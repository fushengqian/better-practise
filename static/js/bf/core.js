/**
* 核心扩展
* registerNameSpace 注册命名空间
* Class             类
*/
if(typeof $.registerNameSpace !== 'undefined')
{
	$._registerNameSpace = $.registerNameSpace;
}

$.extend({
	//用于注册命名空间
	registerNameSpace : function(packageName)
	{
		packageName = packageName.replace(/^\.+|\.+$/g, '');
		var prefix = this;
		this.each(packageName.split('.'), function(index, item){
			if(!prefix[item])
			{
				prefix[item] = {};
			}

			prefix = prefix[item];
		});
	},
	
	Class : {
		//用于创建类
		create : function()
		{
			return function() {	
				return this.__init__.apply(this, arguments);	
			}
		},
		
		/**
		* 实现类之间的继承
		* @param Class subclass 子类
		* @param Class supclass 父类
		* @param Object overrides 如果此参数存在,则用于重写父类方法
		*/
		extend : function(subclass, supclass, overrides)
		{

			var $class = function(){
				//this.__init__ = function() {};
				subclass.call(this);
			};
			$class.prototype = supclass.prototype;
			subclass.prototype = new $class();
			subclass.prototype.constructor = subclass;
			if (supclass.prototype.constructor == Object.prototype.constructor)
			{ 
				supclass.prototype.constructor = supclass;  
			}
			subclass.prototype.superclass = supclass.prototype;
			overrides && $.extend(subclass.prototype, overrides);
			return subclass;
		}
	},
	//获取字节长度
    getByteLen : function(str)
	{
		return str.replace(/[^\x00-\xff]/gi, 'js').length;
	},
	
	//格式化字符串
	sprintf : function()
	{
		var args = Array.prototype.slice.apply(arguments);
		if(!args.length)
		{
			return false;
		}
		if(1 == args.length){
			return args[0];
		}
		var msg = args.shift();

		$.each(args, function(index, item) {
			msg = msg.replace('%s', item);
		});
		return msg;
	},
	
	parseUrl : function(url)
	{
		url = !url && self.location.href || url;
		var ret = {};
		var m = /(https?):\/\/([^\?]+)(?:\?(.+))?/i.exec(url);
		if(m)
		{
			ret['protocol'] = m[1];
			var m2 = m[2], fullhost = m2.replace(/\/.*/i, '');
			var index = fullhost.indexOf(":"), host, port;
			if(index < 0)
			{
				host = fullhost;
				port = 80;
			}
			else
			{
				port = fullhost.substr(index + 1);
				host = fullhost.substr(0, index);
			}

			ret['host'] = host, ret['port'] = port;
			var path = m2.replace(/.+?\//i, '');
			if(!path)
			{
				path = "/";
			}
			else
			{
				path = "/" + path;
			}
			ret['path'] = path;
			
			var params = {};
			if(m[3])
			{
				$.each(m[3].split("&"), function(index, item){
					var dict = item.split("=");
					params[dict[0]] = dict[1];
				});
			}

			ret['params'] = params;
			return ret;
		}
	},
	/**
	*  载入js文件
	*  @param src      String   文件路径
	*  @param callBack Function 回调函数
	*/
	loadJs:function(src,callBack){
		var script = document.body.appendChild(document.createElement("script"));
		var _callBack = callBack||function(){};
		script.src = src;
		if(script.addEventListener){
			script.addEventListener("load",_callBack,false);
		}else if(script.attachEvent){
			script.attachEvent("onreadystatechange", function(){if(event.srcElement.readyState!="loaded"){return};_callBack();});
		}
		//setTimeout(callBack,100);
	},
	/**
	* 载入需求的js包(默认不重复加载)
	* (!)请使用callBack处理后续操作以避免命名空间未及时注册导致的问题
	* @param pack      String   包名,如$.bf.common
	* @param once      Boolean  是否只加载一次,默认为true (!)传递function类型则替代callBack参数
	* @param callBack  Function 回调函数
	*/
	require:function(pack,once,callBack){
			once = typeof once != "function"?(typeof once != "undefined"?once:true):(callBack=once);
			if((typeof pack=="object")&&(typeof pack["pop"]=="function")){
				var callBack_ = callBack||function(){};
				var _once = once;
				var p = pack.slice(1);
				callBack = p.length>0?function(){
					$.require(p,_once,callBack_);
				}:callBack_;
				pack = pack[0];
			}
			var path = pack.toString().split(".");
			window["__ns"] = window["__ns"]||{};
			path.shift();
			var url = $.bf.config.STATIC_URL||"./",ns=$;
			for(var i=0,len=path.length-1;i<len;i++){
				url += path[i]+"/";
				ns = ns[path[i]];
			}
			var file = path.pop();
			if(once&&(window["__ns"][pack]||(ns&&ns[file]))){
				setTimeout(callBack,100);
				return false;
			}
			window["__ns"][pack] = 1;
			$(document).ready(function(){
				$.loadJs(url+file+".js",callBack);
			});
	}
});

//扩展Function原型
$.extend(Function.prototype, {
	/**
	* 用于实现类的成员
	*/
	implement : function( object )
	{
		for(var property in object)
		{
			this.prototype[property] = object[property];
		}
		return this.prototype;
	},
	
	/**
	* 将函数应用到某个对象,并返回一个函数引用
	* @param Object object 要绑定到的对象
	* @return Function
	*/
	bind : function()
	{
		var __method = this;
    	var args     = Array.prototype.slice.call(arguments);
    	var object   = args.shift();
    	return function() {
        	return __method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
		}
		
	},
	
	/**
	* 用于实例化类
	*/
	create : function()
	{
		var f = this, args = arguments;
		var $class = function(){
			f.apply(this, args);
		};
		$class.prototype = this.prototype;
		$class.prototype.constructor = this;
		var $this = new $class();
		$this.superclass && $this.superclass.__init__.apply($this.superclass, arguments);
		return $this;
	}
});