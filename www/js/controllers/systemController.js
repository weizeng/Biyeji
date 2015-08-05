/**
 * Created by lizhaocai on 15/8/2.
 */
// 系统检测功能，提交bug等

angular.module('starter.controllers')

    .controller('SubmitBugsCtrl', function ($ionicPopup,$sce, $cordovaDialogs, $rootScope, $scope, $state, $http, $ionicLoading, $cordovaInAppBrowser) {
        $scope.feedback= {content: null};
        $scope.submitBugs = function () {
            if ($scope.feedback.content.length < 10) {
                $.fn.umshare.tip('请输入大于10个字哦');
                return;
            }

            $ionicLoading.show({
                template: ('正在反馈... ' + "<i class = 'ion-close-round' ng-click='forceLoading()'></i>")
            });
            var FeedBackObject = Bmob.Object.extend("Feedback");
            // 插入许愿列表
            var ddd = new FeedBackObject();
            // Pointer指针
            ddd.set("userId", $rootScope.user);
            ddd.set("content", $scope.contentForBugs);
            ddd.save(null, {
                success: function (ddd) {
                    $ionicLoading.hide();
                    // 吐槽产品增加20金币
                    $rootScope.user.increment("coin", 20);
                    $rootScope.user.save().then(function(user){
                        $rootScope.user = user;
                        $.fn.umshare.tip('增加 +20金币');
                    });
                    $ionicPopup.confirm({
                        title: '太好了',
                        template: "感谢你的吐槽！",
                        buttons: [
                            {
                                text: '<b>确定</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    // Returning a value will cause the promise to resolve with the given value.
                                    $scope.back();
                                }
                            }]
                    });
                }, error: function (error) {

                }
            });
        };

        $scope.back = function () {
            window.history.back();
        };


    });