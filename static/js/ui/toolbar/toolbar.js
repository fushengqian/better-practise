/**
 * ToolBar UI Component
 * @author 陈耀强
 */

$.registerNameSpace("bf.ui.toolbar");
$.bf.ui.toolbar.ToolBar = $.Class.create();
$.Class.extend($.bf.ui.toolbar.ToolBar, $.bf.ui.Dialog, {
	__init__ : function(options)
	{
		this._wrap = ".wrap";
		this.setMasker(false);
		this.options = $.extend({
			'ToolBar_Game'    : {},
			'ToolBar_Twitter' : {},
			'ToolBar_Mail'    : {},
			'ToolBar_Playing' : {},
			'ToolBar_Online'  : {}
		}, options || {});
		this._config = {
			'ToolBar_Game'    : 0,
			'ToolBar_Twitter' : 1,
			'GoTop'           : 2,
			'ToolBar_Mail'    : 3,
			'ToolBar_Online'  : 4,
			'ToolBar_Playing' : 5
		};
		this._plugPrefix     = 'ToolBar_';
		this._pluginPath     = "bf.common.widget.toolbar.plugin.%s";
		this._pluginClass    = '$.bf.ui.toolbar.plugin.%s';
		this._installedPlugs = {}; // 已安装插件
		this._html = '\
			<div class="toolbar" style="display: none;">\
				<div class="iner">\
					<div attr="toolbar_menu_container" class="widget cl"></div>\
					<div attr="toolbar_popup_container" class="popup">\
						<div class="pop p1"></div>\
						<div class="pop p2"></div>\
						<div class="pop p3"></div>\
						<div class="pop p4"></div>\
						<div class="pop p5"></div>\
						<div class="pop p6"></div>\
					</div>\
				</div>\
			</div>\
		';
		this.superclass.build.call(this);
		this._menuContainer  = this.getDialog().find("[attr='toolbar_menu_container']"); // menu容器
		this._popupContainer = this.getDialog().find("[attr='toolbar_popup_container']"); // popup容器
	},
	/**
	* 安装插件
	* @param String plugName 插件名称
	*/
	installPlug : function(plugName, callback)
	{
		if(this._checkIsInstalled(plugName))
		{
			return false;
		}
		var res = this._checkInConfig(plugName);
		if(false === res)
		{
			return false;
		}
		var html = this._getHtml(plugName);
		if(false === html)
		{
			return false;
		}

		var menu = this._insert(this._menuContainer, html.menu, res);
		if(false === menu)
		{
			return false;
		}
		this._installedPlugs[plugName] = {
			name     : plugName,
			menu     : menu,
			popup    : this._getPopupByPlugName(plugName),
			instance : this,
			loaded   : false,
			loading  : false
		};
		if(plugName.search(new RegExp("^" + this._plugPrefix)) < 0)
		{
			menu.click(function(event){
				callback && callback();
			});
		}
		else
		{
			menu.click(function(event){
				this._loadPlug(plugName);
			}.bind(this));
		}
		return this;
	},
	getToolBar : function()
	{
		return this;
	},
	setPosition : function()
	{
	},
	/**
	* 加载插件
	* @param String plugName 插件名称
	*/
	_loadPlug : function(plugName)
	{
		var plug = this._installedPlugs[plugName];
		
		if(plug.loading)
		{
		}
		if(plug.loaded)
		{
			this._packPlug(plug);
			return true;
		}
		plug.loading = true;
		
		$.bf.ajax.get($.sprintf(this._pluginPath, plugName), function(){
			plug.loaded  = true;
			plug.loading = false;
			var _class = new Function("return " + $.sprintf(this._pluginClass, plugName) + ";")();
			plug.instance = _class.create(this, plug);
			plug.instance.doAction(this.options, function(){
				this._packPlug(plug);
			}.bind(this));
		}.bind(this));
	},
	/**
	* 根据插件名称获取对应的popup
	* @param String plugName 插件名称
	* @return DomElement Selector
	*/
	_getPopupByPlugName : function(plugName)
	{
		return this._popupContainer.children().eq(this._config[plugName]);
	},
	/**
	* 计算popup所在区域
	* @param toolbar
	* @param plug 插件
	*/
	_calcRegion : function(toolbar, plug)
	{
		var menu = plug.menu;
		var popup = this._getPopupByPlugName(plug.name);
		var top = -254;//-popup.height();
		var over = popup.width() - toolbar.width();
		var left;
		if(over > 0)
		{
			left = toolbar.width() - popup.width();
		}
		else
		{
			left = menu.offset().left - toolbar.offset().left;
		}

		return {top : top, left : left};
	},
	/**
	* 清除样式
	* @param 如果menu存在，则让menu呈现当前样式
	*/
	ICleanCls : function(menu)
	{
		for(var key in this._installedPlugs)
		{
			var plug = this._installedPlugs[key];
			if(plug.loaded)
			{
				plug.menu.removeClass("cur z");
			}
		}
		if(menu)
		{
			menu.addClass("cur z");
		}
	},
	/**
	* 将插件展现
	* @param String plugName 插件名称
	* @param ClassObject instance 插件实例
	*/
	_packPlug : function(plug)
	{
		var index = this._config[plug.name];
		var offset = this._calcRegion(this.getDialog(), plug);
		this._popupContainer.children().eq(index).append(plug.instance.getDialog());
		var popup = this._getPopupByPlugName(plug.name);
		popup.css({top : offset.top + "px", left : offset.left + "px"}).show();
		this.ICleanCls(plug.menu);
	},
	/**
	* 插入HTML到UI中
	* @param container 父容器
	* @param Object html内容
	* @param Object resObj 包含了插件名称及索引：{name : 'ToolBar_Game', index : 0}
	*/
	_insert : function(container, html, resObj)
	{
		if(!container || !html || false === resObj)
		{
			return false;
		}

		var index = resObj.index, name = resObj.name;
		var childsCount = container.children().size(); // 子元素个数
		
		return $(html).appendTo(container);
		
		/*
		if(childsCount <= 0 || index >= childsCount)
		{
			container.append(html);
		}
		else
		{
			container.children().eq(index).after(html);
		}
		*/
		/*
		if(childsCount <= 0)
		{
			container.append(html);
		}
		else if(index >= childsCount)
		{
			container.children().eq(childsCount - 1).append(html);
		}
		else
		{
			container.children().eq(index - 1).after(html);
		}
		*/
	},
	/**
	* 检查插件是否已安装
	* @param String plugName 插件名称
	*/
	_checkIsInstalled : function(plugName)
	{
		return "undefined" !== typeof this._installedPlugs[plugName];
	},
	/**
	* 检查插件名是否在配置中
	* @param plugName 插件名称
	*/
	_checkInConfig : function(plugName)
	{
		if(!plugName)
		{
			return false;
		}

		for(var item in this._config)
		{
			if(plugName == item)
			{
				return {name : plugName, index : this._config[item]};
			}
		}

		return false;
	},
	_getHtml : function(plugName)
	{
		if(!plugName)
		{
			return false;
		}
		
		switch(plugName)
		{
			case 'ToolBar_Game' :
				return {
							menu : '<a class="wdt w1" href="javascript:;"><span></span><i class="ico i54"></i>我的游戏</a>',
							tab  : '<div class="pop p1" style="display: none; top: -501px; left: 0px;"></div>'
						};
			case 'ToolBar_Twitter' :
				return {
							menu : '<a class="wdt w2" href="javascript:;"><span></span><i class="ico i72"></i>推他</a>',
							tab  : '<div class="pop p2" style="display: none; top: -201px; left: 90px;">2222</div>'
						};
			case 'GoTop' :
				return {
							menu : '<a class="wdt w3" href="javascript:;"><span></span><i class="ico i30"></i>返回顶部</a>',
							tab  : '<div class="pop p3" style="display: block; top: -201px; left: 760px;">3333</div>'
						};
			case 'ToolBar_Mail' :
				return {
							menu : '<a class="wdt w4" href="javascript:;"><span></span><i class="ico i78"></i></a>',
							tab  : '<div class="pop p4" style="display: none; top: -201px; left: 760px;">4444</div>'
						};
			case 'ToolBar_Online' :
				return {
							menu : '<a class="wdt w5" href="javascript:;"><span></span><i class="ico i66"></i>在线好友</a>',
							tab  : '<div class="pop p5" style="display: none; top: -201px; left: 726px;">5555</div>'
						};
			case 'ToolBar_Playing' :
				return {
							menu : '<a class="wdt w6" href="javascript:;"><span></span>谁在玩这个游戏</a>',
							tab  : '<div class="pop p6" style="display: none; top: -201px; left: 614px;">6666</div>'
						};
			default :
				return false;
		}
	},
	goTop : function()
	{
		$().scrollTop(0);
	}
});