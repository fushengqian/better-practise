/**
* 用于选择学校
* @author Jefurry <jefurry.chen@gmail.com>
*/

$.registerNameSpace('bf.ui.School');
$.bf.ui.School = $.Class.create();
$.Class.extend($.bf.ui.School, $.bf.ui.Dialog, {
	__init__ : function(input_selector, combo_selector, cls)
	{
		this._universities       = null;//通过getScript方式取回来的JS数据
		this._pys                = null;//拼音数组
		this._lastKeywords       = null;//上一个搜索关键字
		this._exactName          = null;
		this._exactId            = null;
		this._lastProvId         = null;

		this._inited             = false;//是否初始化完成
		this._titleBar           = null;//标题栏
		this._closeBtn           = null;//关闭按钮
		this._cityContainer      = null;//城市容器
		this._schoolContainer    = null;//学校容器
		this._searchInput        = null;//需要支持搜索的textInput
		this._myInput            = null;//找不到大学时，我自己输入的textInput
		this._currentCityCls     = cls || 'cur';//当前城市的className
		this._bindInput          = $(input_selector) || null;//绑定到的input元素
		this._bindCombo          = $(combo_selector) || null;//绑定到的select元素

		this._html = '\
			<div class="popup" style="position: absolute; z-index: 32000; width: 645px; top: 430%;">\
				<div class="popupTL">\
					<div class="popupTR">\
						<div class="popupT"></div>\
					</div>\
				</div>\
				<div class="popupBoxL">\
					<div class="popupBoxR">\
						<div class="popupBox">\
							<div class="popupTitle" attr="title_bar">\
								<a tag="close" attr="close_btn" href="javascript:void(0)" class="r">\
									<span class="iconClose" style="cursor: pointer;"></span>\
								</a>选择学校\
							</div>\
						<div class="popupMain">\
							<div class="popSearch">搜索：<input type="text" attr="search_input" class="text"></div>\
							<div class="popSearchCity" attr="city_container">\
								<!--<a href="#" class="">北京</a>\
								<a href="#">上海</a>-->\
							</div>\
							<div class="popSchoolList" attr="school_container">\
								<!--<ul>\
									<li>\
										<a href="#">黑龙江中医药</a>\
									</li>\
								</ul>-->\
							</div>\
							<div class="r">找不到我的学校,我要自己输入:&nbsp;<input attr="my_input" type="text" class="text" style="width: 150px;">&nbsp;<span class="button"><span>\
								<button type="button">确认</button></span></span></div><div class="clear"></div>\
							</div>\
						</div>\
					</div>\
				</div>\
				<div class="popupBL">\
					<div class="popupBR">\
						<div class="popupB"></div>\
					</div>\
				</div>\
			</div>\
		';
	},
	/**
	* 设置城市名到UI中
	* @param citiesArray 城市名数组
	*/
	_setCities : function(citiesArray)
	{
		var html = [];
		$.each(citiesArray, function(index, cityName){
			var tpl = "<a class='%s' href='javascript:;' index='%s' attr='city_%s'>%s</a>";
			var cls = '';//当前样式类名
			if(index === 0)
			{
				cls = this._currentCityCls;
			}

			html.push($.sprintf(tpl, cls, index, index, cityName));
		});

		var $this = this;
		this._cityContainer.html(html.join('')).find("a").click(function(event){
			$this._onProvChanged($(this).attr('index'));
		});
	},
	/**
	* 设置city的样式类名
	* @param index 当前是第几个
	*/
	_setCityCls : function(index)
	{
		this._lastProvId = index;
		this._cityContainer.find('a').removeClass().end().find($.sprintf("[attr='city_%s']", index)).removeClass().addClass(this._currentCityCls);
	},
	
	_clearCityCls : function()
	{
		if(this._lastProvId)
		{
			this._dialogHandler.find($.sprintf("[attr='city_%s']", this._lastProvId)).removeClass();
			this._lastProvId = null;
		}
	},
	
	_insertOption : function (comp, txt, value)
	{
		if(!comp)
		{
			return false;
		}

		try {
			comp.add(new Option(txt, value), null);
		} catch (e) {
			comp.add(new Option(txt, value));
		}
	},
	
	_getDeps : function(id, allowEmpty)
	{
		if(!this._bindCombo)
		{
			return false;
		}

		var comp = this._bindCombo.get(0);

		comp.options.length = 0;
		if(id > 0)
		{
			this._insertOption(comp, "正在刷新...", "");
			$.bf.ajax.request("/common/univdep", {"id" : id}, function(result){
				comp.options.length = 0;
				if (result.length == 0) {
					this._insertOption(comp, "没有院系信息", "");
				}
				else
				{
					if(allowEmpty)
					{
						this._insertOption(comp, "不限", "");
					}
					for(var i = 0; i < result.length; ++i)
					{
						this._insertOption(comp, result[i], result[i]);
					}
				}
			}.bind(this));
		}
		else
		{
			this._insertOption(comp, "没有院系信息", "");
		}
	},
	
	_onUnivChanged : function(id, name)
	{
		if(id == 0 && this._exactId)
		{
			id   = this._exactId;
			name = this._exactName;
		}
		if(this._callback)
		{
			this._callback(id, name);
		}
		else
		{
			this._getDeps(id);
		}
		//snda.component.university.close();
	},
	/**
	* 事件 设置学校列表到UI中
	* @param universities 学校数据
	* @param index 学校索引
	*/
	_onProvChanged : function(index)
	{
		//var univs = this._universities[index].univs;
		var univs = this._universities[index].univs;
		this._setCityCls(index);//设置样式
		var html = ["<ul>"];

		for (var i = 0; i < univs.length; ++i)
		{			
			html.push($.sprintf('\
				<li>\
					<a href="javascript:;" onclick="">%s</a>\
				</li>\
			', univs[i][1]));
		}
		html.push("</ul>");
		var $this = this;
		this._schoolContainer.html(html.join('')).find('a').each(function(index, item){
			$(this).click(function(event){
				$this._onUnivChanged(univs[index][0], univs[index][1]);
			});
		});
	},
	
	_listenSearch : function()
	{
		var $this = this;
		this._searchInput.keyup(function(event){
			$this._search($(this).val());
		}).change(function(event){
			$this._search($(this).val());
		});
	},
	
	_search : function(keywords)
	{
		if (keywords == "") return;
		keywords = keywords.toLowerCase();
		if (keywords == this._lastKeywords) return;
/*
		if (this._lastProvId != null)
		{
			var comp = document.getElementById("_uni_selector_prov_" + this._lastProvId);
			comp.className = "";
			this._lastProvId = null;
		}
*/
		this._lastKeywords = keywords;
		var html = ["<ul>"];
		this._exactName = null;
		this._exactId = null;
		this._clearCityCls();
		for(var i = 0; i < this._universities.length; ++i)
		{
			for(var j = 0; j < this._universities[i].univs.length; ++j)
			{
				var id = this._universities[i].univs[j][0];
				var name = this._universities[i].univs[j][1];
				var filter_str = "";
				if (this._universities[i].univs[j].length >= 3)
				{
					filter_str = this._universities[i].univs[j][2];
				}

				if (name == keywords)
				{
					this._exactName = name;
					this._exactId = id;
				}

				if (name.indexOf(keywords) >= 0 || filter_str.indexOf(keywords) >= 0)
				{
					html.push($.sprintf("<li><a uid='%s' uname='%s' href='javascript:;'>%s</a></li>", id, name, name));
				}
			}
		}
		html.push(["</ul>"]);
		var $this = this;
		this._schoolContainer.html(html.join('')).find('a').each(function(index, item){
			$(this).click(function(event){
				$this._onUnivChanged($(this).attr("uid"), $(this).attr("uname"));
			});
		});
	},

	build : function()
	{
		this.superclass.build.call(this); //调用父类方法
		if(!this._inited)
		{
			this._titleBar        = this._dialogHandler.find("[attr='title_bar']");
			this._closeBtn        = this._dialogHandler.find("[attr='close_btn']");
			this._cityContainer   = this._dialogHandler.find("[attr='city_container']");
			this._schoolContainer = this._dialogHandler.find("[attr='school_container']");
			this._searchInput     = this._dialogHandler.find("[attr='search_input']");
			this._myInput         = this._dialogHandler.find("[attr='my_input']");

			this.superclass.auto.call(this);//自动调整
			$.drag.init(this._titleBar, this._dialogHandler);//初始化拖动
			this._closeBtn.click(function(event){
				event.preventDefault();
				event.stopPropagation();

				this.hide();
			}.bind(this));
		}

		this._inited = true;
	},
	//显示
	show : function()
	{
		this.superclass.show.call(this);
	},
	
	//隐藏
	hide : function()
	{
		this.superclass.hide.call(this);
	}
});

