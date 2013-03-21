/**
* 公共对话框组件
* @author Jefurry <jefurry.chen@gmail.com>
*/

$.registerNameSpace('bf.ui');

//对话框父类
$.bf.ui.Dialog = $.Class.create();
$.bf.ui.Dialog.implement({
	__init__ : function()
	{
		this._errno              = 0;
		this._error              = '';
		this._dialogHandler      = null;
		this._maskerHandler      = null;
		this._fixedmaskerHandler = null;//IE下div层次fixed
		this._html               = null;
		this._width              = 0;
		this._height             = 0;
		this._showMasker         = true; // 是否显示遮罩
		this._wrap               = 'body';
	},

	getLastErrno : function()
	{
		return this._errno;
	},
	
	getLastError : function()
	{
		return this._error;
	},
	
	setError : function(errno, error)
	{
		this._errno = errno;
		this._error = error;
	},
	
	clean : function()
	{
		this.setError(0, '');
	},
	/**
	 * 设置是否需要显示遮罩
	 * @param isShow true或false
	 */
	setMasker : function(isShow)
	{
		this._showMasker = !!isShow;
		return this._showMasker;
	},
	
	/**
	* 隐藏浏览器滚动条
	*/
	hideBrowserScrollBar : function()
	{
		$('html').css('overflow', 'hidden');
	},
	
	/**
	* 显示浏览器滚动条
	*/
	showBrowserScrollBar : function()
	{
		$('html').css('overflow', '');
	},

	getDoc : function()
	{
		var hasDocType = document.compatMode === 'CSS1Compat', isBorderMode = $.browser.msie && !hasDocType;
		return isBorderMode && document.body || document.documentElement;
	},

	/**
	* 文档可见宽
	*/
	getViewportWidth : function()
	{
		return $.browser.msie && this.getDoc().clientWidth || self.innerWidth;
	},

	/**
	* 文档可见高
	*/
	getViewportHeight : function()
	{
		return $.browser.msie && this.getDoc().clientHeight || self.innerHeight;
	},
	
	/**
	* 设置居中
	* @param offset 偏移对象。如{top : 10, left : 20}
	*/
	setCenter : function(offset)
	{
		offset = offset || {top : -100, left : 0};
		if(Object !== offset.constructor)
		{
			this.setError(5, "错误的参数类型.");
			return false;
		}

		if(!this._dialogHandler)
		{
			this.setError(6, "对话框句柄为空.");
			return false;
		}

		var dialog = this._dialogHandler;

		var doc_h = this.getViewportHeight(), doc_w = this.getViewportWidth();
        var e_h = dialog.innerHeight(), e_w = dialog.innerWidth();

        var top = (doc_h - e_h) / 2, left = (doc_w - e_w) / 2;

		dialog.css({
			top : Math.max(top + offset.top, 0) + $(window.document).scrollTop(),
			left : Math.max(left + offset.left, 0) + $(window.document).scrollLeft()
		});
	},

	setPosition : function(offset)
	{
		this.setCenter(offset);
	},
	
	/**
	* 获取遮罩对象
	* @param config 配置对象，应是Object的一个实例。可选参数
	* @return DomElement
	*/
	getMasker : function(config)
	{
		if(!this._showMasker)
		{
			return false;
		}
		if(!this._maskerHandler)
		{
			config = config || {};
			if(Object !== config.constructor)
			{
				this.setError(3, '错误的参数类型.');
				return false;
			}
		
			// 惯例配置
			var convertion = {
				'opacity'               : .2,
				'z-index'               : 33339,
				'position'              : 'absolute',
				'top'                   : 0,
				'left'                  : 0,
				'height'                : $(document).height() + 'px',
				'width'                 : $(window).width() + 'px',
				'background-color'      : '#333',
				'-moz-border-radius'    : '10px',
				'-webkit-border-radius' : '10px',
				'border-radius'         : '10px',
				'display'               : 'none'
			};

			config = $.extend(convertion, config);
			try{
				this._maskerHandler = $("<div></div>").css(config).appendTo(this._wrap);
				if($.browser.msie){
					config["z-index"]--;
					this._fixedmaskerHandler = $("<iframe></iframe>").css(config).appendTo(this._wrap);
				}
			} catch(e) {
				this._maskerHandler = null;
				this.setError(4, "遮罩生成失败.");
				return false;
			}
		}
		this._maskerHandler.show();
		this._fixedmaskerHandler&&this._fixedmaskerHandler.show();
	},
	resize:function(){
		/*更新遮罩宽高*/
		var config = {};
		var convertion = {
			'height'                : $(document).height() + 'px',
			'width'                 : $(document).width() + 'px'
		};
		config = $.extend(convertion, config);
		try{
			this._maskerHandler.css(config);
			this._fixedmaskerHandler.css(config);
		}catch(e){
			//mask error
		}
	},
	/**
	* 关闭遮罩
	*/
	closeMasker : function()
	{
		this._maskerHandler && (this._maskerHandler.hide());
		this._fixedmaskerHandler && (this._fixedmaskerHandler.hide());
	},
	
	build : function(html)
	{
		if(this._dialogHandler)
		{
			return this._dialogHandler;
		}

		html = html || this._html || '';
		if(!html)
		{
			this.setError(1, '无效的HTML标记.');
			return false;
		}

		try{
			this._dialogHandler = $(html).appendTo(this._wrap);
		} catch(e) {
			this._dialogHandler = null;
			this.setError(2, '生成对话框失败.');
			return false;
		}
	},
	
	show : function(offset)
	{
		if(!this._dialogHandler)
		{
			this.build();
			if(this.getLastErrno())
			{
				return false;
			}
		}
		//this.getMasker();
		this.setPosition(offset);
		this._dialogHandler.show();
		//ie fixed
		this._dialogHandler.find("[attr='popupMain']").show();
	},
	
	bindResize : function(callback){
		$(window).bind('resize', function(event){
			/*if(this._maskerHandler)
			{
				this._maskerHandler.css({'width' : $(document).width(), 'height' : $(document).height()});	
			}
			if(this._fixedmaskerHandler){
				this._fixedmaskerHandler.css({'width' : $(document).width(), 'height' : $(document).height()});	
			}*/
			this.resize();
			callback && callback();
		}.bind(this)).bind('scroll', function(event){
			/*if(this._maskerHandler)
			{
				this._maskerHandler.css({'width' : $(document).width(), 'height' : $(document).height()});
			}
			if(this._fixedmaskerHandler){
				this._fixedmaskerHandler.css({'width' : $(document).width(), 'height' : $(document).height()});	
			}*/
			this.resize();
			callback && callback();
		}.bind(this));
	},

	auto : function()
	{
		this.bindResize(function(){
			//this.setCenter();
			this.setPosition();
		}.bind(this));
	},

	hide : function()
	{
		if(this._showMasker)
		{
			this.closeMasker();
			this.showBrowserScrollBar();
		}
		this._dialogHandler && (this._dialogHandler.hide());
	},
	
	getDialog : function()
	{
		return this._dialogHandler;
	}
});

