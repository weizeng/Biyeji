/**
 * Created by leo.wei on 15/8/15.
 */
angular.module('starter.controllers')
    .controller('AddressCtrl', function ($stateParams, $ionicScrollDelegate, $cordovaKeyboard, $locationService, $cordovaGeolocation, $ionicPopup, $timeout, $cordovaDialogs, $ionicPlatform, $rootScope, $scope, $ionicLoading, $cordovaCamera, $cordovaFile, $http) {
        var map = new BMap.Map("l-map");
//        map.centerAndZoom(new BMap.Point(116.328749,40.026922), 13);
        map.enableScrollWheelZoom(true);
        var index = 0;
//        var location= $stateParams.lat;
//        alert($stateParams.lat+','+$stateParams.log);
        var adds = [];
        if ($stateParams.lat != "" && $stateParams.log != "") {
            adds = [
                new BMap.Point($stateParams.log, $stateParams.lat)
            ];
            map.centerAndZoom(new BMap.Point($stateParams.log, $stateParams.lat), 13);
            startCanvas(adds);
        } else {
            // 宣言列表
            var XyList = Bmob.Object.extend("Xy_List");

            var query = new Bmob.Query(XyList);
            // 查询关联的用户信息
            query.include("userId");
            query.equalTo("hide", null);
            query.notEqualTo("location", null);
            // 查询评论总数，和赞数目
            query.descending("createdAt");
            query.find({
                success: function (results) {
                    angular.forEach(results, function (result) {
                        var location = result.get('location');
                        adds.push(new BMap.Point(location._longitude, location._latitude));

                    });
                    map.centerAndZoom(adds[0], 13);
                    startCanvas(adds);

                }, error: function (result) {
                    console.log("error:"+result);
                }
            });
        }

        function startCanvas(adds){
            var myGeo = new BMap.Geocoder();

            for (var i = 0; i < adds.length; i++) {
                var myIcon = new BMap.Icon("img/maker.png", new BMap.Size(52, 104));
                var marker = new BMap.Marker(adds[i], {icon: myIcon});//,{icon:myIcon}
                map.addOverlay(marker);
                marker.setLabel(new BMap.Label("我是商圈:" + (i + 1), {offset: new BMap.Size(20, -10)}));
//            marker.setAnimation(BMAP_ANIMATION_BOUNCE);
                marker.addEventListener("click", getAttr);
            }
        }


        function getAttr(marker) {
            var point = new BMap.Point(marker.target.getPosition().lng, marker.target.getPosition().lat);

//                var opts = {
//                    width : 250,     // 信息窗口宽度
//                    height: 80,     // 信息窗口高度
//                    title : "信息窗口" , // 信息窗口标题
//                    enableMessage:true//设置允许信息窗发送短息
//                };

            var content =
                "marker的位置是" + point.lng + "," + point.lat +
                "<img style='float:right;margin:4px' id='imgDemo' src='http://app.baidu.com/map/images/tiananmen.jpg' width='139' height='104' title='天安门'/>" +
                "<p style='margin:0;line-height:1.5;font-size:13px;text-indent:2em'>天安门坐落在中国北京市中心,故宫的南侧,与天安门广场隔长安街相望,是清朝皇城的大门...</p>" +
                "</div>";


            var infoWindow = new BMap.InfoWindow(content);  // 创建信息窗口对象
            map.openInfoWindow(infoWindow, point);

//                var p = marker.getPosition();       //获取marker的位置
//                alert("marker的位置是" + p.lng + "," + p.lat);
//                infoWindow.redraw();
        }

        function bdGEO() {
            var pt = adds[index];
            geocodeSearch(pt);
            index++;
        }

        function geocodeSearch(pt) {
            if (index < adds.length - 1) {
                setTimeout(window.bdGEO, 400);
            }
            myGeo.getLocation(pt, function (rs) {
                var addComp = rs.addressComponents;
                document.getElementById("result").innerHTML += index + ". " + adds[index - 1].lng + "," + adds[index - 1].lat + "：" + "商圈(" + rs.business + ")  结构化数据(" + addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber + ")<br/><br/>";
            });
        }


    });
