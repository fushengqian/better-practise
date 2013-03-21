/**
 * 与展示Feed有关的JS
 * @contact: 吴志坚<wuzhijian@snda.com>
 * @memo: 大多数内容移植自UC项目
 * @修改: 龙世昌
 * 依赖：bf.ui.Face.js, bf.plugin.jquery_cookie.js
 */

var FeedSmallImageMaxWidth = 130;				//动态图片小图最大宽度
var FeedListDisplayArea  = 'ul#feed_area';		//动态展示区域dom
var FeedDeleteAjaxUrl = 'feed/delfeed';			//动态删除ajax地址 //todo: 要改
var SgsId = '1227314366732'; //三国杀ID

//判断是否三国杀页面
function checkIsSgsPage() {
	if (window.location.href.indexOf('/sgs') != -1) {
		return true;
	}else {
		return false;
	}
}

/**
* 获取评论信息
* @param divid 需要追加内容的divid,即整个评论区域的父节点的id
* @param sdid 被评论内容的所有者id
* @param objid 被评论内容的id
* @param urlinfo 在 查看更多 上使用的url
* @param commentid 显示评论数的页面元素的id
*/
function SndaFeedGetComment(divid, sdid, objid, urlinfo, commentid) {
	$.bf.module.Feed.commentExpand(divid, sdid, objid, 'twitter', urlinfo, commentid);
}


/**
* 显示转推层
* @params string   tuita_id: 当前推他的id
* @params string   sdid: 当前推他的用户id
* @params bool   is_repost: 当前推他是否转推 true 转推 false 原推
* @params string   original_sdid: 原推发表人id
* @params string   nickname: 当前推他的用户昵称
* @params string   ori_nickname: 原推发表人昵称
* @params string   ori_content: 原推的内容
* @param string divid 该条推他的标志ID
*/
function SndaFeedGetRetuita(tuita_id, sdid, is_repost, original_sdid, nickname, ori_nickname, ori_content, divid)
{
	if (checkIsSgsPage() == true) {
		$.bf.module.Feed.app_game_id = SgsId;
	}
	$.bf.module.Feed.showRePostPopup(tuita_id, sdid, is_repost, original_sdid, nickname, ori_nickname, ori_content, divid);
}



/**
* 缩小图片
* @params string   dom: 当前图片dom对象
*/
function SndaFeedShrinkPicture(dom)
{
	var obj = $(dom);
	if(obj.length == 0){
		return false;
	}

	var parent = obj.parent(),
		top = parent.parent();

	if(obj.hasClass('iconSmall')){
		parent.hide();
		top.children('a:first').hide();
		top.children('a:last').show();
	}else {
		parent.children('p').hide();
		obj.hide().next().show();
	}

	return false;
}

/**
* 放大图片
* @params string   dom: 当前图片dom对象
*/
function SndaFeedExtendPicture(dom)
{
	var obj = $(dom);
	if(obj.length == 0){
		return false;
	}
	imgurl = obj.children('img').attr('src');

	obj.hide();
	if(obj.parent().children('p').length){
		obj.prev().show();
		obj.parent().children('p').show();

	} else {
		var tpl = [];
		tpl[tpl.length] = '<p>';
		tpl[tpl.length] = '<a href="javascript:void(0);" onclick="SndaFeedShrinkPicture(this);return false" class="iconSmall">收起</a>';
		tpl[tpl.length] = '<a href="'+imgurl+'" class="iconLarger" target="_blank">查看原图</a>';
		tpl[tpl.length] = '</p>';
		tpl[tpl.length] = '<a href="javascript:void(0);" onclick="SndaFeedShrinkPicture(this);return false">';
		tpl[tpl.length] = '<img class="imgBorder" onload="SndaFeedSetPictureWidth(this,3);" src="'+imgurl+'" />';
		tpl[tpl.length] = '</a>';
		obj.parent().prepend($(tpl.join('')));
	}
	return false;
}

/**
* 设定图片宽度
* @params string   dom: 当前dom对象
* @params string   times: 倍数
*/
function SndaFeedSetPictureWidth(dom, times)
{
	var maxWidth = FeedSmallImageMaxWidth;
	if(times){
		maxWidth = maxWidth * times;
	}
	if (dom.width>maxWidth){
		dom.width = maxWidth;
		$(window).resize();
	}
	return false;
}

/**
* 播放视频
* @params string   dom: 当前dom对象
* @params string   url: 视频连接
* @params string   title: 视频标题
*/
function SndaFeedActiveVideo(dom, url, title)
{
	var obj = $(dom);
	if(obj.length == 0){
		return false;
	}
	
	var flash = obj.attr('flashvar'),
		fid = obj.parents('li:first').attr('id'),
		flashdivid = 'flash_'+fid;
	
	if(!$('#'+flashdivid).length){
		var tpl = [];
		tpl[tpl.length] = '<div class="pd5 feedvideo">';
		tpl[tpl.length] = '<p>';
		tpl[tpl.length] = '<a href="javascript:void(0);" onclick="SndaFeedFoldVideo(this, ' + flashdivid + ');" class="iconSmall">收起</a>';
		tpl[tpl.length] = '<a target="_blank" href="' + url + '" class="iconLarger">' + title + '</a>';
		tpl[tpl.length] = '</p>';
		tpl[tpl.length] = '<div id="' + flashdivid + '"></div>';
		tpl[tpl.length] = '</div>';
		
		$(tpl.join('')).insertAfter(obj.parent());
		tpl = null;
	}
	
	//todo: 视频还不能播
	var maxWidth = FeedSmallImageMaxWidth * 3;
	maxHeight = maxWidth * 0.86;
	swfobject.embedSWF(flash, flashdivid, maxWidth, maxHeight, '9.0.0', "http://ipic.staticsdo.com/v1/img/expressInstall.swf",{},{wmode:"transparent"});
	obj.parent().hide().next().show();
	
	return false;
}

