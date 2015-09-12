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
                if(!$rootScope.isConnected){
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
                                        $.fn.umshare.tip('已是最新版本');
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
            },

        dateFn : function (date) {
            var minute = 1000 * 60;
            var hour = minute * 60;
            var day = hour * 24;
            var halfamonth = day * 15;
            var month = day * 30;

            var str = date.toString();
            str = str.replace(/-/g, "/");
            var oDate1 = new Date(str);
            date = oDate1.getTime();

            var now = new Date().getTime();
            var diffValue = now - date;
            if (diffValue < 0) {
                //若日期不符则弹出窗口告之
                //alert("结束日期不能小于开始日期！");
            }
            var monthC = diffValue / month;
            var weekC = diffValue / (7 * day);
            var dayC = diffValue / day;
            var hourC = diffValue / hour;
            var minC = diffValue / minute;
            var result = '';
            if (monthC >= 1) {
                result = str;
                //result = "发表于" + parseInt(monthC) + "个月前";
            }
            else if (weekC >= 1) {
                result = str;
                //result = "发表于" + parseInt(weekC) + "周前";
            }
            else if (dayC >= 1) {
                result = parseInt(dayC) + "天前";
            }
            else if (hourC >= 1) {
                result = parseInt(hourC) + "小时前";
            }
            else if (minC >= 1) {
                result = parseInt(minC) + "分钟前";
            }
            else if (minC < 1) {
                result = "刚刚";
            } else
                result = str;
            return result;
        }
    };
    })
    // 震动监听
    .service('$shakeService', function ($cordovaDeviceMotion, $timeout) {
        // watch Acceleration
        var options = { frequency: 300 };
        var sensitivity = 30;

        var previousAcceleration = {
            x: null,
            y: null,
            z: null
        };

        var timeout;

        var shakeCallBack = function(callback) {
            if (timeout) {
                return;
            }

            timeout = setTimeout(function () {
                clearTimeout(timeout);
                timeout = null;
            }, 750);

            callback();
        };
        var watch = null;

        return {
            startWatch: function (callback) {
                document.addEventListener("deviceready", function () {

                    watch = $cordovaDeviceMotion.watchAcceleration(options);
                    watch.then(
                        null,
                        function(error) {
                            // An error occurred
                        },
                        function(acceleration) {
                            var accelerationChange = {};
                            if (previousAcceleration.x !== null) {
                                accelerationChange.x = Math.abs(previousAcceleration.x - acceleration.x);
                                accelerationChange.y = Math.abs(previousAcceleration.y - acceleration.y);
                                accelerationChange.z = Math.abs(previousAcceleration.z - acceleration.z);
                            }

                            previousAcceleration = {
                                x: acceleration.x,
                                y: acceleration.y,
                                z: acceleration.z
                            };

                            if (accelerationChange.x + accelerationChange.y + accelerationChange.z > sensitivity) {
                                // Shake detected
                                shakeCallBack(callback);
                            }
                        });
                }, false);
            },
            stopWatch: function() {
                if (watch != null) {
                    watch.clearWatch();
                }
            }
        };
    })

// 业务逻辑的服务
    .service('$busiService', function ($cordovaDialogs, $rootScope) {

        return {
            // 开始赞
            goZan: function (xy, callback) {
                if ($rootScope.user == null) {
                    $cordovaDialogs.alert('请先登录', '温馨提示', '确定')
                        .then(function () {
                            // callback success
                        });
                    callback(null,false);
                    return;
                }
                // 添加到赞列表
                var zanObject = Bmob.Object.extend("Zan");
                // 插入许愿列表
                var zan = new zanObject();
                // Pointer指针
                zan.set("userId", $rootScope.user);
                zan.save(null, {
                    success: function (zan) {
                        var relation = xy.relation("zan");
                        relation.add(zan);
                        xy.save();
                        //点赞
//                        if (xy.showZan == true) {
                            xy.increment("zanCount");
//                        }
//                        //取消赞
//                        else {
//                            xy.increment("zanCount", -1);
//                        }
                        xy.save().then(function (success) {
                            //console.log(xy.showZan);
                            xy.attributes.zanCount =xy.attributes.zanCount+1;
                            callback(xy, true);
                        }, function (error) {
                            callback(null,false);
                        });
                    },
                    error: function (ddd, error) {
//                        alert("抱歉，没赞成功。。" + error.message);
                        callback(null,false);
                    }
                });
            },

            loadComment: function(xy, callback) {
                if (!$rootScope.isConnected) {
                    $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                    callback(null, false);
                    return;
                }

                var commentIdQuery = xy.relation('comment').query();
                commentIdQuery.include("userId");
                commentIdQuery.descending("-createdAt");
                commentIdQuery.find({
                    success: function (results) {
                        //$ionicLoading.hide();
                        callback(results, true);
                    },
                    error: function (error) {
                        callback(null, true);
                    }
                });
            },

            saveComment : function (xy, text, callback) {
                if ($rootScope.user == null) {
                    $cordovaDialogs.alert('请先登录', '温馨提示', '确定')
                        .then(function () {
                            // callback success
                        });
                    callback(xy, false);
                    return;
                }
                if (text == undefined || text.length == 0) {
                    callback(xy, false);
                    return;
                }

                if(!$rootScope.isConnected){
                    $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                    callback(xy, false);
                    return;
                }
                // 添加到赞列表
                var commentObject = Bmob.Object.extend("Comment");
                // 插入许愿列表
                var comment = new commentObject();
                // Pointer指针
                comment.set("userId", $rootScope.user);
                comment.set("content", text);

                comment.save(null, {
                    success: function (comment) {
                        // 添加成功之后，将之前查询到的评论信息的relation字段重置。关联起来
                        xy.increment("commentCount");

                        var relation = xy.relation("comment");
                        relation.add(comment);
                        xy.save().then(function (xyNew) {
                            relation.parent = null;
                            xy.relation('comment').parent.attributes.comment = relation;//success.relation("comment");

                            callback(xyNew, true);
                        }, function (error) {
                            callback(xy, false);
                        });

                    },
                    error: function (ddd, error) {
                        callback(xy, false);
                    }
                });
            }
        }
    })


    .service('$locationService', function ($rootScope,$cordovaNetwork,$http, $cordovaGeolocation) {
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
