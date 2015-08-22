angular.module('starter.services', [])

    .service('$appService', function ($cordovaNetwork, $cordovaDialogs, $timeout, $cordovaFileOpener2, $cordovaFileTransfer, $ionicLoading, $ionicPopup, $cordovaAppVersion, $rootScope, $cordovaDevice) {

        var versionCheck = function (result, url, callback) {

            var confirmPopup = $ionicPopup.confirm({
                title: '有新版本啦-' + result.get('version'),
                template: "" + result.get('updateInfo'),
                okText: "确定",
                cancelText: "取消"
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $ionicLoading.show({
                        template: "已经下载：0%"
                    });
//                    var targetPath = "file:///storage/sdcard0/Download/1.apk"; //APP下载存放的路径，可以使用cordova file插件进行相关配置
                    var targetPath;
                    if (ionic.Platform.isAndroid()) {
                        targetPath = cordova.file.externalDataDirectory + "/1.apk";
                    }
                    var trustHosts = true
                    var options = {};
                    $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                        // 打开下载下来的APP
                        $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
                        ).then(function () {
                                // 成功
                                callback(true);
                            }, function (err) {
                                // 错误
                                callback(false);
                            });
                        $ionicLoading.hide();
                    }, function (err) {
                        alert('下载失败');
                        $cordovaDialogs.alert('下载失败', '糟糕', '确定');
                    }, function (progress) {
                        //进度，这里使用文字显示下载百分比
                        $timeout(function () {
                            var downloadProgress = (progress.loaded / progress.total) * 100;
                            $ionicLoading.show({
                                template: "已经下载：" + Math.floor(downloadProgress) + "%"
                            });
                            if (downloadProgress > 99) {
                                $ionicLoading.hide();
                            }
                        })
                    });
                } else {
                    // 取消更新
                }
            });
        }

        return {
            checkUpdate: function (callback) {
                if($cordovaNetwork.isOffline){
                    $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                    return;
                }

                $cordovaAppVersion.getAppVersion().then(function (version) {
                    var appVersion = version;
                    $rootScope.appVersion = appVersion;
                    var systemObject = Bmob.Object.extend("System");
                    var query = new Bmob.Query(systemObject);
                    query.descending("updatedAt");
                    // 查询所有数据
                    query.first({
                        success: function (result) {
                            if (result != null) {
                                var serverVersion = result.get('version');
                                if ($cordovaDevice.getPlatform() == 'Android') {
                                    if (serverVersion > appVersion) {
                                        versionCheck(result, result.get('android')._url, callback);
                                    } else {
//                                        $.fn.umshare.tip('已是最新版本');
                                    }
                                } else {
                                    $.fn.umshare.tip('ios 已是最新版本');
                                }
                            }
                        },
                        error: function (error) {
                            alert("查询失败: " + JSON.parse(error));
                        }
                    });

                });
            }
        };
    })

    .service('$locationService', function ($cordovaNetwork,$http, $cordovaGeolocation) {
        var parseLocation = function (latitude, longitude, parseLocationResult) {
            $http({
                method: 'GET',
                url: 'http://api.map.baidu.com/geocoder/v2/?ak=fe3SKZ5DnQh2IdEGotsdUlnR' + "&location=" + latitude + "," + longitude + "&output=json" + '&pois=1'
            }).success(function (data) {
                console.log(JSON.stringify(data));
                if (data.status === 0) {
                    //alert(JSON.stringify(data));
                    var address = data.result.addressComponent.province + "," + data.result.addressComponent.city + "," + data.result.addressComponent.district + "," + data.result.addressComponent.street;
                    parseLocationResult(address);
                }
            });
        }

        return {
            locate: function (locationResult, parseLocationResult) {
                //获取定位iOS
                if (ionic.Platform.isIOS()) {
                    var posOptions = {timeout: 20000, enableHighAccuracy: false};
                    $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function (position) {
                            //与百度误差
                            var latitude = position.coords.latitude + 0.0034;
                            var longitude = position.coords.longitude + 0.011;
//                            alert(position);
                            console.log(JSON.stringify(position));
                            locationResult(latitude, longitude);
                            if($cordovaNetwork.isOffline){
                                return;
                            }
                            parseLocation(latitude, longitude, parseLocationResult);
                        }, function (err) {
                            console.log(JSON.stringify(err));
                            locationResult(0, 0);
                        });
                }
                //获取定位android
                else if (ionic.Platform.isAndroid()) {
                    document.addEventListener('deviceready', function () {
                        //通过百度sdk来获取经纬度,并且alert出经纬度信息
                        var noop = function () {
                        };
                        window.locationService.getCurrentPosition(function (position) {
                            var latitude = position.coords.latitude;
                            var longitude = position.coords.longitude;
                            //停止地位
                            window.locationService.stop(noop, noop);
                            console.log(JSON.stringify(position));
                            locationResult(latitude, longitude);
                            parseLocation(latitude, longitude, parseLocationResult);
                        }, function (err) {
                            console.log(JSON.stringify(err));
                            locationResult(0, 0);
                        });
                    })

                }
            }
        };
    });