/**
* 收起视频
* @params string   dom: 当前dom对象
* @params string   video_id: 视频ID
*/
function SndaFeedFoldVideo(dom, video_id)
{
	var obj = $(dom);
	if(obj.length == 0){
		return false;
	}
	
	var parentObj = obj.parents('.feedvideo:first');
	if(parentObj.length > 0){
		parentObj.hide().prev().show();
		parentObj.find('object').replaceWith('<div id=\"'+video_id+'\"><\/div>');
	}
	return false;
}

/**
* 动态输出完成后相关处理
*/
function SndaFeedDisplayDeal() //todo: 待套上CSS后，再加上该函数，预计是用来切换feed删除按钮的隐现
{
	var li = $(FeedListDisplayArea+' li');
	li.live('mouseover', function(){
		$(this).addClass('cur');
	});
	li.live('mouseout', function(){
		$(this).removeClass('cur');
	});
	return false;
}

/**
* 更多几条的JS展开收起代码
* @params string   dom: 当前dom对象
*/
function SndaFeedMoreItems(dom) //todo: 用于游戏feed中
{
	$(dom).parent().next().toggle();
	var cont = $(dom).html();
	if('收起'!=cont){
		$(dom).html('收起');
	} else {
		var num = $(dom).attr('num');
		$(dom).html('另外'+num+'条>>');
	}
	return false;
}

/**
* 处理PNG图片
* @params string   dom: 当前dom对象
*/
function SndaFeedPicturePngFix(dom)
{
	$.bf.common.fixPNG(dom);
}

/**
* 删除动态
* @params string   liid: 当前动态LI的ID
* @params string   appid: 应用ID
* @params string   feedid: 动态ID
* @params string   tuita_id: 关联的推他ID
* @params string   tuita_sdid: 关联的推他的作者ID
*/
function SndaFeedDeleteItem(liid, appid, feedid, tuita_id, tuita_sdid, sourceSite) {
	/*$.bf.ajax.request(FeedDeleteAjaxUrl, {
						'fid': feedid, 'aid': appid, 'tid': tuita_id, 'tsdid':tuita_sdid, 'sourceSite':sourceSite
					}, 
					function(data){
						$('#'+liid).fadeOut('normal', function(){
							$('#'+liid).remove();
						});
					}, 
					function(errno, msg){
						$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
						return false;
					}, 
					'GET'
				);*/
	
	$.bf.module.Confirm.show(
		{
		 title: '提示', 
		 message: '确定删除这条微博吗？',
		 onEnter: function() {
				$.bf.ajax.request(FeedDeleteAjaxUrl, {
						'fid': feedid, 'aid': appid, 'tid': tuita_id, 'tsdid':tuita_sdid, 'sourceSite':sourceSite
					}, 
					function(data){
						$('#'+liid).fadeOut('slow', function(){
							$('#'+liid).remove();
						});
					}, 
					function(errno, msg){
						$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
						return false;
					}, 
					'GET'
				);
				return false;
			}
		}
	);
}



;$.registerNameSpace("bf.module.Feed");

