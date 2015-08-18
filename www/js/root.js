/**fbb 
 * Created by leo on 15/7/19.
 */
(function($) {
    // 格式化事件
    Date.prototype.format = function(format){
        var o = {
            "M+" : this.getMonth()+1, //month
            "d+" : this.getDate(), //day
            "h+" : this.getHours(), //hour
            "m+" : this.getMinutes(), //minute
            "s+" : this.getSeconds(), //second
            "q+" : Math.floor((this.getMonth()+3)/3), //quarter
            "S" : this.getMilliseconds() //millisecond
        }

        if(/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        }

        for(var k in o) {
            if(new RegExp("("+ k +")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
            }
        }
        return format;
    }


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
})(jQuery);