//工具提示类
$.bf.ui.Tooltip = $.Class.create();
$.bf.ui.Tooltip.icons = {//对话框ICON类型对象
	OK    : 'icon_succeed',
	ERROR : 'icon_error',
	DOUBT : 'icon_doubt',
	SIGH  : 'icon_sigh'
};
$.Class.extend($.bf.ui.Tooltip, $.bf.ui.Dialog, {
	__init__ : function()
	{
		this.superclass.__init__.call(this);//调用父类构造方法
		this._msgContainer  = null;// 消息容器
		this._iconContainer = null;// ICON
		this._inited        = false;//是否初始化完成
		this._showMasker    = true; // 是否显示遮罩
		
		this._html = '\
			<div style="display:none;position:absolute;z-index:41000;width:230px;" class="popup">\
				<div class="shadow"></div>\
				<div class="popupBox">\
					<div class="popTtMain">\
					<div class="msgBox txt3"><span attr="tooltip_icon" class="icon_doubt"></span><span attr="tooltip_msg"></span></div>\
					</div>\
				</div>\
			</div>\
		';
		this.superclass.build.call(this); // 调用父类方法
	},
	/**
	 * 显示
	 * @param message 消息
	 * @param iconType 图标类型
	 * @param options 配置对象，具体跟消失时的动画相关:{speed 2000,  onClose: function(){}}
	 * @param Boolean showMasker 是否显示遮罩，默认显示遮罩，如不需要遮罩，可传入true
	 */
	show : function(message, iconType, options, showMasker)
	{
		showMasker = !showMasker;
		// 惯例配置
		var convertion = {
			speed    : 2000,
			onClose  : function(){
			}
		};
		options = $.extend(convertion, options || {});
		
		if(!this._msgContainer)
		{
			this._msgContainer  = this._dialogHandler.find("[attr='tooltip_msg']");
			this._iconContainer = this._dialogHandler.find("[attr='tooltip_icon']");
		}

		message = message || '', iconType = iconType || $.bf.ui.Tooltip.icons.OK;
		this._msgContainer.html(message);
		this._iconContainer.removeClass().addClass(iconType);
		if(!this._inited)
		{
			this.auto();//自动调整
			this._inited = true;
		}
		
		if(showMasker)
		{
			this.superclass.getMasker.call(this);
		}	
		this.superclass.show.call(this);// 调用父类方法
		/*
		this.getDialog().fadeOut(options.speed, function(){
			this.hide();options.onClose.call(this);
		}.bind(this));
		*/
		setTimeout(this.hide.bind(this), 2000);
	},

	getDialog : function()
	{
		return this._dialogHandler;
	},
	
	hide : function()
	{
		this.superclass.hide.call(this);
	}
});

/**
 * 公共对话框
 */
$.bf.ui.CommonBox = $.Class.create();
$.Class.extend($.bf.ui.CommonBox, $.bf.ui.Dialog, {
	__init__ : function()
	{
		this._showMasker = false;
		this._html = '\
			<div style="display:none;position:absolute;z-index:31000;width:230px;" class="popup">\
				<div class="shadow"></div>\
				<div class="popupBox">\
					<div class="popTtMain">\
						<div class="msgBox txt3"><span attr="tooltip_msg"></span></div>\
					</div>\
				</div>\
			</div>\
		';
		this.superclass.build.call(this);
	}
});

