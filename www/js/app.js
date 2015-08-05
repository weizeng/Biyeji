// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

    .run(function ($ionicPopup, $cordovaAppVersion, $ionicPlatform, $cordovaDevice, $rootScope, $ionicLoading) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });

        Bmob.initialize("44022f09eb84ad42e812bbbb9f2894c4", "629112d8473f92cc6780ace14a1ab5aa");
        // 初始化平台信息
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

            // 本地读取user的信息，这个user通常是bmob返回的信息
            // 包含字段:uid, screen_name, token, avatar, avatar_large

            // 真实环境
            var userStr = localStorage.getItem('user');
            if (userStr) {
                // 把字符串转化成json对象，变成对象厚可以取
                var uu = eval('(' + userStr + ')');
                Bmob.User.logIn(uu.username, "123", {
                    success: function (user) {
                        $rootScope.user = user;//
                        // JSON.parse(JSON.stringify(user));
                        console.log(JSON.stringify($rootScope.user));
                        if (user.updatedAt) {
                            var currentDate = new Date().format("yyyy-MM-dd");
                            console.log("本地时间:"+currentDate);
                            var serverDate = new Date(user.updatedAt).format("yyyy-MM-dd");
                            console.log("上次更新时间:"+serverDate);
                            if (currentDate >= serverDate) {
//                            alert("同一天，判断是否增加过金币");
                                var LastLoginTime = localStorage.getItem('LastLoginTime');
                                if(LastLoginTime != serverDate) {
                                    // 给自己加积分
                                    user.increment("coin",10);
                                    user.save().then(function(success){
                                        $rootScope.user = user;
                                        localStorage.setItem('LastLoginTime', currentDate);
                                        $.fn.umshare.tip('每天登陆 +10金币');
                                    });
                                }

                            }
                        }

                        $.fn.umshare.tip('欢迎回来！' + $rootScope.user.get('nick'));
                    },
                    error: function (user, error) {
                        // The login failed. Check error to see why.
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            }
            $cordovaAppVersion.getAppVersion().then(function (version) {
//                alert(version);
                var appVersion = version;
                $rootScope.appVersion = appVersion;
                var systemObject = Bmob.Object.extend("System");
                var query = new Bmob.Query(systemObject);
                query.descending("updatedAt");
                // 查询所有数据
                query.first({
                    success: function (result) {

                        var serverVersion = result.get('version');
                        if ($cordovaDevice.getPlatform() == 'Android') {
                            if (serverVersion > appVersion) {
                                versionCheck(result);
                            }
                        }
                    },
                    error: function (error) {
                        alert("查询失败: " + JSON.parse(error));
                    }
                });

            });
        });

        $ionicPlatform.registerBackButtonAction(function() {
            if(window.history.length<2){
                window.plugins.BackgroundTask.execute();
            }
            else window.history.back();
        }, 100);


        $rootScope.forceLoading = function () {
            $ionicLoading.hide();
        };

// 针对非手机版本
        if (!ionic.Platform.isAndroid() && !ionic.Platform.isIOS()) {
            Bmob.User.logIn('MegaGift', "123", {
                success: function (user) {
                    $rootScope.user = user;
                    console.log(JSON.stringify($rootScope.user));
                    console.log(JSON.stringify($rootScope.user).replace(/\\"/g, '"'));

                    if (user.updatedAt) {
                        var currentDate = new Date().format("yyyy-MM-dd");
                        console.log("本地时间:" + currentDate);
                        var serverDate = new Date(user.updatedAt).format("yyyy-MM-dd");
                        console.log("上次更新时间:" + serverDate);
                        if (currentDate >= serverDate) {
//                            alert("同一天，判断是否增加过金币");
                            var LastLoginTime = localStorage.getItem('LastLoginTime');
                            if (LastLoginTime != serverDate) {
                                // 给自己加积分
                                user.increment("coin", 10);
                                user.save().then(function (success) {
                                    $rootScope.user = user;
                                    localStorage.setItem('LastLoginTime', currentDate);
                                    $.fn.umshare.tip('每天登陆 +10金币');
                                });
                            }

                        }
                    }

                    $.fn.umshare.tip('MegaGift 自动登陆成功');
                },
                error: function (user, error) {
                    // The login failed. Check error to see why.
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        }

        var versionCheck = function (result) {
            var confirmPopup = $ionicPopup.confirm({
                title: '版本升级',
                template: "版本升级提示 " + JSON.stringify(result)
            });
            confirmPopup.then(function (res) {
                if (res) {
                    console.log('You are sure');
                } else {
                    console.log('You are not sure');
                }
            });
        }


    })


    .
    config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.navBar.alignTitle('center');
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            // Each tab has its own nav history stack:

            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })

            .state('tab.my', {
                url: '/my',
                views: {
                    'tab-my': {
                        templateUrl: 'templates/tab-my.html',
                        controller: 'MyBoardCtrl'
                    }
                }
            })

            // 许愿列表
            .state('tab.xylist', {
                url: '/xylist',
                views: {
                    'tab-xylist': {
                        templateUrl: 'templates/tab-xylist.html',
                        controller: 'XYListCtrl'
                    }
                }
            })

            // 增加许愿
            .state('addXy', {
                url: '/addXy',
                templateUrl: 'templates/xy_add.html',
                controller: 'AddXyCtrl'
            })

            // 我的宣传列表
            .state('XyByMe', {
                url: '/XyByMe',
                templateUrl: 'templates/xy-byme.html',
                controller: 'XyByMeCtrl'
            })

            .state('SubmitBugs', {
                url: '/SubmitBugs',
                templateUrl: 'templates/submit-bugs.html',
                controller: 'SubmitBugsCtrl'
            })

            .state('tab.chats', {
                url: '/chats',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/tab-chats.html',
                        controller: 'ChatsCtrl'
                    }
                }
            })
            .state('tab.chat-detail', {
                url: '/chats/:chatId',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/chat-detail.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            })

            .state('account', {
                url: '/account',
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');

    });
