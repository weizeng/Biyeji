angular.module('starter.controllers', ['ionic', 'ngCordova'])

// 介绍页面
    .controller('SplashCtrl',['$scope','$rootScope','$ionicSlideBoxDelegate', function($scope,$rootScope,$ionicSlideBoxDelegate) {

        $rootScope.barClass = "bar-clear";

        $scope.back = function() {
            window.localStorage['didTutorial'] = true;
            window.history.back();
        };

        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };

        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };

        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };

    }])
// tab菜单页面
    .controller('TabsController',function($scope,$state) {
        $scope.shouldHide = function() {
            if ($state.current.name == "tab.addXy") {
                return true;
            } else {
                return false;
            }
        };
    })

/**
 *许愿的列表
 */
    .controller('XYListCtrl', function ($ionicPopover,$appService,$cordovaNetwork,$cordovaDialogs, $sce, $rootScope, $scope, $ionicLoading, $cordovaDevice, $ionicModal, $ionicScrollDelegate, $timeout, $state) {

        //限制图片显示高度，太高显示长图
        $scope.imgHeight = window.screen.height - 160;
        $scope.imgHeightpx = window.screen.height - 160+'px';


        //选择自己喜欢要看的
        $ionicModal.fromTemplateUrl('templates/like_modal.html', {
            scope: $scope
            //,
            //animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.likeModal = modal;
        });

        if(!window.localStorage.getItem('likes')){
            $timeout(function(){
                $scope.likeModal.show();
            },500);
        }else {
            var yy = JSON.parse(window.localStorage.getItem('likes'));
            $rootScope.filter.id = yy.h;
            $rootScope.filter.count = yy.c;
        }

        /**
         *增加对某一个评论点赞的方法
         */
        $scope.goZan = function (xy) {

            if ($rootScope.user == null) {
                $cordovaDialogs.alert('请先登录', '温馨提示', '确定')
                    .then(function () {
                        // callback success
                    });
                return;
            }

            // 添加到赞列表
            var zanObject = Bmob.Object.extend("Zan");
            // 插入许愿列表
            //var aa = Bmob.Query(Xy_List);
            var zan = new zanObject();
            // Pointer指针
            zan.set("userId", $rootScope.user);
            zan.save(null, {
                success: function (zan) {

                    var relation = xy.relation("zan");
                    relation.add(zan);
                    xy.save();
                    //点赞
                    if (xy.showZan == true) {
                        xy.increment("zanCount");
                    }
                    //取消赞
                    else {
                        xy.increment("zanCount", -1);
                    }
                    xy.save().then(function (success) {
                        //console.log(xy.showZan);
                    }, function (error) {
                    });
                },
                error: function (ddd, error) {
                    alert("抱歉，没赞成功。。" + error.message);
                }
            });
        };
        //TODO 许愿详情
        $ionicModal.fromTemplateUrl('xy-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.comments = [];
        $scope.openModal = function () {
            $scope.modal.show().then(function (obj) {
                $timeout(function(){
                    $scope.largeImage = $scope.item.get('image')._url;
                    loadComment();

                },1000);
            });
        };
        var newPost;
        var loadComment = function () {
            if(!$rootScope.isConnected){
                $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                return;
            }
            // 检测类型，看是否加载更多内容
            var style = $scope.item.get('style');
            var detailId = $scope.item.get('detailId');
            if (style == 1) {
                //短信息，直接显示
                $scope.article = $scope.item.get('title');
            } else {
                $ionicLoading.show({template: '加载详细内容...'});
                // 实例方法
                var XyDetail = Bmob.Object.extend("Xy_Detail");
                var query = new Bmob.Query(XyDetail);
                query.equalTo("objectId", detailId.id);
                query.ascending("createdAt");
                // 查询所有数据
                query.first({
                    success: function (results) {
                        $ionicLoading.hide();
                        $scope.article = results.get('extends');
                    },
                    error: function (error) {
                        alert("查询失败: " + error.code + " " + error.message);
                    }
                });
            }
            // 查询评论
            $scope.comments.length = 0;

            if ($scope.item.get('commentCount') > 0 || newPost) {
                $scope.detailLoading = true;
                //$ionicLoading.show({template: '加载评论中...' + "<i class = 'ion-close-round' ng-click='forceLoading()'></i>"});
                var commentIdQuery = $scope.item.relation('comment').query();
                commentIdQuery.include("userId");
                commentIdQuery.descending("-createdAt");
                commentIdQuery.find({
                    success: function (results) {
                        //$ionicLoading.hide();

                        $scope.comments = results;
                    },
                    error: function (error) {
                        alert("查询失败: " + error.code + " " + error.message);
                    }
                });
            } else {

            }
        };

        $scope.closeModal = function () {
            $scope.comments.length = 0;
            $scope.item = null;
            $scope.largeImage = null;
            $scope.article=null;
            $scope.modal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.comments.length = 0;
            $scope.item = null;
            $scope.largeImage = null;
            $scope.modal.remove();
        });

        // 弹出毕业墙的详情
        $scope.goXyDetail = function (detail) {
            $scope.item = null;
            $scope.item = detail;
            $scope.openModal();
        };

        $ionicModal.fromTemplateUrl('img-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.imgModal = modal;
        });

        $scope.closeImgModal = function () {
            $scope.imgModal.hide();
            $scope.img = '';
            newPost = false;
        };

        $scope.showLarge = function () {
            $scope.imgModal.show();
        };
        $scope.view = {addCommentText2: null};

        $scope.onScrollTimeline = function(){
            if ($ionicScrollDelegate.getScrollPosition().top > 20 || $ionicScrollDelegate.getScrollPosition().top < -20) {
//                console.log("$ionicScrollDelegate.getScrollPosition().top :"+$ionicScrollDelegate.getScrollPosition().top );
                var isVisible = $cordovaKeyboard.isVisible();
                if(isVisible) {
                    $cordovaKeyboard.close();
                }
            }
        }

        $scope.goUserLocation = function(item){
            if(!$rootScope.isConnected){
                $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                return;
            }

            if (item) {
                localStorage.setItem('xy_item', JSON.stringify(item));
                localStorage.setItem('xy_item_userId', JSON.stringify(item.get('userId')));
                $state.go('address', {log:item.get('location')._longitude,lat:item.get('location')._latitude});
            } else {
                localStorage.removeItem('xy_item');
                localStorage.removeItem('xy_item_userId');
                $state.go('address', {log:"",lat:""});
            }

        };
        //TODO 保存简单的评论
        $scope.saveForm = function (xy, addCommentText) {
            if ($rootScope.user == null) {
                $cordovaDialogs.alert('请先登录', '温馨提示', '确定')
                    .then(function () {
                        // callback success
                    });

                return;
            }
            if(!$rootScope.isConnected){
                $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                return;
            }
            $ionicLoading.show({template: '评论中...' + "<i class = 'ion-close-round' ng-click='forceLoading()'></i>"});
            // 添加到赞列表
            var commentObject = Bmob.Object.extend("Comment");
            // 插入许愿列表
            //var aa = Bmob.Query(Xy_List);
            var comment = new commentObject();
            // Pointer指针
            comment.set("userId", $rootScope.user);
            comment.set("content", addCommentText);

            comment.save(null, {
                success: function (comment) {

                    $scope.view.addCommentText2 = null;
                    // 添加成功之后，将之前查询到的评论信息的relation字段重置。关联起来
                    xy.increment("commentCount");
//                    xy.save();

                    var relation = xy.relation("comment");
                    relation.add(comment);
                    xy.save().then(function (xyNew) {
//                        $cordovaDialogs.confirm('添加评论成功', '温馨提示', '确定')
                        $ionicLoading.hide();
                        newPost = true;

                        relation.parent = null;
                        xy.relation('comment').parent.attributes.comment = relation;//success.relation("comment");

                        loadComment();
                    }, function (error) {
                        $ionicLoading.hide();
                        $cordovaDialogs.alert('添加评论失败了' + JSON.stringify(error), '温馨提示', '确定');
                    });

                },
                error: function (ddd, error) {
                    alert("抱歉，添加评论失败。。" + error.message);
                }
            });
        };
        /**
         * 查询内容
         */
        $scope.more = true;
        $scope.results = [];
        var skip = 0;

        var loadMore = function () {
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

                            loadReallyContent();
                        } else {
                            $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                        }
                    },
                    error: function(result) {
                        $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                    }
                });
            } else {
                loadReallyContent();
            }
        }

        var loadReallyContent = function () {
            var XyList = Bmob.Object.extend("Xy_List");

            var query = new Bmob.Query(XyList);
            query.limit(10);
            query.skip(skip);
            // 查询关联的用户信息
            query.include("userId");
            if($rootScope.filter.id != 0){
                query.equalTo("hide", ""+$rootScope.filter.id);
            }

            // 查询评论总数，和赞数目
            query.descending("createdAt");
            console.log("查询前:" + skip);
            query.find({
                success: function (results) {
                    $ionicLoading.hide();
                    if (skip == 0) {
                       $scope.results.length = 0;
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');    
                    if (results.length > 0) {
                        $scope.more = true;

                        //对查询的结果递归
                        angular.forEach(results, function (result) {
                            result.htmlStr = $sce.trustAsHtml(result.get('title'));
                            $scope.results.push(result);
                        });
                        skip += results.length;
                        
                    } else {
                        if (skip == 0) {
                            $cordovaDialogs.confirm("没有更多数据啦", '糟糕了', '确定');
                        }
                        $scope.more = false;
                    }

                },
                error: function (error) {
                    $cordovaDialogs.confirm('程序员在干嘛啦！' + error.code + " " + error.message, '糟糕了', '确定');
                    $ionicLoading.hide();
//                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        }

        //下拉刷新
        $scope.hardRefresh = function () {
            showLoading = false;
            skip = 0;

            loadMore();
        }


        $scope.loadMorePost = function () {
            showLoading = false;
            // 让系统延迟1s 检测网络是否链接
            $timeout(function(){
                loadMore();
            },1000);
        }

        $scope.listLoading = true;

        //$ionicLoading.show({template: '加载中...'});
        $rootScope.$on("RefreshEvent", function (event, x) {
            $scope.hardRefresh();
        });

        $scope.dateFn = function(date) {
            return $appService.dateFn(date);
        }

        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope
            //,
            //animation: 'slide-in-up'
        }).then(function(popover) {
            $scope.popover = popover;
        });
        $scope.selectedItem = {"index":-1};

        $scope.goFilter= function(item){
            $scope.likeModal.hide();
            if($scope.selectedItem.index>=0) {

                var yy = $scope.popData[$scope.selectedItem.index];
                // 全局有效
                $rootScope.filter.id = yy.h;
                $rootScope.filter.count = yy.c;
                window.localStorage.setItem('likes',JSON.stringify(yy));
                $.fn.umshare.tip('主人,马上给你撸呀:'+yy.t);
                $scope.popover.hide();
                skip=0;
                loadReallyContent();
            }
        }
    })


    .controller('XyByMeCtrl', function ($appService, $cordovaDialogs, $ionicLoading, $rootScope, $sce, $scope, $cordovaDevice, $cordovaActionSheet, $ionicModal) {
        // FEF
        var skip = 0;
        $scope.results = [];
        $scope.more = false;
        var loadMyXy = function () {
            if(!$rootScope.isConnected){
                $cordovaDialogs.confirm('世界上最遥远的还是没有网络', '糟糕了', '确定');
                return;
            }
            var XyList = Bmob.Object.extend("Xy_List");

            var query = new Bmob.Query(XyList);
            query.limit(20);
            query.skip(skip);
            if($rootScope.filter.id != 0){
                query.equalTo("hide", ""+$rootScope.filter.id);
            }
            // 查询关联的用户信息
            query.equalTo("userId", $rootScope.user.objectId+"");
            // 查询评论总数，和赞数目
            query.descending("createdAt");
            console.log("查询前:" + skip);
            query.find({
                success: function (results) {
                    console.log('' + JSON.stringify(results));
                    $ionicLoading.hide();
                    if (skip == 0) {
                        $scope.results.length = 0;
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if (results.length > 0) {
                        $scope.more = true;

                        //对查询的结果递归
                        angular.forEach(results, function (result) {
                            result.htmlStr = $sce.trustAsHtml(result.get('title'));
                            $scope.results.push(result);
                        });
                        skip += results.length;

                    } else {
                        if (skip == 0) {

                        }
                        $scope.more = false;
                    }
                }, error: function (error) {
                    console.log('' + JSON.stringify(error));
                }});
        };


        $scope.refreshMyXy = function () {
            skip = 0;
            loadMyXy();
        };

        $scope.dateFn = function(date) {
            return $appService.dateFn(date);
        }
        //获取第几天
        $scope.getDay = function (date) {
            var str = date.toString();
            str = str.replace(/-/g, "/");
            return new Date(str).getDate();
        };
        //获取第几月
        $scope.getMonth = function (date) {
            var str = date.toString();
            str = str.replace(/-/g, "/");
            return new Date(str).getMonth() + 1 + '月';
        };

        //查看大图
        $ionicModal.fromTemplateUrl('img-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.imgModal = modal;
        });
        $scope.closeImgModal = function () {
            $scope.imgModal.hide();
            $scope.img = '';
        };
        $scope.showLarge = function (img) {
            $scope.img = img;
            $scope.imgModal.show();
        };

        //TODO 许愿详情
        $ionicModal.fromTemplateUrl('xy-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        var loadComment = function () {
            if(!$rootScope.isConnected){
                return;
            }
            // 检测类型，看是否加载更多内容
            var style = $scope.item.get('style');
            var detailId = $scope.item.get('detailId');
            if (style == 1) {
                //短信息，直接显示
                $scope.article = $scope.item.get('title');
            } else {
                $ionicLoading.show({template: '加载详细内容...'});
                // 实例方法
                var XyDetail = Bmob.Object.extend("Xy_Detail");
                var query = new Bmob.Query(XyDetail);
                query.equalTo("objectId", detailId.id);
                query.ascending("createdAt");
                // 查询所有数据
                query.first({
                    success: function (results) {
                        $ionicLoading.hide();
                        $scope.article = results.get('extends');
                    },
                    error: function (error) {
                        alert("查询失败: " + error.code + " " + error.message);
                    }
                });
            }
            // 查询评论
            $scope.comments.length = 0;

            if ($scope.item.get('commentCount') > 0) {
                $ionicLoading.show({template: '加载评论中...'});
                var commentIdQuery = $scope.item.relation('comment').query();
                commentIdQuery.include("userId");
                commentIdQuery.descending("-createdAt");
                commentIdQuery.find({
                    success: function (results) {
                        $ionicLoading.hide();

                        $scope.comments = results;
                    },
                    error: function (error) {
                        alert("查询失败: " + error.code + " " + error.message);
                    }
                });
            } else {

            }
        };
        $scope.closeModal = function () {
            $scope.comments.length = 0;
            $scope.item = null;
            $scope.modal.hide();
        };

        $scope.comments = [];
        $scope.openModal = function () {
            $scope.largeImage=null;
            $scope.modal.show().then(function (obj) {
                $timeout(function(){
                    $scope.largeImage = $scope.item.get('image')._url;
                    loadComment();

                },500);
            });

        };
        // 弹出毕业墙的详情
        $scope.goXyDetail = function (detail) {
            $scope.item = null;
            $scope.item = detail;
            $scope.openModal();
        };

        $scope.delete = function (xy) {
            $ionicLoading.show({
                template: '正在删除...'
            });
            xy.set("hide", "1");
            xy.save().then(function (success) {
//                $ionicLoading.hide();
//                $scope.results.remove(success);
//                alert("已经删除");
                $ionicLoading.show({
                    template: '已删除...'
                });
                skip = 0;
                loadMyXy();
            }, function (error) {

            });
        };

        $scope.back = function () {
            window.history.back();
        };
        $scope.view = {addCommentText2: null};
        $scope.saveForm = function (xy, addCommentText) {
            if ($rootScope.user == null) {
                $cordovaDialogs.alert('请先登录', '温馨提示', '确定')
                    .then(function () {
                        // callback success
                    });

                return;
            }
            $ionicLoading.show({template: '评论中...'});
            // 添加到赞列表
            var commentObject = Bmob.Object.extend("Comment");
            // 插入许愿列表
            //var aa = Bmob.Query(Xy_List);
            var comment = new commentObject();
            // Pointer指针
            comment.set("userId", $rootScope.user);
            comment.set("content", addCommentText);

            comment.save(null, {
                success: function (comment) {

                    $scope.view.addCommentText2 = null;

                    // 添加成功之后，将之前查询到的评论信息的relation字段重置。关联起来
                    xy.increment("commentCount");
                    xy.save();

                    var relation = xy.relation("comment");
                    relation.add(comment);
                    xy.save().then(function (success) {
//                        $cordovaDialogs.confirm('添加评论成功', '温馨提示', '确定')
                        $ionicLoading.hide();
                        newPost = true;
                        loadComment();
                    }, function (error) {
                        $ionicLoading.hide();
                        $cordovaDialogs.alert('添加评论失败了' + JSON.stringify(error), '温馨提示', '确定');
                    });

                },
                error: function (ddd, error) {
                    alert("抱歉，添加评论失败。。" + error.message);
                }
            });
        };

        loadMyXy();
    })

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
            $scope.loginBtn = function () {
                // 现实第三方登陆的login
                $cordovaActionSheet.show(options)
                    .then(function (btnIndex) {
                        var index = btnIndex;
                        var platform;
                        // 目前只支持 平台名.('sina','tencent','qzone','renren','douban')
                        if (index == 1) {
                            platform = 'sina';

                            $.fn.umshare.checkToken('sina', function (user) {
                                // 测试是否登陆成功过sina
                                $.fn.umshare.tip('登录成功,token:' + user.token + ', uid:' + user.uid);
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

// 预留可以删除
    .controller('FriendsCtrl', function ($scope, Friends) {
        $scope.friends = Friends.all();
    })

// 预留可以删除
    .controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
        $scope.friend = Friends.get($stateParams.friendId);
    }
);
