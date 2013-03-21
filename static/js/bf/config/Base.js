/**
* @desc 边锋应用基础部分
*/
//注册配置命名空间
$.registerNameSpace("bf.config");
$.bf.config.BF_ENV = "unknown"; // 定义环境
if(self.location.href.search(/^https?:\/\/dev/i) > -1)
{
	// 开发环境
	$.bf.config.BF_ENV = "dev";
}
else
{
	// 测试或线上环境
	$.bf.config.BF_ENV = "online_or_test";
}

if($.bf.config.BF_ENV == "dev") // 开发环境
{
	$.extend($.bf.config, {
		//网站url
		SITE_URL      : 'http://dev2.bianfeng.com',
		//域名(之后会改成边锋的域名)
		SITE_DOMAIN   : 'dev2.bianfeng.com',
		//静态文件url
		STATIC_URL    : 'http://dev2_pic.bf.com/bfpic',
		//faceurl
		FACE_URL      : 'http://f.staticsdo.com',
		UPLOAD_DOMAIN : 'dev.interface.graph.sdo.com', // 上传HOST
		SHORT_DOMAIN  : 'http://isdo.cn'
	});
}
else
{
	// 线上环境
	$.extend($.bf.config, {
		//网站url
		SITE_URL      : 'http://www.bianfeng.com',
		// 边锋域名
		SITE_DOMAIN   : 'www.bianfeng.com',
		//静态文件url
		STATIC_URL    : 'http://ipic.staticsdo.com/bfpic',
		//faceurl
		FACE_URL      : 'http://f.staticsdo.com',
		UPLOAD_DOMAIN : 'http://interface.graph.sdo.com', // 上传HOST
		SHORT_DOMAIN  : 'http://isdo.cn'
	});
}

$.extend($.bf.config, {
	//全局网页宽度
	PAGE_WIDTH: 950,
	//首页轮询间隔
	POLL_INTERVAL: 30000,
	//推他首页轮询间隔
	TUITA_INDEX_INTERVAL: 30000,
	//迷你推他轮询间隔
	TUITA_APP_INTERVAL: 30000,
	//消息模块check new间隔
	MSG_CHK_INTERVAL: 30000,
	//信件tab中，检查新信件间隔
	MSG_LETTER_INTERVAL: 5000,
	//好友总数上限
	HOME_FRIENDS_TOTAL : 2012,
	//留言最大字节数
	COMMENT_BYTE_LIMIT : 200,
	errors : {
		E_NEED_LOGIN : -50000
	},
	VERSION : "v1",
	USE_CLEAN_JS : false,
	getJSPath : function()
	{
		var path = "source";
		if(this.USE_CLEAN_JS)
		{
			path = "clean";
		}

		return  "/" + path;
	},
	getStaticPath : function()
	{
		return this.STATIC_URL;
	},
	getFlashExpressPath:function(){
		var path = this.USE_CLEAN_JS?"swf":"source/js/ext/utils/swfobject";
		return [this.STATIC_URL,this.VERSION,path].join("/");
	}
});

