/**
 * Module dependencies.
 */
 
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var weixin = require('./models/api');
var translate = require('./translate');

var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.logger({stream: accessLog}));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images' }));    //保留上传文件的后缀名，并把上传目录设置为 /public/images
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret: settings.cookieSecret,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  url: settings.url
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// config
weixin.token = 'weixin';

// 接入验证
app.get('/check', function(req, res) {

    // 签名成功
    if (weixin.checkSignature(req)) {
        res.send(200, req.query.echostr);
    } else {
        res.send(200, 'fail');
    }
});

// 监听文本消息
weixin.textMsg(function(msg) {
    console.log("textMsg received");
    console.log(JSON.stringify(msg));
    
    var resMsg = {};
	
	if(msg.content.search('1#') == 0){
		translate(msg.content, function(result) {
			resMsg = {
					fromUserName : msg.toUserName,
					toUserName : msg.fromUserName,
					msgType : "text",
					content : result,
					funcFlag : 0
				};
			weixin.sendMsg(resMsg);
		});
	}else if (msg.content.search('2#') == 0){
		translate({
		        from: 'zh',
		        to: 'jp',
		        query:msg.content}, function(result) {
			resMsg = {
					fromUserName : msg.toUserName,
					toUserName : msg.fromUserName,
					msgType : "text",
					content : result,
					funcFlag : 0
				};
			weixin.sendMsg(resMsg);
		});
		}
	//		console.log(resMsg);
	 else{
		switch (msg.content) {
			case "文本" :
				// 返回文本消息
				resMsg = {
					fromUserName : msg.toUserName,
					toUserName : msg.fromUserName,
					msgType : "text",
					content : "\ue349",
					funcFlag : 0
				};
				break;
				
			case "音乐" :
				// 返回音乐消息
				resMsg = {
					fromUserName : msg.toUserName,
					toUserName : msg.fromUserName,
					msgType : "music",
					title : "音乐标题",
					description : "音乐描述",
					musicUrl : "音乐url",
					HQMusicUrl : "高质量音乐url",
					funcFlag : 0
				};
				break;

			case "图文" :

				var articles = [];
				articles[0] = {
					title : "PHP依赖管理工具Composer入门",
					description : "PHP依赖管理工具Composer入门",
					picUrl : "http://weizhifeng.net/images/tech/composer.png",
					url : "http://weizhifeng.net/manage-php-dependency-with-composer.html"
				};

				articles[1] = {
					title : "八月西湖",
					description : "八月西湖",
					picUrl : "http://weizhifeng.net/images/poem/bayuexihu.jpg",
					url : "http://weizhifeng.net/bayuexihu.html"
				};

				articles[2] = {
					title : "「翻译」Redis协议",
					description : "「翻译」Redis协议",
					picUrl : "http://weizhifeng.net/images/tech/redis.png",
					url : "http://weizhifeng.net/redis-protocol.html"
				};

				// 返回图文消息
				resMsg = {
					fromUserName : msg.toUserName,
					toUserName : msg.fromUserName,
					msgType : "news",
					articles : articles,
					funcFlag : 0
				};
				break;
				
		    default:
			resMsg = {
					fromUserName : msg.toUserName,
					toUserName : msg.fromUserName,
					msgType : "text",
					content : "我们能为您提供专业的多语言翻译服务，目前支持以下翻译方向：\n" +
	  "1.中 -> 英(英 -> 中)\n2.中 -> 日\n使用方法为：\n翻译方向编号+#+您所要翻译的内容\n如：\n1#你好",
					funcFlag : 0
				};
		}
		}
	
		weixin.sendMsg(resMsg);
	
});

// 监听图片消息
weixin.imageMsg(function(msg) {
    console.log("imageMsg received");
    console.log(JSON.stringify(msg));
	
	var resMsg = {
      fromUserName : msg.toUserName,
      toUserName : msg.fromUserName,
	  msgType : "text",
	  content:"这是图片回复"
	  }
	  weixin.sendMsg(resMsg);
});

// 监听位置消息
weixin.locationMsg(function(msg) {
    console.log("locationMsg received");
    console.log(JSON.stringify(msg));
	
	var resMsg = {
      fromUserName : msg.toUserName,
      toUserName : msg.fromUserName,
	  msgType : "text",
	  content:"这是位置回复"
	  }
	  weixin.sendMsg(resMsg);
});

// 监听链接消息
weixin.urlMsg(function(msg) {
    console.log("urlMsg received");
    console.log(JSON.stringify(msg));
	
	var resMsg = {
      fromUserName : msg.toUserName,
      toUserName : msg.fromUserName,
	  msgType : "text",
	  content:"这是链接回复"
	  }
	  weixin.sendMsg(resMsg);
});

// 监听订阅事件消息
weixin.subEventMsg(function(msg) {
    console.log("subEventMsg received");
    console.log(JSON.stringify(msg));
	
	var resMsg = {
      fromUserName : msg.toUserName,
      toUserName : msg.fromUserName,
      msgType : "text",
      content : "欢迎订阅 ε٩(๑> ₃ <)۶з\n我们能为您提供专业的多语言翻译服务，目前支持以下翻译方向：\n" +
	  "1.中 -> 英(英 -> 中)\n2.中 -> 日\n使用方法为：\n翻译方向编号+#+您所要翻译的内容\n如：\n1#你好"
	  //funcFlag : 0
    }
	console.log(resMsg);
    weixin.sendMsg(resMsg);
});

// 监听取消订阅事件消息
weixin.unsubEventMsg(function(msg) {
    console.log("unsubEventMsg received");
    console.log(JSON.stringify(msg));
	
	var resMsg = {
      fromUserName : msg.toUserName,
      toUserName : msg.fromUserName,
      msgType : "text",
      content : "欢迎再次订阅 (✪ω✪)"
	  //funcFlag : 0
    }
	console.log(resMsg);
    weixin.sendMsg(resMsg);
});

weixin.clickEventMsg(function(msg) {
    console.log("clickEventMsg received");
    console.log(JSON.stringify(msg));
	
	switch(msg.eventKey){
	   case '301' : 
	   
	    var articles = [{
					title : "信息发布平台",
					description : "信息发布平台",
					picUrl : "http://imguxv.penshow.cn/uploadfile/2010/04/06/20100406102259486.jpg",
					url : "http://floating-castle-5941.herokuapp.com/"
				}];
	    var resMsg = {
					fromUserName : msg.toUserName,
					toUserName : msg.fromUserName,
					msgType : "news",
					articles : articles,
					funcFlag : 0
				}
				break;
				
				}
		
		weixin.sendMsg(resMsg);
});


// Start
app.post('/check', function(req, res) {

    // loop
    weixin.loop(req, res);

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);