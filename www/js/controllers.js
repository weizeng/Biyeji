angular.module('starter.controllers', ['ngCordova'])

    .controller('DashCtrl', function ($scope, $cordovaDevice, $cordovaActionSheet) {
        $scope.checkWeChatInstalled = function (id) {
            Wechat.isInstalled(function (installed) {
                alert("Wechat installed: " + (installed ? "Yes" : "No"));
            }, function (reason) {
                alert("Failed: " + reason);
            });
        }
        $scope.loginWechat = function () {
            // 登陆微信
//            Wechat.auth("snsapi_userinfo", function (response) {
//                // you may use response.code to get the access token.
//                alert(JSON.stringify(response));
//            }, function (reason) {
//                alert("Failed:2222 " + reason);
//            });
            Wechat.auth(function (response) {
                alert(response.code);
            });
        }
        $scope.shareWechat = function (id) {
            Wechat.share({
                message: {
                    title: "Message Title",
                    description: "Message Description(optional)",
                    mediaTagName: "Media Tag Name(optional)",
                    thumb: "http://YOUR_THUMBNAIL_IMAGE",
                    media: {
                        type: Wechat.Type.WEBPAGE,   // webpage
                        webpageUrl: "https://github.com/xu-li/cordova-plugin-wechat"    // webpage
                    }
                },
                scene: Wechat.Scene.TIMELINE   // share to Timeline
            }, function () {
                alert("Success");
            }, function (reason) {
                alert("Failed: " + reason);
            });
        }

        Bmob.initialize("44022f09eb84ad42e812bbbb9f2894c4", "629112d8473f92cc6780ace14a1ab5aa");
        var XyList = Bmob.Object.extend("Xy_List");
        var query = new Bmob.Query(XyList);
        query.limit(5);
        query.skip(10);
        query.descending("updatedAt");
        // 查询所有数据
        query.find({
            success: function (results) {
//                alert("查询results: " + results);
            },
            error: function (error) {
                alert("查询失败: " + error.code + " " + error.message);
            }
        });

        document.addEventListener("deviceready", function () {
            var device = $cordovaDevice.getDevice();
            var cordova = $cordovaDevice.getCordova();
            var model = $cordovaDevice.getModel();
            var platform = $cordovaDevice.getPlatform();
            var uuid = $cordovaDevice.getUUID();
            var version = $cordovaDevice.getVersion();

            if (platform == 'Android') {
                window.umappkey = '5598edc167e58e4247001e1e';
            } else {
                window.umappkey = '5598ee6867e58e42e9002113';
            }
            $scope.loginBtn = function () {
                // 现实第三方登陆的login
                $cordovaActionSheet.show(options)
                    .then(function (btnIndex) {
                        var index = btnIndex;
                        var platform;
//                        alert('index:' + index);
                        // 目前只支持 平台名.('sina','tencent','qzone','renren','douban')
                        if (index == 1) {
                            platform = 'sina';
                            // 检查某个平台的登录信息.如果未登录，则进行登录(等价于先使用getoken进行检测，若返回false，则调用login)
                            //
                            // var info = $.fn.umshare.delToken("sina");
                            // $("#delTokenInfo").html('退出成功');

                            $.fn.umshare.checkToken('sina', function (user) {
                                // 测试是否登陆成功过sina
                                $.fn.umshare.tip('登录成功,token:' + user.token + ', uid:' + user.uid);
//                                alert('登录成功,token:' + user.token + ', uid:' + user.uid);
//                                if (!user) {
//                                    $.fn.umshare.login(platform, function (user) {
//                                        $.fn.umshare.tip('登录成功,token:' + user.token + ', uid:' + user.uid);
//                                        // 获取用户平台上的信息
//                                        var info = $.fn.umshare.getToken("sina");
//                                        alert(info ? 'token:' + info.token + ', uid:' + info.uid : 'false');
//
//                                    });
//                                }
                            });
                        } else {
                            platform = 'tencent';
                        }

                    });
            }

        }, false);

        var options = {
            title: '第三方登陆',
            buttonLabels: ['新浪登陆', '腾讯微博'],
            addCancelButtonWithLabel: 'Cancel',
            androidEnableCancelButton: true,
            winphoneEnableCancelButton: true
        };


    })

    .controller('ChatsCtrl', function ($scope, Chats) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        $scope.chats = Chats.all();
        $scope.remove = function (chat) {
            Chats.remove(chat);
        }
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);

    })

    .controller('AccountCtrl', function ($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
