/**
* 对话框
*/

$.registerNameSpace('bf.module');
$.extend($.bf.module, {
	Alert : {
		_alertHandler : null,
		show          : function(options)
		{
			if(!this._alertHandler)
			{
				this._alertHandler = $.bf.ui.Alert.create();
			}
			this._alertHandler.show(options);
			return this;
		},
		hide : function()
		{
			return this.close();
		},
		close         : function()
		{
			this._alertHandler && this._alertHandler.hide();
			return this;
		}
	},
	Confirm : {
		_confirmHandler : null,
		show            : function(options)
		{
			if(!this._confirmHandler)
			{
				this._confirmHandler = $.bf.ui.Confirm.create();
			}
			this._confirmHandler.show(options);
			return this;
		},
		hide : function()
		{
			return this.close();
		},
		close           : function()
		{
			this._confirmHandler && this._confirmHandler.hide();
			return this;
		}
	},
	Tooltip : {
		_tooltipHandler : null,
		show            : function(message, iconType, options, showMasker){
			if(!this._tooltipHandler)
			{
				this._tooltipHandler = $.bf.ui.Tooltip.create();
			}

			this._tooltipHandler.show(message, iconType, options, showMasker);
			return this;
		},
		close           : function()
		{
			this.hide();
		}
	},
	/**
	 * 图片tips
	 * 元素上方显示 1秒后消失
	 * 已知问题:document.body的高度变化会导致定位动画错位,请预先计算偏移或在高度变化情况下使用其他方式替代
	 */
	PopTips:{
		_tooltips:null,
		getDialog:function(){
			this._tooltips = $("#send_success");
			if(this._tooltips.length==0){
				this._tooltips = $('<div id="send_success" style="position:absolute;overflow:hidden;height:45px;width:150px;left:0;top:0;z-index:40000" class="miniPopup">\
				<div attr="scroll" class="box rc10">\
				<div class="arrow"></div>\
				<div class="t"><span></span></div>\
				<div class="c">\
				<div class="body center">\
				<i class="ico idone-commet"></i><span class="none">评论成功</span>\
				</div>\
				</div>\
				<div class="b"><span></span></div>\
				</div>\
				</div>').appendTo(document.body);
			}
			return this._tooltips;
		},
		/**
		 * 对应的图片样式
		 */
		data:{
				"1":{txt:"评论成功",css:"idone-commet"},
				"2":{txt:"转发成功",css:"idone-rt"},
				"3":{txt:"回应成功",css:"idone-reply"}
			},
		/**
		 * @param ele  要校准的元素
		 * @param type 类型
		 * @param offset[top|left] 偏移
		 */
		show:function(ele,type,offset,callback){
			type = type||1;
			offset = offset||{};
			var _offset = $(ele).offset();
			_offset.top -= this.getDialog().height();
			_offset.left -= (this.getDialog().width()-$(ele).width())/2;
			_offset.top += +offset.top||0;
			_offset.left += +offset.left||0;
			
			//alert(_offset.top+" "+_offset.left);
			this.getDialog().offset(_offset).find("i").removeClass("idone-rt").removeClass("idone-commet").removeClass("idone-reply").addClass(this.data[type].css);
			this.getDialog().find("[attr='scroll']").stop(true,true).show().css("top","45px").animate({top:0},400).delay(1000).animate({top:45},300,"linear",function(){
				this.getDialog().offset({top:-1000,left:-1000})
				callback&&callback();
			}.bind(this));
		}
	},
	/**
	 * 文字tips
	 * 元素上方显示 1秒后消失
	 * 已知问题:document.body的高度变化会导致定位动画错位,请预先计算偏移或在高度变化情况下使用其他方式替代
	 */
	TxtTips:{
		_tooltips:null,
		getDialog:function(){
			this._tooltips = $("#txt_success");
			if(this._tooltips.length==0){
				this._tooltips = $('<div id="txt_success" style="position:absolute;overflow:hidden;height:30px;width:auto;left:0;top:0;z-index:40000" class="miniTip">\
										<div attr="scroll" class="box rc10">\
											<div class="arrow"></div>\
											<div class="t"><span></span></div>\
											<div class="c">\
												<div class="cl center body">\
													<span class="t666" attr="txt">评论成功</span>\
												</div>\
											</div>\
											<div class="b"><span></span></div>\
										</div>\
									</div>').appendTo(document.body);
			}
			return this._tooltips;
		},
		/**
		 * @param ele 要校准的元素
		 * @param txt 文字
		 * @param offset[top|left] 偏移
		 */
		show:function(ele,txt,offset){
			offset = offset||{};
			var _offset = $(ele).offset();
			_offset.top -= this.getDialog().height()+3;
			_offset.top += +offset.top||0;
			_offset.left += +offset.left||0;
			this.getDialog().css("width","auto");
			this.getDialog().find("[attr='txt']").text(txt).end().css("width",this.getDialog().find("[attr='txt']").width()*1.3);
			_offset.left -= (this.getDialog().width()-$(ele).width())/2;
			this.getDialog().offset(_offset);
			this.getDialog().find("[attr='scroll']").stop(true,true).show().css("top","30px").animate({top:0},400).delay(1000).animate({top:30},300,"linear",function(){this.getDialog().offset({top:-1000,left:-1000})}.bind(this));
		}
	},
	HTMLDialog : {
		_htmlDialogHandler : null,
		/**
		 * @param showMasker 是否显示遮罩
		 * @param force 是否强制重新实例化
		 */
		init   : function(showMasker, force)
		{
			if(!this._htmlDialogHandler)
			{
				this._htmlDialogHandler = $.bf.ui.HTMLDialog.create(!!showMasker);
			}
			else if(!!force)
			{
				this._htmlDialogHandler = $.bf.ui.HTMLDialog.create(!!showMasker);
			}
			return this;
		},
		setSize : function(size)
		{
			this.init();
			this._htmlDialogHandler.setSize(size);
			return this;
		},
		css : function(cssProperty)
		{
			this.init();
			this._htmlDialogHandler.css(cssProperty);
			return this;
		},
		setHTML : function(html)
		{
			this.init();
			this._htmlDialogHandler.setHTML(html);
			return this;
		},
		setPosition : function(offset)
		{
			this.init();
			this._htmlDialogHandler.setPosition(offset);
			return this;
		},
		show : function(offset){
			this.init();
			this._htmlDialogHandler.show(offset);
			return this;
		},
		hide : function()
		{
			this.close();
		},
		close : function()
		{
			this.init();
			this._htmlDialogHandler.hide();
			return this;
		},
		startEffect : function(forceRestart, interval,delay){
			this.init();
			/*if(delay>-1){
				//alert("init!");
				var _this = this;
				var _force = forceRestart;
				var _interval = interval;
				this._delayHandler = setTimeout(function(){
						_this._htmlDialogHandler.startEffect(_force, _interval);
					},delay);
				this._htmlDialogHandler.getDialog().mouseover(function(){
					clearTimeout(_this._delayHandler);
				}).mouseout(function(){
						_this._htmlDialogHandler.startEffect(_force, _interval);
					});
			}else{
				this._htmlDialogHandler.startEffect(forceRestart, interval);
			}*/
			return this;
		},
		stopEffect : function(cleanQueue, gotoEnd, forceEnd)
		{
			this.init();
			this._htmlDialogHandler.stopEffect(cleanQueue, gotoEnd, forceEnd);

			return this;
		}
	}
});

/*
$.extend($.bf.module, {
	_alert_handler   : null,
	_confirm_handler : null,
	alert : function(message, title, callback)
	{
		if(!this._alert_handler)
		{
			this._alert_handler = $.bf.ui.Alert.create();
		}

		this._alert_handler.show(message, title);
		callback && callback();
	},
	
	confirm : function(message, title, okCallback, CancelCallback)
	{
		if(!this._confirm_handler)
		{
			this._confirm_handler = $.bf.ui.Confirm.create();
		}

		if(this._confirm_handler.show(message, title))
		{
			okCallback && okCallback();
		}
		else
		{
			cancelCallback && cancelCallback();
		}
	}
});
*/

//$.bf.module.alert('message', 'title');
//$.bf.module.confirm('message', 'title');
