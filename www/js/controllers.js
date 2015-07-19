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
            Wechat.auth("snsapi_userinfo", function (response) {
                // you may use response.code to get the access token.
                alert(JSON.stringify(response));
            }, function (reason) {
                alert("Failed:2222 " + reason);
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
    })
// 预留可以删除
    .controller('FriendsCtrl', function ($scope, Friends) {
        $scope.friends = Friends.all();
    })

// 预留可以删除
    .controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
        $scope.friend = Friends.get($stateParams.friendId);
    })

// 许愿的列表
    .controller('XYListCtrl', function ($rootScope, $scope, $ionicLoading) {
        //TODO 增加对某一个评论点赞的方法
        $scope.goZan = function (xy) {
            alert(xy);

            var query = new Bmob.Query("_User");
            query.first({
                //查询要保存的用户，这个对象应该要被序列话到本地
                success: function (user) {
                    $rootScope.user = user;
                    // 添加到赞列表
                    var zanObject = Bmob.Object.extend("Zan");
                    // 插入许愿列表
                    //var aa = Bmob.Query(Xy_List);
                    var zan = new zanObject();
                    // Pointer指针
                    zan.set("userId", user);
                    zan.save(null, {
                        success: function (zan) {
                            // 添加成功之后，将之前查询到的评论信息的relation字段重置。关联起来
                            var relation = xy.relation("zan");
                            relation.add(zan);
                            xy.save();
                            alert("保存成功");
                        },
                        error: function (ddd, error) {
                            alert("抱歉，学长，错了。。" + error.message);
                        }
                    });
                }
            });
        }

        // 毕业墙的详情页面
        $scope.goXyDetail = function (id) {

            alert(id);
        }

        // 初始化毕业墙的
        Bmob.initialize("44022f09eb84ad42e812bbbb9f2894c4", "629112d8473f92cc6780ace14a1ab5aa");
        loadMore = function () {
            if (showLoading) {
                $ionicLoading.show({template: '加载中...'});
            }
            // 宣言列表
            var XyList = Bmob.Object.extend("Xy_List", {
                // 实例方法
                test1: function () {
                    return "YES";
                }
            }, {
                // 静态方法
                test2: function () {
                    return new XyList();
                },

                test3: function () {
                    return "YES3";
                }
            });

            var query = new Bmob.Query(XyList);
            query.limit(5);
            query.skip(skip);
            query.descending("updatedAt");

            // 查询所有数据
            query.find({
                success: function (results) {
                    if (results.length > 0) {
                        $scope.more = true;
                        skip += results.length;
                        console.log("skip===>:" + skip);
                        angular.forEach(results, function (result) {
                            $scope.results.push(result);
                        });
                    } else {
                        $scope.more = false;
                    }

                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },
                error: function (error) {
                    alert("查询失败: " + error.code + " " + error.message);
                    $ionicLoading.hide();
                }
            });
        }

        //下拉刷新
        $scope.hardRefresh = function () {
            showLoading = false;
            loadMore();
        }

        $scope.more = true;
        $scope.results = [];
        var skip = 0;
        $scope.loadMorePost = function () {
            console.log('loadmore========>>>');
            showLoading = false;
            loadMore();
        }


    })

// 增加我的毕业说
    .controller('AddXyCtrl', function ($rootScope, $scope, $ionicLoading) {
        //返回
        $scope.back = function () {
            window.history.back();
        };

        $scope.xy = {content: null};

        //TODO 增加用户评论的方法
        $scope.addComment = function () {
            var query = new Bmob.Query("_User");
            query.first({
                //查询要保存的用户，这个对象应该要被序列话到本地
                success: function (user) {
                    // FIXME 这里需要做第三方登陆，之后把成功的用户信息保存到本地，目前这里只是查询数据中第一条数据，模拟

                    $rootScope.user = user;
                    // FIXME 上传宣言墙的图片, 这里只测试本地的字符串保存到BMOB的file字段
                    var bytes = "Hello, World!";
                    var file = new Bmob.File("hello.txt", bytes);
                    file.save().then(function (obj) {
                        localStorage.setItem('data', JSON.stringify(user));
                        var aa = localStorage.getItem('data');
                        var outP = eval('(' + aa + ')');
                        console.log(outP);


                        var Xy_List = Bmob.Object.extend("Xy_List");
                        // 插入许愿列表
                        //var aa = Bmob.Query(Xy_List);
                        var ddd = new Xy_List();

                        ddd.set("title", $scope.xy.content);
                        // Pointer指针
                        ddd.set("userId", user);
                        ddd.set("image", obj);

                        ddd.save(null, {
                            success: function (ddd) {
                                alert("你的毕业说已经到宣言墙啦");
                                var relation = ddd.relation("commentId");
                            },
                            error: function (ddd, error) {
                                alert("抱歉，学长，错了。。" + error.message);
                            }
                        });
                    }, function (error) {
                        // the save failed.
                    });


                },
                error: function (error) {
                    alert("查询失败: " + error.code + " " + error.message);
                }
            });
        }
    })


    // 我的毕业脚印
    .controller('MyBoardCtrl', function ($rootScope, $scope, $http, $ionicLoading) {
        $scope.logout = function () {
            var info = $.fn.umshare.delToken("sina");
            alert('已经退出微博账号');
            $scope.me=null;
        };

        $scope.checkToken = function () {
            // 检查某个平台的登录信息.如果未登录，则进行登录(等价于先使用getoken进行检测，若返回false，则调用login)
            $.fn.umshare.checkToken('sina', function (user) {
                // 测试是否登陆成功过sina
                $.fn.umshare.tip('登录成功,token:' + user.token + ', uid:' + user.uid);
                // 获取数据
                var showJsonUrl = 'https://api.weibo.com/2/users/show.json?uid=' + user.uid + '&access_token=' + user.token;
                $http.get(showJsonUrl)
                    .success(function (response) {
                        $scope.me = response;
                        //console.log(response);
                    }
                );
            });
        };

        $scope.logIn = function() {
            $scope.checkToken();
        };
        // 如果保存了uid则查询出来
        if($.fn.umshare.getToken('sina')){
            $scope.checkToken();
        }
    });
