$.registerNameSpace('bf.module.tuita');

$.bf.module.tuita = $.Class.create();


$.bf.module.tuita.implement({
	
	_allow_add_time_interval: 1000, //允许发表的时间间隔，单位：毫秒
	_tuita_adding: false, //正在发表推他中,用于频率控制
	
	__init__: function(minHeight, defaultWordsCount, style, options) {
		this.defaultWordsCount = defaultWordsCount;
		this._twitter = $.bf.ui.Twitter.create(minHeight, defaultWordsCount, style, options);
		this._twitter.register();
		this._params = {app:''};
		$.bf.common.TwitterCrossManager.register(this._twitter);
	},

	//显示推他框
	show: function(bind_selector, cbAddTuita, pbAddTuita) {
		this._twitter.replaceWith(bind_selector).show();
		this._twitter.init();
		this._twitter.onPublish = function(data) {
			this._addTuita(data, cbAddTuita, pbAddTuita);
		}.bind(this);
		this.setFocus();
	},
	
	//添加自定义参数
	addParam: function(param, value) {
		this._params[param] = value;
	},
	
	_setPos: function (location) {
		var el = this._twitter.getTextarea().get(0);
		if (el.setSelectionRange) {
			el.focus();
			el.setSelectionRange(location, location);
		} else if (document.body.createTextRange) {
			var range = document.body.createTextRange();
			range.moveToElementText(el);
			range.collapse(true);        
			range.move('character', location);
			range.select();
		}
	},
	
	// 设置焦点
	setFocus: function () {
		// this._twitter.getTextarea().focus().get(0).value += '';
		this._setPos(this.getTextareaContent().length);
	},
	
	// 获取内容
	getTextareaContent: function () {
		return this._twitter._textarea.val();
	},
	
	setTextareaContent: function(content) {
		this._twitter._textarea.val(content);
	},
	
	//获取当前时间，毫秒数
	getCurrentTime: function() {
		var d = new Date();
		var current_time = d.getTime();
		d = null;
		
		return current_time;
	},
	
	//发表频率控制函数
	checkIsAllowAddInIntervalTime: function() {
		var current_time = this.getCurrentTime();
		var last_add_time = $.cookie('__last_add_tuita_time') ? $.cookie('__last_add_tuita_time') : 0;
		if (current_time - last_add_time <= this._allow_add_time_interval) {
			return false;
		}else {
			return true;
		}
	},
	
	//发布推他
	_addTuita: function(data, callback, precall) {
		if (precall) {
			if (precall() == false) return false;
		}
		var content = data.message; //推他内容 
		var mood_color = data.moodData.mood_color; //心情编号
		var mood_desc = data.moodData.mood_desc; //心情描述
		var img = data.imageData; //原图片地址
		var video = data.videoData; //原视频地址
		
		if (content.length <= 0) {
			//$.bf.module.Tooltip.show('请输入微博内容', $.bf.ui.Tooltip.icons.ERROR);
			$.bf.module.TxtTips.show(this._twitter._publishBtn,'请输入微博内容');
			this._twitter.getTextarea().get(0).focus();
			return false;
		}
		if(content.length>this.defaultWordsCount){
			$.bf.module.TxtTips.show(this._twitter._publishBtn,'微博内容不能超过'+this.defaultWordsCount+'个字符');
			//$.bf.module.Tooltip.show('微博内容不能超过'+this.defaultWordsCount+'个字符', $.bf.ui.Tooltip.icons.ERROR);
			this._twitter.getTextarea().get(0).focus();
			this._twitter.getTextarea().get(0).value+="";
			//滚动到底部
			this._twitter.getTextarea().scrollTop(this._twitter.getTextarea().get(0).clientWidth);
			return false;
		}

		//来源app
		var source_app = this._params.app;
		if (! source_app) {
			source_app = '';
		}
		
		if (this._tuita_adding) {
			//$.bf.module.TxtTips.show(this._twitter._publishBtn,'发布中..');
			//$.bf.module.Tooltip.show('微博发表中,请稍后...', $.bf.ui.Tooltip.icons.ERROR);
			return false;
		}
		if (! this.checkIsAllowAddInIntervalTime()) {
			//$.bf.module.TxtTips.show(this._twitter._publishBtn,'发布中..');
			//$.bf.module.Tooltip.show('您发表的频率太快了！', $.bf.ui.Tooltip.icons.ERROR);
			$.bf.module.TxtTips.show(this._twitter._publishBtn,'您发表的太快了！');
			return false;
		}
		
		this._tuita_adding = true;
		
		//发布时载入中
		//this._twitter._sendLoading.show();
		$.cookie('__last_add_tuita_time', this.getCurrentTime());
		$.bf.ajax.request('/tuita/addTuita', 
				{img:img, video:video, content:content, mood:mood_color, mood_text:mood_desc, app:source_app},
				function(data) {
					this._twitter.reset();
					//$.cookie('__last_add_tuita_time', this.getCurrentTime());
					this._tuita_adding = false;
					callback && callback(0, data);
				}.bind(this),
				function(errno, msg) {
					this._tuita_adding = false;
					errno = parseInt(errno);
					this._twitter._sendLoading.hide();
					if (errno == 1003 || errno == 1004 || errno == 1005 || errno == 120 || errno == -12 || errno == -13 || errno == -14 || errno == -50000) {
						$.bf.module.TxtTips.show(this._twitter._publishBtn, msg);
						//$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
					}else {
						//callback && callback(errno, msg);
						$.bf.module.TxtTips.show(this._twitter._publishBtn, '系统忙，请重试.');
					}
				}.bind(this),"POST"
		);
	}
	
});