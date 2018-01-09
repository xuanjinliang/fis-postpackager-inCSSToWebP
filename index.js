/**
 * Created by timxuan on 2016/8/1.
 */

'use strict';
const execFile = require('child_process').execFile,
    fs = require('fs'),
    cwebp = require('cwebp-binLocal'),
    UglifyJS = require("uglify-js");

let rStyleScript = /(?:\s*(<link([^>]*?)(stylesheet){1}([^>]*?)(?:\/)?>))/ig,
    styleUrl = /(?:\shref\s*=\s*)('([^']+)'|"([^"]+)"|[^\s\/>]+)/i,
    imgSrc = /(?:\ssrc\s*=\s*)('([^']+)'|"([^"]+)"|[^\s\/>]+)/i,
    imgReg = '',
    ignoreFileReg = '',
    replaceReg = '',
    jsContent = '',
    webpCache = fis.project.getCachePath() + '/webp-' + fis.project.currentMedia(),
    webpCacheJson = webpCache + '/webpData.json';

module.exports = function(ret, conf, settings, opt){
    let cssObj = {},
        quality = settings.quality || 50;
    imgReg = settings.imgReg || 'jpg';
    ignoreFileReg = settings.ignoreFile || '';

    if(imgReg instanceof Array){
        imgReg = '\\\.' + imgReg.join("|\\\.");
    }else{
        imgReg = '\\\.' + imgReg;
    }

    if(ignoreFileReg instanceof Array){
        ignoreFileReg = ignoreFileReg.join("|");
    }

    if(ignoreFileReg.length>0){
        ignoreFileReg = new RegExp(ignoreFileReg,"gi");
    }

    replaceReg = new RegExp('((?:[^(=\\\"\\\']+)(?:'+imgReg+'))',"gi");

    imgReg = new RegExp(imgReg,"gi");


    if(!fis.util.isDir(webpCache)){
        fis.util.mkdir(webpCache);
    }

    if(!fis.util.isFile(webpCacheJson)){
        writeFile(webpCacheJson,JSON.stringify({}));
    }

    let webpJson = readFile(webpCacheJson),nullwebpJson = {};
    webpJson = JSON.parse(webpJson);

    function search(file){
        if(file.id.indexOf(".css") > -1 ){
            let cssUrl = file.domain+file.release;
            if(file.useHash){
                cssUrl = cssUrl.replace('.css','') + fis.media().get('project.md5Connector', '_') + file.getHash() +'.css';
            }
            cssObj[cssUrl] = file.getContent();
        }
    }

    fis.util.map(ret.pkg, function(subpath, pkg, index) {
        search(pkg);
        /*if(pkg.id.indexOf(".css") > -1 ){
            let cssUrl = pkg.domain+pkg.release;
            if(pkg.useHash){
                cssUrl = cssUrl.replace('.css','') + fis.media().get('project.md5Connector', '_') + pkg.getHash() +'.css';
            }
            console.log('pkg-->', cssUrl);
            cssObj[cssUrl] = pkg.getContent();
        }*/
    });

    fis.util.map(ret.ids, function(subpath, file) {
        search(file);
    });

    fis.util.map(ret.src,function(subpath,file,i){
        if(file.isHtmlLike && !(ignoreFileReg && file.origin.match(ignoreFileReg))){
            let ChangeContent = file.getContent();

            if(rStyleScript.test(ChangeContent)){
                ChangeContent = ChangeContent.replace(rStyleScript,function(v){
                    if(styleUrl.test(v)){
                        let link = RegExp.$1.replace(/\'|\"/ig,'');
                        if(link.indexOf('__ignoreCss') < 0){
                            return v.replace(v,'<replaceStyle style="display: none;">'+cssObj[link]+'</replaceStyle>');
                        }else{
                            return v.replace(/(\??|&?)__ignoreCss/,'');
                        }
                    }
                    return v;
                });
            }

            ChangeContent = ChangeContent.replace(/<head[^>]*>[\s\S]*(<\/head>)/ig,function(m, $1){
                if($1){
                    return m.replace($1,webpJs()+$1);
                }
                return m;
            });

            ChangeContent = ChangeContent.replace(/<(img)\s+[\s\S]*?\/?>/ig,function(m, $1){
                if($1 && imgSrc.test(m)){
                    let src = RegExp.$1.replace(/\'|\"/ig,'').trim();

                    if(src.length > 0){
                        let result = m.match(imgSrc)[0],
                            string = result.replace(/\s*/g,'').replace('src=',' data-webpOriginal=');
                        return m.replace(result, string);
                    }else{
                        return m;
                    }
                }else{
                    return m;
                }
            });

            file.setContent(ChangeContent);
        }else if(file.isImage() && !/^_/.test(file.basename)){
            let dirPath = fis.project.getProjectPath();
            let new_img_folder = '',
                ext = file.rExt;

            if(ext.match(imgReg)){
                if(file.release){
                    new_img_folder = dirPath + file.release.replace(file.ext,'');
                }else{
                    new_img_folder = file.dirname;
                }

                let hash = new_img_folder + fis.media().get('project.md5Connector', '_') + file.getHash();
                if(!fis.util.isDir(new_img_folder)){
                    fis.util.mkdir(new_img_folder);
                }

                hash += ext+'.webp';
                let webpFile = fis.file(hash),existFile = webpFile.isFile();

                if(file.isFile() && (!existFile || !(webpJson[hash] && webpJson[hash] == quality))){
                    execFile(cwebp, (file.fullname + ' -q ' + quality +' -o ' + hash).split(/\s+/), function(err, stdout, stderr) {
                        if(err){
                            console.log(err);
                        }else{
                            nullwebpJson[hash] = quality;
                            writeFile(webpCacheJson,JSON.stringify(nullwebpJson));
                        }
                    });
                }else{
                    if(existFile){
                        nullwebpJson[hash] = quality;

                    }
                }
            }
        }
    });
    if(Object.keys(nullwebpJson).length){
        writeFile(webpCacheJson,JSON.stringify(nullwebpJson));
    }
};

function webpJs(){
    let result = UglifyJS.minify(fs.readFileSync(__dirname+'/load.js', "utf8"));

    if(jsContent.length <= 0){
        jsContent = result.code.replace(/\/\\\.jpg\/i/ig,replaceReg);
    }
    return '<script>'+jsContent+'</script>';
}

function writeFile(path,data){
    fis.util.write(path, data, 'utf-8', false);
}

function readFile(path){
    return fis.util.read(path,true);
}