//添加好友对话框
$.bf.ui.AddFriendDialog = $.Class.create();
$.Class.extend($.bf.ui.AddFriendDialog, $.bf.ui.Dialog, {
	/**
	 * 构造方法
	 * @param friendInfo 好友信息数组，格式为：[{sdid : 'sdid', nick : 'nick', gender : 'gender', city : 'city', star : 'star', avatar : 'avatar'}]
	 * @param groupDatas 好友分组数据，应为数组，数据格式如：[{groupId : 'groupId', groupName : 'groupName', groupNum : 'groupNum', checked : 1}, {groupId : 'groupId', groupName : 'groupName', groupNum : 'groupNum', checked : 0}]
	 */
	__init__ : function(friendInfo, groupDatas)
	{
		this._friendInfo         = friendInfo || [];
		this._groupDatas         = groupDatas || [];
		this._inited             = false;
		this._showMasker         = true;
		this._timer              = null; // 定时器，用于定时设置它分组对话框与添加好友对话框进行对齐
		this._friendInfoTemplate = '\
			<div class="l avatar-45 mgr10"><img alt="" src="%s"></div>\
			<p class="l">\
				昵称：%s  <br>\
				%s  %s %s\
			</p>\
		';

		this._html = '\
			<div class="popup" style="position: absolute; width: 258px; left: 62%; top: 90%; z-index: 32000;display:none;">\
				<div class="shadow"></div>\
				<div class="popupBox">\
					<div class="popupTitle" attr="friend_title_bar">\
						<a href="javascript:;" class="r" attr="friend_close_btn">\
							<span class="iconClose"></span>\
						</a>\
						<span>添加好友</span>\
					</div>\
					<div class="popupMain">\
						<div class="addgroups">\
							<div attr="friend_info_container"></div>\
							<div class="clear"></div>\
							<p class="words">分组：\
								<span class="inputWrap">\
									<span>\
										<input type="text" style="width: 132px;" attr="friend_group_input" />\
									</span>\
								</span>\
								<span class="buttonSelect" attr="friend_select_group_btn">\
									<i class="ico i53" href="javascript:void(0);"></i>\
								</span>\
							</p>\
						</div>\
						<p class="submit">\
							<a class="btn btn3 mr10" href="javascript:void(0);" onclick="return false" attr="friend_enter_btn"><span>确认</span></a>\
							<a class="btn btn3" href="javascript:void(0);" onclick="return false" attr="friend_close_btn"><span>取消</span></a>\
						</p>\
					</div>\
				</div>\
			</div>\
		';
		this.superclass.build.call(this);
		this._groupDialogHandler  = $.bf.ui.AddGroupBox.create(this._dialogHandler.find("[attr='friend_group_input']"), this._groupDatas); // 分组对话框句柄
		this._friendInfoContainer = this._dialogHandler.find("[attr='friend_info_container']"); // 好友信息容器
		this._friendTitleBar      = this._dialogHandler.find("[attr='friend_title_bar']"); // 标题栏
		this._friendCloseBtn      = this._dialogHandler.find("[attr='friend_close_btn']"); // 关闭按钮
		this._friendEnterBtn      = this._dialogHandler.find("[attr='friend_enter_btn']");// 确定按钮
		this._friendCloseBtn.click(function(event){
			this.hide();
		}.bind(this));

		this.setFriendInfo(this._friendInfo); // 设置好友信息
		this.setGroupDatas(this._groupDatas); // 设置分组数据
		this._dialogHandler.find("[attr='friend_select_group_btn']").toggle(function(){
			this.getGroupDialog().show();
		}.bind(this), function(){
			this.getGroupDialog().hide();
		}.bind(this));
	},
	/**
	 * 设置好友信息
	 * @params friendInfo 好友信息数组
	 */
	setFriendInfo : function(friendInfo)
	{
		friendInfo = friendInfo || [];
		var tpl = [];
		$.each(friendInfo, function(index, friend){
			tpl[tpl.length] = $.sprintf(this._friendInfoTemplate, friend.avatar || '', friend.nick || '', friend.gender || '', friend.city || '', friend.star || '');
		}.bind(this));
		this._friendInfoContainer.html(tpl.join(''));

		return this;
	},
	/**
	 * 清除好友信息数据及分组数据
	 */
	clear : function()
	{
		this._friendInfoContainer && this._friendInfoContainer.html('');
		this._groupDialogHandler && this._groupDialogHandler.clear();

		return this;
	},
	/**
	 * 设置分组数据
	 * @param groupDatas 分组数据
	 */
	setGroupDatas : function(groupDatas)
	{
		this._groupDialogHandler.setGroupDatas(groupDatas);

		return this;
	},
	/**
	 * 添加分组数据到UI
	 * @param groupDatas 分组数据
	 */
	addGroup : function(groupDatas)
	{
		this._groupDialogHandler.addGroup(groupDatas);

		return this;
	},
	/**
	 * 添加新组回调方法
	 * @param newGroupName 新建的组名
	 */
	addNewGroupCallback : function(newGroupName)
	{
		return newGroupName;
	},
	/**
	 * 设置分组回调方法
	 * @param selectedGroups 已选中的组
	 */
	setGroupCallback : function(selectedGroups)
	{
		return selectedGroups;
	},
	/**
	 * 添加好友回调方法，需重写
	 * @param fid 好友ID
	 * @param selectedGroups 已选中的分组
	 */
	addFriendCallback : function(fid, selectedGroups)
	{
	},
	getGroupDialog : function()
	{
		return this._groupDialogHandler;
	},
	getDialog : function()
	{
		return this._dialogHandler;
	},
	/**
	 * 显示对话框
	 * @param fid 好友ID，必选参数
	 * @param String friendInfo 如果friendInfo存在，则设置好友信息
	 */
	show : function(fid, friendInfo)
	{
		if(!fid)
		{
			return false;
		}
		if(friendInfo)
		{
			this.setFriendInfo(friendInfo);
		}

		if(!this._inited)
		{
			// 拖动 start
			$.drag.init(this._friendTitleBar, this.getDialog());
			this.bindResize(function(){
				this.getGroupDialog().setPosition();
			}.bind(this));
			this._dialogHandler.get(0).onDrag = function(event, x, y)
			{
				this.getGroupDialog().setPosition();
			}.bind(this);
			// end
			this.superclass.auto.call(this); // 自动调整
			this.getGroupDialog().addCallback('add', function(){
				this.addNewGroupCallback(this._groupDialogHandler.getInputGroupText());
			}.bind(this)).addCallback('enter', function(){
				this.setGroupCallback(this._groupDialogHandler.getSelectedGroups());
			}.bind(this));
			this._friendEnterBtn.click(function(event){
				this.addFriendCallback(fid, this._groupDialogHandler.getSelectedGroups());
			}.bind(this));

			this._inited = true;
		}

		this.superclass.getMasker.call(this);

		this.superclass.show.call(this);
		// fix firefox window.onResize	
		this._timer = self.setInterval(function(){
			this.getGroupDialog().setPosition();
		}.bind(this), 0);
		// end
	},
	
	hide : function()
	{
		this.superclass.hide.call(this);
		this._groupDialogHandler.hide(); // 隐藏分组对话框
		// fix
		this._timer && self.clearInterval(this._timer);
		this._timer = null;
	}
});

