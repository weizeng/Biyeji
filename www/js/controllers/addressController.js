/**
 * Created by leo.wei on 15/8/15.
 */
angular.module('starter.controllers')
    .controller('AddressCtrl', function ($stateParams, $ionicScrollDelegate, $cordovaKeyboard, $locationService, $cordovaGeolocation, $ionicPopup, $timeout, $cordovaDialogs, $ionicPlatform, $rootScope, $scope, $ionicLoading, $cordovaCamera, $cordovaFile, $http) {
        //返回
        $scope.back = function () {
            window.history.back();
        };

        function SquareOverlay(center, width, height, img) {
            this._center = center;
            this._width = width;
            this._height = height;
            this._img = img;
        }

        // 继承API的BMap.Overlay
        SquareOverlay.prototype = new BMap.Overlay();

        //2、初始化自定义覆盖物
        // 实现初始化方法
        SquareOverlay.prototype.initialize = function (map) {
            // 保存map对象实例
            this._map = map;
            // 创建div元素，作为自定义覆盖物的容器
            var div = document.createElement("div");
            div.style.position = "absolute";
            // 可以根据参数设置元素外观
            div.style.width = this._width + "px";
            div.style.height = this._height + "px";
            div.style.background = "url(img/maker.png)";

            var img = document.createElement("img");
            img.setAttribute("src", this._img);
            img.setAttribute("style", "border-radius: 50%;border: 1px solid #F78181;margin-top: 10px;");

            div.appendChild(img);
            // 将div添加到覆盖物容器中
            map.getPanes().markerPane.appendChild(div);
            // 保存div实例
            this._div = div;
            // 需要将div元素作为方法的返回值，当调用该覆盖物的show、
            // hide方法，或者对覆盖物进行移除时，API都将操作此元素。
            return div;
        }


//3、绘制覆盖物
// 实现绘制方法
        SquareOverlay.prototype.draw = function () {
// 根据地理坐标转换为像素坐标，并设置给容器
            var position = this._map.pointToOverlayPixel(this._center);
//                this._div.style.left = position.x - this._length / 2 + "px";
//                this._div.style.top = position.y - this._length / 2 + "px";
            this._div.style.left = position.x - this._width / 2 + "px";
            this._div.style.top = position.y - this._height + "px";
        }

        //6、自定义覆盖物添加事件方法
        SquareOverlay.prototype.addEventListener = function (event, data, fun) {
            this._div['on' + event] = fun;
//                this._div['lng'] = location;
            this._div['data'] = data;
        }

        var map = new BMap.Map("l-map");
//        map.centerAndZoom(new BMap.Point(116.328749,40.026922), 13);
        map.enableScrollWheelZoom(true);
//        map.addControl(new BMap.ScaleControl());

//        initMap();
        var index = 0;
//        var location= $stateParams.lat;
//        alert($stateParams.lat+','+$stateParams.log);
        var adds = [];
        if ($stateParams.lat != "" && $stateParams.log != "") {
            adds = [
                {point: new BMap.Point($stateParams.log, $stateParams.lat), include: null}
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
                        adds.push({point: new BMap.Point(location._longitude, location._latitude), include: result});

                    });
                    map.centerAndZoom(adds[0].point, 13);
                    startCanvas(adds);
                }, error: function (result) {
                    console.log("error:" + result);
                }
            });
        }

        function startCanvas(adds) {
            for (var i = 0; i < adds.length; i++) {
                var userImageUrl = null;
                if (adds[i].include != null) {
//                // 增加用户头像
                    userImageUrl = JSON.parse(adds[i].include.get('userId').get('weiboMes'));//.get('profile_image_url')
                }

                var mySquare = new SquareOverlay(adds[i].point, 52, 104, userImageUrl.profile_image_url);

                map.addOverlay(mySquare);
                mySquare.addEventListener('click', adds[i], function (e) {//这里是自定义覆盖物的事件
                    getAttr(e.currentTarget.data);
                });
            }
        }


        function getAttr(marker) {
            if (marker.include == null) {
                return;
            }
            var point = new BMap.Point(marker.point.lng, marker.point.lat);

            var opts = {
                width: 250,     // 信息窗口宽度
                height: 80,     // 信息窗口高度
                title: "信息窗口", // 信息窗口标题
                enableMessage: true//设置允许信息窗发送短息
            };
            var imageUrl = 'http://file.bmob.cn/' + marker.include.get('image_small');
            var content =
                marker.include.get('title') +
                "<img style='float:right;margin:4px' src=" + imageUrl + ">";


            var infoWindow = new BMap.InfoWindow(content);  // 创建信息窗口对象
            map.openInfoWindow(infoWindow, point);
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
