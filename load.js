/**
 * Created by timxuan on 2016/8/3.
 */

'use strict';

(function () {
    function check_webp_feature(callback) {
        var kTestImages = 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
        var img = new Image();
        img.onload = function () {
            var result = (img.width > 0) && (img.height > 0);
            window.__isWebp = true;
            callback(result);
        };
        img.onerror = function () {
            window.__isWebp = false;
            callback(false);
        };
        img.src = "data:image/webp;base64," + kTestImages;
    }

    function getEleTags(tags){
        if(document.querySelectorAll){
            return document.querySelectorAll(tags);
        }else{
            document.getElementsByTagName(tags);
        }
    }

    check_webp_feature(function(bool){
        if(bool){
            var styleTag = getEleTags('style');
            for(var i = 0, l = styleTag.length; i < l; i++){
                var o = styleTag[i];
                var styleHtml = o.innerHTML;
                styleHtml = styleHtml.replace(/url\("?[^)]*(?:\.jpg|\.png|\.jpeg)[^\.webp]*"?\)/ig,function(v){
                    return v.replace(/\.jpg/i,function(v,$1){
                        return $1 + '.webp';
                    });
                });
                o.innerHTML = styleHtml;
            }
        }

        var fn = function(){
            var imgTag = getEleTags('img');

            for(var i = 0, l = imgTag.length; i < l; i++){
                var o = imgTag[i];
                var imgSrc = o.getAttribute('data-webporiginal');
                if(imgSrc && imgSrc.length > 0){
                    if(bool){
                        imgSrc = imgSrc.replace(/\.jpg/i,function(v,$1){
                            return $1 + '.webp';
                        });
                    }
                    o.setAttribute('src',imgSrc);
                }
            }
        };

        if (document.addEventListener) {
            var runFun = function () {
                fn();
                document.removeEventListener('DOMContentLoaded', runFun, false);
            };

            if (/complete|loaded|interactive/.test(document.readyState) && document.body) {
                fn();
            } else {
                document.addEventListener('DOMContentLoaded', runFun, false);
            }
        }else if (document.attachEvent) { //IE

            var bTop = false;

            try {
                bTop = window.frameElement == null;
            } catch (e) {}
            if (document.documentElement.doScroll && bTop) {
                (function () {
                    try {
                        document.documentElement.doScroll('left');
                        fn();
                    } catch (e) {
                        setTimeout(arguments.callee, 1);
                    }
                })();
            }
        }
    });
})();