//好友分组类
$.bf.ui.AddGroupBox = $.Class.create();
$.Class.extend($.bf.ui.AddGroupBox, $.bf.ui.Dialog, {
	/**
	 * 构造方法
	 * @param bindTo 绑定到的元素，此应为jQuery选择器
	 * @param groupDatas 好友分组数据，应为数组，数据格式如：[{groupId : 'groupId', groupName : 'groupName', groupNum : 'groupNum', checked : 1}, {groupId : 'groupId', groupName : 'groupName', groupNum : 'groupNum', checked : 0}]
	 */
	__init__ : function(bindTo, groupDatas, maxLength)
	{
		this._bindTo        = bindTo || ''; // 绑定到的元素（此应为jquery选择器）
		this.setBindElement(this._bindTo); // 绑定元素
		this.maxLength = maxLength || 10;
		//this._bindTo         = $(bindTo || ''); // 绑定到的元素(此应为jQuery选择器)
		this._groupDatas     = groupDatas || []; // 用户好友数据
		this.setGroupDatas(this._groupDatas);
		this._inited         = false; //是否初始化完成
		this._groupTemplate  = '<p><input type="checkbox" class="checkbox" "%s" value="%s" /><span>%s(%s)</span></p>'; // 组模板
		this._showMasker     = false; // 不显示遮罩
		/*
		if(!this._bindTo)
		{
			this.setError(6, '要绑定到的元素不存在.');
			return false;
		}
		*/
		this._html = '\
			<div class="popup" style="position: absolute; width: 278px; left: 32%; top: 90%; z-index: 32000;display:none;">\
                <div class="buildAgroup">\
				   <div attr="group_container">\
                   <!--<p><input type="checkbox" value="" name="">恐龙时代</p>\
                   <p><input type="checkbox" value="" name="">中学同学</p>-->\
				   </div>\
                   <p>\
                   <span class="inputWrap"><span><input type="input" attr="group_new_input" maxlength="' + this.maxLength + '"></span></span>\
                   <a class="btn btn3" href="javascript:void(0);" attr="group_new_btn"><span>新建</span></a>\
                   </p>\
                   <p class="txt4" attr="group_tips_container"><!--请不要超过16个字符--></p>\
                   <p class="center buttonW">\
                   <a class="btn btn3" href="javascript:void(0);" onclick="return false" attr="group_enter_btn"><span>确定</span></a>\
                   </p>\
              </div>\
			</div>\
		';
		this.superclass.build.call(this);
		this._groupContainer     = this._dialogHandler.find("[attr='group_container']"); // 组容器
		this._groupTipsContainer = this._dialogHandler.find("[attr='group_tips_container']"); // 消息提示容器
		this._groupNewInput      = this._dialogHandler.find("[attr='group_new_input']"); // 新建组文本域
		this._groupNewBtn        = this._dialogHandler.find("[attr='group_new_btn']"); // 新建组按钮
		this._groupEnterBtn      = this._dialogHandler.find("[attr='group_enter_btn']"); // 确定按钮

		this.addGroup(this._groupDatas);
	},
	/**
	 * 重新绑定到元素上
	 * @param selector 元素选择器
	 */
	setBindElement : function(selector)
	{
		this._bindTo = $(selector || '');
	},
	/**
	 * 设置分组数据
	 * @param groupDatas 分组数据
	 */
	setGroupDatas : function(groupDatas)
	{
		this._groupDatas = groupDatas || [];

		return this;
	},
	/**
	 * 清除填充的组数组
	 */
	clear : function()
	{
		this._groupContainer && this._groupContainer.html('');

		return this;
	},
	/**
	 * 添加分组 
	 */
	addGroup : function(groupDatas)
	{
		groupDatas = groupDatas || this._groupDatas;
		var tpl = [];
		$.each(groupDatas, function(index, group){
			tpl[tpl.length] = $.sprintf(this._groupTemplate, !!group.checked && "checked='true'" || "", group.groupId, group.groupName, group.groupNum || 0);
		}.bind(this));
		tpl.length > 0 && this._groupContainer && this._groupContainer.append(tpl.join(''));

		return this;
	},
	/**
	 * 获取要新建的组名称
	 */
	getInputGroupText : function()
	{
		return this._groupNewInput.val();
	},
	/**
	 * 增加回调
	 * @param type 回调类型，为enter(确定)或add(新建组)
	 * @param callback 回调方法
	 */
	addCallback : function(type, callback)
	{
		type = (type || 'add').toLowerCase();
		callback = (callback || function(){}).bind(this);
		if(type == 'add')
		{
			this._groupNewBtn.get(0).onclick = function(event){
				callback(this.getInputGroupText());
			}.bind(this);
		}
		else if(type == 'enter')
		{
			this._groupEnterBtn.get(0).onclick = function(event){
				callback(this.getSelectedGroups());
			}.bind(this);
		}
		
		return this;
	},
	/**
	 * 获取已选中的好友分组
	 */
	getSelectedGroups : function()
	{
		var groups = [];
		this._groupContainer.find("input:checked").each(function(index, input){
			var groupId = $(this).val(), groupName = $(this).next().text();
			groups[groups.length] = {groupId : groupId, groupName : groupName};
		});

		return groups;
	},
	/**
	 * 设置提示信息
	 * @param msg 消息体
	 */
	setTips : function(msg)
	{
		this._groupTipsContainer.html(msg || '').show();

		return this;
	},
	/**
	 * 清除消息体
	 */
	clearTips : function()
	{
		this._groupTipsContainer.html('').hide();

		return this;
	},

	show : function()
	{
		this.superclass.show.call(this);
	},

	setPosition : function(offset)
	{
		var offset = offset || {left : 0, top : 0};
		if(Object !== offset.constructor)
		{
			this.setError(5, '错误的参数类型.');
			return false;
		}
		if(!this._dialogHandler)
		{
			this.setError(6, '对话框句柄为空.');
			return false;
		}

		var bind_offset = this._bindTo.offset(); // 获取绑定到的元素相对于当前视窗的left和top
		var offset = {top : offset.top + bind_offset.top, left : offset.left + bind_offset.left};
		this._dialogHandler.css(offset);

		return this;
	},
		
	hide : function()
	{
		this.superclass.hide.call(this);

		return this;
	}
});

