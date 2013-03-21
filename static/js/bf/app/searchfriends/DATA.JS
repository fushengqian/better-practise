/**
 * 封装了和数据相关的操作，包括数据存储，异步获取数据，返回数据标准处理
 */

initNameSpace('snda.lib');
snda.lib.data = {
	_baseURL : snda.lib.constant.__SITE_URL + '/',
	_domain : snda.lib.constant.__SITE_DOMAIN,
	_scriptInstances : {},
	_scriptIndex : 1,

	scriptCallback: function(index, result) {
		var cbs = snda.lib.data._scriptInstances[index];
		if (!cbs) return;

		if (result.errno != 0) { //默认处理
			if (cbs[1]) cbs[1](result.errno, result.msg);
			else snda.lib.data.defaultErrorHandler(result.errno, result.msg);
			return;
		}
		if (cbs[0]) { //用户处理
			try{
				cbs[0](result.data);
			} catch(e) {}
		}
	},
	
	isSameDomain : function() {
		//if (snda.lib.data._domain  != document.domain) return false;
		var url = location.href;
		if (url.substring(0, 7).toLowerCase() != "http://") return false;

		var index1 = url.indexOf(":", 7);
		var index2 = url.indexOf("/", 7);
		var port = 80;
		var domain = "";
		if (index1 > 0 && (index2 < 0 || index1 < index2)) {
			port = parseInt(url.substring(index1 + 1));
			domain = url.substring(7, index1).toLowerCase();
		} else if (index2 > 0) {
			domain = url.substring(7, index2).toLowerCase();
		} else {
			domain = url.substring(7).toLowerCase();
		}
		return port == 80 && snda.lib.data._domain  == domain;
	},
	
	createURL : function(router, data) {
		if (!data) {
			return snda.lib.data._baseURL + router;
		} else {
			var url = snda.lib.data._baseURL + router;
			if (url.indexOf("?") > 0)
				return url + "&" + $.param(data, true);
			else
				return url + "?" + $.param(data, true);
		}
	},

	defaultErrorHandler : function(errno, msg) {
		//alert(msg);
	},

	request : function (router, data, callback, error_handler, method, timeout) {

		//其他请求
		method = method ? method.toUpperCase(): 'GET';

		if (!snda.lib.data.isSameDomain() && method != "GET") {
			alert("different domain can only do GET method\n" + location.href);
			return;
		}

		if (snda.lib.data.isSameDomain()) {
			var req_callback = function (result) {
				var result = snda.lib.data._parseResponse(result);
				if (result.errno != 0) { //默认处理
					if (error_handler) error_handler(result.errno, result.msg);
					else return snda.lib.data.defaultErrorHandler(result.errno, result.msg);
					return;
				}
				if (callback) { //用户处理
					//try{
						callback(result.data);
					//} catch(e) {}
				}
			}
			$.ajax({
				type: method,
				url:   snda.lib.data.createURL(router),
				data: data,
                async: true, 
				success: req_callback,
				error: req_callback,
				timeout: timeout
			});
		} else {
			if (!data) data = {};
			var index = snda.lib.data._scriptIndex++;
			data["_script_key"] = index;
			snda.lib.data._scriptInstances[index] = [callback, error_handler];
			var url = snda.lib.data.createURL(router, data);
			$.getScript(url, function() {delete snda.lib.data._scriptInstances[index];});
		}
	},

	_parseResponse : function (response) {
		try{
			eval('var response = '+ response);
		}catch(e){}
		if( !response || 'undefined' == typeof(response['errno']) ) { //404等网络错误
			return {'errno': 1, 'msg': '系统繁忙, 请稍候再试！'};
		}
		return response;
	}
};