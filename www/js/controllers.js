angular.module('starter.controllers', ['ionic', 'ngCordova'])


/**
 *许愿的列表
 */
    .controller('XYListCtrl', function ($cordovaDialogs, $sce, $rootScope, $scope, $ionicLoading, $cordovaDevice, $ionicModal, $timeout) {
        /**
         *增加对某一个评论点赞的方法
         */

        $scope.goZan = function (xy) {
            //alert(xy);
            // 添加到赞列表
            var zanObject = Bmob.Object.extend("Zan");
            // 插入许愿列表
            //var aa = Bmob.Query(Xy_List);
            var zan = new zanObject();
            // Pointer指针
            zan.set("userId", $rootScope.user);
            zan.save(null, {
                success: function (zan) {
                    // 添加成功之后，将之前查询到的评论信息的relation字段重置。关联起来
                    var relation = xy.relation("zan");
                    relation.add(zan);
                    xy.save();
                    //xy.showZan = true;
                    console.log(xy.showZan);
                    //alert("赞成");
                    $cordovaDialogs.confirm('已赞', '太好了', '确定');
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
        $scope.openModal = function () {
            $scope.modal.show().then(function (obj) {
                // 检测类型，看是否加载更多内容
                var style = $scope.item.get('style');
                var detailId = $scope.item.get('detailId');
                if (style == 1) {
                    //短信息，直接显示
                    $scope.article = $scope.item.get('title');
                } else {
                    $ionicLoading.show({template: '加载中...'});
                    // 实例方法
                    var XyDetail = Bmob.Object.extend("Xy_Detail");
                    var query = new Bmob.Query(XyDetail);
                    query.equalTo("objectId", detailId.id);
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
            });

        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });

        // 弹出毕业墙的详情
        $scope.goXyDetail = function (detail) {
            $scope.item = detail;
            $scope.openModal();
        };

        //TODO 保存简单的评论
        $scope.saveForm = function (xy) {
            $ionicLoading.show({template: '评论中...'});
            // 添加到赞列表
            var commentObject = Bmob.Object.extend("Comment");
            // 插入许愿列表
            //var aa = Bmob.Query(Xy_List);
            var comment = new commentObject();
            // Pointer指针
            comment.set("userId", $rootScope.user);
            comment.set("content", $scope.msg);
            comment.save(null, {
                success: function (comment) {
                    $ionicLoading.hide();
                    // 添加成功之后，将之前查询到的评论信息的relation字段重置。关联起来
                    var relation = xy.relation("commentId");
                    relation.add(comment);
                    xy.save();
                    alert("添加评论成功");
                },
                error: function (ddd, error) {
                    alert("抱歉，添加评论失败。。" + error.message);
                }
            });
        };
        /**
         * 查询内容
         */
        $scope.zanCount = [];
        $scope.commentCount = [];
        $scope.more = true;
        $scope.results = [];
        var skip = 0;

        loadMore = function () {
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
            $ionicLoading.show({template: '加载中...'});

            var query = new Bmob.Query(XyList);
            query.limit(10);
            query.skip(skip);
            // 查询关联的用户信息
            query.include("userId");
            // 查询评论总数，和赞数目
            query.descending("createdAt");

            query.find({
                success: function (results) {
                    $ionicLoading.hide();
                    if (results.length > 0) {
                        $scope.more = true;

                        if (skip == 0) {
                            $scope.results.length = 0;
                            $scope.commentCount.length = 0;
                            $scope.$broadcast('scroll.refreshComplete');
                        }
                        angular.forEach(results, function (result) {
                            result.htmlStr = $sce.trustAsHtml(result.get('title'));
                            // FIXME 考虑后台提交file的时候直接产生缩略图 http://wenda.bmob.cn/?/question/129 在云端掺入url可以让云端保存呢一份缩略图，将返回的url保存到特殊字段中
                            // 怀疑第二次请求会取本地的图片直接返回
                            var zanRelation = result.relation("zan");
                            zanRelation.query().find({
                                success: function (list) {
                                    $scope.zanCount.push(list.length);
                                }
                            });

                            var commentIdRelation = result.relation("commentId");
                            commentIdRelation.query().find({
                                success: function (list) {
                                    $scope.commentCount.push(list.length);
                                }
                            });

                            $scope.results.push(result);
                        });
                        skip += results.length;
                        console.log("skip:" + skip);
                    } else {
                        if (skip == 0) {

                        }
                        $scope.more = false;
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },
                error: function (error) {
                    $cordovaDialogs.confirm('程序员在干嘛啦！' + error.code + " " + error.message, '糟糕了', '确定');
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.refreshComplete');
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

        if( window.sessionStorage.getItem('doRefresh')){
            window.sessionStorage.removeItem('doRefresh');
            $scope.hardRefresh();
        }

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
                result = date;
                //result = "发表于" + parseInt(monthC) + "个月前";
            }
            else if (weekC >= 1) {
                result = date;
                //result = "发表于" + parseInt(weekC) + "周前";
            }
            else if (dayC >= 1) {
                result = parseInt(dayC) + "天前";
            }
            else if (hourC >= 1) {
                result = parseInt(hourC) + "个小时前";
            }
            else if (minC >= 1) {
                result = parseInt(minC) + "分钟前";
            }
            else if (minC < 1) {
                result = "刚刚";
            } else
                result = date;
            return result;
        }
    })

// 增加我的毕业说
    .controller('AddXyCtrl', function ($cordovaDialogs, $ionicPlatform, $rootScope, $scope, $ionicLoading, $cordovaCamera, $cordovaFile) {

        //返回
        $scope.back = function () {
            window.history.back();
            initData();
        };

        $scope.xy = {content: null};

        //初始化加载先清空
        function initData(){
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

            var name = imageLocalPath.substr(imageLocalPath.lastIndexOf('/') + 1);
            document.addEventListener("deviceready", function () {
                var picDictionary;
                if (ionic.Platform.isAndroid()) {
                    // 必须要加前缀file:// 否则出现 ECODING_ERR的错误
                    picDictionary = 'file://' + imageLocalPath.substr(0, imageLocalPath.lastIndexOf('/'));
                } else {
                    picDictionary = cordova.file.tempDirectory;
                }

                console.log("#增加许愿#图片:" + picDictionary);
                $cordovaFile.readAsBinaryString(picDictionary, name).then(function (success) {
                    // success
                    $ionicLoading.show({
                        template: ('发表中... ' + "<i class = 'ion-close-round' ng-click='forceLoading()'></i>")
                    });

                    //$ionicLoading.show({template: '发表中...'});
                    var file = new Bmob.File(name, success, "image/png");
                    console.log("#增加许愿#图片读取完毕:" + picDictionary);
                    file.save().then(function (savedObject) {
                        // 生成缩略图
                        Bmob.Image.thumbnail({"image": savedObject.url(), "mode": 0, "quality": 100, "width": 480}
                        ).then(function (thumbnail) {
                                console.log("#增加许愿#缩略图图片上传完毕, 准备添加到URL:" + thumbnail.url());
                                var Xy_List = Bmob.Object.extend("Xy_List");
                                // 插入许愿列表
                                var ddd = new Xy_List();
                                ddd.set("title", $scope.xy.content);
                                // Pointer指针
                                ddd.set("userId", $rootScope.user);
                                ddd.set("image", savedObject);
                                ddd.set("image_small", thumbnail.url);
                                ddd.set("style", 1);
                                ddd.save(null, {
                                    success: function (ddd) {
                                        $ionicLoading.hide();
                                        console.log("#增加许愿# 操作完毕");
//                                alert("你的毕业说已经到宣言墙啦");
                                        var relation = ddd.relation("commentId");
                                        $cordovaDialogs.confirm('你的毕业说已经到宣言墙啦', '太好了', '确定')
                                            .then(function () {
                                                // callback success
                                                window.sessionStorage.setItem('doRefresh',true);
                                                $scope.back();
                                            });
                                    },
                                    error: function (ddd, error) {
                                        $ionicLoading.hide();
                                        alert("抱歉，学长，错了。。" + error.message);
                                    }
                                });

                            });


                    }, function (error) {
                        // the save failed.
                        $ionicLoading.hide();
                        $cordovaDialogs.alert('网络在开小差' + JSON.stringify(error), '糟糕啊', '确定');
                    });
//                    alert("right");
                }, function (error) {
                    // error
                    $cordovaDialogs.alert('网络在开小差2' + JSON.stringify(error), '糟糕啊', '确定');
                });
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
                console.log('Failed because: ');
                console.log(err);
            });
        }
    })

    // 我的毕业脚印
    .controller('MyBoardCtrl', function ($rootScope, $scope, $http, $ionicLoading) {
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
            $scope.user = $rootScope.user;
            // 对象转化成json的字符串保存
            localStorage.setItem('user', JSON.stringify(user));
        };

        //FIXME
        $scope.user = $rootScope.user;
    })

/**
 *
 * 不经常用到
 *
 *
 */
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
    }
);
