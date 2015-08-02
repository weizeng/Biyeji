/**
 * Created by lizhaocai on 15/8/2.
 */
angular.module('starter.controllers')
// 增加我的毕业说
    .controller('AddXyCtrl', function ($timeout, $cordovaDialogs, $ionicPlatform, $rootScope, $scope, $ionicLoading, $cordovaCamera, $cordovaFile) {

        //返回
        $scope.back = function () {
            window.history.back();
            initData();
        };

        $scope.xy = {content: null};

        //初始化加载先清空
        function initData() {
            $scope.xy = {content: null};
            $scope.cameraimage = null;
        };

        // 本地图片的路径,android需要转化URI，ios不需要
        var imageLocalPath;

        //TODO 增加一个许愿
        $scope.addXy = function () {
            if ($rootScope.user == null) {
                $cordovaDialogs.alert('请先登录', '温馨提示', '确定')
                    .then(function () {
                        // callback success
                    });

                return;
            }
            if (imageLocalPath == null) {
                $.fn.umshare.tip("请先选择一张照片");
                return;
            }

            var name = imageLocalPath.substr(imageLocalPath.lastIndexOf('/') + 1);

            var picDictionary;
            if (ionic.Platform.isAndroid()) {
                // 必须要加前缀file:// 否则出现 ECODING_ERR的错误
                picDictionary = 'file://' + imageLocalPath.substr(0, imageLocalPath.lastIndexOf('/'));
            } else {
                picDictionary = cordova.file.tempDirectory;
            }

            console.log("准备读取图片===>" + picDictionary + name);
            $ionicLoading.show({
                template: ('读取图片中... ' + "<i class = 'ion-close-round' ng-click='forceLoading()'></i>")
            });
            $cordovaFile.readAsBinaryString(picDictionary, name).then(function (success) {
                // success
                var file = new Bmob.File(name, success);
                $ionicLoading.show({
                    template: ('图片读取完毕,开始上传... ' + "<i class = 'ion-close-round' ng-click='forceLoading()'></i>")
                });
                console.log("图片读取完毕,开始上传===>" + picDictionary + name);
                file.save().then(function (savedObject) {
//                        alert('图片保存成功:' + savedObject.url());
                    console.log('图片保存成功,准备创建图片缩略图===>' + savedObject.url());
                    $ionicLoading.show({
                        template: ('正在创建缩略图... ' + "<i class = 'ion-close-round' ng-click='forceLoading()'></i>")
                    });
                    Bmob.Image.thumbnail({"image": savedObject.url(), "mode": 0, "quality": 100, "width": 480}
                    ).then(function (obj) {
                            $ionicLoading.show({
                                template: ('正在发布到毕业墙... ' + "<i class = 'ion-close-round' ng-click='forceLoading()'></i>")
                            });
                            console.log("-------- filename:" + JSON.stringify(obj));

                            var Xy_List = Bmob.Object.extend("Xy_List");
//                                    // 插入许愿列表
                            var ddd = new Xy_List();
                            ddd.set("title", $scope.xy.content);
                            // Pointer指针
                            ddd.set("userId", $rootScope.user);
                            ddd.set("image", savedObject);
                            ddd.set("image_small", obj.error == null ? obj.url : savedObject.url());
                            ddd.set("style", 1);
                            ddd.save(null, {
                                success: function (ddd) {
                                    $ionicLoading.hide();
                                    console.log("#增加许愿# 操作完毕");
                                    var relation = ddd.relation("comment");
                                    $cordovaDialogs.confirm('你的毕业说已经到宣言墙啦', '太好了', '确定')
                                        .then(function () {
                                            // callback success
                                            window.sessionStorage.setItem('doRefresh', true);
                                            $scope.back();
                                        });
                                },
                                error: function (ddd, error) {
                                    $ionicLoading.hide();
                                    alert("抱歉，学长，错了。。" + error.message);
                                }
                            });
                        }, function (error) {
                            // the save failed.
                            $ionicLoading.hide();
                            console.log("创建缩略图错误" + JSON.stringify(error));
                        });
                }, function (error) {
                    // the save failed.
                    $ionicLoading.hide();
                    console.log("保存图错误" + JSON.stringify(error));
                    $cordovaDialogs.alert('网络在开小差2222' + JSON.stringify(error), '糟糕啊', '确定');
                });
            }, function (error) {
                // error
                console.log('文件读取错误' + JSON.stringify(error));
                $cordovaDialogs.alert('文件读取错误' + JSON.stringify(error), '糟糕啊', '确定');
            });

        };
        //选择拍照
        $scope.goCamera = function () {
            var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.PNG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true
            };

            // udpate camera image directive
            $cordovaCamera.getPicture(options).then(function (imageURI) {
                console.log('goCamera getPicture(options) :' + imageURI);
                if (ionic.Platform.isAndroid()) {
                    window.FilePath.resolveNativePath(imageURI, function (success) {
                        imageLocalPath = success;
                    }, function (error) {
                        alert(error);
                    });
                } else {
                    imageLocalPath = imageURI;
                }

                // 用于展示
                $scope.cameraimage = imageURI;
            }, function (err) {
                console.log('Failed because: ');
                console.log(err);
            });
        };
        //选择照片
        $scope.goPhoto = function () {
            //if(!ionic.Platform.isAndroid()&&!ionic.Platform.isIOS()){
            //    imageLocalPath = document.getElementById('imgFile').files[0].name;
            //}
            var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.PNG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            // udpate camera image directive
            $cordovaCamera.getPicture(options).then(function (imageURI) {
                console.log('goPhoto getPicture(options) :' + imageURI);
                if (ionic.Platform.isAndroid()) {
                    window.FilePath.resolveNativePath(imageURI, function (success) {
                        imageLocalPath = success;

                    }, function (error) {
                        alert(error);
                    });
                } else {
                    imageLocalPath = imageURI;
                }

                // 用于展示
                $scope.cameraimage = imageURI;
            }, function (err) {
                console.log('Failed because: ' + err);
            });
        }
    });
