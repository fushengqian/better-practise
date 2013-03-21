/**
 * Twitter UI Component
 * @author Jefurry <jefurry.chen@gmail.com>
 */

$.registerNameSpace('bf.ui.Twitter');

// 心情选择对话框
$.bf.ui.MoodDialog = $.Class.create();
$.Class.extend($.bf.ui.MoodDialog, $.bf.ui.Dialog, {
	__init__ : function(twitterInstance)
	{
		this._twitterInstance = twitterInstance || null; // 引用twitter框实例
		this.setMasker(true);
		this._html = '\
			<div style="width: 288px; left: 60%; top: 10%; z-index: 35000; display: none;" class="popup">\
				<div class="shadow"></div>\
					<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
					<div class="popupBoxL">\
						<div class="popupBoxR">\
							<div class="popupBox">\
							<div class="popupTitle" attr="mood_title_bar"><a class="r" href="javascript:void(0)"><span class="iconClose"></span></a>管理心情</div>\
								<div class="popupMain">\
									<ul class="mindAdmin" attr="mood_Container"></ul>\
									<div class="addMind">\
										<h3>添加心情</h3>\
										<dl>\
											<dt>输入心情</dt>\
											<dd><input type="text" attr="mood_input" class="text"></dd>\
											<dt>选择颜色</dt>\
											<dd class="mindChoice" attr="mood_color_container">\
												<a href="javascript:;" mood_color="1" class="kind1"></a>\
												<a href="javascript:;" mood_color="2" class="kind2"></a>\
												<a href="javascript:;" mood_color="3" class="kind3"></a>\
												<a href="javascript:;" mood_color="4" class="kind4"></a>\
												<a href="javascript:;" mood_color="5" class="kind5"></a>\
												<a href="javascript:;" mood_color="6" class="kind6"></a>\
												<a href="javascript:;" mood_color="7" class="kind7"></a>\
												<a href="javascript:;" mood_color="8" class="kind8"></a>\
												<a href="javascript:;" mood_color="9" class="kind9"></a>\
												<a href="javascript:;" mood_color="10" class="kind10"></a>\
												<a href="javascript:;" mood_color="11" class="kind11"></a>\
												<a href="javascript:;" mood_color="12" class="kind12"></a>\
												<a href="javascript:;" mood_color="13" class="kind13"></a>\
												<a href="javascript:;" mood_color="14" class="kind14"></a>\
												<a href="javascript:;" mood_color="15" class="kind15"></a>\
												<a href="javascript:;" mood_color="16" class="kind16"></a>\
												<a href="javascript:;" mood_color="17" class="kind17"></a>\
												<a href="javascript:;" mood_color="18" class="kind18"></a>\
												<a href="javascript:;" mood_color="19" class="kind19"></a>\
												<a href="javascript:;" mood_color="20" class="kind20"></a>\
											</dd>\
											<dt></dt>\
											<dd><span class="button"><span><a href="javascript:;" class="btn btn3" attr="mood_add_btn"><span>添加</span></a></span></span></dd>\
										</dl>\
									</div>\
								</div>\
							</div>\
						</div>\
					</div>\
					<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
				</div>\
		';
		this.superclass.build.call(this);

		this._titleBar           = this.getDialog().find("[attr='mood_title_bar']"); // 标题栏
		this._moodContainer      = this.getDialog().find("[attr='mood_Container']"); // 自定义的心情容器
		this._moodColorContainer = this.getDialog().find("[attr='mood_color_container']"); // 自定义心情颜色容器
		this._moodInput          = this.getDialog().find("[attr='mood_input']"); // 心情描述文本域
		this._addMoodBtn         = this.getDialog().find("[attr='mood_add_btn']"); // 添加心情文按钮

		this._selectedCoodColor  = null; // 已选择的颜色代号

		this._initEvent();
	},

	_initEvent : function()
	{
		var _this = this;

		$.drag.init(this._titleBar, this.getDialog());

		// 关闭对话框
		this._titleBar.find("a.r").click(function(event){
			event.preventDefault();
			event.stopPropagation();

			this.hide();
		}.bind(this));

		// 添加心情描述
		this._addMoodBtn.click(function(event){
			event.preventDefault();
			event.stopPropagation();

			var mood_desc = $.trim(this._moodInput.val());
			if(!mood_desc)
			{
				return $.bf.module.Tooltip.show("请填写心情描述", $.bf.ui.Tooltip.icons.ERROR, null, true);
			}
			if(mood_desc.length > 4)
			{
				return $.bf.module.Tooltip.show("心情描述不能超过4个字符", $.bf.ui.Tooltip.icons.ERROR, null, true);
			}
			if(!this._selectedMoodColor)
			{
				return $.bf.module.Tooltip.show("请选择心情颜色", $.bf.ui.Tooltip.icons.ERROR, null, true);
			}

			var mood_color = this._selectedMoodColor;

			$.bf.ajax.request("/tuita/addmood", {mood_color : mood_color, mood_desc : mood_desc}, function(result){
				var tpl = this._getMoodTpl(result);
				this._moodContainer.append(tpl);
				this._reset();
				this.hide();
				this._twitterInstance.IAppendMood(result);
				this._twitterInstance.ISCurrentMoodCls(mood_color, mood_desc);
				this._bindCMoodDelEvent(this._moodContainer.find(".iconClose6:last"));

			}.bind(this), function(errno, error){
			}, 'POST');
		}.bind(this));
		
		// 选择心情颜色
		this._moodColorContainer.find("a").click(function(event){
			event.preventDefault();
			event.stopPropagation();

			var mood_color = $.trim($(this).attr("mood_color"));
			_this._selectedMoodColor = mood_color;
			_this._moodColorContainer.find("a").removeClass("cur");
			$(this).addClass("cur");
		});
		
		/*
		this.bindResize(function(){
			this.setPosition();
		}.bind(this));
		*/
	},
	
	/**
	* 获取心情模板
	* @param dict 心情数据字典
	*/
	_getMoodTpl : function(dict)
	{
		return $.sprintf('<li><span class="%s">%s</span><a mood_id="%s" href="javascript:;" class="iconClose6"></a></li>', "kind" + dict.mood_color, dict.mood_desc, dict.id);
	},
	
	/**
	* 绑定自定义心情删除事件
	* @param selector 选择器
	*/
	_bindCMoodDelEvent : function(selector)
	{
		var _this = this;
		selector.click(function(event){
			event.preventDefault();
			event.stopPropagation();
			
			// 删除自定义心情
			var mood_id = $.trim($(this).attr("mood_id"));
			$.bf.ajax.request("/tuita/delmood", {mood_id : mood_id}, function(result){
				$(this).parent().remove();
				_this._twitterInstance.IDelMood(mood_id);
				_this._twitterInstance.ISCurrentMoodCls(0, "");
			}.bind(this), function(errno, error){
			}, 'POST');

		});
	},
	
	/**
	* 初始化自定义心情
	* @param index 起始样式索引
	* @param moods 心情数组
	*/
	initMoods : function(index, moods)
	{
		var tpl = [];
		$.each(moods, function(i, dict){
			tpl[tpl.length] = this._getMoodTpl(dict);
		}.bind(this));
		this._moodContainer.html(tpl.join(""));
		this._bindCMoodDelEvent(this._moodContainer.find(".iconClose6"));
	},
	
	_reset : function()
	{
		this._moodInput.val("");
		this._moodColorContainer.find("a").removeClass("cur");
		this._selectedMoodColor = null;
	},
	
	show : function()
	{
		this.superclass.getMasker.call(this);
		this._reset();
		this.superclass.show.call(this);
		return this;
	}
});