// 邀请好友对话框组件
$.bf.ui.InviteDialog = $.Class.create();
$.Class.extend($.bf.ui.InviteDialog, $.bf.ui.Dialog, {
	__init__ : function()
	{
		this._showMasker = true;
		this._html = '\
			<div class="popup2" style="width: 305px; top: 5%; left: 50px;z-index:31000;display:none;">\
    			<div class="popupBox">\
    				<div class="popupTitle" attr="title_bar">\
        				<div class="popupbor">\
							<a title="关闭" tag="close" href="javascript:;" attr="close_btn" class="r">\
								<span class="iconClose"></span>\
							</a>\
							<span>邀请你的好友一起玩三国杀</span>\
            			</div>\
        			</div>\
        			<div class="popupMain">\
                		<!--tab-->\
                		<div class="TabWrap">\
                   	 		<div class="TabBorder">\
                        		<div class="tab" attr="tabs_container">\
									<a class="cur" href="javascript:;"><span>在线好友</span></a>\
									<a href="javascript:;"><span>谁在玩这个游戏</span></a>\
									<a href="javascript:;"><span>站外好友</span></a>\
                        		</div>\
                    		</div>\
                		</div>\
                		<!--/tab-->\
       					<div class="popupMainCon" attr="content_container">\
              				<div class="noteWord t999 size14 center">您目前没有任何好友在线1！</div>\
           				</div>\
						<div class="popupMainCon none" attr="content_container">\
              				<div class="noteWord t999 size14 center">您目前没有任何好友在线2！</div>\
           				</div>\
						<div class="popupMainCon none" attr="content_container">\
              				<div class="noteWord t999 size14 center">您目前没有任何好友在线3！</div>\
           				</div>\
            			<div class="buttonWrap buttonBlueWrap center">\
                    		<span class="buttonSmall"><span><input type="button" value="马上邀请" attr="invite_btn"></span></span>\
            			</div>\
        			</div>\
    			</div>\
			</div>\
		';
		this.superclass.build.call(this);
		this._titleBar          = this.getDialog().find("[attr='title_bar']"); // 标题栏
		this._closeBtn          = this.getDialog().find("[attr='close_btn']"); // 关闭按钮
		this._tabsContainer     = this.getDialog().find("[attr='tabs_container']"); // Tab容器
		this._inviteBtn         = this.getDialog().find("[attr='invite_btn']"); // 邀请按钮
		this._tabsLength        = undefined; // Tabs个数
		this._selectedTabIndex  = 0; //当前选中tab索引
		this._tabs              = undefined; // tabs集合
		this._contentContainers = undefined; // 内容容器集合
		this._closeBtn.click(function(event){
			this.hide();
		}.bind(this));
		$.drag.init(this._titleBar, this.getDialog());
		this.initTab(true);
		this._inviteBtn.click(function(event){
			this.inviteCallback();
		}.bind(this));
		this.bindResize(function(){
			this.auto();
		}.bind(this));
	},
	/**
	 * 初始化tab
	 * @param force 是否强制重新计算
	 */
	initTab : function(force)
	{
		force = !!force;
		this.changeTab(0);
		this.getSelectedTabIndex(force);
		this.getContentContainers(force);
	},
	/**
	 * 切换tab
	 * @param selectedIndex 选中的索引
	 */
	changeTab : function(selectedIndex)
	{
		this.getTabs().each(function(index, elem){
			$(elem).click(function(event){
				event.preventDefault();
				event.stopPropagation();
				
				this._selectedTabIndex = index;
				this.selectTab(index).selectContainer(index);
			}.bind(this));
		}.bind(this));
	},
	/**
	 * 获取内容容器
	 * @param force 是否强制重新计算
	 */
	getContentContainers : function(force)
	{
		if(!!force || 'undefined' === typeof this._contentContainers)
		{
			this._contentContainers = this.getDialog().find("[attr='content_container']"); // 获取内容容器
		}

		return this._contentContainers;
	},
	/**
	 * 获取tabs集合
	 * @param force 是否强制重新计算
	 */
	getTabs : function(force)
	{
		if(force || 'undefined' === typeof this._tabs)
		{
			this._tabs = this._tabsContainer.find("a");
		}

		return this._tabs;
	},
	/**
	 * 获取当前选中的tab索引
	 */
	getSelectedTabIndex : function()
	{
		return this._selectedTabIndex;
	},
	/**
	 * 选择tab
	 * @param index 索引
	 */
	selectTab : function(index)
	{
		var tabs   = this.getTabs();
		var tabLen = tabs.size();
		index = Math.max(0, Math.min(tabLen - 1, index));
		tabs.removeClass().eq(index).removeClass().addClass('cur');

		return this;
	},
	/**
	 * 选择内容容器
	 * @param index 索引
	 */
	selectContainer : function(index)
	{
		var containers    = this.getContentContainers();
		var containersLen = containers.size();
		index = Math.max(0, Math.min(containersLen - 1, index));
		//containers.removeClass().addClass("none").eq(index).removeClass().addClass("popupMainCon");
		containers.addClass("none").eq(index).removeClass("none");
		return this;
	},
	/**
	 * 设置内容
	 * @param index 索引
	 * @param content 内容
	 * @param cls 样式类名。当容器没有内容时的类为popupMainCon，有内容时的类为popupAvatarCon
	 */
	setContent : function(index, content, cls)
	{
		var tabLen = this.getTabs.size();
		index = Math.max(0, Math.min(tabLen - 1, index));
		var container = this.getContentContainers().eq(index);
		cls && container.removeClass(cls);
		container.html(content || '');

		return this;
	},
	/**
	 * 邀请回调方法
	 */
	inviteCallback : function()
	{
	},
	/**
	 * 显示对话框
	 */
	show : function()
	{
		this.superclass.show.call(this);
	},
	/**
	 * 隐藏对话框
	 */
	hide : function()
	{
		this.superclass.hide.call(this);
	},

	getDialog : function()
	{
		return this._dialogHandler;
	}
});

