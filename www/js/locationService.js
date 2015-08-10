angular.module('starter.services',[])

    .service('$locationService', function ($http, $cordovaGeolocation) {
        var parseLocation = function(latitude, longitude, parseLocationResult) {
            $http({
                method: 'GET',
                url: 'http://api.map.baidu.com/geocoder/v2/?ak=fe3SKZ5DnQh2IdEGotsdUlnR'+"&location=" + latitude + "," + longitude+"&output=json"+'&pois=1'
            }).success(function(data) {
                console.log(JSON.stringify(data));
                if(data.status === 0){
                    //alert(JSON.stringify(data));
                    var address = data.result.addressComponent.province+","+data.result.addressComponent.city+","+data.result.addressComponent.district+""+data.result.addressComponent.street;
                    //TODO 保存位置
                    parseLocationResult(address);
                }
            });
        }

        return {
            locate: function (locationResult, parseLocationResult) {
                //获取定位iOS
                if (ionic.Platform.isIOS()) {
                    var posOptions = {timeout: 20000, enableHighAccuracy: false};
                    $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function (position) {
                            //与百度误差
                            var latitude = position.coords.latitude + 0.0034;
                            var longitude = position.coords.longitude + 0.011;
//                            alert(position);
                            console.log(JSON.stringify(position));
                            locationResult(latitude, longitude);
                            parseLocation(latitude, longitude, parseLocationResult);
                        }, function (err) {
                            console.log(JSON.stringify(err));
                            locationResult(0, 0);
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
                            console.log(JSON.stringify(position));
                            locationResult(latitude, longitude);
                            parseLocation(latitude, longitude, parseLocationResult);
                        }, function (err) {
                            console.log(JSON.stringify(err));
                            locationResult(0, 0);
                        });
                    })

                }
            }
        };
    });
