angular.module('starter.services',[])

    .service('locationService', function ($cordovaGeolocation) {

        return {
            locate: function () {
                //获取定位iOS
                if (ionic.Platform.isIOS()) {
                    var posOptions = {timeout: 20000, enableHighAccuracy: false};
                    $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function (position) {
                            //与百度误差
                            var latitude = position.coords.latitude + 0.0034;
                            var longitude = position.coords.longitude + 0.011;
                            alert(position);
                            return position;
                        }, function (err) {
                            console.log(JSON.stringify(err));
                            return;
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
                            return position;
                        }, function (err) {
                            console.log(JSON.stringify(err));
                            return;
                        });
                    })

                }
            }
        };
    });
