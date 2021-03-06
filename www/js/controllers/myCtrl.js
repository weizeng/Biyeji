/**
 * Created by lizhaocai on 15/8/2.
 */
// 我的毕业脚印

angular.module('starter.controllers')

    .controller('MyBoardCtrl', function ($appService,$state,$cordovaDevice, $cordovaAppVersion, $sce, $cordovaDialogs, $rootScope, $scope, $state, $http, $ionicLoading, $cordovaInAppBrowser,$cordovaGeolocation) {
        $scope.logout = function () {
            var result = $.fn.umshare.delToken("sina");
            localStorage.removeItem('user');
            $rootScope.user = null;
            $scope.user = null;
        };

        $scope.checkToken = function () {
            // 检查某个平台的登录信息.如果未登录，则进行登录(等价于先使用getoken进行检测，若返回false，则调用login)
            $.fn.umshare.checkToken('sina', function (checkUser) {
                console.log("fn.umshare.checkToken:" + JSON.stringify(checkUser));
                if (checkUser.error != null && checkUser.error.length > 0) {
                    $cordovaDialogs.alert('登录出错了,' + checkUser.error, '糟糕啊', '确定');
                    $scope.logout();
                    $scope.checkToken();
                    return;
                }

                // 获取用户的详细数据
                var showJsonUrl = 'https://api.weibo.com/2/users/show.json?uid=' + checkUser.uid + '&access_token=' + checkUser.token;
                console.log("fetch user Detail by url:" + showJsonUrl);
                $http.get(showJsonUrl)
                    .success(function (response) {
                        console.log("$http.get user detail:" + JSON.stringify(response));
                        // FIXME 提交bmob，此处最好交给js云端处理
                        checkUserFromBmob(response.screen_name, function (isExist) {
                            if (isExist) {
                                console.log("bmob EXIST user. then login");
                                Bmob.User.logIn(response.screen_name, "123", {
                                    success: function (user) {
                                        initDataAfterLogin(user);
                                    },
                                    error: function (user, error) {
                                        alert("Error: " + error.code + " " + error.message);
                                    }
                                });
                            } else {
                                // 不存在则
                                console.log("bmob NOT EXIST user. then Regist");
                                var user = new Bmob.User();
                                user.set("username", response.screen_name);
                                user.set("password", "123");// bmob要求必须密码，默认123
                                user.set("openid", response.idstr);// 对应uid(微信可能叫做openid,所以后台统一设置称openid)
                                user.set("location", response.location);
                                user.set("cover_image_phone", response.cover_image_phone);
                                user.set("profile_url", response.profile_url);
                                user.set("avatar_large", response.avatar_large);
                                user.set("avatar_hd", response.avatar_hd);
                                user.set("weiboMes", JSON.stringify(response));
                                user.set("sex", response.gender);//m : w
                                user.set("nick", response.screen_name);
                                user.set("description", response.description);
                                user.set("platform", 'sina');
                                user.set("image_small_v", response.profile_image_url);
                                user.set("token", checkUser.token);
                                // 用户设备信息
                                user.set("version", '');
                                user.signUp(null, {
                                    success: function (user) {
                                        console.log('regist from bmob,user:' + user.avatar_large);

                                        user.increment("coin", 40);
                                        user.save().then(function (user) {
                                            $rootScope.user = user;
                                            $.fn.umshare.tip('首次注册，赠送 +40金币');
                                        });
                                        initDataAfterLogin(user);
                                    },
                                    error: function (user, error) {
                                        $ionicLoading.hide();
                                        // Show the error message somewhere and let the user try again.
                                        $cordovaDialogs.alert('出错了,' + error.code + " " + error.message, '糟糕啊', '确定');
                                    }
                                });
                            }
                        });
                    }
                );
            });
        };

        if (ionic.Platform.isAndroid()) {
            $scope.isShowVersion = true;
        }

        $scope.logIn = function(){
            if(!$rootScope.isConnected){
                $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                return;
            }
            $ionicLoading.show({
                template: '正在登陆...'
            });
            $scope.checkToken();
        };

        $scope.registByRandom = function(){
            if(!$rootScope.isConnected){
                $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                return;
            }
            $ionicLoading.show({
                template: '自动注册中...'
            });
            $scope.registReallyByRandom();
        };

        // 是否存在该用户
        var checkUserFromBmob = function (name, callback) {
            var User = Bmob.Object.extend("_User");
            var query = new Bmob.Query(User);
            query.equalTo("username", name);
            query.find({
                success: function (results) {
                    callback(results.length);
                },
                error: function (error) {
//                    return true;
//                    alert("查询失败: " + error.code + " " + error.message);
                }
            });
        };

        $scope.registReallyByRandom = function () {
            var name = RandomString(8);
            checkUserFromBmob(name, function (isExist) {
                if (isExist) {
                    console.log("bmob EXIST user. then login");
                    Bmob.User.logIn(name, "123", {
                        success: function (user) {
                            initDataAfterLogin(user);
                        },
                        error: function (user, error) {
                            alert("Error: " + error.code + " " + error.message);
                        }
                    });
                } else {
                    // 不存在则
                    console.log("bmob NOT EXIST user. then Regist");
                    var user = new Bmob.User();
                    user.set("username", name);
                    user.set("nick", name);
                    user.set("password", "123");// bmob要求必须密码，默认123
                    user.set("cover_image_phone", "http://tse1.mm.bing.net/th?&id=OIP.Mbe4a3da6b8c936ee349cdaa7ed7dafe9o0&w=300&h=300&c=0&pid=1.9&rs=0&p=0");
                    user.set("platform", 'regist');
                    user.set("image_small_v", "http://tse1.mm.bing.net/th?&id=OIP.Mbe4a3da6b8c936ee349cdaa7ed7dafe9o0&w=300&h=300&c=0&pid=1.9&rs=0&p=0");
                    user.signUp(null, {
                        success: function (user) {
                            user.increment("coin", 40);
                            user.save().then(function (user) {
                                user.attributes.avatar_large='img/ionic.png';
                                $rootScope.user = user;
                                $.fn.umshare.tip('首次注册，赠送 +40金币');
                            });
                            initDataAfterLogin(user);
                        },
                        error: function (user, error) {
                            $ionicLoading.hide();
                            // Show the error message somewhere and let the user try again.
                            $cordovaDialogs.alert('出错了,' + error.code + " " + error.message, '糟糕啊', '确定');
                        }
                    });
                }
            });
        }
        function RandomString(length) {
            // http://www.outofmemory.cn
            var str = '';
            for ( ; str.length < length; str += Math.random().toString(36).substr(2) );
            return str.substr(0, length);
        }

        var initDataAfterLogin = function (user) {
            $ionicLoading.hide();
            // 保存成功之后,设置到全局，并且保存本地local
            // FIXME
            $rootScope.user = user;

            $scope.user = JSON.parse(JSON.stringify($rootScope.user));
            // 对象转化成json的字符串保存
            localStorage.setItem('user', JSON.stringify(user));
        };
        //FIXME
        if ($rootScope.user) {
            $scope.user = JSON.parse(JSON.stringify($rootScope.user));
        }
        $scope.appVersion = $rootScope.appVersion;

        $scope.goUrl = function () {
            document.addEventListener('deviceready', function () {
                var options = {
                    location: "no",
                    toolbar: 'yes'
                };

                $cordovaInAppBrowser.open('http://m.weibo.cn/' + $scope.user.profile_url, '_blank', options).then(function () {
                    console.log("InAppBrowser opened http://m.weibo.cn successfully");
                }, function (error) {
                    console.log("Error: " + error);
                });

            }, false);
        }

        $scope.gotoActivity = function (url) {
            document.addEventListener('deviceready', function () {
                var options = {
                    location: "no",
                    toolbar: 'yes'
                };

                $cordovaInAppBrowser.open(url, '_blank', options).then(function () {
                    console.log("InAppBrowser opened http://m.weibo.cn successfully");
                }, function (error) {
                    console.log("Error: " + error);
                });

            }, false);
        };


        $scope.goAddress = function(){
            $state.go('address');
        };

        //获取活动
        $scope.activity = {title:'', url:''};
        var fetchActivity = function () {
            if(!$rootScope.isConnected){
                return;
            }
            var systemObject = Bmob.Object.extend("Activity");
            var query = new Bmob.Query(systemObject);
            query.descending("createdAt");
            // 查询所有数据
            query.first({
                success: function (result) {
                    var url = result.get('url');
                    if(url!=null && url.length > 9) {
                        $scope.activity.title = result.get('title');
                        $scope.activity.url = result.get('url');
                    }
                },
                error: function (result) {

                }
            });
        };
        fetchActivity();
        $scope.slogan  = {title:'人可以穷，只要他有目标敢于追求，他就是伟大的！'};

        //获取口号
        var fetchSlogan = function () {
            if(!$rootScope.isConnected){
                return;
            }
            var systemObject = Bmob.Object.extend("Slogan");
            var query = new Bmob.Query(systemObject);
            query.descending("createdAt");
            // 查询所有数据
            query.first({
                success: function (result) {
                    $scope.slogan.title = result.get('slogan');
                },
                error: function (result) {
                }
            });
        };

        $scope.gotoProfile = function () {
            if(!$rootScope.isConnected){
                $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                return;
            }
            document.addEventListener('deviceready', function () {
                var options = {
                    location: "no",
                    toolbar: 'yes'
                };

                $cordovaInAppBrowser.open('http://m.weibo.cn/' + $scope.user.profile_url, '_blank', options).then(function () {
                    console.log("InAppBrowser opened http://m.weibo.cn successfully");
                }, function (error) {
                    console.log("Error: " + error);
                });

            }, false);
        }

        $scope.checkVersion = function () {
            $appService.checkUpdate(function(result){
                console.log(result);
            });
        }

        fetchSlogan();

    })
