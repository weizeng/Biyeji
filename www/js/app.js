// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

    .run(function ($ionicPlatform, $cordovaDevice, $rootScope) {
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
            var userStr = localStorage.getItem('user');
            if (userStr) {
                // 把字符串转化成json对象，变成对象厚可以取
                var uu = eval('(' + userStr + ')');
                Bmob.User.logIn(uu.username, "123", {
                    success: function (user) {
                        $rootScope.user = user;
                        console.log(JSON.stringify($rootScope.user));
//                        alert("success: " + JSON.stringify($rootScope.user));
                        $.fn.umshare.tip('自动登陆成功');
                    },
                    error: function (user, error) {
                        // The login failed. Check error to see why.
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            } else {
//            alert('未登陆');

            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        $ionicConfigProvider.tabs.position('bottom');
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

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');

    });
