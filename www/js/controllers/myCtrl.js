/**
 * Created by lizhaocai on 15/8/2.
 */
// 我的毕业脚印

angular.module('starter.controllers')

.controller('MyBoardCtrl', ['$sce','$cordovaDialogs', '$rootScope', '$scope','$state','$http', '$ionicLoading','$cordovaInAppBrowser',function ($sce,$cordovaDialogs, $rootScope, $scope, $state,$http, $ionicLoading,$cordovaInAppBrowser) {
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
                                    initDataAfterLogin(eval('(' + JSON.stringify(user) + ')'));
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
                            user.set("token", checkUser.token);
                            // 用户设备信息
                            user.set("version", '');
                            user.signUp(null, {
                                success: function (user) {
                                    console.log('regist from bmob,user:' + user.avatar_large);
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



    $scope.logIn = function () {
        $ionicLoading.show({
            template: '正在登陆...'
        });
        $scope.checkToken();
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

    if(!$rootScope.user&&ionic.Platform.isAndroid()||ionic.Platform.isIOS()){
        $scope.logIn();
    }else $scope.user = JSON.parse(JSON.stringify($rootScope.user));

    $scope.goUrl = function(){
        document.addEventListener('deviceready', function () {
            var options = {
                location: "no"
            };

            $cordovaInAppBrowser.open('http://m.weibo.cn/'+$scope.user.profile_url, '_blank', options).then(function () {
                console.log("InAppBrowser opened http://m.weibo.cn successfully");
            }, function (error) {
                console.log("Error: " + error);
            });

        }, false);
    }

}])
// 账号信息
.controller('AccountCtrl', function ($scope,$rootScope,$state,$timeout) {

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

});