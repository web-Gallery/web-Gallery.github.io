!function () {
    "use strict";
    function a() {
        function a() {
            function a(a, c) {
                function d(a) {
                    var c = 1 === (e = 1 - e) ? "width" : "height";
                    return Math.floor(Number(a) * b[c])
                }

                var e = 0;
                i[c].coords = a.split(",").map(d).join(",")
            }

            var b = {width: k.width / k.naturalWidth, height: k.height / k.naturalHeight};
            j.forEach(a)
        }

        function b(a) {
            return a.coords.replace(/ *, */g, ",").replace(/ +/g, ",")
        }

        function c() {
            clearTimeout(l), l = setTimeout(a, 250)
        }

        function d() {
            (k.width !== k.naturalWidth || k.height !== k.naturalHeight) && a()
        }

        function e() {
            k.addEventListener("load", a, !1), window.addEventListener("focus", a, !1), window.addEventListener("resize", c, !1), window.addEventListener("readystatechange", a, !1), document.addEventListener("fullscreenchange", a, !1)
        }

        function f() {
            return "function" == typeof h._resize
        }

        function g() {
            i = h.getElementsByTagName("area"), j = Array.prototype.map.call(i, b), k = document.querySelector('img[usemap="#' + h.name + '"]'), h._resize = a
        }

        var h = this, i = null, j = null, k = null, l = null;
        f() ? h._resize() : (g(), e(), d())
    }

    function b() {
        function b(a) {
            if (!a.tagName)throw new TypeError("Object is not a valid DOM element");
            if ("MAP" !== a.tagName.toUpperCase())throw new TypeError("Expected <MAP> tag, found <" + a.tagName + ">.")
        }

        function c(c) {
            c && (b(c), a.call(c), d.push(c))
        }

        var d;
        return function (a) {
            switch (d = [], typeof a) {
                case"undefined":
                case"string":
                    Array.prototype.forEach.call(document.querySelectorAll(a || "map"), c);
                    break;
                case"object":
                    c(a);
                    break;
                default:
                    throw new TypeError("Unexpected data type (" + typeof a + ").")
            }
            return d
        }
    }

    "function" == typeof define && define.amd ? define([], b) : "object" == typeof module && "object" == typeof module.exports ? module.exports = b() : window.imageMapResize = b(), "jQuery" in window && (jQuery.fn.imageMapResize = function () {
        return this.filter("map").each(a).end()
    })
}();
//# sourceMappingURL=imageMapResizer.map/**
