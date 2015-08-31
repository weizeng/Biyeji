// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

    .run(['$cordovaNetwork', '$appService','$timeout','$cordovaFileTransfer','$cordovaFileOpener2','$cordovaKeyboard', '$ionicHistory','$location','$cordovaToast','$ionicPopup', '$cordovaAppVersion', '$ionicPlatform', '$cordovaDevice', '$rootScope', '$ionicLoading',function ($cordovaNetwork, $appService,$timeout,$cordovaFileTransfer,$cordovaFileOpener2,$cordovaKeyboard, $ionicHistory,$location,$cordovaToast,$ionicPopup, $cordovaAppVersion, $ionicPlatform, $cordovaDevice, $rootScope, $ionicLoading) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
        $rootScope.isDeviceReady = false;
        Bmob.initialize("d57f41849e40df714f46408b9a50f4b6", "64ab903f9d796b8a87fbdf1f2599f88d");
        // 初始化平台信息
        document.addEventListener("deviceready", function () {
            //初始化友盟统计配置
            window.plugins.umengAnalyticsPlugin.init();
            //调试模式
            window.plugins.umengAnalyticsPlugin.setDebugMode(true);

            //注意，这段代码是应用退出前保存统计数据，请在退出应用前调用
            //window.plugins.umengAnalyticsPlugin.onKillProcess();

            var device = $cordovaDevice.getDevice();
            var cordova = $cordovaDevice.getCordova();
            var model = $cordovaDevice.getModel();
            var platform = $cordovaDevice.getPlatform();
            var uuid = $cordovaDevice.getUUID();
            var version = $cordovaDevice.getVersion();

            if (platform == 'Android') {
                window.umappkey = '55e45f5d67e58e7c190009de';

            } else {
                window.umappkey = '55e45fa8e0f55accd9002cda';
            }

            // 本地读取user的信息，这个user通常是bmob返回的信息
            // 包含字段:uid, screen_name, token, avatar, avatar_large

            $rootScope.isConnected = $cordovaNetwork.isOnline();
            // 真实环境
            var userStr = localStorage.getItem('user');
            if (userStr && $rootScope.isConnected) {
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

            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){

                $rootScope.isConnected = (networkState != Connection.NONE && networkState != Connection.UNKNOWN);
//                alert("$cordovaNetwork:online"+$rootScope.isConnected);
            })

            // listen for Offline event
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                $rootScope.isConnected = (networkState != Connection.NONE && networkState != Connection.UNKNOWN);
//                alert("$cordovaNetwork:offline"+$rootScope.isConnected);
            })

            if(!$cordovaNetwork.isOffline){
                // 检查更新
                $appService.checkUpdate(function(result){
                    console.log(result);
                });
            }
            $rootScope.isDeviceReady = true;
        });

        //双击退出
        $ionicPlatform.registerBackButtonAction(function (e) {
            //判断处于哪个页面时双击退出
            if ($location.path() == '/tab/xylist'||$location.path() == '/tab/my') {
                if ($rootScope.backButtonPressedOnceToExit) {
                    ionic.Platform.exitApp();
                } else {
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast.showShortBottom('再按一次退出系统');
                    setTimeout(function () {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000);
                }
            }
            else if ($ionicHistory.backView()) {
                if ($cordovaKeyboard.isVisible()) {
                    $cordovaKeyboard.close();
                } else {
                    $ionicHistory.goBack();
                }
            } else {
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.showShortBottom('再按一次退出系统');
                setTimeout(function () {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }
            e.preventDefault();
            return false;
        }, 101);

        $rootScope.forceLoading = function () {
            $ionicLoading.hide();
        };

        // 针对非手机版本, 可以自动登陆
        if (!ionic.Platform.isAndroid() && !ionic.Platform.isIOS()) {
            $rootScope.appVersion = 1;
            $rootScope.isConnected= true;
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
        } else {

        }
    }])


    .
    config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider',function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

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
                templateUrl: "templates/tabs.html",
                controller: 'TabsController'
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
            .state('splash', {
                url: '/splash',
                //views: {
                //    'tab-xylist': {
                        templateUrl: 'templates/splash.html',
                        controller: 'SplashCtrl'
                    //}
                //}
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
            .state('tab.addXy', {
                url: '/addXy',
                views:{
                    'tab-xylist': {
                        templateUrl: 'templates/xy_add.html',
                        controller: 'AddXyCtrl'
                    }
                }
            })

            //.state('tab.chat-detail', {
            //    url  : '/chats/:chatId',
            //    views: {
            //        'tab-cart': {
            //            templateUrl: 'templates/chat-detail.html',
            //            controller : 'ChatDetailCtrl'
            //        }
            //    }
            //})


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

            .state('address', {
                url: '/address/:log/:lat',
                cache:false,
                templateUrl: 'templates/xy-address.html',
                controller: 'AddressCtrl'
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

    }]);