// Twitter组件
$.bf.ui.Twitter = $.Class.create();
$.bf.ui.Twitter.Manager = {
	__index__ : 0, // 第几个实例
	instanceCollections : {} // 保存所有实例
};
$.Class.extend($.bf.ui.Twitter, $.bf.ui.Dialog, {
	/**
	* 构造方法	
	* @param defaultWordsCount 最多允许的字数，默认为256
	* @param minHeight textarea的小最高度，默认为60
	* @param style 推他风格参数，默认为twitter
	* @param options 发布时附带的参数
	*/
	__init__ : function(minHeight, defaultWordsCount, style, options){
		//atOffset - textarea中偏移量
		this.options = options || {allowFollow : true, container : null, atOffset:{top:20,left:0}};
		$.bf.ui.Twitter.Manager.__index__++;
		this._instance_index = $.bf.ui.Twitter.Manager.__index__;
		this._wrap = "body";
		this._minHeight         = minHeight || 85; // 最小高度
		this._defaultWordsCount = defaultWordsCount || 256; // 最多允许输入的字符
		this._uploadUrl         = null; // 上传地址
		this.type               = style;
		this._styleMap = {
			"twitter" : {
				hd         : 'hd',
				style      : 'twitter'
			},
			'twitterSgs' : {
				hd         : 'hd',
				style      : 'twitterSgs'
			},
			"twitterS" : {
				hd         : 'hd',
				style      : 'twitterS'
			},
			"twitterMin" : {
				hd         : 'hd',
				style      : 'twitterMin'
			},
			"twitterM" : {
				hd         : 'hd2',
				style      : 'twitterM'
			},
			"twitterG" : {
				hd         : 'hd1',
				style      : 'twitterM'
			}
		};
		var st = this._styleMap[style || "twitter"];
		if("undefined" === typeof st)
		{
			st = this._styleMap["twitter"];
		}
		
		this._st        = st; // 样式
		// 用于保存将要发布的推他信息
		this._imageData = null; // {murl : murl, lurl : lurl, name : name} lurl为大图，murl为小图
		this._videoData = null; // 视频数据 {url : url}
		this._moodData  = {mood_color : 0, mood_desc : ''}; // 心情
		this.setMasker(false);
		//v2.1
		this._html = '\
				<div class="twitter">\
                    <div class="arrow"></div>\
                    <div class="tw_body">\
                        <div class="t cl"><span></span></div>\
                        <div class="hd cl">\
                            <span class="topic"><em class="none">此时此刻你在做什么</em></span>\
                            <span class="restNum" id="uc_tuitaInput_remainWordsContainer"><em attr="twitter_remain_count" id="uc_tuitaInput_remainWords">'+this._defaultWordsCount+'</em>字</span>\
                        </div>\
						<div class="popup" style="z-index: 36000; position: absolute; left: 32px; top: 109px;display:none" attr="twitter_preview_img">\
							<div class="del_con">\
								<span style="cursor:default" attr="twitter_preview_title"></span><a class="ml5 ico idel1" title="删除图片" href="javascript:;"><span class="none">X</span></a>\
							</div>\
						</div>\
						<div class="popup" style="z-index: 36000; position: absolute; left: 32px; top: 109px;display:none" attr="twitter_preview_video">\
							<div class="del_con">\
								<span style="cursor:default" attr="twitter_preview_title"></span><a class="ml5 ico idel1" title="删除视频" href="javascript:;"><span class="none">X</span></a>\
							</div>\
						</div>\
                         <div class="bd" id="uc_tuitaInput_inputContainer">\
                                <div class="area_t cl"><span></span></div>\
                                <div class="area_c">\
									<!--@功能用-->\
									<div class="popup" style="display:none;z-index:36000; position: absolute; left: 0; top: 0" attr="twitter_at_popup">\
                                        <div class="Atwho">\
                                            <div class="title">想用@提到谁？</div>\
                                            <ul attr="at_list">\
                                            <li class="cur">浩方电竞平台 </li>\
                                            <li>智慧小猪没尾巴 </li>\
                                            </ul>\
                                        </div>\
                                    </div>\
									<tt attr="uc_at_test" style="visibility:hidden;color:#888;white-space:pre-wrap;font-family:inherit;word-break:break-all;line-height:20px;font-size:14px;word-wrap:break-word;position:absolute;overflow:auto;height:85px;width:510px;padding:0;margin:0;"><span attr="pos">this will be replaced</span></tt>\
									<textarea style="overflow:auto;white-space:pre-wrap;word-wrap:break-word;word-break:break-all" name="uc_tuitaInput_input" id="uc_tuitaInput_input" attr="twitter_textarea"></textarea>\
                               	    <div attr="twitter_loading" style="display:none;" class="loadingW"><i class="loadding"></i></div>\
									<div attr="twitter_send_loading" style="display:none;" class="loadingW"><i class="loadding"></i> </div>\
									<div class="twPopup" attr="twitter_success" style="display:none"><i class="ico idone"></i><span class="none">分享成功</span></div>\
								</div>\
                                <div class="area_b"><span></span></div>\
                                <div class="clear"></div>\
                        </div>\
                        <div class="ft">\
                            <div class="widgets" id="uc_tuitaInput_btnList">\
                            		<a href="javascript:;" onclick="return false;" title="@朋友名字就可以提到他，他在（提到我的）中可以看到你的分享" attr="twitter_at_btn"><i class="ico iAT"></i><em>朋友</em></a>\
                                    <a href="javascript:;" onclick="return false;" id="uc_tuitaInput_imgBtnContainer" title="支持jpg、jpeg、gif、png格式的图片，文件小于4M" attr="twitter_image_btn">\
                                    <i class="ico iImg"></i>\
                                    <em id="uc_tuitaInput_openImgBtn">图片</em>\
                                                <span style="display: none;" id="uc_tuitaInput_imgSubmitTips"></span>\
                                                <i style="display: none;" class="ico iClose" attr="twitter_del_upload_image_btn" id="uc_tuitaInput_deleteImgBtn">\
                                        <i class="none">×</i>                                    </i>\
                                    <span style="display: none;" class="icoImgDis" id="uc_tuitaInput_imgDisableTips">图片</span>                                </a>\
                                    <a href="javascript:;" onclick="return false;" attr="twitter_video_btn" title="粘帖视频播放页地址，酷六，土豆，youku等网站视频可直接播放" id="uc_tuitaInput_videoBtnContainer">\
                                    <i class="ico iVideo"></i>\
                                    <em id="uc_tuitaInput_openVideoBtn">视频</em>\
                                                <span style="display: none;" id="uc_tuitaInput_videoSubmitTips"></span>\
                                                <i attr="twitter_del_upload_video_btn" style="display: none;" class="ico iClose" id="uc_tuitaInput_deleteVideoBtn">\
                                        <i class="none">×</i>                                    </i>\
                                    <span style="display: none;" class="icoVideoDis" id="uc_tuitaInput_videoDisableTips">视频</span>                                </a>\
                                	<a href="javascript:;" onclick="this.blur();return false;" title="随机推荐" attr="twitter_random_btn"><i class="ico iTui"></i><em>乱弹</em></a>\
                                                <a href="javascript:;" onclick="this.blur();return false;" attr="twitter_smile_btn" title="插入表情" id="uc_tuitaInput_openFaceBtn">\
                                    <i class="ico iFace"></i>\
                                    <em>表情</em>                                </a>\
								</div>\
                            <a href="javascript:;" onclick="this.blur();return false;" attr="twitter_publish_btn" class="btn_tuita" id="uc_tuitaInput_postBtn"><span>发布</span></a>                          </div>\
                          <div class="b cl"><span></span></div>\
                   </div>\
                </div>\
				  ';
		this.superclass.build.call(this);
			
		this._params                     = {}; // 上传图片时附带的参数
		this._uploadTimeout              = 20000; // 上传超时时间
		this._working                    = false; // 是否正在上传中
		this._uploadTimer                = 0; // 图片上传定时器
		this._uploadIFrame               = null; // 用于上传的iframe的引用
		this._uploadBtn                  = false; // 上传按钮(如果上传按钮存在，则用它来启动上传，否则绑定到FileInput的onchange事件来触发上传)
		this._uploadIFrameName           = "_twitter_iframe_upload_image_name_" + this._instance_index; // iframe的name属性值
		this._remainCount                = this.getDialog().find("[attr='twitter_remain_count']"); // 剩余字数容器
		this._atBtn                      = this.getDialog().find("[attr='twitter_at_btn']"); // @朋友按钮
		this._imageBtn                   = this.getDialog().find("[attr='twitter_image_btn']"); // 图片按钮
		this._videoBtn                   = this.getDialog().find("[attr='twitter_video_btn']"); // 视频按钮
		this._smileBtn                   = this.getDialog().find("[attr='twitter_smile_btn']"); // 表情按钮
		this._randomBtn                  = this.getDialog().find("[attr='twitter_random_btn']"); // 乱弹按钮
		this._uploadMenu                 = this._getUploadMenu();//this.getDialog().find("[attr='twitter_upload_menu']"); // 上传菜单
		this._atMenu                     = this._getAtMenu();//this.getDialog().find("[attr='twitter_upload_menu']"); // 上传菜单
		this._uploadFileInput            = this._uploadMenu.find("[attr='twitter_upload_file_input']"); // 上传文本域
		this._imageLinkUrl               = 'http://photo.sdo.com/ajax.php?r=UploadImage&app=bbs_tuita&tuita_sdid=%s&fetch_url=%s&data_type=javascript';
		this._getVideoUrl                = '/tuita/getVideoUrl';
		this._imageLinkBtn               = this._uploadMenu.find("[attr='twitter_image_link_btn']"); // 图片链接按钮
		this._atCloseBtn                 = this._atMenu.find("[attr='at_close_btn']"); // 关闭图片链接对话框按钮
		this._imageLinkDialog            = this._getImageLinkDialog();//this.getDialog().find("[attr='twitter_image_link_dialog']"); // 图片链接对话框
		this._imageLinkDialogCloseBtn    = this._imageLinkDialog.find("[attr='twitter_image_link_close_btn']"); // 关闭图片链接对话框按钮
		this._videoLinkDialog            = this._getVideoLinkDialog();//this.getDialog().find("[attr='twitter_video_link_dialog']"); // 视频链接对话框
		this._videoLinkDialogCloseBtn    = this._videoLinkDialog.find("[attr='twitter_video_link_close_btn']"); // 关闭视频链接对话框按钮
		this._textarea                   = this.getDialog().find("[attr='twitter_textarea']"); // 发表twitter的textarea
		this._faceBox                    = $.bf.ui.FaceBox.create(this._textarea); // 表情对话框
		this._loading                    = this.getDialog().find("[attr='twitter_loading']"); // loading机器人对话框
		this._sendLoading                = this.getDialog().find("[attr='twitter_send_loading']"); // loading对话框
		this._publishBtn                 = this.getDialog().find("[attr='twitter_publish_btn']"); // 发布推他按钮
		this._moodBtn                    = this.getDialog().find("[attr='twitter_mood_btn']"); // 切换心情按钮
		this._selectMoodDialog           = this._getSelectMoodDialog();//this.getDialog().find("[attr='twitter_select_mood_dialog']"); // 选择心情对话框
		this._moodContainer              = this._selectMoodDialog.find("[attr='twitter_mood_container']"); // 心情容器
		this._addVideoInput              = this._videoLinkDialog.find("[attr='twitter_add_video_input']"); // 添加视频分享的文本域
		this._addVideoBtn                = this._videoLinkDialog.find("[attr='twitter_add_video_btn']"); // 添加视频分享按钮
		this._videoTips                  = this._videoLinkDialog.find("[attr='twitter_video_tips']"); // 视频分享消息提示容器
		this._addImageInput              = this._imageLinkDialog.find("[attr='twitter_add_image_input']"); // 添加图片分享的文本域
		this._addImageBtn                = this._imageLinkDialog.find("[attr='twitter_add_image_btn']"); // 添加图片分享按钮
		this._imageTips                  = this._imageLinkDialog.find("[attr='twitter_image_tips']"); // 图片分享消息提示容器
		this._uploadedImage              = this.getDialog().find("[attr='twitter_preview_img']"); // 已上传图片容器
		this._uploadedVideo              = this.getDialog().find("[attr='twitter_preview_video']"); // 已上传视频容器
		this._uploadedImageName          = this._uploadedImage.find("[attr='twitter_preview_title']"); // 已上传图片文件名容器
		this._uploadedVideoName          = this._uploadedVideo.find("[attr='twitter_preview_title']"); // 已上传视频文件名容器
		this._delUploadedImageBtn        = this._uploadedImage.find("a"); // 删除已上传图片按钮
		this._delUploadedVideoBtn        = this._uploadedVideo.find("a"); // 删除已上传视频按钮
		this._manageMoodBtn              = this._selectMoodDialog.find("[attr='twitter_manage_mood_btn']"); // 管理心情按钮
		this._successTip                 = this.getDialog().find("[attr='twitter_success']");//成功提示框

		this._uploadImageLoadingDialog   = this._getUploadImageLoadingDialog();//this.getDialog().find("[attr='twitter_upload_loading_dialog']"); // 上传图片loading对话框
		this._previewDialog              = this._getPreviewDialog();//this.getDialog().find("[attr='twitter_preview_dialog']"); // 图片上传预览对话框
		this._videoPreviewDialog         = this._getVideoPreviewDialog();//this.getDialog().find("[attr='twitter_preview_dialog']"); // 图片上传预览对话框
		this._twitterTips                = this._getTwitterTips();//this.getDialog().find("[attr='twitter_upload_tips']"); // twitter错误提示对话框

		this._defaultImageTwitterMessage = "分享图片"; // 默认上传图片的twitter信息
		this._defaultVideoTwitterMessage = "分享视频"; // 默认上传视频的twitter信息

		//this._moodDialogInstance       = $.bf.ui.MoodDialog.create(this); // 管理心情对话框实例
		
		$.bf.ui.Twitter.Manager.instanceCollections["instance" + this._instance_index]   = this; // 保存实例
		this._initEvent();
		this._hideEvent();
		//http://v.youku.com/v_show/id_XMjE2MDE4ODAw.html

		this.uploadFinished = true; // 图片是否上传完成
	},
	
	// Created by gesion<v.wangensheng@snda.com>
	_hideEvent : function () {
		var dialogs = [
			this._atMenu,
			this._uploadMenu,
			this._imageLinkDialog,
			this._videoLinkDialog,
			this._faceBox.getDialog(),
			// this._previewDialog,
			this._twitterTips,
			this._selectMoodDialog
		];
		
		var len = dialogs.length;
		
		var attrs = ['twitter_at_btn','twitter_image_btn', 'twitter_video_btn', 'twitter_smile_btn'];
		
		$(document.body || document.documentElement).click(function (event) {
			for (var i = 0; i < len; i++) {
				var el = dialogs[i];
				if (el.is(':visible')) {
					//滚动后
					var offY = $(document).scrollTop();
					var offX = $(document).scrollLeft();
					var off = 5; // Border Offset
					var pos = el.position();
					var e_x = pos.left - off;
					var e_y = pos.top - off;
					var e_w = el.width() + (off * 2);
					var e_h = el.height() + (off * 2);
					var c_x = event.clientX+offX;
					var c_y = event.clientY+offY;
					var e_t = $(event.target);
					var c_a = 1; // Check Attributes
					for (var j = 0; j < 3; j++) {
						if (e_t.is('a') && $.inArray(e_t.attr('attr'), attrs) != -1) {
							c_a = 0;
							break;
						}
						e_t = e_t.parent();
					}
					c_a && (c_x < e_x || c_x > e_x + e_w || c_y < e_y || c_y > e_y + e_h) && el.toggle(100);
					break;
				}
			}
		});
	},
	
	toggleAllDialog : function()
	{
		var dialogs = [
			this._atMenu,
			this._uploadMenu,
			this._imageLinkDialog,
			this._videoLinkDialog,
			this._faceBox.getDialog(),
			//this._loading,
			this._previewDialog,
			this._videoPreviewDialog,
			//this._twitterTips,
			//this._selectMoodDialog
		];
		$.each(dialogs, function(index, dialog){
			if($(this).is(":visible"))
			{
				$(this).toggle();
			}
		});
	},
	
	getTextarea : function()
	{
		return this._textarea;
	},
	
	/**
	* 初始化Twitter组件
	* 加载好友列表
	*/
	init : function(callback, url){
		$.bf.ajax.request(url || "/friends/getAtFriendList", null, function(result){
			this.setFriend(result);
			this._haveFriend = true;
			callback && callback();
		}.bind(this), function(errno, error){
		}, 'POST');
		//初始化心情
		$.bf.ajax.request(url || "/tuita/getmoodlist", null, function(result){
			/*var dmoods = result.default_moods, cmoods = result.custom_moods;
			this._createMood(dmoods, cmoods);

			if(cmoods && cmoods.length)
			{
				this._moodDialogInstance.initMoods(dmoods.length, cmoods); // 在管理心情对话框中初始化自定义心情
			}
			this._bindSelectMoodEvent(this._moodContainer.find("a"));*/
			this._uploadUrl = result.upload_url;
			callback && callback();
		}.bind(this), function(errno, error){
		}, 'POST');
	},
	// 创建心情UI
	// moods 心情数组
	_createMood : function(dmoods, cmoods)
	{
		var tpl = [];
		$.each(dmoods, function(index, item){
			var cls;
			if(index == 0)
			{
				cls = "defKind";
			}
			else
			{
				cls = "kind" + index;
			}
			tpl[tpl.length] = $.sprintf('<a href="javascript:void(0);" onclick="return false;" mood_color="%s" class="%s">%s</a>', index, cls, item);
		});
		if(cmoods && cmoods.length)
		{
			$.each(cmoods, function(index, dict){
				tpl[tpl.length] = this._getCustomMoodTpl(dict);
			}.bind(this));
		}

		this._moodContainer.html(tpl.join(""));
	},
	
	/**
	* 获取自定义心情模板
	* @param dict 自定义心情数据字典
	*/
	_getCustomMoodTpl : function(dict)
	{
		return $.sprintf('<a href="javascript:void(0);" onclick="return false;" mood_id="%s" mood_color="%s" class="%s">%s</a>', dict.id, dict.mood_color, "kind" + dict.mood_color, dict.mood_desc);
	},
	
	/**
	* 设置当前心情按钮样式
	* @param mood_color 心情颜色代号
	*/
	ISCurrentMoodCls : function(mood_color, mood_desc)
	{
		mood_color = parseInt(mood_color);
		if(!mood_color || isNaN(mood_color))
		{
			mood_color = 0;
		}
		var _this = this;
		this._moodBtn.removeClass().addClass("mindSelect mind" + (mood_color + 1));;
		$.browser.msie&&setTimeout(function(){
			_this._moodBtn.addClass("mindSelect mind" + (mood_color + 1));
		},100);
		if(mood_color == 0)
		{
			this._moodBtn.text("");
		}
		else
		{
			this._moodBtn.text(mood_desc || "");
		}
		this._moodData = {mood_color : mood_color, mood_desc : mood_desc};
	},
	
	/**
	* 增加自定义心情接口
	* @param dict 自定义心情数据字典
	*/
	IAppendMood : function(dict)
	{
		this._moodContainer.append(this._getCustomMoodTpl(dict));
		this._bindSelectMoodEvent(this._moodContainer.find("a:last"));
	},
	/**
	* 删除自定义心情接口
	* @param mood_id 自定义心情ID
	*/
	IDelMood : function(mood_id)
	{
		this._moodContainer.find($.sprintf("[mood_id='%s']", mood_id)).remove();
	},
	/**
	 * 切换twitter框上的弹出框
	 * @param index 当前的索引
	 */
	_changeDialog : function(curIndex)
	{
		var selectorArr = [this._uploadMenu, this._imageLinkDialog, this._videoLinkDialog, this._faceBox.getDialog()/*, this._selectMoodDialog*/,this._atMenu];
		$.each(selectorArr, function(index, item){
			if(index == curIndex) return;
			$(this).fadeOut(100);
		});
	},
	
	/**
	*  以元素来替换
	* @param emem_id 要替换的元素
	*/
	replaceWith : function(elem_selector)
	{
		this.getDialog().replaceAll($(elem_selector));
		return this;
	},
	/**
	* 插入到元素内部
	* @param elem_selector
	*/
	insert : function(elem_selector)
	{
		this.getDialog().appendTo($(elem_selector));
		return this;
	},
	
	_onOpenImageMenu : function(){
		if(this._uploadImageLoadingDialog.css("display")!="none"){
			return;
		}
		if(this._previewDialog.css("display")!="none"){
			return;
		}
		var _this = $.bf.ui.Twitter.Manager.instanceCollections["instance" + this._instance_index];
		_this._changeDialog(0);
		/*if(!document.attachEvent){
			//alert(_this._uploadMenu.find("input[type='file']").length);
			_this._uploadMenu.find("input[type='file']").click();
		}else{*/
			_this._initPosition(_this._imageBtn, _this._uploadMenu).toggle();
		//}
	},
	
	_onOpenVideoDialog : function()
	{
		var _this = $.bf.ui.Twitter.Manager.instanceCollections["instance" + this._instance_index];
		if(_this._videoPreviewDialog.css("display")!="none"){
			return;
		}
		if(_this._uploadImageLoadingDialog.css("display")!="none"){
			return;
		}
		_this._changeDialog(2);
		_this._videoTips.html("").hide();
		var video_url = "http://";
		if(_this._videoData && _this._videoData.url)
		{
			video_url = _this._videoData.url;
		}
		_this._initPosition(_this._videoBtn, _this._videoLinkDialog).toggle();
		_this._addVideoInput.val(video_url);
		_this._addVideoInput.focus();
	},
	
	/**
	* 获取上传菜单
	*/
	_getUploadMenu : function()
	{
		if(!this._uploadMenu)
		{
			this._uploadMenu = $($.sprintf('\
			<div attr="twitter_upload_menu_%s" style="z-index:36000;position:absolute;left: 50%; top: 20px; display:none;" class="popup popUpload">\
				<div class="shadow"></div>\
				<span class="popArrow"></span>\
				<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
					<div class="popupBoxL">\
						<div class="popupBoxR">\
							<div class="popupBox"> \
								<div class="popUploadBox">\
									<!--<p class="cur">-->\
									<a style="cursor:pointer" attr="twitter_upload_btn"><span class="iconUpload mgr5"></span>本地上传<form method="post" action="" enctype="multipart/form-data">\
										<input type="hidden" name="MAX_FILE_SIZE" value="4194304" />\
										<input type="file" name="tuita_image" class="inputFile" autocomplete="off" attr="twitter_upload_file_input" /></form>\
									</a>\
									<!--</p>\
									<p>\
									<a href="javascript:;" onclick="return false" attr="twitter_image_link_btn"><span class="iconBrowse mgr5"></span>图片链接</a>\
									</p>-->\
								</div>\
							</div>\
						</div>\
					</div>\
					<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
				</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return this._uploadMenu;
	},
	
	
	
	/**
	* 获取上传菜单
	*/
	_getAtMenu : function()
	{
		if(!this._atMenu)
		{
			/*this._atMenu = $($.sprintf('\
			<div attr="twitter_upload_menu_%s" style="z-index:36000;position:absolute;left: 50%; top: 20px; display:none;" class="popup popUpload">\
				<div class="shadow"></div>\
				<span class="popArrow"></span>\
				<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
					<div class="popupBoxL">\
						<div class="popupBoxR">\
							<div class="popupBox"> \
								<div class="popUploadBox">\
									<p class="cur">\
									<a style="cursor:pointer" attr="twitter_upload_btn"><span class="iconUpload mgr5"></span>本地上传<form method="post" action="" enctype="multipart/form-data">\
										<input type="hidden" name="MAX_FILE_SIZE" value="4194304" />\
										<input type="file" name="tuita_image" class="inputFile" autocomplete="off" attr="twitter_upload_file_input" /></form>\
									</a>\
									</p>\
									<p>\
									<a href="javascript:;" onclick="return false" attr="twitter_image_link_btn"><span class="iconBrowse mgr5"></span>图片链接</a>\
									</p>\
								</div>\
							</div>\
						</div>\
					</div>\
					<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
				</div>\
			', this._instance_index)).appendTo(document.body);*/
			this._atMenu = $($.sprintf('\
			<div attr="twitter_at_menu_%s" style="z-index: 36001; width: 260px; top:0; display:none; left: 0;" class="popup">\
				<div class="shadow"></div>\
				<span class="popArrow"></span>\
				<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
				<div class="popupBoxL"><div class="popupBoxR">\
				<div class="popupBox AtMain">\
					<div class="popGreenClose"><a class="r iconClose" href="javascript:;" onclick="this.blur();" title="关闭" attr="at_close_btn"></a></div>\
					<div class="popupMain">\
						<div class="AtCon">\
							<div class="AtSearch">\
								<div class="iptSelect">\
									<span class="ipt"><span><input attr="at_friend_input" maxlength="20" type="text" value=""></span>\
									<span class="atbtn" attr="at_search"><i class="ico iSearch"></i></span><a title="清空" attr="at_input_clear" class="ico idel" style="display:none" href="javascript:;" onclick="this.blur();return false"></a></span>\
								</div>\
							</div>\
							<div class="AtList">\
								<ul attr="at_friend_list">\
								<li class="cur">加载中</li>\
								</ul>\
							</div>\
							<div class="Atnote">\
								<span class="t999">@朋友账号，他就能在【提到我的】页收到</span>\
							</div>\
						</div>\
					 </div>\
				   </div>\
				</div></div>\
				<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
			</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return this._atMenu;
	},
	
	/**
	* 获取图片预览对话框
	*/
	_getPreviewDialog : function()
	{
		if(!this._previewDialog)
		{
			this._previewDialog = $($.sprintf('\
			<div attr="twitter_preview_dialog_%s" style="z-index:36000;position:absolute;left: 50%; top: 20px; display: none;" class="popup popUpload">\
				<div class="shadow"></div>\
				<span class="popArrow"></span>\
				<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
					<div class="popupBoxL">\
						<div class="popupBoxR">\
							<div class="popupBox"> \
								<div class="popUploadBox">\
									<p>\
										<a attr="twitter_image_preview"></a>\
									</p>\
								</div>\
							</div>\
						</div>\
					</div>\
				<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
			</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return  this._previewDialog;
	},
	
	
	/**
	* 获取视频预览对话框
	*/
	_getVideoPreviewDialog : function()
	{
		if(!this._videoPreviewDialog)
		{
			this._videoPreviewDialog = $($.sprintf('\
			<div attr="twitter_video_preview_dialog_%s" style="z-index:36000;position:absolute;left: 50%; top: 20px; display: none;" class="popup popUpload">\
				<div class="shadow"></div>\
				<span class="popArrow"></span>\
				<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
					<div class="popupBoxL">\
						<div class="popupBoxR">\
							<div class="popupBox"> \
								<div class="popUploadBox">\
									<p>\
										<a attr="twitter_video_preview"></a>\
									</p>\
								</div>\
							</div>\
						</div>\
					</div>\
				<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
			</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return  this._videoPreviewDialog;
	},
	
	/**
	* 获取图片链接对话框
	*/
	_getImageLinkDialog : function()
	{
		if(!this._imageLinkDialog)
		{
			/*this._imageLinkDialog = $($.sprintf('\
				<div attr="twitter_image_link_dialog_%s" style="z-index:36000;position:absolute;width: 400px; top: 65%; right: 10px; display: none;" class="popup">\
					<div class="shadow"></div>\
					<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
					<div class="popupBoxL">\
						<div class="popupBoxR">\
							<div class="popupBox">\
							<div class="popGreenClose"><a href="javascript:;" attr="twitter_image_link_close_btn" class="r iconClose"></a></div>\
								<div class="popupMain">\
									<p>链接只支持以.jpg .png .gif .bmp结尾的图片链接</p>\
									<p class="urlWid"><input attr="twitter_add_image_input" type="text error" class="text" value="http://"></p>\
									<p class="pd10">\
										<a href="javascript:;" attr="twitter_add_image_btn" onclick="return false" class="btn btn6 mr5"><span>提交</span></a>\
										<span class="tRed none" attr="twitter_image_tips">链接只支持以.jpg .png .gif .bmp结尾的图片链接</span>\
									</p>\
								</div>\
							</div>\
						</div>\
					</div>\
					<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
				</div>\
			', this._instance_index)).appendTo(document.body);*/
			this._imageLinkDialog = $($.sprintf('\
				<div attr="twitter_image_link_dialog_%s" class="popup" style="z-index: 36000; position: absolute; width: 400px; top: 100px; left: 10px; display: none;" attr="twitter_image_link_dialog_1">\
					<div class="shadow"></div>\
					<span class="popArrow"></span>\
					<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
						<div class="popupBoxL">\
						<div class="popupBoxR">\
						<div class="popupBox">\
								<div class="popGreenClose"><a class="r iconClose" attr="twitter_image_link_close_btn" href="javascript:;"></a></div>\
								<div class="popupMain">\
									<p>链接只支持以.jpg .png .gif .bmp结尾的图片链接</p>\
									<p class="urlWid"><input type="text error" value="http://" class="text" attr="twitter_add_image_input"></p>\
									<p class="pd10">\
										<a class="btn btn6 mr5" href="javascript:;" attr="twitter_add_image_btn" onclick="return false"><span>提交</span></a>\
										<span attr="twitter_image_tips" class="tRed none" style="display: none;"></span>\
									 </p>\
								</div>\
						 </div>\
						 </div>\
					</div>\
					 <div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
				</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return this._imageLinkDialog;
	},
	
	_getVideoLinkDialog : function()
	{
		if(!this._videoLinkDialog)
		{
			this._videoLinkDialog = $($.sprintf('\
				<div class="popup" attr="twitter_video_link_dialog_%s" style="z-index:36000;position:absolute;width: 400px; top: 90%; right: 10px; display: none;">\
					<div class="shadow"></div>\
					<span class="popArrow"></span>\
					<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
					<div class="popupBoxL">\
						<div class="popupBoxR">\
							<div class="popupBox">\
							<div class="popGreenClose"><a href="javascript:;" attr="twitter_video_link_close_btn" class="r iconClose"></a></div>\
								<div class="popupMain">\
									<p>请输入酷六，土豆，youku,等视频网站的视频地址URL</p>\
									<p class="urlWid"><input attr="twitter_add_video_input" type="text" class="text" value="http://"></p>\
									<p class="pd10">\
										<a href="javascript:;" onclick="return false;" attr="twitter_add_video_btn" class="btn btn6 mr5" title="提交"><span>提交</span></a>\
										<span class="tRed none" attr="twitter_video_tips">无法识别的链接地址</span>\
									</p>\
								</div>\
							</div>\
						</div>\
					</div>\
					<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
				</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return this._videoLinkDialog;
	},
	
	/**
	* 获取选择心情对话框
	*/
	_getSelectMoodDialog : function()
	{
		if(!this._selectMoodDialog)
		{
			this._selectMoodDialog = $($.sprintf('\
				<div attr="twitter_select_mood_dialog_%s" class="popup mindPop" style="z-index:36000;position:absolute;display: none;top: 65%; left: 1%;">\
					<div class="shadow"></div>\
					<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
						<div class="popupBoxL">\
							<div class="popupBoxR">\
								<div class="popupBox"> \
									<div class="mindKind">\
										<span  attr="twitter_mood_container"></span>\
										<a href="javascript:;" class="kindMng" attr="twitter_manage_mood_btn">管理心情 &gt;&gt;</a>\
										<div class="clear"></div>\
									</div>\
								</div>\
							</div>\
						</div>\
					<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
				</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return this._selectMoodDialog;
	},
	
	/**
	* 获取twitter提示对话框
	*/
	_getTwitterTips : function()
	{
		if(!this._twitterTips)
		{
			this._twitterTips = $($.sprintf('\
			<div attr="twitter_upload_tips_%s" style="z-index:36000;position:absolute;width: 207px; display: none;" id="upload_img_fail" class="popup popUpload">\
				<span class="popArrow"></span>\
				<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
				<div class="popupBoxL">\
					<div class="popupBoxR">\
						<div class="popupBox">\
						<div class="popGreenClose"><a class="r iconCloseGreen" href="javascript:void(0);"></a></div>\
							<div style="padding: 0pt 10px;" class="popupMain">\
								<b class="font14 txt8" attr="msg">上传失败，请重新上传</b><br>\
								<span id="fail_reason">请上传小于4M的JPG,PNG,GIF</span>\
							</div>\
						</div>\
					</div>\
				</div>\
				<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
			</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return this._twitterTips;
	},
	
	/**
	* 获取上传图片时的loading对话框
	*/
	_getUploadImageLoadingDialog : function()
	{
		if(!this._uploadImageLoadingDialog)
		{
			this._uploadImageLoadingDialog = $($.sprintf('\
				<div attr="twitter_upload_loading_dialog_%s" style="z-index:36000;position:absolute;left: 50%; top: 20px; display: none;" class="popup popUpload">\
					<div class="shadow"></div>\
					<span class="popArrow"></span>\
					<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
						<div class="popupBoxL">\
							<div class="popupBoxR">\
								<div class="popupBox"> \
									<div class="popUploadBox">\
										<p class="center"><i class="loadding"></i></p>\
									</div>\
								</div>\
							</div>\
						</div>\
					<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
				</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return this._uploadImageLoadingDialog;
	},

	_initEvent : function()
	{
		var _this = this;
		this._atMenu.find("[attr='at_friend_list']").parent().scroll(function(){
			var offset = 220+5;
			if($(this).scrollTop()+offset>$(this).find("[attr='at_friend_list']").height()){
				//alert("bottom");
				var t = $.bf.ui.Twitter.Manager.instanceCollections["instance1"];
				var data = t.getFriend();
				var keyword = $("[attr='at_friend_input']").val()||"";
				if($("[attr='at_friend_input']").val()!=t._at_search_value){
					t._at_data_change = true;
					t._at_search_value = $("[attr='at_friend_input']").val();
				}
				t.renderAtList(keyword,data,$(this).find("li").length,100,true);
			}
		});
		$(document.body).click(function(event){
			if(event.target!=$("[attr='twitter_at_popup']").get(0)&&(event.target!=$.bf.ui.Twitter.Manager.instanceCollections["instance1"]._textarea.get(0))){
				$("[attr='twitter_at_popup']").hide();
				$.bf.ui.Twitter.Manager.instanceCollections["instance1"]._input_focus=false;
			}else{
				return false;
			}
		});
		this._addVideoInput.keydown(function(event){
			if(event.keyCode==13||event.keyCode==10){
				this._addVideoBtn.click();
				return false;
			}
		}.bind(this));
		this._addImageInput.keydown(function(event){
			if(event.keyCode==13||event.keyCode==10){
				this._addImageBtn.click();
				return false;
			}
		}.bind(this));
		//@朋友框
		$("[attr='at_friend_input']").keydown(function(event){
			//esc
			if(event.keyCode==27){$(this).val('');$(this).parents(".popup").hide();return false;}
		});
		this._textarea.focus(function(){this._input_focus=true;}.bind(this));
		this._textarea.click(function(){this._input_focus=true;}.bind(this));
		this._textarea.keydown(function(event){if(event.keyCode==27){/*esc*/this._input_focus=false;$("[attr='twitter_at_popup']").hide();return false}else{this._input_focus=true;}}.bind(this));
		this._textarea.keydown(function(event){
			var atShow = $("[attr='twitter_at_popup']").css("display")!="none";
			var list = $("[attr='twitter_at_popup']");
			if(event.keyCode==38){//上
				if(atShow){
					var index = list.find("li.cur").index();
					var count = list.find("li").length;
					list.find("li.cur").removeClass("cur");
					list.find("li").eq(index==0?count-1:--index).addClass("cur");
					return false;
				}
				//alert(event.keyCode);
			}else if(event.keyCode==40){//下
				if(atShow){
					var index = list.find("li.cur").index();
					var count = list.find("li").length;
					list.find("li.cur").removeClass("cur");
					list.find("li").eq(index<count-1?++index:0).addClass("cur");
					return false;
				}
				//
			}
		}.bind(this)).keypress(function(event){
			var atShow = $("[attr='twitter_at_popup']").css("display")!="none";
			var list = $("[attr='twitter_at_popup']");
			if(event.keyCode==13||event.keyCode==10){//回车
				if(atShow){
					list.find("li.cur").mouseup();
					return false;
				}
			}
		});
		this._textarea.blur(function(){if($("[attr='twitter_at_popup']").css("display")=="none"){this._input_focus=false;}}.bind(this));
		// 打开图片上传或链接菜单
		this._imageBtn.bind("click", this._onOpenImageMenu.bind(this));

		// 打开图片链接对话框
		this._imageLinkBtn.click(function(event){
			this._changeDialog(1);
			this._imageTips.html("").hide();
			this._addImageInput.val("http://");
			this._initPosition(this._imageBtn, this._imageLinkDialog).toggle();
			this._addImageInput.focus();
		}.bind(this));
		
		// 关闭打开的图片链接对话框
		this._imageLinkDialogCloseBtn.click(function(event){
			this._imageLinkDialog.hide();
		}.bind(this));
		
		//关闭@朋友
		this._atCloseBtn.click(function(event){
			this._atMenu.hide();
		}.bind(this));
		
		// 打开视频链接对话框
		this._videoBtn.bind("click", this._onOpenVideoDialog.bind(this));

		// 关闭打开的视频链接对话框
		//alert(this._videoLinkDialogCloseBtn.attr("attr"));
		this._videoLinkDialogCloseBtn.click(function(event){
			this._videoLinkDialog.hide();
		}.bind(this));

		//@朋友按钮
		this._atBtn.click(function(event){
			this._changeDialog(4);
			this._initPosition(this._atBtn, this._atMenu).toggle();
			if(this._atMenu.is(":visible")){
				//alert("show!");
			}
			try{
				$("[attr='at_friend_input']").focus().val("");
				this._atMenu.find(".AtList").scrollTop(0);
			}catch(e){}
		}.bind(this));
		
		// 打开表情选择对话框
		this._smileBtn.click(function(event){
			this._changeDialog(3);
			this._initPosition(this._smileBtn, this._faceBox.getDialog()).toggle();
		}.bind(this));

		// 乱弹按钮
		this._randomBtn.click(function(event){
			this._changeDialog();
			this._textarea.val("");
			this.setRemainLen(this._defaultWordsCount);
			this._loading.show();
			self.setTimeout(function(){
				$.bf.ajax.request("/tuita/gettwitterrandom", null, function(result){
					this._textarea.val(result);
					this._textarea.focus().get(0).value+="";
					this.setRemainLen(this._defaultWordsCount - result.length);
					this._loading.hide();
				}.bind(this), function(errno, error){
					this._loading.hide();
				}.bind(this), 'POST');}.bind(this), 1000);
		}.bind(this));
		
		// 自适应textarea高度
		this._textarea.autoHeight(this.onInput.bind(this, this._textarea), this._minHeight, this._defaultWordsCount,(this.type!="twitterG")&&(this.type!="twitterM")?null:this._minHeight);
		// end
		
		$(document).ready(function(){
			//监听@
			this._handleAt();
		}.bind(this));
		
		if(window.addEventListener&&!window.opera){
			if($("#toolbar_t2 .popupScroll").length>0){
				$("#toolbar_t2 .popupScroll").get(0).addEventListener('DOMMouseScroll',function(e){
					var scrollDiv = $("#toolbar_t2 .popupScroll").get(0);
					if(!scrollDiv){return;}
					if(scrollDiv.scrollTop==0){
						if(e.detail>0){
							return;
						}
					}else if(scrollDiv.scrollTop+scrollDiv.clientHeight<scrollDiv.scrollHeight){
						return;
					}else{
						if(e.detail<0){
							return;
						}
					}
					e.stopPropagation();
					e.preventDefault();
				},false);
			}
		}else{
			if($("#toolbar_t2 .popupScroll").length>0){
				$("#toolbar_t2 .popupScroll").get(0).onmousewheel=function(){
					var e=event;
					var scrollDiv = $("#toolbar_t2 .popupScroll").get(0),offset = -e.wheelDelta/2;
					if(!scrollDiv){return;}
					if(scrollDiv.scrollTop==0){
						if(offset>0){return;}
					}else if(scrollDiv.scrollTop+scrollDiv.clientHeight<scrollDiv.scrollHeight){
						if(scrollDiv.scrollTop+offset<=0){
							scrollDiv.scrollTop = 0;
						}else if(scrollDiv.scrollTop+scrollDiv.clientHeight+offset>=scrollDiv.scrollHeight){
							scrollDiv.scrollTop = scrollDiv.scrollHeight - scrollDiv.clientHeight;
						}else{return;}
					}else{
						if(offset<0){return;}
					}
					e.cancelBubble=true;
					return false;
				}
			}
		}
		
		//快捷键发表推他
		this._textarea.keypress(function(event){
			//event.preventDefault();
			//event.stopPropagation();
			if(event.ctrlKey&&(event.keyCode==13||event.keyCode==10)){
				this._publishBtn.click();
			}
		}.bind(this));
		// 发布推他
		this._publishBtn.click(function(event){
			event.preventDefault();
			event.stopPropagation();
			
			this.onPublish && this.onPublish.call(this, {
				imageData   : this._imageData,
				videoData   : this._videoData,
				moodData    : this._moodData,
				message     : this._textarea.val()
			});
		}.bind(this));

		// 打开选择心情对话框
		this._moodBtn.click(function(event){
			event.preventDefault();
			event.stopPropagation();
			
			this._changeDialog(4);
			this._initPosition(this._moodBtn, this._selectMoodDialog, {top : 0}).toggle();
			return false;
		}.bind(this));

		// 管理心情
		this._manageMoodBtn.click(function(event){
			event.preventDefault();
			event.stopPropagation();

			//alert("管理心情");
			this._selectMoodDialog.hide();
			this._moodDialogInstance.show();
			return false;
		}.bind(this));
		
		// 视频分享文本域
		this._addVideoInput.focus(function(event){
			event.preventDefault();
			event.stopPropagation();

			this.select();
		});

		// 添加视频分享
		this._addVideoBtn.click(function(event){
			event.preventDefault();
			event.stopPropagation();
			
			var video_url = $.trim(this._addVideoInput.val());
			if(!this._checkVideoUrl(video_url))
			{
				this._videoTips.html("无法识别的链接地址").show();
				return false;
			}

			this._uploadImageLoadingDialog.hide();
			this._initPosition(this._videoBtn, this._uploadImageLoadingDialog).toggle();

			var ajax_url = this._getVideoUrl;
			$.ajax({
				type: "POST",
				url: ajax_url,
				dataType: "json",
				data:{url:video_url},
				timeout:10000,
				success:function(data){
					this._uploadImageLoadingDialog.hide();
					if(data["errno"] != 0){
						$.bf.module.Tooltip.show(data["msg"], $.bf.ui.Tooltip.icons.ERROR);
						return;
					}
					this._videoData = {url : video_url};
					this._setActiveVideo(this._videoData);
					this._showVideoPreview({thumbnail:data["data"]["preview_url"],title:data["data"]["title"]});
				}.bind(this),
				error:function(){
					this._uploadImageLoadingDialog.hide();
					$.bf.module.TxtTips.show(this._videoBtn.find("em"),"出错啦,请重试一次");
				}.bind(this)
			});
			
			
			/*$.post(ajax_url,{url:video_url},function(data){
				this._uploadImageLoadingDialog.toggle();
				if(data["errno"] != 0){
					$.bf.module.Tooltip.show(data["msg"], $.bf.ui.Tooltip.icons.ERROR);
					return;
				}
				this._videoData = {url : video_url};
				this._setActiveVideo(this._videoData);
				this._showVideoPreview({thumbnail:data["data"]["preview_url"],title:data["data"]["title"]})
			}.bind(this),"json");*/
			
			//this._showVideoPreview({thumbnail:"http://i0.ku6img.com/encode/picpath/2011/4/3/2/1304881145592_692331_692331/5.jpg"});
			
			this._videoLinkDialog.hide();
		}.bind(this));

		// 删除已上传的视频
		this._delUploadedVideoBtn.click(function(event){
			event.preventDefault();
			event.stopPropagation();

			this._setActiveImage();
			this._uploadedImageName.css("color", "");
			this._imageBtn.bind("click", this._onOpenImageMenu.bind(this)).find("em").css("color","").attr("title","");
			this._videoBtn.bind("click", this._onOpenVideoDialog.bind(this)).find("em").css("color","").attr("title","");
			this._videoData = null; // 清空已上传的视频缓存
		}.bind(this));

		// 删除已上传的图片
		this._delUploadedImageBtn.click(function(event){
			event.preventDefault();
			event.stopPropagation();
			
			this._imageData = null; // 清空图片缓存
			this._setActiveVideo();
			this._uploadedVideoName.css("color", "");
			this._imageBtn.bind("click", this._onOpenImageMenu.bind(this)).find("em").css("color","").attr("title","");
			this._videoBtn.bind("click", this._onOpenVideoDialog.bind(this)).find("em").css("color","").attr("title","");
		}.bind(this));

		// 图片分享文本域
		this._addImageInput.focus(function(event){
			event.preventDefault();
			event.stopPropagation();

			this.select();
		});

		// 添加图片分享
		this._addImageBtn.click(function(event){
			event.preventDefault();
			event.stopPropagation();

			var image_url = $.trim(this._addImageInput.val()).split("?")[0];
			if(!this._checkImgUrl(image_url)){
				alert("upload failed");
				this._imageTips.html("只支持以.jpg .png .gif .bmp结尾的图片链接").show();
				return false;
			}
			alert("upload");
			this._initPosition(this._imageBtn, this._uploadImageLoadingDialog).toggle();

			var ajax_url = $.sprintf(this._imageLinkUrl, encodeURIComponent($('input#_tuita_sdid').val()), encodeURIComponent(image_url));
			$.getScript(ajax_url, function () {
				this._uploadImageLoadingDialog.toggle();
				if (typeof __javascript_data == 'undefined') {
					alert('图片上传失败');
					return ;
				}
				if (__javascript_data['status'] == false) {
					alert(__javascript_data['msg']);
					return ;
				}
				this._imageData = __javascript_data['data'];
				this._imageData['error'] = __javascript_data['code'];
				this._setActiveImage(this._imageData);
				this._showImagePreview(this._imageData);
			}.bind(this));
			this._imageLinkDialog.hide();
		}.bind(this));


		// 允许弹出的对话框跟随滚动条以及窗口缩放时自适应位置
		if(this.options.allowFollow)
		{
			this.bindResize(function(){
				this.setPosition();
			}.bind(this));

			if(this.options.container)
			{
				$(this.options.container).scroll(function(){
					this.setPosition();
				}.bind(this));
			}
		}

		$("[attr='twitter_at_popup'],[attr='twitter_at_popup'] div").click(function(){
			//this._textarea.focus();
			//this._input_focus=false;
			//return false;
		}.bind(this));
		
		$("[attr='at_input_clear']").click(function(){
			$("[attr='at_friend_input']").val("").focus();
		});
		
		
		this._uploadedImage.hover(function(){
				this._previewDialog.fadeIn();
			}.bind(this),function(){
				this._previewDialog.fadeOut();
			}.bind(this));
		this._uploadedVideo.hover(function(){
				this._videoPreviewDialog.fadeIn();
			}.bind(this),function(){
				this._videoPreviewDialog.fadeOut();
			}.bind(this));

	},
	/**
	 * @朋友列表数据存取
	 */
	getFriend:function(){
		return this._atData||[];
	},
	setFriend:function(data){
		this._at_data_change = true;
		var _data = [];
		/*for(var i=0,len=data.length;i++){
			_data[i] = 
		}*/
		$.bf.utils.pinyin.chineseToPY(data,function(rs){
    		this._atDataPY = rs;
		}.bind(this));
		this._atData = data;
	},
	appendFriend:function(key,val){
		this._at_data_change = true;
		this._atData = this._atData||[];
		this._atData[key] = val;
	},
	_at_data_change:true,
	_haveFriend:false,
	searchFriend:function(key,data,start,count){
		var out = "";
		key = key||"";
		key = key.toString().toLowerCase();
		data = data||this.getFriend();
		var data_py = this._atDataPY||[];
		start = start||0;
		count = count||5;
		for(var i=start,j=0,len=data.length;i<len;i++){
			j++;
			if(data[i]&&data[i].toString().toLowerCase().indexOf(key)!=-1){
				out += ["<li>",data[i].toString().replace(new RegExp(key,"i"),function(a,b){return "<b>"+a+"</b>"}),"</li>"].join("");
			}else if(data_py[i]&&data_py[i].toString().toLowerCase().indexOf(key)!=-1){
				out += ["<li>",data[i],"</li>"].join("");
			}else{
				j--;
			}
			if(j>=count){
				break;
			}
		}
		if(out==""){
			return "<li attr='noselect' style='cursor:default'>"+(this._haveFriend?"搜索结果为空":"加载中")+"</li>";
		}
		return out;
	},
	renderAtList:function(keyword,data,start,count,append){
		var list = this.searchFriend(keyword,data,start,count);
		var lists = this._atMenu.find("[attr='at_friend_list']");
		if(append){
			lists = list.indexOf("noselect")!=-1?lists:lists.append(list);
		}else{
			lists = lists.html(list);
		}
		lists.find("li[attr!='noselect']").first().addClass("cur").end().unbind().hover(
			function(){$(this).parent().find("li.cur").removeClass("cur");$(this).addClass("cur")},
			function(){if($(this).parent().find("li.cur").length==1){return}}
		).mouseup(
				function(event){
					var t = $.bf.ui.Twitter.Manager.instanceCollections["instance1"];
					t._textarea.focus().get(0).value += "@"+$(this).parent().find("li.cur").text()+" ";
					t._atMenu.hide();
				}
			);
		this._at_data_change = false;
	},
	/**
	 * 监听文本框@功能
	 */
	_handleAt:function(){
		var $this = this;
		clearInterval(this.__at_handler);
		//用interval来避免客户端发布框闪烁
		__at_handler = setInterval(function(){
			if($this._atMenu.find("[attr='at_friend_list']").is(":visible")){
				if($this._atMenu.find("[attr='at_friend_input']").val().length==0){
					$this._atMenu.find("[attr='at_search']").show();
					$this._atMenu.find("[attr='at_input_clear']").hide();
				}else{
					$this._atMenu.find("[attr='at_search']").hide();
					$this._atMenu.find("[attr='at_input_clear']").show();
				}
				var data = $this.getFriend();
				var keyword = $this._atMenu.find("[attr='at_friend_input']").val()||"";
				if($this._atMenu.find("[attr='at_friend_input']").val()!=$this._at_search_value){
					$this._at_data_change = true;
					$this._at_search_value = $this._atMenu.find("[attr='at_friend_input']").val();
				}
				if($this._at_data_change){
					//var list = $this.searchFriend(keyword,data,0,100);
					$this.renderAtList(keyword,data,0,100);
					/*$("[attr='at_friend_list']").html(list)
					.find("li[attr!='noselect']").first().addClass("cur").end().hover(
						function(){$(this).parent().find("li.cur").removeClass("cur");$(this).addClass("cur")},
						function(){if($(this).parent().find("li.cur").length==1){return}}
					).mouseup(
							function(event){
								var t = $.bf.ui.Twitter.Manager.instanceCollections["instance1"];
								t._textarea.focus().get(0).value += "@"+$(this).parent().find("li.cur").text()+" ";
								t._atMenu.hide();
							}
						);
					$this._at_data_change = false;*/
					//滚动顶部
					$this._atMenu.find("[attr='at_friend_list']").parent().scrollTop(0);
				}
			}
			if(!$this._input_focus){
				return;
			}
			//显示剩余字数
			var len = $this._textarea.val().length;
			var val = $this._defaultWordsCount - len;
			if ($this._remainCount.text() != val) {
				$this._remainCount.text(val);
			}
			//剩余字数end
			
			//获取文本框光标位置
			var pos = $this._txtgetPos($this._textarea.get(0),$this._input_focus?true:false);
			var at = pos;
			var prevTxt = $this._textarea.val().substr(0,pos-$this._textarea.get(0).value.substr(0,pos).split("\r").length+1);
			pos = prevTxt.lastIndexOf("@");
			//光标前文本
			prevTxt = prevTxt.substr(pos==-1?prevTxt.length:pos);
			
			//匹配@内容
			if(/@([^@\s\n\r]{1,20})$/.test(prevTxt)){
				prevTxt = RegExp.$1;
			}else{
				prevTxt = "";
			}
			if((prevTxt==""&&pos<1)||($this._textarea.val()=="")||($this._textarea.val().indexOf("@")=="-1")){
				$("[attr='twitter_at_popup']").hide();
			}
			if(prevTxt==""&&at>0){
				$("[attr='twitter_at_popup']").hide();
			}
			$this.__atWho = prevTxt;
			var testTxt = pos==-1?$this._textarea.val():$this._textarea.val().substr(0,pos);
			//格式化文本
			var endTxt = pos!=-1?$this._textarea.val().substr(pos+1):"";
			var tagName = document.attachEvent?"pre":"span";
			var space = '<'+tagName+' style="display:inline;white-space:pre-wrap;font-size:inherit;font-family:inherit;"> </'+tagName+'>';
			endTxt = endTxt.replace(/\n/g,"<br/>").replace(/\r/g,"<br/>").replace(/([ ]+) /g,function(a,b){
				return space+b.replace(/[ ]/g,space);
			});
			endTxt = $("<p>").text(endTxt).html();
			testTxt = $("<p>").text(testTxt.replace(/\n/g,"<br/>").replace(/\r/g,"<br/>").replace(/([ ]+) /g,function(a,b){
				return space+b.replace(/[ ]/g,space);
			})).html()+"<span attr='uc_at_pos' style='background-color:#000;color:#fff'>@</span>"+endTxt;
			if($this._old_text!=testTxt+prevTxt){
				$this._input_focus=true;
				$("[attr='uc_at_test']").html(testTxt);
			}
			$("[attr='uc_at_test']").scrollTop($this._textarea.scrollTop()+5);
			if(prevTxt.length>0&&$this._input_focus){
				var list = $("[attr='twitter_at_popup']");
				if($this._old_text!=testTxt+prevTxt){
					var html = $this.searchFriend(prevTxt,data,0,5);
					if(html.indexOf("noselect")!=-1){//空
						html = "<li class='cur'>"+prevTxt+"</li>";
					}
					//220
					//AtList
					
					list.click(function(){
						$.bf.ui.Twitter.Manager.instanceCollections["instance1"]._textarea.focus();
						return false;
					}).find("[attr='at_list']").html(html).find("li").first().addClass("cur").end().unbind().hover(function(){$(this).parent().find("li.cur").removeClass("cur");$(this).addClass("cur")},function(){if($(this).parent().find("li.cur").length==1){return};$(this).removeClass("cur")}).mouseup(
						function(event){
							var t = $.bf.ui.Twitter.Manager.instanceCollections["instance1"];
							var pos = t._txtgetPos(t._textarea.get(0));
							var text = t._textarea.get(0).value.split("");
							var atPos = t._textarea.get(0).value.substr(0,pos).lastIndexOf("@")+1;
							var txt = $(this).parent().find("li.cur").text();
							var count = t._defaultWordsCount - atPos + 1;
							if(count<=$(this).parent().find("li.cur").text()){
								txt = txt.substr(0,count-txt.length);
								t._input_focus = false;
							}
							text.splice(atPos,pos-atPos,txt+" ");
							t._textarea.val(text.join(""));
							t._old_text = text.join("");
							//alert(pos+" "+atPos+" "+(atPos+txt.length-t._textarea.get(0).value.split("\r").length+2));
							t._setPos(t._textarea.get(0),Math.min(atPos+txt.length-t._textarea.get(0).value.substr(0,pos).split("\r").length+2+(window.opera?t._textarea.get(0).value.split("\r").length-1:0),t._textarea.get(0).value.length));
							$("[attr='twitter_at_popup']").hide();
						}
					);
				}
				if(list.css("display")=="none"||($this._old_text!=testTxt+prevTxt)){
					if(list.css("display")=="none"){
						list.fadeIn(200);
					}
					var at_pos = $("[attr='uc_at_pos']").offset();
					list.offset(at_pos).offset({top:at_pos.top+$this.options.atOffset.top,left:at_pos.left+$this.options.atOffset.left});// = .x
				}
			}else{
				if(!$this._input_focus){
					$("[attr='twitter_at_popup']").hide();
				}else if(prevTxt.length==0){
					if(pos==-1){
						//$("[attr='twitter_at_popup']").hide();
					}
					//alert(pos+" "+prevTxt);
					//$("[attr='twitter_at_popup']").hide();
				}
			}
			$this._old_text = testTxt+prevTxt;
			//调试用
			//document.title = prevTxt;
		}, 500);
	},
	/**
	 * 获取textarea选区以及文字
	 */
	_txtgetPos:function(o,noFocus){
		var CaretPos = 0;
		if(document.selection){
			if(!noFocus){
				o.focus();
			}
			var Sel = document.selection.createRange();
			Sel.moveStart('character', -o.innerText.length);
			var text = Sel.text;                
			for (var i = 0; i < o.innerText.length; i++){
				if(o.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)){
					CaretPos = i + 1;                          
				}
			}
		}else if(o.selectionStart || o.selectionStart == '0'){
			CaretPos = o.selectionStart;
		}
		return CaretPos;
	},
	_setPos:function(element,location){
		if(element.setSelectionRange){
			element.focus();
			element.setSelectionRange(location,location);
		}else if(document.body.createTextRange){
			var range = document.body.createTextRange();
			range.moveToElementText(element);
			range.collapse(true);        
			range.move('character', location);
			range.select();
		}
	},
	/** 监听选择心情事件
	* @param selector 选择器
	*/
	_bindSelectMoodEvent : function(selector)
	{
		var _this = this;
		selector.click(function(event){
			var mood_color = $(this).attr("mood_color");
			var mood_desc  = $(this).text();
			_this.ISCurrentMoodCls(mood_color, mood_desc);
			_this._selectMoodDialog.hide();
			_this._moodData = {mood_color : mood_color, mood_desc : $(this).text()}; // 保存心情
		});
	},
	
	// 检测是否是有效的图片地址
	_checkImgUrl : function(url)
	{
		return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[(\x80-\xff)\w-.\/?#%&=_x,·-]*)\.(jpg|png|gif|bmp|jpeg)$/i.test(url || '');
	},
	
	// 检测是否是有效的视频地址
	_checkVideoUrl : function(url)
	{
		return /^http(s)?:\/\/([\w-]+\.)+(youku.com|tudou.com|56.com|joy.cn|ku6.com)/i.test(url);
	},
	
	setRemainLen : function(len)
	{
		if(len!=this._remainCount.text().length){
			if(len<0){
				this._remainCount.addClass("tRed");
			}else{
				this._remainCount.removeClass("tRed");
			}
			this._remainCount.text(len);
		}
	},
	/**
	 * 此方法可重写，用于输入时触发的回调
	 * @param textarea 推他框中的文本域对象
	 */
	onInput : function(textarea)
	{
		this.setRemainLen(this._defaultWordsCount - textarea.val().length);
	},
	// 发布事件，需重写，参数data包含了此次发布的所有数据
	onPublish : function(data)
	{
	},
	/**
	* 初始化位置
	* @param target 对齐的目标
	* @param me 要对齐的对象
	* @param offset 偏移对象
	*/
	_initPosition : function(target, me, offset)
	{
		offset = offset || {top : 10, left : 0};
		offset.top = offset.top || 0, offset.left = offset.left || 0;
		var targetHeight = target.height(), targetOffset = target.offset();
		try{
			return me.css({
				top  : targetOffset.top + targetHeight + offset.top,
				left : targetOffset.left + offset.left
			});
		}catch(e){}
	},
	register : function(params)
	{
		this.setParams(params);
		if(this._uploadBtn)
		{
			this._uploadBtn.click(this._upload.bind(this));
		}
		else{
			this._uploadFileInput.change(this._upload.bind(this));
		}
	},
	/**
	* 设置上传时携带的参数
	* @param Object params
	*/
	setParams : function(params)
	{
		this._params = params || {};
	},
	/**
	* 增加上传时的参数
	*/
	addParams : function(params)
	{
		this._params = $.extend(this._params, params || {});
	}, 
	removeParams : function(keys)
	{
		if(!keys)
		{
			return false;
		}
		if(Array !== keys.constructor)
		{
			keys = [keys];
		}

		$.each(keys, function(index, key){
			for(var item in this._params)
			{
				if(this._params[key])
				{
					delete this._params[key];
				}
			}
		}.bind(this));
	},
	getParams : function()
	{
		return this._params;
	},
	_upload : function(event)
	{
		
		//this._uploadMenu.toggle();
		if(!this._params['action'])
		{
			this._params['action'] = this._uploadUrl;//'/tuita/upload';
		}
		this._uploadfileName = this._uploadFileInput.val();
		var s = this._uploadfileName.toString().indexOf("\\")!=-1?"\\":"/";
		this._uploadfileName = this._uploadFileInput.val().toString().split(s).pop()||"";
		var action = this._params['action'];
		if(!action)
		{
			return false;
		}
		
		var param = '';
		if(action.indexOf("?") > -1)
		{
			param = action + "&";
		}
		else
		{
			param = action + "?";
		}

		this._createIFrame();
		var form = $(this._uploadFileInput.get(0).form);
		form.attr({
			'method' : 'post',
			'enctype': 'multipart/form-data',
			'target' : this._uploadIFrameName,
			'action' : param//$.param(this._params)
		});
		// 上传前的验证
		if(!this.onBeforeUpload())
		{
			return false;
		}
		this._initPosition(this._imageBtn, this._uploadImageLoadingDialog).toggle(); // 显示上传图片loading对话框
		this.uploadFinished = false;
		this.onStartUpload();
		form.submit();
		this._uploadTimer = self.setTimeout(this._onFinishUpload.bind(this, true, form), this._uploadTimeout);

		event.preventDefault();
		event.stopPropagation();
		return false;
		//this._uploadIFrame.load(this._onFinishUpload.bind(this, false, form));
	},
	/**
	* 当上传完成时数据到来时触发
	* @param data 服务器端返回的数据
	*/
	onImageData : function(data)
	{
		this._imageData = data;
		this._onFinishUpload(false, $(this._uploadFileInput.get(0).form));
	},
	onBeforeUpload : function()
	{
		return true;
	},
	onStartUpload : function()
	{
	},
	// 设置当前已经上传图片，在UI上具体表现
	_setActiveImage : function(data)
	{
		this._uploadedVideoName.text("视频");
		this._uploadedVideo.hide();
		if(data && !data.errno){
			var imgName = this._uploadfileName||"分享图片";
			this._uploadedImageName.text(imgName);
			this._videoBtn.unbind("click").find("em").css("color","#bbb").attr("title","已经添加图片了");
			this._imageBtn.unbind("click").find("em").css("color","#bbb").attr("title","已经添加图片了");
			this._uploadedImage.show();
			this._uploadedVideoName.css("color", "#666");
			if(!$.trim(this._textarea.val()))
			{
				this._textarea.val(this._defaultImageTwitterMessage);
				this._remainCount.text(this._defaultWordsCount - this._defaultVideoTwitterMessage.length);
			}
		}
		else
		{
			if($.trim(this._textarea.val()) == this._defaultVideoTwitterMessage)
			{
				this._textarea.val("");
				this._remainCount.text(this._defaultWordsCount);
			}
		}

		this._videoPreviewDialog.hide();
		this._uploadMenu.hide();
	},
	_setActiveVideo : function(data)
	{
		this._uploadedImageName.text("图片");
		this._uploadedImage.hide();
		if(data)
		{
			
			this._videoBtn.unbind("click").find("em").css("color","#bbb").attr("title","已经添加视频了");
			this._imageBtn.unbind("click").find("em").css("color","#bbb").attr("title","已经添加视频了");
			this._uploadedVideo.show();
			this._videoData = data;
			this._uploadedImageName.css("color", "#666");
			if(!$.trim(this._textarea.val()))
			{
				this._textarea.val(this._defaultVideoTwitterMessage);
				this._remainCount.text(this._defaultWordsCount - this._defaultVideoTwitterMessage.length);
			}
		}
		else
		{
			if($.trim(this._textarea.val()) == this._defaultImageTwitterMessage)
			{
				this._textarea.val("");
				this._remainCount.text(this._defaultWordsCount);
			}
		}
		/*
		if($.trim(this._textarea.val()) == this._defaultImageTwitterMessage)
		{
			this._textarea.val("");
			this._remainCount.text(this._defaultWordsCount);
		}
		*/
		this._previewDialog.hide();
		this._uploadMenu.hide();
	},
	/**
	* 显示图片预览
	* @param thumbnail 缩略图路径
	*/
	_showImagePreview : function(imageData)
	{
		var previewDialog = this._previewDialog.find("[attr='twitter_image_preview']")
							// .attr("href", imageData.link)
							//.attr("href", "javascript:void(0);")
							.html($.sprintf('<img width="75" height="75" src="%s" />', imageData.thumbnail)).end();
		this._initPosition(this._uploadedImage, previewDialog).hide();
	},
	/**
	* 显示影片预览
	* @param thumbnail 缩略图路径
	*/
	_showVideoPreview : function(imageData){
		var title = imageData.title||"视频";
		var previewDialog = this._videoPreviewDialog.find("[attr='twitter_video_preview']")
							// .attr("href", imageData.link)
							//.attr("href", "javascript:void(0);")
							.html($.sprintf('<img width="75" height="75" src="%s" title="%s" />', imageData.thumbnail,imageData.title)).end();
		this._uploadedVideoName.text(imageData.title);
		this._initPosition(this._uploadedVideo, previewDialog).hide();
	},
	_reset : function(){
		this._uploadImageLoadingDialog.hide();
		this._atMenu.hide();
		this._sendLoading.hide();
		this._videoBtn.unbind("click").find("em").css("color","").attr("title","");
		this._imageBtn.unbind("click").find("em").css("color","").attr("title","");
		this._uploadedImageName.css("color", "");
		this._uploadedVideoName.css("color", "");
		this._textarea.val("");
		this._remainCount.text(this._defaultWordsCount);
		this._previewDialog.hide();
		this._videoPreviewDialog.hide();
		this._uploadedImage.hide();
		this._uploadedVideo.hide();
		this._imageData = null; // {murl : murl, lurl : lurl, name : name} lurl为大图，murl为小图
		this._videoData = null; // 视频数据 {url : url}
		this._moodData  = {mood_color : 0, mood_desc : ''}; // 心情
		this._moodBtn.removeClass().addClass("mindSelect mind1");
		this._moodBtn.text("");

		this._imageBtn.unbind("click").bind("click", this._onOpenImageMenu.bind(this));
		this._videoBtn.unbind("click").bind("click", this._onOpenVideoDialog.bind(this));
	},
	reset : function()
	{
		this._reset();
	},
	
	_showUploadImgTips : function(msg)
	{
		var tips = this._twitterTips;
		tips.find("[attr='msg']").html(msg || "");
		this._initPosition(this._imageBtn, this._twitterTips).toggle().fadeOut(3000);
	},

	/**
	* 上传完成时被触发
	* @param Boolean isTimeout 是否超时
	*/
	_onFinishUpload : function(isTimeout, form)
	{
		this._uploadTimer && self.clearTimeout(this._uploadTimer);
		this._uploadImageLoadingDialog.toggle();
		if(isTimeout)
		{
			this._showUploadImgTips("上传超时，请重新上传");
		}
		else
		{
			if(!this._imageData)
			{
				this._showUploadImgTips("上传失败，请重新上传");
			}
			else
			{
				var data = this._imageData.data, errno = this._imageData.errno;
				if(!data)
				{
					this._showUploadImgTips("上传失败，请重新上传");
				}
				else
				{
					if(errno == 100)
					{
						this._showUploadImgTips("请先登录");
					}
					else if(errno == 0)
					{
						this._setActiveImage(data);
					}
					else
					{
						this._showUploadImgTips("上传失败，请重新上传");
					}
					this._imageData = data;//console.log(data);
					//预览
					if(!$.trim(this._textarea.val()))
					{
						this._textarea.val(this._defaultImageTwitterMessage);
						this._remainCount.text(this._defaultWordsCount - this._defaultImageTwitterMessage.length);
					}
					this._showImagePreview(data);
				}
			}
		}

		form.get(0).reset();
		self.setTimeout(this._removeIFrame.bind(this), 0);
		this.uploadFinished = true;
		//console.log(this._imageData);
		return true;
		/*
		this._uploadTimer && self.clearTimeout(this._uploadTimer);
		var result = null;
		if(isTimeout)
		{
			result = {errno : 1, error : "超时", data : null};
		}
		else
		{
			try{
				var result = this._uploadIFrame.get(0).contentWindow.__iframe_upload_image_data;
			} catch(e){
				result = {errno : 2, error : '未登录', data : null};
			}
		}
		self.setTimeout(this._removeIFrame.bind(this), 0);
		form.get(0).reset();
		var data = null;
		if(result && result.errno)
		{
			data = {errno : result.errno, error : result.error};
		}
		else
		{
			data = result.data;
		}
		this._uploadImageLoadingDialog.toggle(); // 隐藏图片上传loading对话框
		this._setActiveImage(data);
		this.onImageData.call(this, data);
		
		return true;
		*/
	},
	/**
	* 用于创建上传的iframe
	*/
	_createIFrame : function()
	{
		if(!this._uploadIFrame)
		{
			this._uploadIFrame = $($.sprintf('<iframe name="%s" width="0" height="0"></iframe>', this._uploadIFrameName)).appendTo(document.body);
		}
		return this;
	},
	/**
	* 移除用于上传的iframe
	*/
	_removeIFrame : function()
	{
		this._uploadIFrame.remove();
		this._uploadIFrame = null
	},
	setPosition : function()
	{
		var btns    = [this._atBtn,this._imageBtn, this._videoBtn, this._smileBtn, this._moodBtn,$(".at"),this._uploadedImage,this._uploadedVideo],
		dialogs = [
					[this._atMenu],
					[
						this._uploadMenu,
						this._imageLinkDialog,
						//this._loading,
						this._twitterTips
					],
					[
						this._videoLinkDialog
					],
					[this._faceBox.getDialog()],
					[this._selectMoodDialog],
					[this._atMenu],
					[this._previewDialog],
					[this._videoPreviewDialog]
				];
		var _this = this;
		try{
			$.each(btns, function(index, _btn){
				$.each(dialogs[index], function(_index, _dialog){
						_this._initPosition(_btn, $(this));
				});
			});
		}catch(e){}
	},
	/**
	 * 隐藏乱弹(在活动中隐藏)
	 */
	hideRandom:function(){
		this._randomBtn.hide();
	}
});