$.bf.module.Feed = {
	thisd:null,
	app_game_id:'',
	retuita_cb:'',

	/**
	 * 获取一条记录的评论列表
	 * @param: objid 整个评论列表区域父节点ID
	 * @param: user_id 被评论内容的所有者sdid
	 * @param: module_id 被评论对象的id
	 * @param: channel_id 被评论对象所属的频道
	 * @param: urlinfo 
	 * @param: chan 评论列表显示评论数量的元素ID
	 * 
	 * 对应UC中snda.lib.comment.commentexpand()
	 */
	commentExpand: function(objid, user_id, module_id, channel_id, urlinfo, chan){
		if($("#com_"+objid).get(0) != null){
			$("#com_"+objid).slideUp("slow");
			$("#com_"+objid).remove();
			return;
		}
		channels = channel_id;

		$.bf.ajax.request(
			$.bf.ajax.createURL("feed/commentExpand"),
			{'user_id':user_id,'module_id':module_id,'channel_id':channel_id},
			function(msg) {
				$.bf.module.Feed.commentExport(objid,user_id,module_id,channel_id,urlinfo,chan,msg);
			},
			function(errno,error) {
				$.bf.module.Tooltip.show(error);
			},
			'POST'
		);
	},

	/**
	 * 输出评论信息
	 * @param: objid 整个评论列表区域父节点ID
	 * @param: user_id 被评论内容的所有者sdid
	 * @param: module_id 被评论对象的id
	 * @param: channel_id 被评论对象所属的频道
	 * @param: urlinfo 
	 * @param: chan 评论列表显示评论数量的元素ID
	 * @param: msg 
	 * 
	 * 对应UC中snda.lib.comment.commentexport()
	 */
	commentExport: function(objid,user_id,module_id,channel_id,urlinfo,chan,msg){
		urlinfo = '/home/tdetail/sdid/'+user_id+'/tid/'+module_id; //单条推他链接地址
		var target_new_window = '';
		
		var _html=[];
		_html.push('<div class="commentRepyBox" id="com_'+objid+'" style="display:none;">');
		_html.push('<div class="commentRepyBoxT"></div>');
		_html.push('<div class="repyBox">');
		_html.push('<h4><span class="r"><span id="repcomment_'+objid+'">'+msg.rows.total+'</span>条评论，<a href="'+urlinfo+'" '+target_new_window+'>点击查看>></a></span><a href="javascript:void(0);" onclick="$.bf.module.Feed.delComlist(\''+objid+'\');return false;">收起</a></h4>');		
		_html.push('<span id="repyBox_'+objid+'">');
		if(msg.rows.comlist != null){
			for(var i=0;i<msg.rows.comlist.length;i++){
				_html.push('<div class="plBox" id="plBox_'+msg.rows.comlist[i].cid+'">');
				_html.push('<div class="avatar"><a href="'+msg.rows.comlist[i].home+'"><img src="'+msg.rows.comlist[i].pic+'" class="avatar"/></a></div>');
				_html.push('<div class="subItems">');
				_html.push('<a href="'+msg.rows.comlist[i].home+'">'+msg.rows.comlist[i].nickname+'</a> ：');
				_html.push(msg.rows.comlist[i].content);
				_html.push('<p class="tagText"> <span class="r"><a href="javascript:void(0);" onclick="$.bf.module.Feed.replyComments(\''+msg.rows.comlist[i].cid+'\',\''+objid+'\',\''+module_id+'\',\''+msg.rows.comlist[i].writer+'\',\''+msg.rows.comlist[i].sender+'\',\''+msg.rows.comlist[i].nickname+'\');return false;">回复</a>');
				if(msg.rows.comlist[i].del == 'yes'){
					var deluser,deltype;
					deluser = msg.rows.comlist[i].deluser;
					deltype = msg.rows.comlist[i].deltype;
					_html.push('<em>|</em><a href="javascript:void(0);" onclick="$.bf.module.Feed.delComment(this, \''+msg.rows.comlist[i].cid+'\',\''+objid+'\',\''+deluser+'\',\''+deltype+'\',\''+module_id+'\');return false;">删除</a>');
				}
				_html.push('</span> ('+msg.rows.comlist[i].adddate+')</p>');
				_html.push('</div>');
				_html.push('</div>');
			}
		}
		_html.push('</span>');	
		//评论框开始
		//判断登录
		var no_logined_txt = '';
		if (!$.bf.common.loginJudge()) {
			no_logined_txt = '登录后才可发表评论';
		}
		_html.push('<div class="writeComment" id="write_'+objid+'">');
		_html.push('<form id="replycomment_'+objid+'" name="replycomment" method="post" action="/feed/CommentReplyinfo" target="hidden_frame_'+objid+'">');
		_html.push('<input type="hidden" name="cid" id="cid_'+objid+'" value=""/>');
		_html.push('<input type="hidden" name="objid" id="objid_'+objid+'" value="'+objid+'"/>');
		_html.push('<input type="hidden" name="nickname" id="nickname_'+objid+'" value=""/>');
		_html.push('<input type="hidden" name="content" id="content_'+objid+'" value=""/>');
		_html.push('<input type="hidden" name="receive" id="receive_'+objid+'" value="'+user_id+'"/>');
		_html.push('<input type="hidden" name="writer" id="writer_'+objid+'" value="'+user_id+'"/>');
		_html.push('<input type="hidden" name="module_id" id="module_id_'+objid+'" value="'+module_id+'"/>');
		_html.push('<input type="hidden" name="channel_id" id="channel_id_'+objid+'" value="'+channel_id+'"/>');
		_html.push('<input type="hidden" name="chan" id="chan_'+objid+'" value="'+chan+'"/>');
		_html.push('<input type="hidden" name="ywcontent" id="ywcontent_'+objid+'" value=""/>');
		_html.push('<div class="writeWrap">');
		_html.push('<textarea class="text" id="comments_'+objid+'" name="comments" onKeyUp="$.bf.module.Feed.limitLetter(this, 300);" onPaste="$.bf.module.Feed.limitLetter(this, 300);" onfocus="if (this.value==\'登录后才可发表评论\') {this.value=\'\'};">'+no_logined_txt+'</textarea>');
		_html.push('<a href="javascript:void(0);" onclick="$.bf.module.Feed.submitComment(\''+objid+'\',\''+module_id+'\');return false;" class="writeCommentBtn" ></a>');
		_html.push('</div>');
		_html.push('<div class="clear"></div>');
		_html.push('<div class="ttSame"><span class="r"><input type="checkbox" id="commtwitter_'+objid+'" name="commtwitter" value="yes"/> 同时转推该评论</span><a href="javascript:void(0);" onclick="return false" class="smileFace" id="smileFace_'+objid+'"></a></div>');
		_html.push('</form>');
		_html.push('</div>');
		_html.push('</div>');
		_html.push('<div class="commentRepyBoxB"><iframe id="hidden_frame_'+objid+'" name="hidden_frame_'+objid+'" frameborder=0 style="display:block; width:1px; height:1px"></iframe></div>');
		_html.push('</div>');
		
		if ($("#"+objid+" .rc1Bd").length > 0) {
			$("#"+objid+" .rc1Bd").append(_html.join(''));
		}else {
			$("#"+objid).append(_html.join(''));
		}
		
		var face = $.bf.ui.FaceBox.create("#comments_"+objid);
		$("#smileFace_"+objid).click(function() {
			face.getDialog().toggle();
			face.initPosition("#smileFace_"+objid);
		});		
		$("#com_"+objid).slideDown("slow");
		_html.length = 0;
		_html = null;
	},

	//限制输入
	limitLetter: function(obj, max){
		if ($(obj).val().length > max) {
			$(obj).val($(obj).val().substr(0, max));
			$(obj).focus(function(){$(obj).val($(obj).val());});
			$(obj).focus(); 
		}
	},

	/**
	 * 回复评论
	 * 对应UC中snda.lib.comment.replycomments()
	 */
	replyComments: function(cid,objid,module_id,writer,receive,re_nickname){
		$("#cid_"+objid).val(cid);
		$("#receive_"+objid).val(receive);
		$("#nickname_"+objid).val(re_nickname);
		$("#comments_"+objid).val('回复@'+re_nickname+'：');
		$("#comments_"+objid).focus(function(){
			$("#comments_"+objid).val($("#comments_"+objid).val());
		});
		$("#comments_"+objid).focus();
		//$("#comments_"+objid).get(0).scrollIntoView();
	},

	/**
	 * 提交评论
	 * 对应UC中snda.lib.comment.subcomment()
	 */
	submitComment: function(objid, module_id){
		var content = $("#comments_"+objid).val();
		content = content.replace("回复@"+$("#nickname_"+objid).val()+"：","");
		//判断字符数
		if(content.length == 0) {
			$("#comments_"+objid).focus(function(){$("#comments_"+objid).val($("#comments_"+objid).val());});
			$("#comments_"+objid).focus();
			return false;
		}
		if(content.length == ''){
			$("#comments_"+objid).focus(function(){$("#comments_"+objid).val($("#comments_"+objid).val());});
			$("#comments_"+objid).focus();
			return false;
		}
		if(content.length > 300){
			$("#comments_"+objid).focus(function(){$("#comments_"+objid).val($("#comments_"+objid).val());});
			$("#comments_"+objid).focus();
			return false;
		}
		$("#content_"+objid).val(content);
		$("#comments_"+objid).val('');
		if(channels == 'twitter'){
			$("#ywcontent_"+objid).val($("#twitter_content_"+module_id).html());
		}
		
		//判断是否三国杀页面
		if (checkIsSgsPage() == true) {
			this.app_game_id = SgsId;
		}
		//判断是否转推
		var repost = 0;
		if ($("#commtwitter_"+objid).attr("checked") == true && this.app_game_id == '') {
			repost = 1;
		}

		$.bf.ajax.request(
			$.bf.ajax.createURL("feed/CommentReplyinfo"),
			{
				"cid"        : $("#cid_"+objid).val(), 
				"objid"      : $("#objid_"+objid).val(), 
				"nickname"   : $("#nickname_"+objid).val(),
				"content"    : $("#content_"+objid).val(),
				"receive"    : $("#receive_"+objid).val(),
				"writer"     : $("#writer_"+objid).val(),
				"module_id"  : $("#module_id_"+objid).val(),
				"channel_id" : $("#channel_id_"+objid).val(),
				"chan"       : $("#chan_"+objid).val(),
				"ywcontent"  : $("#ywcontent_"+objid).val(),
				"comments"   : $("#comments_"+objid).val(),
				"commtwitter": $("#commtwitter_"+objid).val(),
				"repost"     : repost
			},
			function(obj) {
				if($("#commtwitter_"+objid).attr("checked") == true && this.app_game_id != '') {//三国杀页面的转推
					var receiver = $("#receive_"+objid).val();
					$.bf.ajax.request(
						$.bf.ajax.createURL("tuita/repostTuita"),
						{"tid":module_id,"sdid":receiver,"content":content, "source":this.app_game_id}, 
						function(data) {
							//$.bf.module.Tooltip.show('转推成功！');
						},
						function(errno,error) {
							$.bf.module.Tooltip.show('转推出错：'+error);
						},
						'POST'
					);
				};

				//清除点回复链接的数据
				$("#cid_"+objid).val('');
				$("#nickname_"+objid).val('');
				
				$("input[name='commtwitter']").attr("checked",false);
				$("#receive_"+objid).val($("#writer_"+objid).val());
				$("#repcomment_"+objid).html(parseInt(parseInt($("#repcomment_"+objid).text())+1));
				
				//更新评论数
				var channame = $("#chan_"+objid).val();
				if (channame.indexOf('comment_num_') > -1) {//推他接口读的推他
					comment_num = $("#"+channame).text();
					if (!comment_num) {
						comment_num = 1;
					} else {
						comment_num = parseInt(comment_num.replace('(', '').replace(')', '')) + 1;
					}
					
					$("#"+channame).text('('+comment_num+')');
				}else {//FEED列表
					comment_num = $("#"+objid).find('.icoComment:first span').text();
					if (!comment_num) {
						comment_num = 1;
					} else {
						comment_num = parseInt(comment_num.replace('(', '').replace(')', '')) + 1;
					}
					
					if (comment_num == 1) {
						var comment_num_str = '评论(<span id="'+channame+'">1</span>)';
						$("#"+objid+" .icoComment").html(comment_num_str);
					}else {
						$("#"+objid).find('.icoComment:first span').text(comment_num);
					}
				}
				
				$.bf.module.Feed.insertComment(obj, objid);
				
				//更新转推数
				if (repost == 1) {
					var zh_num = null;
					if (channame.indexOf('comment_num_') > -1) {//推他接口读的推他列表
						zh_num = $("#"+objid).find("#convey_num").text();
						if (zh_num) {
							zh_num = parseInt(zh_num.replace('(', '').replace(')', ''))+1;
						}else {//无转推数的情况
							zh_num = 1;
						}
						$("#"+objid).find("#convey_num").text('('+zh_num+')');
					}else {//FEED列表
						zh_num = $("#"+objid+' .icoZt').text();
						if (zh_num == '转推') {
							zh_num = 1;
						}else {
							zh_num = parseInt(zh_num.replace('转推(', '').replace(')', '')) + 1;
						}
						$("#"+objid+' .icoZt').text('转推('+zh_num+')');
					}
				}
			}.bind(this),
			function(errno,error) {
				$.bf.module.Tooltip.show(error);
			},
			'POST'
		);
	},

	/**
	 * 将新的评论插入页面
	 对应UC中snda.lib.comment.insertcomment()
	 */
	insertComment: function(obj,objid){
		var _html = [];
		_html.push('<div class="plBox" id="plBox_'+obj.cid+'" style="display:none;"><a href="'+obj.home+'"><img class="avatar" src="'+obj.pic+'"></a><div class="subItems">');
		_html.push('<a href="'+obj.home+'">'+obj.nickname+'</a> ：');
		_html.push(obj.content);
		_html.push('<p class="tagText"> <span class="r"><a onclick="$.bf.module.Feed.replyComments(\''+obj.cid+'\',\''+objid+'\',\''+obj.module_id+'\',\''+obj.writer+'\',\''+obj.sender+'\',\''+obj.nickname+'\');return false;" href="javascript:void(0);">回复</a>');
		if(obj.del == 'yes'){
			var deluser,deltype;
			deluser = obj.deluser;
			deltype = obj.deltype;
			_html.push('<em>|</em><a href="javascript:void(0);" onclick="$.bf.module.Feed.delComment(this,\''+obj.cid+'\',\''+objid+'\',\''+deluser+'\',\''+deltype+'\',\''+obj.module_id+'\');return false;">删除</a>');
		}
		_html.push('</span> ('+obj.adddate+')</p></div></div>');
		$("#repyBox_"+objid).append(_html.join(''));
		if($("#repyBox_"+objid+" div[class='plBox']").length > 10){
			$("#repyBox_"+objid+" div[class='plBox']").eq(0).fadeOut('slow',function(){
				$("#repyBox_"+objid+" div[class='plBox']").eq(0).remove();
				$("#repyBox_"+objid+" div[class='plBox']").eq($("#repyBox_"+objid+" div[class='plBox']").length-1).fadeIn('slow');
			});
		}else{
			$("#repyBox_"+objid+" div[class='plBox']").eq($("#repyBox_"+objid+" div[class='plBox']").length-1).fadeIn('slow');
		}
		_html.length = 0;
		_html = null;
	},
	
	/**
	 * 删除评论
	 * 对应UC中snda.lib.comment.delcomment()
	 */
	delComment: function(a, cid, objid, user_id, types, module_id) {
		
		this.thisd = a;

		$.bf.module.Confirm.show(
			{
			 title: '提示',
			 message: '确定要删除该条评论吗？',
			 onEnter: function() {
					  $.bf.ajax.request(
							$.bf.ajax.createURL("feed/CommentDel"),
							{'cid'      : cid,
							'user_id'   : user_id,
							'type'      : types,
							'module_id' : $("#module_id_"+objid).val(),
							'channel_id': $("#channel_id_"+objid).val()
							},
	
							function(msg) {
								$.bf.module.Feed.delcommenthtml(msg,objid,user_id,types,module_id);
							},
							function(errno, error) {
								$.bf.module.Tooltip.show(error);
							},
							'POST'
						);
			 }
			}
		);
	},

	/** 
	 * 在展开中删除评论后更新数据
	 * 对应UC中snda.lib.comment.delcommenthtml()
	 */
	delcommenthtml:function(msg,objid,user_id,types,module_id){
		var _html = [];
		if(msg.rows.comlist != null) {
			for(var i=0;i<msg.rows.comlist.length;i++) {
				_html.push('<div class="plBox" id="plBox_'+msg.rows.comlist[i].cid+'">');
				_html.push('<a href="'+msg.rows.comlist[i].home+'"><img src="'+msg.rows.comlist[i].pic+'" class="avatar" /></a>');
				_html.push('<div class="subItems">');
				_html.push('<a href="'+msg.rows.comlist[i].home+'">'+msg.rows.comlist[i].nickname+'</a> ：');
				_html.push(msg.rows.comlist[i].content);
				_html.push('<p class="tagText"> <span class="r"><a href="javascript:void(0);" onclick="$.bf.module.Feed.replyComments(\''+msg.rows.comlist[i].cid+'\',\''+objid+'\',\''+module_id+'\',\''+msg.rows.comlist[i].writer+'\',\''+msg.rows.comlist[i].sender+'\',\''+msg.rows.comlist[i].nickname+'\');return false;">回复</a>');
				if(msg.rows.comlist[i].del == 'yes'){
					var deluser,deltype;
					deluser = msg.rows.comlist[i].deluser;
					deltype = msg.rows.comlist[i].deltype;
					_html.push('<em>|</em><a href="javascript:void(0);" onclick="$.bf.module.Feed.delComment(this,\''+msg.rows.comlist[i].cid+'\',\''+objid+'\',\''+user_id+'\',\''+types+'\',\''+module_id+'\');return false;">删除</a>');
				}
				_html.push('</span> ('+msg.rows.comlist[i].adddate+')</p>');
				_html.push('</div>');
				_html.push('</div>');
			}
		}
		
		$(this.thisd).closest("DIV[class='plBox']").fadeOut('slow',function() {
			$(this.thisd).closest("DIV[class='plBox']").remove();
			$("#repyBox_"+objid).html(_html.join(''));
			
			//更新评论数
			var channame = $("#chan_"+objid).val();
			if (channame.indexOf('comment_num_') > -1) {//推他接口读的推他
				var comment_count = parseInt($("#"+channame).text().replace('(', '').replace(')', ''));
				$("#"+channame).text('('+(comment_count-1)+')');
			}else {//FEED接口数据列表
				if(channame.length > 0 && $("#"+channame).get(0) != null) {
					$("#"+channame).html(parseInt(parseInt($("#"+channame).text())-1));
				}				
			}
			$("#repcomment_"+objid).html(parseInt(parseInt($("#repcomment_"+objid).text())-1));
			
			_html.length = 0;
			_html=null;
		});
	},

	/**
	 * 收起层
	 * 对应UC中snda.lib.comment.delcomlist()
	 */
	delComlist: function(objid){
		$("#com_"+objid).slideUp("slow", function(){
			$("#com_"+objid).remove();
		});
	},


	/**
	 * 显示转推层
	 * 
	 * @params string   tuita_id: 当前推他的id
	 * @params string   user_id: 当前推他的用户id
	 * @params bool   is_repost: 当前推他是否转推 true 转推 false 原推
	 * @params string   original_user_id: 原推发表人id
	 * @params string   user_name: 当前推他的用户昵称
	 * @params string   ori_user_name: 原推发表人昵称
	 * @params string   ori_content: 原推的内容
	 * @param string divid 当前推他的标志Id
	 *	
	 * 对应UC中snda.uclib.component.tuita.showRePostPopup()
	 */
	showRePostPopup: function(tuita_id, user_id, is_repost, original_user_id, user_name, ori_user_name, ori_content, divid) {
		//判断登录
		if (!$.bf.common.loginJudge()) {
			$.bf.module.Tooltip.show('请您登录后再转推！', $.bf.ui.Tooltip.icons.ERROR);
			//todo: 弹出登录框：$bf.common.homeLogin();
			return false;
		}
		if (is_repost != true) {
			divid = ori_content;
		}

		var tuita_content     = $("#twitter_content_"+tuita_id).html();
		var user_nickname     = user_name;
		var original_nickname = ori_user_name;

		var tuita_title;
		var tuita_quoted = '';


		if(is_repost){//转推
			if(typeof(ori_content)=='undefined'){
				var original_content = $("#ori_content_"+tuita_id).html();
				tuita_title = '<a href="'+$.bf.ajax.createURL('/home/i/uid/'+original_user_id)+'" target="_blank">'+(original_nickname ? original_nickname : original_user_id)+'</a>：'+original_content;
			}else{
				var original_content = '';
				if ($("#_tuita_"+tuita_id).find('.ztBox .subItems p').length) {
					tuita_title = $("#_tuita_"+tuita_id).find('.ztBox .subItems p').html();
				}else {
					original_content = ori_content;
					tuita_title = '<a href="'+$.bf.ajax.createURL('/home/i/uid/'+original_user_id)+'" target="_blank">'+(original_nickname ? original_nickname : original_user_id)+'</a>：'+original_content;
				}
			}
		}else{
			tuita_title = '<a href="'+$.bf.ajax.createURL('/home/i/uid/'+user_id)+'" target="_blank">'+(user_nickname ? user_nickname : user_id)+'</a>：'+tuita_content;
		}
		if(is_repost){//转推
			//tuita_content = $.bf.ui.Face.codeToSmile(tuita_content);//先进行表情解析，
			tuita_content = tuita_content.replace(/<[^>]+>/g, "");      //再去html

			tuita_quoted = '//@'+user_nickname+'：'+tuita_content;
		}

		var html = [];
		html[html.length] = '<div class="popupTitle"><a class="r" id="close_convey_sign" href="javascript:void(0)" onclick="$.bf.module.HTMLDialog.hide();" tag="close"><span class="iconClose"></span></a>转推</div>';
		html[html.length] = '<div class="popupMain">';
		html[html.length] =		'<p class="words">';
		html[html.length] =			tuita_title;
		html[html.length] =		'</p>';
		html[html.length] =		'<div class="setName pd5">';
		html[html.length] =			'<p class="popSmile"><a class="smileFace mr5" href="javascript:;" onclick="return false" id="convey_smileFace"></a><span class="iconArrow5"></span></p>';
		html[html.length] =			'<textarea class="text textareaWid" id="repost_area" onkeyup="$.bf.module.Feed.limitLetter($(\'#repost_area\'), 256);" onmouseup="$.bf.module.Feed.limitLetter($(\'#repost_area\'), 256);">'+tuita_quoted+'</textarea>';
		html[html.length] =		'</div>';
		html[html.length] =		'<p>';
		html[html.length] =			'<span class="r mr10">';		
		html[html.length] =				'<a href="#" class="btn btn8 mr5" id="commit_convey_btn" onclick="$.bf.module.Feed.conveyAndComment(\''+tuita_id+'\',\''+user_id+'\', \''+divid+'\');"><span>转推</span></a>';
		html[html.length] =				'<a class="btn btn3" href="javascript:void(0);" id="cancel_convey_btn" onclick="$.bf.module.HTMLDialog.hide();"><span>取消</span></a>';
		html[html.length] =			'</span>';
		html[html.length] = 			'<input class="checkbox" type="checkbox" id="addcomment_'+tuita_id+'" name="addcomment" value="yes"/> 同时作为该推他的评论';
		html[html.length] =		'</p>';
		html[html.length] =	'</div>';

		$.bf.module.HTMLDialog.init(true).setSize({width:"400px"}).setHTML(html.join('')).show();
		
		//表情框	
		var face = null;
		$("#convey_smileFace").click(function() {
			if(null == face) {
				face = $.bf.ui.FaceBox.create("#repost_area");
			}
			face.getDialog().toggle();
			face.initPosition("#convey_smileFace", "bottom");
		});
		
		$("#cancel_convey_btn").click(function() {
			face && face.getDialog().hide();
		});
		
		$("#commit_convey_btn").click(function() {
			face && face.getDialog().hide();
		});
		
		$("#close_convey_sign").click(function() {
			face && face.getDialog().hide();
		});
		

		html.length = 0;
		html = null;
		this.setTextAreaFocus('repost_area','first');
		//快捷键提交
		$("#repost_area").keypress(function(e){
			if( e.ctrlKey && (e.keyCode == 13 ||e.which==13)){//firefox
				$.bf.module.Feed.conveyAndComment(tuita_id,user_id, divid);
			}else if( e.ctrlKey && (e.keyCode == 10 ||e.which==10)){//ie
				$.bf.module.Feed.conveyAndComment(tuita_id,user_id, divid);
			}
		});
	},

    /**
	 * 发表转推
	 * 对应UC中snda.uclib.component.tuita.ConveyAndComment()
	 * @param divid 当前推他的标志ID
	 */
	 conveyAndComment:function(mood_id, user_id, divid) {
		var comment = $("#repost_area").val().replace(/(^\s*)|(\s*$)/g,""); 
		if(comment.length == 0){
			 comment = '转推';
		}
		if(comment.length > 256){
			comment = comment.substring(0,256);
		}
		$("#writeCommentBtn_convey").attr("disabled",true); 
		$("#repost_area").val('');
		$.bf.module.HTMLDialog.hide();
		
		//转推来源
		var source = '';
		if(this.app_game_id!='') {
			source = this.app_game_id;
		}
		var is_comment = 0;
		if ($("#addcomment_"+mood_id).attr("checked") == true) {
			is_comment = 1;
		}			
		
		$.bf.ajax.request(
			$.bf.ajax.createURL("tuita/repostTuita"),
			{"tid":mood_id,"sdid":user_id,"content":comment, "source":source, "is_comment":is_comment}, 
			function(data) {				
				if (divid != 'undefined') { //推他接口读的推他
					//更新转推数
					var zt_text = $("#_tuita_"+mood_id).find("#convey_num").text();
					var zt_num = 0;
					if (! zt_text) {
						zt_num = 1;
					}else {
						zt_num = parseInt(zt_text.replace('(', '').replace(')', ''));
						zt_num += 1;
					}
					$("#_tuita_"+mood_id).find("#convey_num").text('('+zt_num+')');
					
					//更新评论数
					if (is_comment == 1) {
						var comment_num_text = $("#_tuita_"+mood_id+' #comment_num_'+mood_id).text();
						var comment_num = 0;
						if (! comment_num_text) {
							comment_num = 1;
						}else {
							comment_num = parseInt(comment_num_text.replace('(', '').replace(')', ''))+1;
						}
						$("#_tuita_"+mood_id+' #comment_num_'+mood_id).text('('+comment_num+')');
						
						if (window.location.href.indexOf('home/tdetail/sdid/') != -1) {//仅用于单条推他页面
							$.bf.app.tuita.getTuitaComment(mood_id, 1000000);
						}
					}
					
					//显示转推数据
					this.showConveyContent(data.tuita_html, 'tuita');
				}else {//FEED读的推他
					//更新转推数
					var zt_obj = $('a.icoZt[onclick*="SndaFeedGetRetuita(\''+mood_id+'\', \''+user_id+'\'"]');
					var zt_text = zt_obj.text();
					if (zt_text == '转推') {
						zt_obj.text('转推(1)');
					}else {
						zt_text = zt_text.replace('转推(', '');
						var zt_num = parseInt(zt_text.replace(')', ''))+1;
						zt_obj.text('转推('+zt_num+')');
					}
					
					//更新评论数
					if (is_comment == 1) {
						var comment_obj = $('a.icoComment[onclick*=",\''+user_id+'\', \''+mood_id+'\', "]');
						var comment_text = '';
						if (! comment_obj.find('span:first').length) {
							comment_text = '评论(<span>1</span>)';
							comment_obj.first().html(comment_text);
						}else {
							comment_text = comment_obj.find('span:first').text().replace('评论(', '').replace(')', '');
							comment_text = parseInt(comment_text) + 1;
							comment_obj.find('span:first').html(comment_text);
						}
					}
					
					//显示转推数据
					this.showConveyContent(data.feed_html, 'feed');
				}
				
				$.bf.module.Tooltip.show('转推成功！', '', {"onClose": new Function("return " + $.bf.module.Feed.retuita_cb + ";")(), "speed":2000});		
			}.bind(this),
			function(errno,error) {
				$.bf.module.Tooltip.show(error);
			},
			'POST'
		);
	},
	
	//显示转推的内容
	showConveyContent: function(html_data, html_type) {
		var url = window.location.href;
		var re = new RegExp(".*(com/|/home)#?$");
		var arr_rs = url.match(re);
		
		if (arr_rs != null) {
			var tab = $.bf.app.my.current_tab_name ? $.bf.app.my.current_tab_name : '';
			var tab_sub = $.bf.app.my.sub_tab_name ? $.bf.app.my.sub_tab_name : '';
			
			if (tab && (tab == 'feed_all' || (tab == 'tuita_my' && tab_sub == 'tuita_my'))) {
				$("#temp_tuita_feed").html(html_data);
				if (html_type == 'feed') {
					$.bf.module.Feed.deleteVSign('#temp_tuita_feed');
				}
				$("#feed_ul").prepend($("#temp_tuita_feed").html().replace('<li ', '<li style="display:none;" '));
				$("#feed_ul li:first").fadeIn('slow');
				$("#temp_tuita_feed").html('');
			}
		}
	},

	/**
	 * 获取焦点到最后
	 * 对应UC中snda.uclib.component.tuita.setTextAreaFocus()
	 */
	setTextAreaFocus:function(text_id){
		var pos = arguments[1]?arguments[1]:'last';
		if(pos == 'last'){
			var cursor_pos = $("#"+text_id).val().length;
		}else if(pos == 'first'){
			$('textarea#'+text_id).focus();
			var cursor_pos = 0;
		}
		$('textarea#'+text_id).focus().focus();
		if(typeof(document.selection)!= 'undefined'){//ie
		   with(document.selection.createRange()){
			   //moveStart("character",$("#"+text_id).val().length);
			   moveStart("character",cursor_pos);
			   collapse();
			   select();
		   }  
		}else{//firefox,chrome
			var x=document.getElementById(text_id);
			//x.setSelectionRange(x.textLength,x.textLength);
			x.setSelectionRange(cursor_pos,cursor_pos);
		}
		/*
		//光标停留在文字最后
		$("#"+text_id).blur();
		var temp_text = $("#"+text_id).val();
		$("#"+text_id).val('');
		$("#"+text_id).focus();
		$("#"+text_id).val(temp_text);
		*/
	},

	//删除FEED的V标志
	deleteVSign: function(feed_selector) {
		var source_html = '';
		var source_name = '';
		var source_obj = null;
		var html_obj = null;
		var feed_detail = '';
		var sdid = '';
		var home_url = '';
		var zt_html_tuita_url = '';
		var mood_name = '';

		$.each($(feed_selector).find('li'), function(key, val) {
			
			//删除推他里的V
			$(this).find(".itemsDetails .font14 .txt4").attr('title', '');
			$.each($(this).find('.itemsDetails .font14 a'), function(key, val) {
				if ($(this).attr('title').length > 0) {
					$(this).remove();
				}
			});
			
			//删除转推里的V
			$(this).find(".ztBox .subItems p .txt4").attr('title', '');
			$.each($(this).find(".ztBox .subItems p a"), function(key, val) {
				if ($(this).attr('title').length > 0) {
					$(this).remove();
				}
			});
			
			//去除客户端的来源链接：边锋、茶苑、浩方
			source_html = $(this).find(".tag").html();
			if (source_html && (source_html.indexOf('/1100000080?') != -1 || source_html.indexOf('/1100000081?') != -1 || source_html.indexOf('/1100000082?') != -1)) {
				source_obj = $(this).find('.tag').find('a');
				source_name = source_obj.text();
				if (source_html.indexOf('/1100000080?') != -1) {
					source_obj.replaceWith(source_name.replace('边锋边锋', '边锋'));
				}else {
					source_obj.replaceWith(source_name.replace('边锋', ''));
				}
			}else {
				//去除来源 边锋推他 的链接新窗口打开
				if (source_html && source_html.indexOf('/tuita') != -1) {
					$(this).find(".tag a:first").attr('target', '');
					$(this).find(".tag a:first").attr('href', '/');
				}
			}
			
			//重新构造HTML结构
			html_obj = $(this).find('.itemsDetails');
			feed_detail = html_obj.html();
			html_obj.html('<div class="rc1Hd"><span></span></div><div class="rc1Bd"><div class="arrowL"></div>'+feed_detail+'</div><div class="rc1Ft"><span></span></div>');
			
			//去除链接新窗口弹开功能
			sdid = $(this).find(".avatar-45 a:first").attr('href').substr($(this).find(".avatar-45 a:first").attr('href').lastIndexOf('/')+1);
			home_url = '/home/'+sdid;
			
			$(this).find(".avatar-45 a:first").attr('href', home_url); //更改头像链接
			$(this).find(".avatar-45 a:first").attr('target', ''); //去除新窗口弹开功能
			
			//修改推他内容标签里的链接
			$.each($(this).find(".rc1Bd .font14 a"), function(key, val) {
				home_url = $(this).attr('href');
				if (home_url.indexOf('bianfeng.') != -1) {
					sdid = home_url.substr(home_url.lastIndexOf('/') + 1);
					$(this).attr('target', '');
					$(this).attr('href', '/home/'+sdid);
				}
			});
			
			//修改粉丝动态内容里的链接
			$.each($(this).find(".rc1Bd .itemsBody a"), function(key, val) {
				home_url = $(this).attr('href');
				if (home_url.indexOf('bianfeng.') != -1) {
					sdid = home_url.substr(home_url.lastIndexOf('/') + 1);
					$(this).attr('target', '');
					$(this).attr('href', '/home/'+sdid);
				}
			});
			//特殊处理：当粉丝动态里只有一个粉丝信息时			
			if ($(this).find(".r:eq(1) img").length > 0) {
				home_url = $(this).find(".r:eq(1) a").attr('href');
				sdid = home_url.substr(home_url.lastIndexOf('/') + 1);
				
				$(this).find(".r:eq(1) a").attr('target', '');
				$(this).find(".r:eq(1) a").attr('href', '/home/'+sdid);
			}
			
			//修改转推里的链接
			zt_html_tuita_url = $(this).find(".ztBox").find(".tagText a:first").attr('href');
			if (zt_html_tuita_url) {
				$(this).find(".ztBox").find(".tagText a").attr('target', '');
				$(this).find(".ztBox").find(".tagText a").attr('href', zt_html_tuita_url.substr(zt_html_tuita_url.indexOf('/tuita/')).replace('/tuita', '/home'));
			}
			
			//更换心情名称:微小说=>给力, 龙之谷=>有木有, 泡泡战士=>高兴, 糖果美女=>伤不起
			html_obj = $(this).find('.mind:first');
			if (html_obj.length) {
				mood_name = html_obj.text();
				switch(mood_name) {
					case '微小说':
						html_obj.text('给力');
						break;
					case '龙之谷':
						html_obj.text('有木有');
						break;
					case '泡泡战士':
						html_obj.text('高兴');
						break;
					case '糖果美女':
						html_obj.text('伤不起');
						break;
				}
			}
			
			source_html = '';
			source_name = '';
			source_obj = null;
			html_obj = null;
			feed_detail = '';
			sdid = '';
			home_url = '';
			zt_html_tuita_url = '';
			mood_name = '';
		});
	}
	
};

if (typeof(snda) == 'undefined') snda = {};
if (typeof(snda.uclib) == 'undefined') snda.uclib = {};
if (typeof(snda.uclib.component) == 'undefined') snda.uclib.component = {};
$.registerNameSpace('snda.uclib.component');

snda.uclib.component.feed2 = {
	display: function(dom){
		$(dom).parent().next().toggle();
	}
};
$(document).ready(function() {
	//鼠标悬停显示删除功能事件
	//live在IE下会有闪烁问题 暂留
	/*$("#feed_ul li").live('mouseover', function() {
		$(this).addClass('cur');
	});
	
	$("#feed_ul li").live('mouseout', function() {
		$(this).removeClass('cur');
	});*/
	
	/*$("#feed_ul li").hover(function(){
			$(this).addClass('cur');
		},function(){
			$(this).removeClass('cur');
		});*/
	/*$("#feed_ul li").live("hover",function (ev) {
		if(ev.type == 'mouseover') {
			$(this).addClass("cur");
		}
		if(ev.type == 'mouseout') {
			$(this).removeClass("cur");
		}
	});*/
});

