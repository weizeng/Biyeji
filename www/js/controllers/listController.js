angular.module('starter.controllers', ['ionic', 'ngCordova'])


/**
 *许愿的列表
 */
    .controller('XYListCtrl', function ($cordovaDialogs, $sce, $rootScope, $scope, $ionicLoading, $cordovaDevice, $ionicModal, $timeout,locationService) {
        //locationService.locate(function(result){
        //    alert(JSON.stringify(result));
        //});
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
                    if(xy.showZan==true){
                        xy.increment("zanCount");
                    }
                    //取消赞
                    else {
                        xy.increment("zanCount",-1);
                    }
                    xy.save().then(function (success) {
                        //console.log(xy.showZan);
                    }, function (error) {
                    });
                    //xy.showZan = true;

                    //alert("赞成");
//                    $cordovaDialogs.confirm('已赞', '太好了', '确定');
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
                loadComment();
            });

        };
        var newPost;
        var loadComment = function () {

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
            $scope.item=null;
            $scope.modal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.comments.length = 0;
            $scope.item = null;
            $scope.modal.remove();
        });

        // 弹出毕业墙的详情
        $scope.goXyDetail = function (detail) {
            $scope.item=null;
            $scope.item = detail;
            $scope.openModal();
        };

        //TODO 许愿详情
        $ionicModal.fromTemplateUrl('img-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.imgModal = modal;
        });

        $scope.closeImgModal = function () {
            $scope.imgModal.hide();
            $scope.img='';
            newPost = false;
        };

        $scope.showLarge= function () {
            $scope.imgModal.show();
        };
        $scope.view = {addCommentText2: null};
        //TODO 保存简单的评论
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
        /**
         * 查询内容
         */
        $scope.more = true;
        $scope.results = [];
        var skip = 0;

        var loadMore = function () {
            // 宣言列表
            var XyList = Bmob.Object.extend("Xy_List");

            var query = new Bmob.Query(XyList);
            query.limit(10);
            query.skip(skip);
            // 查询关联的用户信息
            query.include("userId");
            query.equalTo("hide", null);
            // 查询评论总数，和赞数目
            query.descending("createdAt");
            console.log("查询前:" + skip);
            query.find({
                success: function (results) {
                    $ionicLoading.hide();
                    if (results.length > 0) {
                        $scope.more = true;
                        if (skip == 0) {
                            $scope.results.length = 0;
                            $scope.$broadcast('scroll.refreshComplete');
                        }
                        //对查询的结果递归
                        angular.forEach(results, function (result) {
                            result.htmlStr = $sce.trustAsHtml(result.get('title'));
                            $scope.results.push(result);
                        });
                        skip += results.length;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    } else {
                        if (skip == 0) {

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
            loadMore();
        }

        $ionicLoading.show({template: '加载中...'});
        $rootScope.$on("RefreshEvent", function (event, x) {
            $scope.hardRefresh();
        });

        //TODO dateFn 日期格式化
        $scope.dateFn = function (date) {

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
    })



    .controller('XyByMeCtrl', function ($ionicLoading,$rootScope,$sce, $scope, $cordovaDevice, $cordovaActionSheet,$ionicModal) {
        // FEF
        var skip = 0;
        $scope.results=[];
        $scope.more=false;
        var loadMyXy = function () {

            var XyList = Bmob.Object.extend("Xy_List");

            var query = new Bmob.Query(XyList);
            query.limit(20);
            query.skip(skip);
            query.equalTo("hide", null);
            // 查询关联的用户信息
            query.equalTo("userId", $rootScope.user.objectId);
            // 查询评论总数，和赞数目
            query.descending("createdAt");
            console.log("查询前:" + skip);
            query.find({
                success: function (results) {
                    console.log(''+JSON.stringify(results));
                    $ionicLoading.hide();
                    if (results.length > 0) {
                        $scope.more = true;
                        if (skip == 0) {
                            $scope.results.length = 0;
                            $scope.$broadcast('scroll.refreshComplete');
                        }
                        //对查询的结果递归
                        angular.forEach(results, function (result) {
                            result.htmlStr = $sce.trustAsHtml(result.get('title'));
                            $scope.results.push(result);
                        });
                        skip += results.length;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    } else {
                        if (skip == 0) {

                        }
                        $scope.more = false;
                    }
                }, error: function (error) {
                    console.log(''+JSON.stringify(error));
                }});
        };


        $scope.refreshMyXy = function () {
            skip = 0;
            loadMyXy();
        };

        //TODO dateFn 日期格式化
        $scope.dateFn2 = function (date) {

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
            str = str.split(' ')[1];
            if (monthC >= 1) {
                result = str;
                //result = "发表于" + parseInt(monthC) + "个月前";
            }
            else if (weekC >= 1) {
                result = str;
                //result = "发表于" + parseInt(weekC) + "周前";
            }
            else if (dayC >= 1) {
                result = str;
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
        };
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
            return new Date(str).getMonth()+1+'月';
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
            $scope.img='';
        };
        $scope.showLarge= function (img) {
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
            $scope.item=null;
            $scope.modal.hide();
        };

        $scope.comments = [];
        $scope.openModal = function () {
            $scope.modal.show().then(function (obj) {
                loadComment();
            });

        };
        // 弹出毕业墙的详情
        $scope.goXyDetail = function (detail) {
            $scope.item=null;
            $scope.item = detail;
            $scope.openModal();
        };

        $scope.delete = function (xy) {
            $ionicLoading.show({
                template: '正在删除...'
            });
            xy.set("hide","1");
            xy.save().then(function(success) {
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
