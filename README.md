### 安装

```javascript
   npm install fis-postpackager-inCSSToWebP
```

### 使用

```javascript
       
    //fis3配置
    .match('::package', {
        postpackager: fis.plugin('inCSSToWebP',{
            quality: 60,					//压缩图片的质量，默认50
            imgReg: ['jpg','png','jpeg'],	//要转为webp的图片格式，默认jpg
            ignoreFile: ['recruitArtist']	//过滤不转换的文件夹下的所有文件
        })
    })

	//过滤html中的css外链：
	<link href="aa.css?__ignoreCss" rel="stylesheet" />

```

此插件 **慎用,慎用,慎用** 重要事情说三遍！！该插件主要用于移动端的H5，PC端看实际情况；

描述：
该插件会读取外链的css文件，把内容插入到html中，然后把页面中的相关图片转为webp格式的图片；

    //aa.html
	<!DOCTYPE html>
	<html>
	<head>
	    <meta charset="UTF-8">
	    <title>aaaaaa</title>
	    <meta name="format-detection" content="telephone=no">
	    <link href="../css/index.css" rel="stylesheet"/>
	</head>
	<body>
	</body>
	</html>

	//转化后的aa.html
	<!DOCTYPE html>
	<html>
	<head>
	    <meta charset="UTF-8">
	    <title>aaaaaa</title>
	    <meta name="format-detection" content="telephone=no">
	    <style type="text/css">
			.............................
		</style>
	</head>
	<body>
	</body>
	</html>
	



### 全局变量

`window.__isWebp` 表示当前浏览器是否支持webp，true为支持，false为不支持。

(欢迎反馈BUG，方便提升插件的质量)

