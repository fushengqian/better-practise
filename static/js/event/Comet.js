/**
* 长连接(串流式更新)框架
* @author 陈耀强 <jefurry.chen@gmail.com>
*/

$.registerNameSpace("bf.utils");

// 长连接类
$.bf.utils.Comet = $.Class.create();

// 自定义错误号
$.bf.utils.Comet.errors = {
	E_CONNECT_FAILURE : 1001
};

$.Class.extend($.bf.utils.Comet, $.bf.utils.Observer, {
	/**
	* 构造方法
	*/
	__init__ : function(backend)
	{
		/**
		* 对外发布事件
		* connect 当成功建立连接时被触发
		* data 当数据到来时被触发
		* close 当连接被关闭时触发
		* timeout 超时被触发
		* error 当产生异常时被触发
		*/
		this.dispatchEvent("connect", "data", "close", "timeout", "error");

		this.backend             = null;
		this.setBackend(backend);
		this.connector           = null; // 连接器
		this._htmlfile           = null;
		this._timeout_mseconds   = 20000; // 默认超时时间为20秒
		this._timer              = 0; // 定时器
	},
	
	/**
	* 启动超时管理
	*/
	_startTimeoutManager : function()
	{
	},
	
	initConnector : function()
	{
		var _connector = null;
		if($.browser.msie)
		{
			var htmlfile = new ActiveXObject("htmlfile");
			htmlfile.open();
			htmlfile.write("<html><head>");
			htmlfile.write("</head><body></body></html>");
			htmlfile.close();
			_connector = htmlfile.createElement("iframe");
			_connector.setAttribute("src", this.backend);
			_connector.setAttribute("width", "0");
			_connector.setAttribute("height", "0");
			htmlfile.appendChild(_connector);
			_connector = $(_connector);
			htmlfile.parentWindow.$ = $; // 关键:让iframe可以引用父窗口的变量
			this._htmlfile = htmlfile;
		}
		else
		{
			_connector = $($.sprintf('<iframe src="%s" width="0" height="0" style="display: none;"></iframe>', this.backend)).appendTo(document.body);
		}

		this.connector = _connector;
		if(this.connector && this.connector.size() > 0)
		{
			this.fireEvent("connect", this);
		}
		else
		{
			this.fireEvent("error", this, $.bf.utils.Comet.errors.E_CONNECT_FAILURE, "连接失败");
		}
	},
	
	/**
	* 设置超时时间
	* @param mseconds 毫秒
	*/
	setTimeout : function(mseconds)
	{
		this._timeout_mseconds = mseconds;
	},

	/**
	* 重新连接
	*/
	reconnect : function()
	{
		this.disconnect();
		this._initConnector();
	},
	
	/**
	* 断开连接
	*/
	disconnect : function()
	{
		this.connector.remove();
		this._htmlfile = null;
	},
	
	/**
	* 设置backend
	*/
	setBackend : function(backend)
	{
		this.backend = backend || '';
	}
});

$.bf.utils.CometManager = {
	_cometList : [],
	register : function(_comet)
	{
		this._cometList.push(_comet);
	},
	fireEvent : function()
	{
		var _args = arguments;
		$.each(this._cometList, function(_index, _comet){
			_comet.fireEvent.apply(_comet, _args);
		});
	}
};