//Alert类
$.bf.ui.Alert = $.Class.create();
$.bf.ui.Alert.icons = {
	OK    : 'icon_succeed', // 成功
	ERROR : 'icon_error', // 失败
	DOUBT : 'icon_doubt', // 问号
	SIGH  : 'icon_sigh' // 感叹号
};
$.Class.extend($.bf.ui.Alert, $.bf.ui.Dialog, {
	__init__ : function()
	{
		this._html = '\
			<div class="popup" style="width: 300px; left: 80%; top: 60%; z-index: 34000; display: none;">\
  				<div class="shadow"></div>\
    			<div class="popupBox">\
    			<div class="popupTitle" attr="title_bar">\
					<a class="r" attr="close_btn"><span class="iconClose"></span></a><span attr="title_container">温馨提示</span></div>\
            		<div class="popupMain">\
                    	<div class="msgBox txt3">\
							<span class="icon_succeed" attr="icon_container"></span>\
							<span attr="message_container">您已成功邀请到好友.</span>\
						</div>\
						<p align="center" class="submit">\
                    		<a class="btn btn4" href="javascript:;" onclick="return false" attr="ok_btn"><span>确认</span></a>\
               			</p>\
            		</div>\
    			</div>\
			</div>\
		';
		this.superclass.build.call(this);
		this._titleContainer   = this.getDialog().find("[attr='title_container']"); // 标题容器
		this._titleBar         = this.getDialog().find("[attr='title_bar']"); // 标题栏
		this._iconContainer    = this.getDialog().find("[attr='icon_container']"); // ICON容器
		this._messageContainer = this.getDialog().find("[attr='message_container']"); // 消息容器
		this._okBtn            = this.getDialog().find("[attr='ok_btn']"); // 确认按钮
		this._closeBtn         = this.getDialog().find("[attr='close_btn']"); // 取消按钮
		$.drag.init(this._titleBar, this.getDialog());
		/* Todo 滚动有影响
		this.bindResize(function(){
			this.auto();
		}.bind(this));
		*/
	},

	getDialog : function()
	{
		return this._dialogHandler;
	},
	/**
	 * 显示alert对话框
	 * @params options 配置项
	 */
	show : function(options)
	{
		// 惯例配置
		var convertion = {
			title      : '系统提示',
			message    : '',
			onEnter    : function(){},
			onClose    : function(){},
			icon       : 'icon_succeed',
			buttonText : '确定'
		};
		options = $.extend(convertion, options || {});
		this._titleContainer.html(options.title);
		// 如果内容小于25个字节，则补充空白
		var byteLen = $.getByteLen(options.message);
		if(byteLen < 25)
		{
			var pad = "", needLen = 25 - byteLen;
			for(var i = 0; i < needLen; i++)
			{
				pad += "&nbsp;";
			}
			options.message += pad;
		}
		this._iconContainer.removeClass().addClass(options.icon);
		this._messageContainer.html(options.message);
		this.superclass.getMasker.call(this);
		this.superclass.setPosition.call(this);

		this._okBtn.html("<span>" + options.buttonText + "</span>").each(function(index, btn){
			btn.onclick = function(){
				this.hide();
				options.onEnter.call(this);
			}.bind(this);
		}.bind(this));

		this._closeBtn.each(function(index, btn){
			btn.onclick = function(){
				this.hide();
				options.onClose.call(this);
			}.bind(this);
		}.bind(this));

		this.getDialog().show();
	}
});

