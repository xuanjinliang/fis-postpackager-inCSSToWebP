/**
 * Created by timxuan on 2016/8/3.
 */

'use strict';

(function () {
    function check_webp_feature(callback) {
        var body = getEleTags('body'),
            kTestImages = 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
            img = new Image();

        body[0].style.visibility = 'hidden';

        img.onload = function () {
            var result = (img.width > 0) && (img.height > 0);
            window.__isWebp = true;
            body[0].style.visibility = 'visible';
            callback(result);
        };
        img.onerror = function () {
            window.__isWebp = false;
            body[0].style.visibility = 'visible';
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

    function removeElement(_element){
        var _parentElement = _element.parentNode;
        if(_parentElement){
            _parentElement.removeChild(_element);
        }
    }

    check_webp_feature(function(bool){
        var head = getEleTags('head'),
            styleTag = getEleTags('replaceStyle');
        for(var i = 0, l = styleTag.length; i < l; i++){
            var o = styleTag[i];
            var styleHtml = o.innerHTML;
            if(bool){
                styleHtml = styleHtml.replace(/url\("?[^)]*(?:\.jpg|\.png|\.jpeg)[^\.webp]*"?\)/ig,function(v){
                    return v.replace(/\.jpg/i,function(v,$1){
                        return $1 + '.webp';
                    });
                });
            }
            var style = document.createElement('style');
            style.setAttribute('type','text/css');
            style.innerHTML = styleHtml;
            head[0].appendChild(style);
        }
        removeElement(styleTag[0]);

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

    window.isWebp = function(imgSrc){
        if(window.__isWebp){
            return imgSrc.replace(/\.jpg/i,function(v,$1){
                return $1 + '.webp';
            });
        }else{
            return imgSrc;
        }
    }

})();