// 账号信息
    .controller('AccountCtrl', function ($scope, $rootScope, $state, $timeout) {

        $scope.user = JSON.parse(JSON.stringify($rootScope.user));

        $scope.back = function () {
            window.history.back();
        };

        //注销登录
        $scope.logout = function () {
            var result = $.fn.umshare.delToken("sina");
            localStorage.removeItem('user');
            $rootScope.user = null;
            $scope.user = null;
            $state.go('tab.xylist');
            $timeout(function () {
                window.location.reload();
            }, 1000);
        };

    })
    .controller('SetCtrl', function ($scope, $rootScope, $state, $timeout) {

        //$scope.user = JSON.parse(JSON.stringify($rootScope.user));

        $scope.back = function () {
            window.history.back();
        };

        if(!$rootScope.isConnected){
            $scope.$broadcast('scroll.refreshComplete');
            $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
            return;
        }
        // 检测系统是否配置完毕，用户显示审核内容
        if(!$rootScope.appConf){
            var appConf = Bmob.Object.extend("AppConf");

            var appQuery = new Bmob.Query(appConf);
            appQuery.find({
                success: function (results) {
                    $rootScope.appConf = results[0];
                    if($rootScope.appConf) {
                        if($rootScope.appConf) {
                            $scope.showLocate = $rootScope.appConf.get('hasLocate') != undefined && $rootScope.appConf.get('hasLocate');
                        }

                        $scope.popData = JSON.parse($rootScope.appConf.attributes.filter);

                    } else {
                        $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                    }
                },
                error: function(result) {
                    $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                }
            });
        }
        //改变
        $scope.changeChecks = function(item){

            if (item.h === '0') {
                if (item.checked === true) {
                    angular.forEach($scope.popData, function (item) {
                        item.checked = true;
                    });
                } else {
                    angular.forEach($scope.popData, function (item) {
                        item.checked = false;
                    });
                }
            }else{
                if (item.checked === false && $scope.popData.length > 0) {
                    $scope.popData[0].checked = false;
                }
            }
        };
        //下一步登录
        $scope.goLogin = function(){
            console.log($scope.popData);
            $state.go('login');
        }

    })
    .controller('LoginCtrl', function ($scope, $rootScope, $state, $timeout) {

        $scope.back = function () {
            window.history.back();
        };
        //TODO 登录


    });