//Confirm类
$.bf.ui.Confirm = $.Class.create();
$.Class.extend($.bf.ui.Confirm, $.bf.ui.Dialog, {
	__init__ : function()
	{
		this._html = '\
			<div class="popup" style="width: 300px; left: 80%; top: 60%; z-index: 34000; display: none;">\
  				<div class="shadow"></div>\
    			<div class="popupBox">\
    			<div class="popupTitle" attr="title_bar">\
					<a class="r" attr="close_btn"><span class="iconClose"></span></a><span attr="title_container">温馨提示</span></div>\
            		<div class="popupMain">\
                    	<div class="msgBox txt3">\
							<span class="icon_doubt" attr="icon_container">&nbsp;&nbsp;</span>\
							<span attr="message_container">确定要删除吗？</span>\
						</div>\
						<p align="center" class="submit">\
                    		<a class="btn btn3 mr10" onclick="return false" attr="ok_btn"><span>确认</span></a>\
							<a class="btn btn3" onclick="return false" attr="close_btn"><span>取消</span></a>\
               			</p>\
            		</div>\
    			</div>\
			</div>\
		';

		this.superclass.build.call(this);
		this._titleContainer   = this.getDialog().find("[attr='title_container']"); // 标题容器
		this._titleBar         = this.getDialog().find("[attr='title_bar']"); // 标题栏
		this._iconContainer    = this.getDialog().find("[attr='icon_container']"); // ICON容器
		this._messageContainer = this.getDialog().find("[attr='message_container']"); // 消息容器
		this._okBtn            = this.getDialog().find("[attr='ok_btn']"); // 确认按钮
		this._closeBtn        = this.getDialog().find("[attr='close_btn']"); // 取消按钮
		$.drag.init(this._titleBar, this.getDialog());
		/* Todo 滚动有影响
		this.bindResize(function(){
			this.auto();
		}.bind(this));
		*/
	},

	getDialog : function()
	{
		return this._dialogHandler;
	},
	
	/**
	 * 显示confirm对话框
	 * @params options 配置项
	 */
	show : function(options)
	{
		// 惯例配置
		var convertion = {
			title   : '温馨提示',
			message : '',
			onEnter : function(){},
			onClose : function(){},
			icon    : 'icon_succeed' 
		};
		options = $.extend(convertion, options || {});
		this._titleContainer.html(options.title);
		// 如果内容小于25个字节，则补充空白
		var byteLen = $.getByteLen(options.message);
		if(byteLen < 25)
		{
			var pad = "", needLen = 25 - byteLen;
			for(var i = 0; i < needLen; i++)
			{
				pad += "&nbsp;";
			}
			options.message += pad;
		}

		this._messageContainer.html(options.message);
		this.superclass.getMasker.call(this);
		this.superclass.setPosition.call(this);
		
		this._okBtn.each(function(index, btn){
			btn.onclick = function(){
				this.hide();
				options.onEnter.call(this);
			}.bind(this);
		}.bind(this));

		this._closeBtn.each(function(index, btn){
			btn.onclick = function(){
				this.hide();
				options.onClose.call(this);
			}.bind(this);
		}.bind(this));

		this.getDialog().show();
	}
});