//注册远程数据访问名称空间
$.registerNameSpace('bf.ajax');
$.extend($.bf.ajax, {
	_baseURL : $.bf.config.SITE_URL + '/',
	_domain : $.bf.config.SITE_DOMAIN,
	_scriptInstances : {},
	_scriptIndex : 1,
	
	//用于jsonp回调
	jsonpCallback : function(index, result) {
		var cbs = this._scriptInstances[index];
		if (!cbs)
		{
			return false;
		}

		if(result.errno != 0)
		{ //默认处理
			if(cbs[1])
			{
				cbs[1](result.errno, result.msg);
			}
			else
			{
				this.defaultErrorHandler(result.errno, result.msg);
			}
			return false;
		}
		if(cbs[0])
		{ //用户处理
			try{
				cbs[0](result.data);
			} catch(e) {}
		}
	},
	
	/**
	* 通过网址获取域名
	* @param router 网址
	*/
	getDomain : function(router)
	{
		if(router.search(/https?:\/\//i) < 0)
		{
			router = this._baseURL.replace(/\/+$/, '') + router;
		}

		var path_info = $.parseUrl(router.toLowerCase());

		return $.sprintf("%s://%s:%s", path_info.protocol, path_info.host, path_info.port);
	},

	/**
	* 判断两个网址是否同域
	* @param current_router 网址一
	* @param target_router 网址二
	*/
	isSameDomain : function(current_router, target_router)
	{
		var current_domain = this.getDomain(current_router);
		var target_domain  = this.getDomain(target_router);

		return current_domain === target_domain;
	},

	createURL : function(router, data)
	{
		if(router.search(/http:\/\//i) < 0)
		{
			router = this._baseURL + router.replace(/^\//, '');
		}

		if(data)
		{
			if(router.indexOf("?") > 0)
			{
				router += "&" + $.param(data, true);
			}
			else
			{
				router += "?" + $.param(data, true);
			}
		}

		return router;
	},

	defaultErrorHandler : function(errno, msg)
	{
		//alert(msg);
	},

	request : function (router, data, callback, error_handler, method, timeout)
	{
		//其他请求
		method = method && method.toUpperCase() || 'GET';
		timeout = timeout || 15000;
		var is_same_domain = this.isSameDomain(location.href, router);

		if (!is_same_domain && method != "GET")
		{
			alert("different domain can only do GET method\n" + location.href);
			return false;
		}

		if (is_same_domain)
		{
			var req_callback = function (result)
			{
				var result = $.bf.ajax._parseResponse(result);
				
				if (result.errno != 0)
				{ //默认处理
					if (error_handler)
					{
						error_handler(result.errno, result.msg);
					}
					else 
					{
						return $.bf.ajax.defaultErrorHandler(result.errno, result.msg);
					}
					return;
				}
				if (callback && 'undefined' !== typeof callback)
				{ //用户处理
					//try{
						callback(result.data);
					//} catch(e) {}
				}
			};
			$.ajax({
				type    : method,
				url     : $.bf.ajax.createURL(router),
				data    : data,
                async   : true, 
				success : req_callback,
				error   : req_callback,
				timeout : timeout
			});
		}
		else
		{
			if(!data)
			{
				data = {};
			}
			var index = $.bf.ajax._scriptIndex++;
			data["_jsonp"] = index;
			$.bf.ajax._scriptInstances[index] = [callback, error_handler];
			var url = $.bf.ajax.createURL(router, data);
			$.getScript(url, function() {
				delete $.bf.ajax._scriptInstances[index];
			});
		}
	},

	_parseResponse : function(response)
	{
		try{
			eval('var response = '+ response);
		}catch(e){}
		if(!response || 'undefined' === typeof(response['errno']))
		{ //404等网络错误
			return {'errno' : -1000, 'msg' : '系统繁忙, 请稍候再试！'};
		}
		return response;
	},
	/**
	* 远程获取脚本
	* @param path 脚本路径
	* @param callback 脚本加载完成的回调方法
	*/
	get : function(path, callback)
	{
		path = path || '';
		if(!path)
		{
			return false;
		}

		path = $.bf.config.STATIC_URL + '/js/' + path.replace(/\./g, '/').replace(/^\/|\./, '') + '.js';
		$.getScript(path, callback || function(){});
	}
});
//alert($.bf.config.SITE_DOMAIN);
//alert($.bf.ajax.isSameDomain);
/*
//定义父类
var SupC = $.Class.create();
//成员实现
SupC.implement({
	__init__ : function(nick, sex)
	{
		this.nick = nick;
		this.sex  = sex;
	},
	
	getNick : function()
	{
		alert(this.nick);
	},
	
	getSex : function()
	{
		alert(this.sex);
	}
});

//定义子类
var SubC = $.Class.create();
//从SupC中继承
$.Class.extend(SubC, SupC, {
	__init__ : function(nick, sex)
	{
		//调用父类构造方法
		this.superclass.__init__.call(this, nick, sex);
	},
	
	//为SubC类增加新成员
	getNickAndSex : function()
	{
		this.getNick();//调用父类方法
		this.getSex();
	}
});

var sup = SupC.create('jefurry', '男');
sup.getNick();
sup.getSex();

var sub = SubC.create('马毅', '女');
sub.getNickAndSex();
*/

/*同域请求测试代码
$.bf.ajax.request("/user/ajaxtest", {'name' : 'jefurry'}, function(result){
	alert(result.name);
}, function(errno, msg){
	alert(errno);
	alert(msg);
}, 'GET', 15000);
*/

/*
$.bf.ajax.request("http://jefurrychen.com/user/ajaxtest", {'name' : 'jefurry'}, function(result){
	alert(result.name);
	alert(result.isAjaxRequest);
}, function(errno, msg){
	alert(errno);
	alert(msg);
}, 'GET', 15000);
*/