$.extend($.bf.ui.School, {
	_universities   : null,
	_loading        : false,//大学数据是否正在加载中
	_loaded         : false,//大学数据是否加载完成
	_citiesArray    : null,//城市名称数组
	_schoolInstance : null,//School类的实例
	_setPYEnd : function(pinyins)
	{
		var index = 0;
		for(var i = 0; i < this._universities.length; ++i)
		{
			for(var j = 0; j < this._universities[i].univs.length; ++j)
			{
				this._universities[i].univs[j][2] = pinyins[index].join("\n");
				++index;
			}
		}
	},
	
	/**
	* 获取城市名数组
	*/
	_getCitiesNameArray : function()
	{
		if(this._citiesArray)
		{
			return this._citiesArray;
		}

		this._citiesArray = [];
		for(var i = 0; i < this._universities.length; ++i)
		{
			this._citiesArray.push(this._universities[i].name);
		}

		return this._citiesArray;
	},
	
	/**
	* 获取School类的实例
	*/
	_getSchoolInstance : function(input_selector, combo_selector, cls)
	{
		if(this._schoolInstance)
		{
			return this._schoolInstance;
		}

		this._schoolInstance = this.create(input_selector, combo_selector, cls);
		return this._schoolInstance;
	},
	
	init : function(callback)
	{
		callback = (callback || function(){}).bind(this);
		if(!this._loaded && !this._loading)
		{
			$.bf.ajax.get('bf.data.UniversityLib',function(){	//加载大学
				this._universities = _universities;
				var names = [];
				for(var i = 0; i < this._universities.length; ++i)
				{
					for(var j = 0; j < this._universities[i].univs.length; ++j)
					{
						names.push(this._universities[i].univs[j][1]);
					}
				}
				$.bf.utils.pinyin.chineseToPY(names, $.bf.ui.School._setPYEnd);
				callback && callback();

				this._loading = false;
				this._loaded  = true;

			}.bind(this));
		}
		else
		{
			callback && callback();
		}
	}
});

/*
$.bf.ui.School.init(function(){
	//this._search('sh');
	//this._getCitiesNameArray();
	//var school = this.create();
	//school.show();
	//this._getSchoolInstance();
	var school = this._getSchoolInstance("[attr='school_name']", "[attr='school_college']", 'cur');
	school.build();
	school._universities = this._universities;
	school._setCities(this._getCitiesNameArray());
	school._onProvChanged(0);
	school._listenSearch();

	school.show();
});
*/