// HTML对话框
$.bf.ui.HTMLDialog = $.Class.create();
$.Class.extend($.bf.ui.HTMLDialog, $.bf.ui.Dialog, {
	/**
	 * 构造方法
	 * @param showMasker 是否显示遮罩
	 */
	__init__ : function(showMasker)
	{
		this._isShowMasker = this.setMasker(!!showMasker);
		this._html = '\
			<div class="popup" style="width: 258px; left: 62%; top: 90%; z-index: 35000;">\
  				<div class="shadow"></div>\
    			<div class="popupBox" attr="popupMain">\
        		</div>\
    		</div>\
		';
		this.superclass.build.call(this);
		this._popupMain = this.getDialog().find("[attr='popupMain']");
		this._timer = 0; // 定时器
		this._time_interval = 3000; // 默认为2秒
		this._inited_effect = false; // 是否第一次启动效果
		this.auto();
	},
	setSize : function(size)
	{
		size = size || {};
		size.width && this.getDialog().css('width', size.width);
		size.height && this._popupMain.css('height', size.height);
		return this;
	},
	setPosition : function(offset)
	{
		offset = offset || {};
		offset.top = offset.top || -100, offset.left = offset.left ||  0;
		this.superclass.setPosition.call(this, offset);
		return this;
	},
	css : function(cssProperty)
	{
		this.getDialog().css(cssProperty || {});
		return this;
	},
	setHTML : function(html)
	{
		this._popupMain.html(html || '');
		return this;
	},
	show : function()
	{
		this.getMasker();
		this.superclass.show.call(this);
		return this;
	},
	hide : function()
	{
		this.getDialog().hide();
		this.superclass.closeMasker.call(this);
		return this;
	},
	/**
	* 启动效果
	* @param interval 时间间隔,默认为2秒
	*/
	startEffect : function(forceRestart, interval)
	{
		if(!this._inited_effect)
		{
			interval = parseInt(interval);
			if(!isNaN(interval))
			{
				this._time_interval = interval;
			}

			this._inited_effect = true;
		}

		if(!!forceRestart)
		{
			this.stopEffect(true, true, true);
			this.getDialog().bind("mouseover", function(event){
				event.preventDefault();
				event.stopPropagation();

				this.stopEffect(true, true, false);
				this.show();//fadeIn
				//IE fixed
				$.browser.msie&&this._popupMain.show();
			}.bind(this)).bind("mouseout", function(event){
				event.preventDefault();
				event.stopPropagation();

				this.startEffect(false);
			}.bind(this));
		}

		var _dialog = $.browser.msie?this.getDialog().find("[attr='popupMain']"):this.getDialog();
		this._timer = _dialog.fadeOut(this._time_interval, function(){
			if($.browser.msie){//IE fixed
				_dialog.parent().hide();
			}
			if(this._isShowMasker)
			{
				this.closeMasker && this.closeMasker();
			}
		}.bind(this));

		return this;
	},
	/**
	* 停止效果
	*/
	stopEffect : function(cleanQueue, gotoEnd, forceEnd)
	{
		var _dialog = $.browser.msie?this.getDialog().find("[attr='popupMain']"):this.getDialog();
		_dialog.stop(!!cleanQueue, !!gotoEnd);
		if(!!forceEnd)
		{
			_dialog.unbind("mouseover").unbind("mouseout");
		}
		return this;
	}
});

/*
$(function(){
	var d = $.bf.ui.HTMLDialog.create(true);
	d.setSize({width:250, height:100}).setHTML("<strong>test</strong>").show().startEffect(2000);
});
*/


//#########zhaoxianghu###########
//笑脸类
$.bf.ui.faceDiv = $.Class.create();
$.Class.extend($.bf.ui.faceDiv, $.bf.ui.Dialog, {
	__init__ : function(faceButton, areaId, tipId)
	{
		this._faceButton = faceButton || '';
		this._areaId = areaId || '';
		this._tipId = tipId || '';

		this._faceTemplate = '<a href="javascript:void(0);" attr="face_obj"><img src=" %s " title=" %s " /></a>'; // 组模板

		this._inited     = false;
		this._showMasker = false;
		this._showed = false;
		
		this._html = 
			'<div style="width:395px;display:none;z-index:33000;" class="popup" id="'+this._tipId+'">\
			<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
			<div class="popupBoxL">\
			<div class="popupBoxR">\
			<div class="popupBox">\
			<div class="popGreenClose"><a class="r iconCloseGreen" attr="close_btn">close</a></div>\
			<div class="popupMain">\
			<div class="smileList">\
			<div attr="face_container">\
			<!--<a href="javascript:void(0);" attr="face_obj"><img src=" %s " title=" %s " /></a>-->\
			</div>\
			</div></div></div></div></div>\
			<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div></div>\
			';

		this.superclass.build.call(this);

		this._faceContainer     = this._dialogHandler.find("[attr='face_container']"); // 组容器
		this._faceCloseBtn      = this._dialogHandler.find("[attr='close_btn']"); // 关闭按钮
		
		//得到数据来源
		$.bf.ui.Face.config();
		//生成face图标对象
		this.data2template($.bf.ui.Face.sndaFaceCfg);
		
	    //取出图标对象
		this._faceObj = this._dialogHandler.find("[attr='face_obj']");       //face图标集合

		//点击添加表情的按钮 弹出div
		$("#"+this._faceButton).click(function(){
			if (this._showed == false){
				this.show();
			}
			else {
				this.hide();
			}
		}.bind(this));

		//每个表情点击后事件
		this._faceObj.each(function(index,face){
			$(face).bind("click",function(event){
				$("#"+this._areaId).insertFace(index);
				this.hide();
			}.bind(this));
		}.bind(this));

		//右上角关闭按钮
		this._faceCloseBtn.click(function(event){
			this.hide();
		}.bind(this));

	}, 
	
	show : function()
	{
		this.superclass.show.call(this);
		
		this._showed = true;
		
		//可重写setPosition方法
		$("#"+this._tipId).css({
			top : $('#'+this._faceButton)[0].offsetHeight+$('#'+this._faceButton).offset().top,
			left : $('#'+this._faceButton).offset().left
		});
		//this.setPosition({left : menuObj.offset().left, top : menuObj.height()+menuObj.offset().top});
	},

	hide : function()
	{
		this.superclass.hide.call(this);
		this._showed = false;
	},

	//将表情数据  替换成模板对应的html块
	data2template : function(faceData)
	{
		var tpl = [];
		// console.log(faceData);
		$.each(faceData, function(index,face){
			tpl[tpl.length] = $.sprintf(this._faceTemplate, $.bf.config.STATIC_URL+'/img/face/'+$.bf.ui.Face.sndaFaceCfg[index][1], $.bf.ui.Face.sndaFaceCfg[index][2]);
		}.bind(this));
		tpl.length > 0 && this._faceContainer && this._faceContainer.append(tpl.join(''));
	}
});
