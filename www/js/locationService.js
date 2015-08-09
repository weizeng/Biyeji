angular.module('starter.services', [])

    .factory('locationService', function ($cordovaGeolocation, $scope, $cordovaDevice, $rootScope) {
        var callback;
        //获取定位iOS
        if (ionic.Platform.isIOS()) {
            var posOptions = {timeout: 20000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    //与百度误差
                    var latitude = position.coords.latitude + 0.0034;
                    var longitude = position.coords.longitude + 0.011;
//                    alert(JSON.stringify(position));
                    callback(position);
                }, function (err) {
                    alert(JSON.stringify(err));
                });
        }
        //获取定位android
        else if (ionic.Platform.isAndroid()) {
            document.addEventListener('deviceready', function () {
                //通过百度sdk来获取经纬度,并且alert出经纬度信息
                var noop = function () {
                };
                window.locationService.getCurrentPosition(function (position) {
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    //停止地位
                    window.locationService.stop(noop, noop);
//                    alert(JSON.stringify(position));
                    callback(position);
                }, function (err) {
                    alert(JSON.stringify(err));
                });
            })

        }


        return {
            locate: function (callback) {
                this.callback = callback;
                return;
            }
        };
    });
