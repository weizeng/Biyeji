/**
 * Created by leo.wei on 15/8/15.
 */
angular.module('starter.controllers')
    .controller('RandomCtrl', function ($appService,$ionicModal,$cordovaToast,$busiService,$sce,$shakeService, $cordovaNetwork,$locationService,$stateParams, $ionicScrollDelegate, $cordovaKeyboard, $cordovaGeolocation, $ionicPopup, $timeout, $cordovaDialogs, $ionicPlatform, $rootScope, $scope, $ionicLoading, $cordovaCamera, $cordovaFile, $http) {
        //返回
        $scope.back = function () {
            window.history.back();
        };


        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        $scope.results=[];
        var loadReallyContent = function () {
            var XyList = Bmob.Object.extend("Xy_List");

            var query = new Bmob.Query(XyList);
            query.limit(6);

            // 查询关联的用户信息
            query.include("userId");
            if($rootScope.appConf.get('hasPass')) {
                query.equalTo("hide", null);
                query.skip(getRandomInt(0, 1000));
            } else {
                query.equalTo("hide", "2");
            }

            // 查询评论总数，和赞数目
            query.descending("createdAt");
            query.find({
                success: function (results) {
                    $ionicLoading.hide();
                    if (results.length > 0) {
                        $scope.more = true;

                        $scope.results.length = 0;
//                        $scope.$broadcast('scroll.refreshComplete');

                        //对查询的结果递归
                        angular.forEach(results, function (result) {
                            result.htmlStr = $sce.trustAsHtml(result.get('title'));
                            $scope.results.push(result);
                        });
                        openPhotoSwipe();
//                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    } else {

                        $scope.more = false;
                    }

                },
                error: function (error) {
                    $cordovaDialogs.confirm('程序员在干嘛啦！' + error.code + " " + error.message, '糟糕了', '确定');
                    $ionicLoading.hide();
                }
            });
        }


        $shakeService.startWatch(function(){
            if(pswp != null) {
                pswp.destroy();
            }
            loadReallyContent();
        });

        $scope.$on('$destroy', function () {
            $shakeService.stopWatch();
            if(pswp!=null) {
                pswp.destroy();
            }
        });

        var pswp=null;
        //INIT...
        var openPhotoSwipe = function() {
            $scope.item = null;
            var pswpElement = document.querySelectorAll('.pswp')[0];
            // build items array
            var items=[];
            if($scope.results.length > 0) {
                $scope.item =  $scope.results[0];
            }
            for(var i=0;i < $scope.results.length;i++) {
                items.push(
                    {
                        src:'http://file.bmob.cn/'+$scope.results[i].get('image_small'),
                        w: $scope.results[i].get('W'),
                        h: $scope.results[i].get('H')
                    }
                );
            }

            // define options (if needed)
            var options = {
                // history & focus options are disabled on CodePen
                history: false,
                focus: false,
                escKey: false,
                closeOnVerticalDrag:false,
                showHideOpacity:333,
                fullscreenEl: false,
                shareEl: false,
                tapToClose: false,
                errorMsg:'<div class="pswp__error-msg">加载失败,请检查网络啦</div>'

            };

            pswp = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            pswp.init();

            pswp.listen('gettingData', function(index, item) {
                // index - index of a slide that was loaded
                // item - slide object

                // e.g. change path to the image based on `something`
//                alert('index:'+index);
                console.log('index:'+index+",pswp.getCurrentIndex():"+pswp.getCurrentIndex());
                // 更新显示的内容，包含可以点赞
                $scope.item= $scope.results[index];
            });
        };

//        openPhotoSwipe();
//        loadReallyContent();

        $scope.goZan = function(item) {
            $busiService.goZan(item, function(xy, result){
                if(result) {
                    console.log('zanCount:'+  xy.attributes.zanCount);
                    $scope.item = xy;
                }
            })
        }

        $scope.goXyDetail = function(item) {
           //open model
            $scope.comments = [];
            $ionicLoading.show({
                template: '正在偷窥...'
            });

            loadComment(item);
        }

        $scope.dateFn = function(item) {
            return $appService.dateFn(item);
        }

        var loadComment = function(item) {
            $busiService.loadComment(item, function(comments, result){
                if(result) {
                    $ionicLoading.hide();
                    if(comments != null && comments.length > 0) {
                        // ignore
                        $scope.comments = comments;
                    } else {
                        if($rootScope.isDeviceReady) {
                            $cordovaToast.showShortBottom('还没人评论');
                        }
                    }
                    $scope.modal.show();
                }
            });
        }

        $scope.comments = [];
        $scope.commentText={comm:null};
        //TODO 许愿详情
        $ionicModal.fromTemplateUrl('xy-detail-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.closeModal = function () {
            $scope.comments.length = 0;
            $scope.commentText = {comm:null};
            $scope.disableShoot = false;
            $scope.modal.hide();
        };

        $scope.saveComment= function (item) {

            $.fn.umshare.tip('正在发射...');
            $scope.disableShoot = true;
            $busiService.saveComment(item, $scope.commentText.comm, function(newItem, result) {
                $scope.disableShoot = false;
                $.fn.umshare.tip(result?"射出去了":"没射出去...");

                if(result) {
                    loadComment(item);
                }
            })
        }
    });
