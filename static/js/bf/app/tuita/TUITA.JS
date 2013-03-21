$.registerNameSpace('bf.app.tuita');

$.bf.app.tuita.page = 1;  //全局分页页码
$.bf.app.tuita.debug = true;
$.bf.app.tuita.in_progress = false;
$.bf.app.tuita.loading_img = '<img src="'+$.bf.config.getStaticPath()+'/img/loading.gif">';
$.bf.app.tuita.loading_html = '<br><div style="text-align:center;">'+$.bf.app.tuita.loading_img+'</div><br>';

//获取微博广场信息
$.bf.app.tuita.hotTuita = function(type, more, page) {
	more = parseInt(more);
	type = parseInt(type);
	page = parseInt(page);
	if (type != 2 && type != 3 && type != 4) {
		type = 0;
	}
	if (more != 0 && more != 1) {
		more = 0;
	}
	if (page) {
		if (page < 0) {
			page = 0;
		}
	}else {
		page = 0;
	}
	
	var more_html = '<a href="javascript:void(0);" class="moreActive" onclick="$.bf.app.tuita.hotTuita('+type+', 1, '+(page+1)+');"><span class="bg"><span class="iconArrow"></span>查看更多动态</span></a>';
	var sub_menu_html = '<a href="javascript:;" class="cur" id="submenu0" onclick="$.bf.app.tuita.hotTuita(0);">全部</a><em>|</em><a id="submenu3" href="javascript:;" onclick="$.bf.app.tuita.hotTuita(3);">视频</a><em>|</em><a id="submenu2" href="javascript:;" onclick="$.bf.app.tuita.hotTuita(2);">图片</a><em>|</em><a id="submenu4" href="javascript:;" onclick="$.bf.app.tuita.hotTuita(4);">转推</a>';
	var js_html = '<script>$("#interval_id").html(setInterval("$.bf.app.tuita.getNewTuita('+type+', false, \'guangchang\')", 30000))</script>';
	var prompt_message = '<span id="new_tuita_msg" class="mr10 red" style="display:none;" onclick="$.bf.app.tuita.getNewTuita(\'\', true, \'guangchang\');">有新动态，点击查看</span>';
	
	$(".submenu").html(sub_menu_html); //加载微博类型HTML
	$(".submenu a").removeClass('cur');
	$("#submenu"+type).addClass('cur');
	$("#more_tuita").html('');
	
	if (more == 0) {
		if (type == 0) {
			$("#new_msg_prompt").html(prompt_message);
		}
		$("#new_tuita_msg").hide(); //隐藏提示新消息
		$("#friends_tuita").removeClass('cur');
		$("#hot_tuita").addClass('cur');
		$("#tuita_list").html($.bf.app.tuita.loading_html);
		
		//删除定时器
		var interval_id = $("#interval_id").html();
		if (interval_id) {
			clearInterval(interval_id);
		}
	}else {
		$("#more_tuita").html($.bf.app.tuita.loading_img);
	}
	
	$.bf.ajax.request('/tuita/hotTuita', {type:type, more:more, page:page}, 
			function(data){
				if (more == 0) {
					$("#tuita_list").html(data);
					$("#more_tuita").html(more_html);					
					$("#interval").html(js_html);
				}else {
					if (data) {
						$("#tuita_list").append(data);
						$("#more_tuita").html(more_html);
					}else {
						$("#more_tuita").html('');
					}
				}
			},
			function(errno, msg) {
				if ($.bf.app.tuita.debug == true) {
					$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
				}else {
					$("#tuita_list").html('<br><div style="text-align:center;">系统忙，请稍候再试</div><br>');
				}
			}
	);
};

//获取微博广场最新信息
$.bf.app.tuita.getNewTuita = function(type, show, user_type) {
	//获取最新一条微博的ID
	if (user_type == 'friends') { //好友微博
		var time = $("#tuita_list li:first").attr("time");
		time = parseInt(time)+1;
	}else {//微博广场
		var tid = $("#tuita_list li:first").attr("id");
		//tid = '88e19a3ce7fa11dfaea3000c29a1cc9d';
		//console.log(tid);
	}
	
	if (show == true) {//显示新微博操作
		if ($("#new_tuita_msg").data("new_tuita_cache")) {//判断是否有缓存
			$("#tuita_list").prepend($("#new_tuita_msg").data("new_tuita_cache")); //显示新微博
			$("#new_tuita_msg").removeData("new_tuita_cache"); //删除缓存
			$("#new_tuita_msg").hide(); //隐藏提示信息
		}else {//没有缓存就从服务器读取
			if (user_type == 'friends') {
				$.bf.app.tuita.getNewFriendsTuita(time, type);
			}else {
				$.bf.app.tuita.getNewHotTuita(tid, type);
			}
		}
	}else {//检查是否有新微博
		if ($("#new_tuita_msg").css("display") == 'none') {
			if (user_type == 'friends') {
				if (! time) {
					var d = new Date();
					time = d.getTime();
				}
				$.bf.app.tuita.getNewFriendsTuita(time, type);
			}else {
				$.bf.app.tuita.getNewHotTuita(tid, type);
			}
		}
	}
};

//读取好友是否有新微博
$.bf.app.tuita.getNewFriendsTuita = function(time, type) {
	$.bf.ajax.request('/tuita/newFriendsTuita', {t:time, type:type}, 
			function(data) {
				if (data) {
					$("#new_tuita_msg").data("new_tuita_cache", data); //创建缓存
					$("#new_tuita_msg").show(); //显示提示信息
				}
			},
			function(errno, msg) {
				if ($.bf.app.tuita.debug == true) {
					$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
				}
			}
	);
};

//读取微博广场是否有新微博
$.bf.app.tuita.getNewHotTuita = function(tid, type) {
	$.bf.ajax.request('/tuita/newTuita', {tid:tid, type:type}, 
			function(data) {
				if (data) {
					$("#new_tuita_msg").data("new_tuita_cache", data); //创建缓存
					$("#new_tuita_msg").show(); //显示提示信息
				}
			},
			function(errno, msg) {
				if ($.bf.app.tuita.debug == true) {
					$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
				}
			}
	);
};


//获取好友微博
$.bf.app.tuita.friendsTuita = function(type, more) {	
	type = parseInt(type);
	more = parseInt(more);
	if (type != 2 && type != 3 && type != 4) {
		type = 0;
	}
	if (more != 1 && more != 0) {
		more = 0;
	}
	
	var more_html = '<a href="javascript:void(0);" class="moreActive" onclick="$.bf.app.tuita.friendsTuita('+type+', 1);"><span class="bg"><span class="iconArrow"></span>查看更多动态</span></a>';
	var sub_menu_html = '<a href="javascript:;" class="cur" id="submenu0" onclick="$.bf.app.tuita.friendsTuita(0);">全部</a><em>|</em><a id="submenu3" href="javascript:;" onclick="$.bf.app.tuita.friendsTuita(3);">视频</a><em>|</em><a id="submenu2" href="javascript:;" onclick="$.bf.app.tuita.friendsTuita(2);">图片</a><em>|</em><a id="submenu4" href="javascript:;" onclick="$.bf.app.tuita.friendsTuita(4);">转推</a>';
	var js_html = '<script>$("#interval_id").html(setInterval("$.bf.app.tuita.getNewTuita('+type+', false, \'friends\')", 30000))</script>';
	var prompt_message = '<span id="new_tuita_msg" class="mr10 red" style="display:none;" onclick="$.bf.app.tuita.getNewTuita(\'\', true, \'friends\');">有新动态，点击查看</span>';

	$(".submenu").html(sub_menu_html);
	$(".submenu a").removeClass('cur');
	$("#submenu"+type).addClass('cur');	
	$("#more_tuita").html('');
	
	var time = '';
	if (more == 0) {
		if (type == 0) {
			$("#new_msg_prompt").html(prompt_message);
		}
		$("#new_tuita_msg").hide(); //隐藏提示新消息
		$("#friends_tuita").addClass('cur');
		$("#hot_tuita").removeClass('cur');		
		$("#tuita_list").html($.bf.app.tuita.loading_html);
		
		//删除定时器
		var interval_id = $("#interval_id").html();
		if (interval_id) {
			clearInterval(interval_id);
		}
	}else {
		time = $("#tuita_list li:last").attr("time");
		$("#more_tuita").html($.bf.app.tuita.loading_img);
	}
	
	$.bf.ajax.request('/tuita/friendsTuita', {type:type, t:time, more:more}, 
			function(data){
				if (more == 0) {
					$("#tuita_list").html(data);
					if (data) {
						$("#more_tuita").html(more_html);
					}
					$("#interval").html(js_html);
				}else {
					if (data) {
						$("#tuita_list").append(data);
						$("#more_tuita").html(more_html);
					}else {
						$("#more_tuita").html('');
					}
				}
				$("#tuita_list li .r a").removeClass("iconItemClose");
				$.bf.common.Feed.deleteVSign('#tuita_list');
			},
			function(errno, msg) {
				$.bf.module.TxtTips.show($(".tabs:eq(0)"),'系统繁忙');
				//$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
				$("#tuita_list").html('<br><div style="text-align:center;"></div><br>');
				/*if ($.bf.app.tuita.debug == true) {
					alert(errno+':'+msg);
				}else {
					$("#tuita_list").html('<br><div style="text-align:center;">系统错误</div><br>');
				}*/
			}
	);
};





// bf2.1微博部分公共JS开始

//删除微博
$.bf.app.tuita.delTuita = function(tuita_id) {
	if (! tuita_id) {
		$.bf.module.Tooltip.show('微博ID不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	/*$.bf.ajax.request('/tuita/deleteTuita', {tid:tuita_id},
							function(result) {
								$("#feed_ul #"+tuita_id).fadeOut("normal", function(){
									$("#feed_ul #"+tuita_id).remove();
								});
							},
							function(errno, msg) {
								if ($.bf.app.tuita.debug == true) {
									$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
								}
							}
					   );*/
	
	$.bf.module.Confirm.show(
			{
			 title: '提示', 
			 message: '确定删除这条微博吗？',
			 onEnter: function() {
						$.bf.ajax.request('/tuita/deleteTuita', {tid:tuita_id},
							function(result) {
								$("#feed_ul #"+tuita_id).fadeOut('slow', function(){
									$("#feed_ul #"+tuita_id).remove();
								});
							},
							function(errno, msg) {
								if ($.bf.app.tuita.debug == true) {
									$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
								}
							}
					   );
					}
			}
			
	);
};

//删除转发，本页的原文的回应数减一
$.bf.app.tuita.updateTotalCount = function(tuita_id) {
	if (! tuita_id) {
		return false;
	}
	
	
};

// 踩、顶、快速转推 微博操作
$.bf.app.tuita.quickOpTuita = function(obj_this, type, tuita_id, tuita_sdid, ori_tid) {
	if (type != 'up' && type != 'down' && type != 'retransmit') {
		$.bf.module.TxtTips.show(obj_this,"操作类型不正确");
		//$.bf.module.Tooltip.show('操作类型不正确.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (! tuita_id) {
		$.bf.module.TxtTips.show(obj_this,"微博ID不能为空");
		//$.bf.module.Tooltip.show('微博ID不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (type == 'retransmit' && !tuita_sdid) {
		$.bf.module.TxtTips.show(obj_this,"微博的作者ID不能为空");
		//$.bf.module.Tooltip.show('微博的作者ID不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (! ori_tid) {
		ori_tid = '';
	}
	
	var retransmitText = '';
	if (type == 'retransmit' && ori_tid) {
		var fix = $.bf.app.tuita.getRetransmitTextFix(tuita_id);
		retransmitText = '转发' + fix;
	}
	
	var platform_id = 0;
	var app_id = '';
	var target = obj_this;
	var func = function(){
		//$.bf.app.tuita.updateOperationCount(obj_this, 'retransmitQuick'); return;//debug
		if ($.bf.app.tuita.in_progress) return;
		$.bf.app.tuita.in_progress = true;
		$.bf.ajax.request('/tuita/quickOpTuita', {tid:tuita_id, op:type, pid:platform_id, aid:app_id, sdid:tuita_sdid, otid:ori_tid, content:retransmitText}, 
				function(data) {
					if (type == 'retransmit') {
						$.bf.app.tuita.updateOperationCount(obj_this, 'retransmitQuick');
						//2 - 转发成功
						$.bf.module.PopTips.show(target,2,{},function (){
							$.bf.app.tuita.retransmitCb('feed_ul', data.tuita_html);
							$.bf.app.tuita.in_progress = false;
						});
						//$.bf.module.Tooltip.show('转发成功.', $.bf.ui.Tooltip.icons.OK);
					}else {
						$.bf.app.tuita.updateOperationCount(obj_this, type);
						//成功回应
						$.bf.module.PopTips.show(target,3);
						$.bf.app.tuita.in_progress = false;
						//
						//$.bf.module.Tooltip.show('您的回应已成功提交.', $.bf.ui.Tooltip.icons.OK);
					}
				},
				function(errno, msg) {
					$.bf.app.tuita.in_progress = false;
					if (type == 'retransmit') {
						$.bf.module.TxtTips.show(target,msg);
					}else {
						if (errno == 3 || errno == 4) {
							$.bf.module.TxtTips.show(target,"不要重复哦");
							//$.bf.module.Tooltip.show('您已回应了，请不要重复哦.', $.bf.ui.Tooltip.icons.ERROR);
						}else {
							$.bf.module.TxtTips.show(target,msg);
							//$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
						}
					}
				},'post'
		);
	};
	if(type=="retransmit"){
		//$.bf.module.Confirm.show({title:"快速转发",message:"确定要转发吗？",onEnter:func});
		func();
	}else{
		func();
	}
};

// 发表评论 微博操作
$.bf.app.tuita.showCommentForm = function(item_html_id, tuita_id, t_author) {// 显示评论框
	var obj_form = $(item_html_id).next('#commentForm');
	if (obj_form.length > 0) {
		obj_form.css("overflow","hidden").css({width:500,height:135}).animate({height:0},300,function(){$(this).css("overflow","");$(this).remove()});
		return false;
	}
	
	var ori_comment_count = parseInt($(item_html_id).find('#commentNum').text());
	var tuita_detail_url_html = '，<a href="'+$.bf.app.tuita.getTuitaDetailUrl(t_author, tuita_id, 'comment')+'" class="num">共<span id="commentCount">'+ori_comment_count+'</span>条评论<span class="ftsong">>></span></a>';
	if ($.bf.app.tuita.checkIsTuitaDetailPage()) {
		tuita_detail_url_html = '';
	}
	var form_html = '<div id="commentForm" style="" class="commentRepyBox">\
	                  	<!--<div class="arrow"></div>-->\
	                    <div class="boxT"><span></span></div>\
	                    <div class="boxC repyBox">\
	                      <h4>\
	                          <a href="javascript:;" onclick="$.bf.app.tuita.showCommentForm(\''+item_html_id+'\', \''+tuita_id+'\');return false;" class="r"><i class="iconClose"></i></a>\
	                          <p><span class="t999">评论原文</span>'+tuita_detail_url_html+'\
	                          <!-- <a href="javascript:;" onclick="$.bf.app.tuita.clearComment(this, \'comment\');return false;" class="clear"> [清空评论]</a> -->\
	                          </p>\
	                      </h4>\
	                      <div class="writeComment">\
	                        <div class="writeWrap">\
	                            <textarea class="text" id="commentText"></textarea>\
	                        </div>\
	                        <div class="writeBtn"><p class="r"><span class="restNum">还能输入<em><span id="commentWordCountLeft">256</span></em>字</span><a href="javascript:;" onclick="$.bf.app.tuita.submitComment(this, \''+tuita_id+'\', '+t_author+');return false;" class="writeCommentBtn"></a></p></div>\
	                        <div class="ttSame">\
	                            <a href="javascript:;" onclick="return false" id="atFriendBtn" class="ico iAT mr10"></a>\
	                          	<a href="javascript:;" onclick="return false" id="smileFace" class="smileFace mr15"></a>\
	                            <span class="zt">\
	                              <input type="checkbox" id="is_retransmit" class="checkbox" />\
	                              同时转发\
	                            </span>\
	                         </div>\
	                         <div class="clear"></div>\
	                      </div>\
	                    </div>\
	                    <div class="boxB"><span></span></div>\
	                  </div>';
	
	if ($.bf.app.tuita.checkIsTuitaDetailPage()) {
		if ($(item_html_id).next().attr('id') == 'retransmitForm') {
			$(item_html_id).next().remove();
		}
	}else {
		$(item_html_id).next().remove();
	}
	$(item_html_id).after(form_html);
	
	var obj = $(item_html_id).next('#commentForm');
	//alert(obj.length);
	//obj.css({visibility:"visible",width:484}).animate({height:135},300,function(){$(this).css("overflow","")});
	$.bf.app.tuita.createSmileFace(obj, obj.find('#commentText'));
	$.bf.app.tuita.createAt(obj.find('#commentText'), obj.find('#atFriendBtn'), obj.find('#commentWordCountLeft'));
	obj.find('#commentText').focus();
};

//清空评论
$.bf.app.tuita.clearComment = function(obj_this, type) {
	if (type == 'comment') {
		$(obj_this).parents('#commentForm').find('#commentText').val('');
	}else if (type == 'comment_reply') {
		
	}
};

//设置AT功能
$.bf.app.tuita.createAt = function(obj_textarea, obj_btn, obj_word_count_left) {
	$.bf.module.At.create(obj_textarea, obj_btn, obj_word_count_left);
};


//设置表情框
$.bf.app.tuita.createSmileFace = function(obj, obj_textarea) {
	var face_position_selecter_name = '#smileFace';
	var face = $.bf.ui.FaceBox.create(obj_textarea);
	var face_position = obj.find(face_position_selecter_name);
	
	face_position.click(function() {
		face.getDialog().toggle();
		face.initPosition(face_position, 'bottom');
	});
};

//设置微博详情页URL
$.bf.app.tuita.getTuitaDetailUrl = function(tuita_author, tuita_id, ext) {
	return '/home/tdetail/sdid/' + tuita_author + '/tid/' + tuita_id + '/tab/' + ext;
};

//obj_this onclick 所在HTML节点
//tuita_id 被评论的微博ID
//tuita_sdid 被评论的微博作者
//comment_id 被回复的评论ID
//comment_author 被回复的评论的作者
$.bf.app.tuita.showReplyCommentForm = function(obj_this, tuita_id, tuita_sdid, comment_id, comment_author) {// 显示回复评论框
	var obj_parent = $(obj_this).parents('.subItems');
	var obj_form = obj_parent.next('#replyCommentForm');
	
	if (obj_form.length > 0) {
		obj_form.remove();
		return false;
	}
	
	var pre_text = $.bf.app.tuita.getPrefixText(obj_this);
	
	var reply_comment_form_html = '<div id="replyCommentForm" class="writeComment subComment">\
                                	<!--<div class="arrow"></div>-->\
                                    <div class="writeWrap">\
                                        <textarea id="replyCommentText" class="text">'+pre_text+'</textarea>\
                                    </div>\
                                    <div class="writeBtn"><p class="r"><span class="restNum">还能输入<em><span id="commentWordCountLeft">256</span></em>字</span><a href="javascript:;" onclick="$.bf.app.tuita.submitComment(this, \''+tuita_id+'\', '+tuita_sdid+', \''+comment_id+'\', \''+comment_author+'\');return false;" class="writeCommentBtn"></a></p></div>\
                                    <div class="ttSame">\
                                        <a href="javascript:;" onclick="return false" id="atFriendBtn" class="ico iAT mr10"></a>\
                                        <a href="javascript:;" onclick="return false" id="smileFace" class="smileFace mr15"></a>\
                                        <span class="zt">\
                                          <input type="checkbox" id="is_retransmit" class="checkbox" />\
                                          同时转发\
                                        </span>\
                                     </div>\
                                     <div class="clear"></div>\
                                  </div>';
                                     
    var obj = obj_parent.parent().parent();
    obj.find('#replyCommentForm').remove();
    obj.find('#subRetransmitForm').remove();
    obj_parent.after(reply_comment_form_html);
    
    $.bf.app.tuita.movePointerToStart(obj.find('#replyCommentForm').find('#replyCommentText').get(0));
    
    $.bf.app.tuita.createSmileFace(obj.find('#replyCommentForm'), obj.find('#replyCommentForm').find('#replyCommentText'));
    $.bf.app.tuita.createAt(obj.find('#replyCommentForm').find('#replyCommentText'), obj.find('#atFriendBtn'), obj.find('#commentWordCountLeft'));
};

$.bf.app.tuita.getPrefixText = function(obj_this, type) {//获取转发评论、回复评论时，获取初始化发表框的内容的文本
	var comment_sender = '';
	var comment_text = '';
	var comment_faces = '';
	var pre_text = '';
	var obj_form = null;
	
	if (type == 'comment') {
		obj_form = $(obj_this).parents('#replyCommentForm').prev('#commentListItem');
		comment_sender = obj_form.find('#commentSender').text();
		comment_text = obj_form.find('#commentContent').html();
		comment_faces = obj_form.find('#commentContent').find('img');
	}else if (type == 'retransmit') {
		obj_form = $(obj_this).parents('#subRetransmitForm').prev('#commentListItem');
		comment_sender = obj_form.find('#commentSender').text();
		comment_text = obj_form.find('#commentContent').html();
		comment_faces = obj_form.find('#commentContent').find('img');
	}else {
		comment_sender = $(obj_this).parents('#commentListItem').find('#commentSender').text();
		comment_text = $(obj_this).parents('#commentListItem').find('#commentContent').html();
		comment_faces = $(obj_this).parents('#commentListItem').find('#commentContent').find('img');
	}
	
	comment_text = $.bf.app.tuita.TextFixConvertToText(comment_text, comment_faces);	
	pre_text = '||@' + comment_sender + '：' + comment_text;
	
	return pre_text;
};

//发表评论回调函数
$.bf.app.tuita.submitCommentCb = function(tuita_id, tuita_sdid, data, comment_id) {
	var comment_html = '';
	var d = null;
	var str_d = '';

	var c = data;
	d = new Date(c.adddate*1000);
	str_d = (d.getMonth()+1)+'月'+d.getDate()+'日 '+d.getHours()+':'+d.getMinutes();
	
	comment_html += '<div class="plBox">\
                        <div id="commentListItem" class="subItems">\
                        	<div class="subCon"><span class="author"><a id="commentSender" href="/'+c.sender+'">'+c.nick+'</a>：&nbsp;</span><span id="commentContent" class="topic">'+c.content+'</span></div>\
                            <div class="tags cursor">\
	                            <p class="tagText r">\
	                                <a href="javascript:;" onclick="$.bf.app.tuita.showSubRetransmitForm(this, \''+tuita_id+'\', '+tuita_sdid+');return false;" class="icoZ">转发</a><em>|</em><a href="javascript:;" onclick="$.bf.app.tuita.showReplyCommentForm(this, \''+tuita_id+'\', '+tuita_sdid+', \''+c.cid+'\', '+c.sender+');return false;" class="icoComment" name="getCommentTopic">评论</a>\
	                            </p>\
	                            <span class="t999 date">'+str_d+'</span>\
	                            <span class="t999 from">来自'+c.source+'</span>\
                            </div>\
                        </div>\
                      </div>';
	
	d = null;
	
	var obj = $('li[id="'+tuita_id+'"]').find('#commentList');
	if (obj.length > 0) {
		var comment_total_count = parseInt($('li[id="'+tuita_id+'"]').find('#commentNumInCommentTab').text());
		if (comment_total_count-1 > 0) {
			obj.find('#listArea').prepend(comment_html);
		}else {
			obj.find('#listArea').html(comment_html);
		}
	}
};

$.bf.app.tuita.submitComment = function(obj, tid, t_author, comment_id, comment_author) {// 提交评论
	var max_comment_length = 256;  //评论最多字符数
	var comment_item_html_id = '';
	var is_retransmit_html_id = '';
	var obj_form_html_id = '';
	var request_url = '';
	var target = obj;
	
	if (comment_id) {// 回复评论
		obj_form_html_id = '#replyCommentForm';
		comment_item_html_id = '#replyCommentText';
		is_retransmit_html_id = '#is_retransmit';
		
		request_url = '/comment/replyComment';
	}else {// 发表评论
		obj_form_html_id = '#commentForm';
		comment_item_html_id = '#commentText';
		is_retransmit_html_id = '#is_retransmit';
		comment_id = '';
		
		request_url = '/comment/addComment';
	}
	
	var obj_form = $(obj).parents(obj_form_html_id);
	var commentText = obj_form.find(comment_item_html_id).val();
	var is_retransmit = obj_form.find(is_retransmit_html_id).attr('checked');
	if (is_retransmit) {
		is_retransmit = 1;
	}else {
		is_retransmit = 0;
	}
	t_author = parseInt(t_author);
	/*if (comment_id) {
		var pre_text = $.bf.app.tuita.getPrefixText(obj, 'comment');
		commentText = commentText.replace(pre_text, '');
	}*/
	if (comment_id) {
		comment_author = parseInt(comment_author);
	}else {
		comment_author = parseInt(t_author);
	}
	
	if (! commentText) {
		$.bf.module.TxtTips.show(target,'评论内容不能为空');
		//$.bf.module.Tooltip.show('评论内容不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		obj_form.find('#commentText').focus();
		return false;
	}else {
		if (commentText.length > max_comment_length) {
			$.bf.module.TxtTips.show(target,'评论内容不能超过'+max_comment_length+'个字符');
			//$.bf.module.Tooltip.show('评论内容不能超过'+max_comment_length+'个字符.', $.bf.ui.Tooltip.icons.ERROR);
			obj_form.find('#commentText').focus();
			return false;
		}
	}
	if (! tid) {
		$.bf.module.TxtTips.show(target,'微博ID不能为空');
		//$.bf.module.Tooltip.show('微博ID不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (t_author <= 0) {
		$.bf.module.TxtTips.show(target,'微博作者不能为空');
		//$.bf.module.Tooltip.show('接收者不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (comment_id && !comment_author) {
		$.bf.module.TxtTips.show(target,'评论作者不能为空');
		return false;
	}
	//$.bf.app.tuita.updateOperationCount(obj, 'comment', 'retransmit'); return //debug
	//$.bf.app.tuita.updateOperationCount(obj, 'replyComment', 'retransmit'); return; //debug
	$.bf.ajax.request(request_url, {tauthor:t_author, tid:tid, content:commentText, repost:is_retransmit, cid:comment_id, cauthor:comment_author},
			function(result) {
				
				//更新转推数、评论数
				if (is_retransmit == 1) {
					if (comment_id) {
						$.bf.app.tuita.updateOperationCount(obj, 'replyComment', 'retransmit');
					}else {
						$.bf.app.tuita.updateOperationCount(obj, 'comment', 'retransmit');
					}
				}else {
					if (comment_id) {
						$.bf.app.tuita.updateOperationCount(obj, 'replyComment');
					}else {
						$.bf.app.tuita.updateOperationCount(obj, 'comment');
					}
				}
				
				//回应框内评论
				var subs = false;
				//弹出层校准目标
				var _target = $(target).parents("#commentForm").prev().find("#showCommentFormBtn");
				var offsetTop = $.bf.app.tuita.checkIsTuitaDetailPage() ? 0 : 0;
				if(_target.length==0){
					subs = true;
					_target = $(target).parents("#replyCommentForm").prev().find(".icoComment");
					offsetTop = 0;//$(target).parents("#replyCommentForm").height()+5;
					if($(target).parents("#replyCommentForm").css("display")=="none"){
						offsetTop -= $(target).parents("#replyCommentForm").height();
					}
					//var isIE6=!!window.ActiveXObject&&!window.XMLHttpRequest;
					//var offsetLeft = isIE6?40:0;
					//offsetTop += isIE6?-50:0;
				}
				//评论按钮
				$.bf.module.PopTips.show(_target,1,{top:offsetTop},function(){
					$.bf.app.tuita.checkIsTuitaDetailPage() && $.bf.app.tuita.submitCommentCb(tid, t_author, result, comment_id);
					if (comment_id) {
						obj_form.css("overflow","hidden").css({width:478,height:135}).animate({height:0},300,function(){$(this).css("overflow","");});
					}else {
						if ($.bf.app.tuita.checkIsTuitaDetailPage()) {
							obj_form.find('#commentText').val('');
							obj_form.find('#is_retransmit').attr('checked', false);	
						}else {
							obj_form.css("overflow","hidden").css({width:478,height:135}).animate({height:0},300,function(){$(this).css("overflow","");});
						}						
					}
					obj_form.remove();
				});
				//(subs || !$.bf.app.tuita.checkIsTuitaDetailPage()) && obj_form.delay(200).remove();
				obj_form.delay(200).remove();
				//$.bf.module.Tooltip.show('发表成功.', $.bf.ui.Tooltip.icons.OK);
			},
			function(errno, msg) {
				if (errno == 1008 || errno == 1007) {
					$.bf.module.TxtTips.show(target,msg);
					//$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
				}else {
					$.bf.module.TxtTips.show(target,"系统繁忙");
					//$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
				}
			},'post'
	);
};

//光标定位到开始位置
$.bf.app.tuita.movePointerToStart = function(element,pos){
	pos = +pos;
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
};

// 通用转发 微博操作
$.bf.app.tuita.showRetransmitForm = function(item_html_id, tuita_id, tuita_sdid, is_retransmit) {// 显示转发框
	var obj_form = $(item_html_id).next('#retransmitForm');
	if (obj_form.length > 0) {
		obj_form.css("overflow","hidden").css({width:500,height:135}).animate({height:0},300,function(){$(this).css("overflow","");$(this).remove()});
		return false;
	}
	
	var ori_retransmit_count = parseInt($(item_html_id).find('#retransmitNum').text());
	var tuita_detail_url_html = '<p><span class="t999">转发原文，</span><a href="'+$.bf.app.tuita.getTuitaDetailUrl(tuita_sdid, tuita_id, 'retransmit')+'" class="num">共<span id="retransmitCount">'+ori_retransmit_count+'</span>条转发<span class="ftsong">>></span></a></p>';
	if ($.bf.app.tuita.checkIsTuitaDetailPage()) {
		tuita_detail_url_html = '<p><span class="t999">通用转发，顺便说几句</span></p>';
	}
	
	var retransmitTextFix = '';
	if (is_retransmit) {
		retransmitTextFix = $.bf.app.tuita.getRetransmitTextFix(tuita_id);
	}
	
	var form_html = '<div id="retransmitForm" class="commentRepyBox ZFBox">\
	                  	<!--<div class="arrow"></div>-->\
	                    <div class="boxT"><span></span></div>\
	                    <div class="boxC repyBox">\
	                      <h4><a href="javascript:;" onclick="$.bf.app.tuita.showRetransmitForm(\''+item_html_id+'\', \''+tuita_id+'\', '+tuita_sdid+');return false;" class="r"><i class="iconClose"></i></a>'+tuita_detail_url_html+'\
	                      </h4>\
	                      <div class="writeComment">\
	                        <div class="writeWrap">\
	                            <textarea id="retransmitText" class="text">'+retransmitTextFix+'</textarea>\
	                        </div>\
	                        <div class="writeBtn"><p class="r"><span class="restNum">还能输入<em><span id="commentWordCountLeft">256</span></em>字</span><a href="javascript:;" onclick="$.bf.app.tuita.retransmitTuita(this, '+tuita_sdid+', \''+tuita_id+'\', false, '+is_retransmit+');return false;" class="writeZfBtn"></a></p></div>\
	                        <div class="ttSame">\
	                            <a href="javascript:;" onclick="return false" id="atFriendBtn" class="ico iAT mr10"></a>\
	                          	<a href="javascript:;" onclick="return false" id="smileFace" class="smileFace mr15"></a>\
	                        </div>\
	                        <div class="clear"></div>\
	                      </div>\
	                    </div>\
	                    <div class="boxB"><span></span></div>\
	                  </div>';
	                    
    if ($.bf.app.tuita.checkIsTuitaDetailPage()) {
    	if ($(item_html_id).next('#commentForm').length > 0) {
    		$(item_html_id).next().remove();
    	}
    }else {
    	$(item_html_id).next().remove();
	}
	$(item_html_id).after(form_html);
	
	var obj = $(item_html_id).next('#retransmitForm');
	
	$.bf.app.tuita.movePointerToStart(obj.find('#retransmitText').get(0));
	
	//obj.css("overflow","hidden").css({visibility:"visible",width:484,height:0}).animate({height:135},300,function(){$(this).css("overflow","");});
	$.bf.app.tuita.createSmileFace(obj, obj.find('#retransmitText'));
	$.bf.app.tuita.createAt(obj.find('#retransmitText'), obj.find('#atFriendBtn'), obj.find('#commentWordCountLeft'));
	obj.find('#retransmitText').focus();
};

$.bf.app.tuita.showSubRetransmitForm = function(obj_this, tuita_id, tuita_sdid) {// 显示评论列表处的转发框
	var obj_parent = $(obj_this).parents('.subItems');
	var obj_form = obj_parent.next('#subRetransmitForm');
	
	if (obj_form.length > 0) {
		obj_form.remove();
		return false;
	}
	
	var pre_text = $.bf.app.tuita.getPrefixText(obj_this);
	
	var sub_retransmit_form_html = '<div id="subRetransmitForm" class="writeComment subZF">\
                                    	<!--<div class="arrow"></div>-->\
                                        <div class="writeWrap">\
                                            <textarea id="subRetransmitText" class="text">'+pre_text+'</textarea>\
                                        </div>\
                                        <div class="writeBtn"><p class="r"><span class="restNum">还能输入<em><span id="commentWordCountLeft">256</span></em>字</span><a href="javascript:;" onclick="$.bf.app.tuita.retransmitTuita(this, '+tuita_sdid+', \''+tuita_id+'\', true);return false;" class="writeZfBtn"></a></p></div>\
                                        <div class="ttSame">\
                                            <a href="javascript:;" onclick="return false" id="atFriendBtn" class="ico iAT mr10"></a>\
                                            <a href="javascript:;" onclick="return false" id="smileFace" class="smileFace mr15"></a>\
                                        </div>\
                                        <div class="clear"></div>\
                                      </div>';
    
    var obj = obj_parent.parent().parent();
    obj.find('#subRetransmitForm').remove();
    obj.find('#replyCommentForm').remove();
    obj_parent.after(sub_retransmit_form_html);
    
    $.bf.app.tuita.movePointerToStart(obj.find('#subRetransmitForm').find('#subRetransmitText').get(0));
    
    $.bf.app.tuita.createSmileFace(obj.find('#subRetransmitForm'), obj.find('#subRetransmitForm').find('#subRetransmitText'));
    $.bf.app.tuita.createAt(obj.find('#subRetransmitForm').find('#subRetransmitText'), obj.find('#subRetransmitForm').find('#atFriendBtn'), obj.find('#subRetransmitForm').find('#commentWordCountLeft'));
};

//转发评论、回复评论带上的原内容里的表情转符号、短域名转回原始URL、@nick去除链接
$.bf.app.tuita.TextFixConvertToText = function(input_content, obj_content_img) {
	var re = '';
	//表情转对应的文字符号
	if (obj_content_img && obj_content_img.length > 0) {
		var arr_face_text = [];
		$.each(obj_content_img, function() {
			arr_face_text[arr_face_text.length] = $(this).attr('title');
		});
		
		re = new RegExp('<img .*?>', 'ig');
		var matches = input_content.match(re);
		$.each(matches, function(key, val) {
			input_content = input_content.replace(val, '[' + arr_face_text[key] + ']');
		});
	}
	
	//@去除链接
	re = new RegExp('<a href=.*?>(@.*?)</a>', 'ig');
	var matches_at = input_content.match(re);
	if (matches_at && matches_at.length > 0) {
		var arr_user_nick = [];
		var re_nick = new RegExp('<a href=.*?>(@.*?)</a>', 'i');
		$.each(matches_at, function(k, at_html) {
			arr_user_nick = at_html.match(re_nick);
			input_content = input_content.replace(at_html, arr_user_nick[1]);
		});
	}
	
	//短域名转为真实URL
	re = new RegExp('<a .+>.+</a>', 'ig');
	var matches_shorturl = input_content.match(re);
	if (matches_shorturl && matches_shorturl.length > 0) {
		var arr_ori_url = [];
		var re_url = new RegExp('<a .+ href="(.+)">.+</a>', 'i');
		$.each(matches_shorturl, function(index, value) {
			arr_ori_url = value.match(re_url);
			input_content = input_content.replace(value, arr_ori_url[1]);
		});
	}
	
	return input_content;
};

//获取转发前缀文本
$.bf.app.tuita.getRetransmitTextFix = function(tuita_id) {
	if (! tuita_id) {
		return false;
	}
	
	var weibo_content = '', weibo_author = '';
	var obj = $('li[id="'+tuita_id+'"]');
	
	weibo_content = obj.find('#weiboContent').html();
	
	var weibo_faces = obj.find('#weiboContent').find('img');
	weibo_content = $.bf.app.tuita.TextFixConvertToText(weibo_content, weibo_faces);	
	weibo_author = obj.find('#weiboAuthorNick').text();
	var fix = '||' + '@' + weibo_author + '：' + weibo_content;
	
	return fix;
};

$.bf.app.tuita.retransmitTuita = function(obj, sdid, tid, from_comment, is_retransmit) {// 提交转发
	var obj_form = null;
	var retransmitText = '';
	var target = obj;
	if (from_comment == true) {
		obj_form = $(obj).parents('#subRetransmitForm');
		retransmitText = obj_form.find('#subRetransmitText').val();
	}else {
		obj_form = $(obj).parents('#retransmitForm');
		retransmitText = obj_form.find('#retransmitText').val();
	}
	sdid = parseInt(sdid);
	if (! tid) {
		$.bf.module.Tooltip.show('被转发的微博ID不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (! sdid) {
		$.bf.module.Tooltip.show('被转发的微博作者ID不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (! retransmitText) {
		/*$.bf.module.Tooltip.show('转发理由不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		obj_form.find('#retransmitText').focus();
		return false;*/
		retransmitText = '转发';
	}else {
		if (is_retransmit) {
			var fix = $.bf.app.tuita.getRetransmitTextFix(tid);
			if (fix == retransmitText) {
				retransmitText = '转发 ' + retransmitText;
			}
		}
	}
	
	var source_app_id = 0;
	//$.bf.app.tuita.updateOperationCount(obj, 'retransmit'); return; //debug
	//$.bf.app.tuita.updateOperationCount(obj, 'subRetransmit'); return; //debug
	
	if ($.bf.app.tuita.in_progress) return;
	$.bf.app.tuita.in_progress = true;
	$.bf.ajax.request('/tuita/repostTuita', {tid:tid, sdid:sdid, content:retransmitText, pid:0, source:source_app_id, is_comment:0}, 
			function(result){
				if (from_comment) {
					$.bf.app.tuita.updateOperationCount(obj, 'subRetransmit');
					!$.bf.app.tuita.checkIsTuitaDetailPage() && obj_form.css("overflow","hidden").css({width:478,height:135}).animate({height:0},300,function(){$(this).css("overflow","");});
				}else {
					$.bf.app.tuita.updateOperationCount(obj, 'retransmit');
					if ($.bf.app.tuita.checkIsTuitaDetailPage()) {
						obj_form.find('#retransmitText').val('');
					}else {
						obj_form.css("overflow","hidden").css({width:478,height:135}).animate({height:0},300,function(){$(this).css("overflow","");});
					}
				}
				//回应框内转发
				var subs = false;
				//弹出层校准目标
				var _target = $(target).parents("#retransmitForm").prev().find("#retransmitOpList a:eq(0)");
				var offsetTop = $.bf.app.tuita.checkIsTuitaDetailPage() ? 0 : 0;
				if(_target.length==0){
					subs = true;
					_target = $(target).parents("#subRetransmitForm").prev().find(".icoZ");
					// offsetTop = $.bf.app.tuita.checkIsTuitaDetailPage() ? 0:$(target).parents("#subRetransmitForm").height()-5;
					
					//var isIE6=!!window.ActiveXObject&&!window.XMLHttpRequest;
					//var offsetLeft = isIE6?40:0;
					//offsetTop += isIE6?-50:0;
				}
				//转发按钮
				$.bf.module.PopTips.show(_target,2,{top:offsetTop},function(){
					$.bf.app.tuita.retransmitCb('feed_ul', result.tuita_html);
					obj_form.remove();
					$.bf.app.tuita.in_progress = false;
				});
				//回应中或微博列表中删除转推框
				//(subs || !$.bf.app.tuita.checkIsTuitaDetailPage())&& obj_form.delay(200).remove();
				obj_form.delay(200).remove();
				//$.bf.module.Tooltip.show('转发成功.', $.bf.ui.Tooltip.icons.OK);
			},
			function(errno, msg) {
				$.bf.app.tuita.in_progress = false;
				if (errno == -13) {
					$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
				}else {
					$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
				}
			}
	);
	
};

//转发回调函数
$.bf.app.tuita.retransmitCb = function(weibo_parent_html_id, tuita_html) {
	try {
		$('#temp_tuita_feed').html(tuita_html);
		var new_li = $('#temp_tuita_feed').html().replace('<li ', '<li style="display:none;" ');
		$('#temp_tuita_feed').html('');
		
		$('#feed_ul').prepend(new_li);
		$('#feed_ul li:first').fadeIn('slow');
		
		//更新活动页面微博条数
		if ($('#shareTotalCount').length > 0) {
			var share_total_count = parseInt($('#shareTotalCount').text());
			share_total_count++;
			$('#shareTotalCount').text(share_total_count);
		}
	}catch(e) {
		
	}
};

// 更新踩、顶、评论、转发计数
$.bf.app.tuita.updateOperationCount = function(obj_this, update_type, ext) {
	switch (update_type) {
		case 'comment':
			var obj_form = $(obj_this).parents('#commentForm');
			var obj_count = obj_form.prev().find('#commentNum');
			var obj_total_count = obj_form.prev().find('#totalOperationCount');
			var comment_count = parseInt(obj_count.text()) + 1;
			var total_count = parseInt(obj_total_count.text()) + 1;
			
			if (ext == 'retransmit') {
				var obj_retransmit_count = obj_form.prev().find('#retransmitNum');
				var retransmit_count = parseInt(obj_retransmit_count.text()) + 1;
				
				total_count++;
				obj_retransmit_count.text(retransmit_count);
			}
			
			obj_count.text(comment_count);
			obj_form.find('#commentCount').text(comment_count);
			obj_total_count.text(total_count);
			
			//如果评论列表是展开的，还需要更新相关属性
			var obj_comment_list = obj_form.parent().find('#commentList');
			if (obj_comment_list.length > 0) {
				obj_comment_list.find('#commentNumInCommentTab').text(comment_count);
				if (ext == 'retransmit') {
					obj_comment_list.find('#retransmitNumInCommentTab').text(retransmit_count);
					obj_comment_list.find('#totalNumInCommentTab').text(total_count);
				}
			}
			break;
		case 'replyComment':
			var obj_comment_list = $(obj_this).parents('#commentList');
			var obj = obj_comment_list.parent();
			
			var obj_total = obj.find('#totalOperationCount');
			var total_count = parseInt(obj_total.text()) + 1;
			var obj_comment_count = obj.find('#commentNum');
			var comment_count = parseInt(obj_comment_count.text()) + 1;
			obj_comment_count.text(comment_count);
			
			obj_comment_list.find('#commentNumInCommentTab').text(comment_count);			
			
			if (ext == 'retransmit') {
				var obj_retransmit_count = obj.find('#retransmitNum');
				var retransmit_count = parseInt(obj_retransmit_count.text()) + 1;
				obj_retransmit_count.text(retransmit_count);
				
				obj_comment_list.find('#retransmitNumInCommentTab').text(retransmit_count);
				
				total_count++;
			}
			obj_total.text(total_count);
			obj_comment_list.find('#totalNumInCommentTab').text(total_count);
			break;
		case 'retransmit':
			var obj_form = $(obj_this).parents('#retransmitForm');
			var obj_count = obj_form.prev().find('#retransmitNum');
			var obj_total_count = obj_form.prev().find('#totalOperationCount');
			var retransmit_count = parseInt(obj_count.text()) + 1;
			var total_count = parseInt(obj_total_count.text()) + 1;
			
			obj_count.text(retransmit_count);
			obj_form.find('#retransmitCount').text(retransmit_count);
			obj_total_count.text(total_count);
			
			//如果评论列表是展开的，还需要更新相关属性
			var obj_comment_list = obj_form.parent().find('#commentList');
			if (obj_comment_list.length > 0) {
				obj_comment_list.find('#retransmitNumInCommentTab').text(retransmit_count);
				obj_comment_list.find('#totalNumInCommentTab').text(total_count);
			}
			break;
		case 'subRetransmit':
			var obj_comment_list = $(obj_this).parents('#commentList');
			var obj = obj_comment_list.parent();
			var obj_total = obj.find('#totalOperationCount');
			var total_count = parseInt(obj_total.text()) + 1;
			obj_total.text(total_count);
			
			var obj_retransmit_count = obj.find('#retransmitNum');
			var retransmit_count = parseInt(obj_retransmit_count.text()) + 1;
			obj_retransmit_count.text(retransmit_count);
			
			obj_comment_list.find('#retransmitNumInCommentTab').text(retransmit_count);
			obj_comment_list.find('#totalNumInCommentTab').text(total_count);
			break;
		case 'up':
			var obj_total_count = $(obj_this).parent().parent().parent();
			var total_count = parseInt(obj_total_count.find('#totalOperationCount').text()) + 1;
			obj_total_count.find('#totalOperationCount').text(total_count);
			var up_count = parseInt(obj_total_count.find('#upNum').text()) + 1;
			obj_total_count.find('#upNum').text(up_count);
			//如果评论列表是展开的，还需要更新相关属性
			if (obj_total_count.find('#commentList').length > 0) {
				obj_total_count.find('#commentList').find('#upNumInCommentTab').text(up_count);
				obj_total_count.find('#commentList').find('#totalNumInCommentTab').text(total_count);
			}
			break;
		case 'down':
			var obj_total_count = $(obj_this).parent().parent().parent();
			var total_count = parseInt(obj_total_count.find('#totalOperationCount').text()) + 1;
			obj_total_count.find('#totalOperationCount').text(total_count);
			var down_count = parseInt(obj_total_count.find('#downNum').text()) + 1;
			obj_total_count.find('#downNum').text(down_count);
			//如果评论列表是展开的，还需要更新相关属性
			if (obj_total_count.find('#commentList').length > 0) {
				obj_total_count.find('#commentList').find('#downNumInCommentTab').text(down_count);
				obj_total_count.find('#commentList').find('#totalNumInCommentTab').text(total_count);
			}
			break;
		case 'retransmitQuick':
			var obj = $(obj_this).parent().parent().parent();
			var obj_retransmit_count = obj.find('#retransmitNum');
			var retransmit_count = parseInt(obj_retransmit_count.text()) + 1;
			var obj_total_count = $(obj_this).parent().parent().parent().parent().find('#totalOperationCount');
			var total_count = parseInt(obj_total_count.text()) + 1;
			
			obj_retransmit_count.text(retransmit_count);
			obj_total_count.text(total_count);
			//如果微博框、评论列表是展开的，还需要更新相关属性
			var obj = $(obj_this).parent().parent().parent().parent().parent();
			if (obj.find('#commentList').length > 0) {
				obj.find('#commentList').find('#retransmitNumInCommentTab').text(retransmit_count);
				obj.find('#commentList').find('#totalNumInCommentTab').text(total_count);
			}
			
			if (obj.parent().parent().find('#retransmitForm').length > 0) {
				obj.parent().parent().find('#retransmitCount').text(retransmit_count);
			}
			break;
		default:
			break;
	}
};

//获取微博的评论列表
$.bf.app.tuita.getTuitaCommentList = function(obj_this, tuita_id, tuita_sdid, page) {
	if (! tuita_id) {
		return false;
	}
	
	var obj_form = null;
	obj_form = $(obj_this).next('#commentList');
	if (obj_form.length <= 0) {
		obj_form = $(obj_this).parents('#commentList');
	}
	
	if (obj_form.find('#commentListTab').attr('class') == 'cur' && page == 0) {
		return false;
	}
	if (page <= 0) {
		page = 1;
	}
	
	$.bf.app.tuita.setCommentListTabStyle(obj_form, 'comment');

	obj_form.find('#listArea').html($.bf.app.tuita.loading_html);
	$.bf.ajax.request('/tuita/getTuitaComment', {tid:tuita_id, sdid:tuita_sdid, page:page},
			function(data){
				if (data.rows == null) {
					obj_form.find('#listArea').html('<span class="blank">暂时没有评论.</span>');
					return false;
				}else {
					var comment_html = '';
					var d = null;
					var str_d = '';
					$.each(data.rows, function(key, c) {
						d = new Date(c.adddate*1000);
						str_d = (d.getMonth()+1)+'月'+d.getDate()+'日 '+d.getHours()+':'+d.getMinutes();
						
						comment_html += '<div class="plBox">\
					                        <div id="commentListItem" class="subItems">\
					                        	<div class="subCon"><span class="author"><a id="commentSender" href="/'+c.sender+'">'+c.nick+'</a>：&nbsp;</span><span id="commentContent" class="topic">'+c.content+'</span></div>\
					                        	<div class="tags cursor">\
						                            <p class="tagText r">\
						                                <a href="javascript:;" onclick="$.bf.app.tuita.showSubRetransmitForm(this, \''+tuita_id+'\', '+tuita_sdid+');return false;" class="icoZ">转发</a><em>|</em><a href="javascript:;" onclick="$.bf.app.tuita.showReplyCommentForm(this, \''+tuita_id+'\', '+tuita_sdid+', \''+c.cid+'\', '+c.sender+');return false;" class="icoComment" name="getCommentTopic">评论</a>\
						                            </p>\
						                            <span class="t999 date">'+str_d+'</span>\
						                            <span class="t999 from">来自'+c.source+'</span>\
					                            </div>\
					                        </div>\
					                      </div>';
					});
					
					d = null;
					obj_form.find('#listArea').html(comment_html);
					obj_form.find('#pageMenuArea').html(data.page_menu);
				}
			},
			function(errno, msg) {
				obj_form.find('#listArea').html(errno + ':' + msg);
				//$.bf.module.Tooltip.show(errno + ':' + msg, $.bf.ui.Tooltip.icons.ERROR);
			}
	);
};

// 设置回应列表各TAB样式
$.bf.app.tuita.setCommentListTabStyle = function(obj_form, type) {
	
	obj_form.find('#commentTabList li').removeClass('cur');
	
	switch(type) {
		case 'up':
			obj_form.find('#upListTab').addClass('cur');
			break;
		case 'down':
			obj_form.find('#downListTab').addClass('cur');
			break;
		case 'retransmit':
			obj_form.find('#retransmitListTab').addClass('cur');
			break;
		case 'comment':
			obj_form.find('#commentListTab').addClass('cur');
			break;
	}
	
};

// 获取微博的踩、顶、转发的用户列表
$.bf.app.tuita.getQuickOpUserList = function(obj_this, tuita_id, page, type) {
	if (! tuita_id) {
		return false;
	}
	
	var obj_form = null;
	obj_form = $(obj_this).parents('#commentList');
	
	if (obj_form.find('#'+type+'ListTab').attr('class') == 'cur' && page == 0) {
		return false;
	}
	
	if (page <= 0) {
		page = 1;
	}
	
	$.bf.app.tuita.setCommentListTabStyle(obj_form, type);
	
	var request_url = '';
	var no_msg = '';
	switch (type) {
		case 'up':
			request_url = '/tuita/getUpUserList';
			no_msg = '暂时没有人顶.';
			break;
		case 'down':
			request_url = '/tuita/getDownUserList';
			no_msg = '暂时没有人踩.';
			break;
		case 'retransmit':
			request_url = '/tuita/getRetransmitUserList';
			no_msg = '暂时没有人转发.';
			break;
		default:
			return false;
			break;
	}

	obj_form.find('#listArea').html($.bf.app.tuita.loading_html);
	$.bf.ajax.request(request_url, {tid:tuita_id, page:page}, 
		function(data) {			
			if (data.total_count == 0) {
				obj_form.find('#listArea').html('<span class="blank">' + no_msg + '</span>');
				obj_form.find('#pageMenuArea').html(data.page_menu);
				return false;
			}
			
			var list_html = '';
			$.each(data.list, function(key, v) {
				list_html += '<div class="plBox">\
					            <div class="subItems">\
					                <a href="/'+v.sdid+'">'+v.nick+': </a><span class="topic"></span>\
					                <span class="t999 date">'+v.add_time+'</span>\
					                <span class="t999 from">来自'+v.platform+'</span>\
					            </div>\
					          </div>';
			});
			
			obj_form.find('#listArea').html(list_html);
			obj_form.find('#pageMenuArea').html(data.page_menu);
		}, 
		function(errno, msg) {
			//$.bf.module.Tooltip.show(errno + ':' + msg, $.bf.ui.Tooltip.icons.ERROR);
			var err_msg = errno + ':' + msg;
			obj_form.find('#listArea').html(err_msg);
		}, 'post'
	);
};

//判断是否在微博详情页
$.bf.app.tuita.checkIsTuitaDetailPage = function() {
	if (window.location.href.indexOf('/tdetail/sdid/') != -1) {
		return true;
	}
	
	return false;
};

// 显示评论列表
$.bf.app.tuita.getCommentList = function(item_html_id, tuita_id, tuita_sdid) {
	var obj_form = $(item_html_id).next('#commentList');
	if (obj_form.length > 0) {
		obj_form.remove();
		return false;
	}
	
	var ori_comment_count = parseInt($(item_html_id).find('#commentNum').text());
	var ori_retransmit_count = parseInt($(item_html_id).find('#retransmitNum').text());
	var ori_up_count = parseInt($(item_html_id).find('#upNum').text());
	var ori_down_count = parseInt($(item_html_id).find('#downNum').text());
	var total_count = parseInt($(item_html_id).find('#totalOperationCount').text());
	
	var div1 = 'boxT';
	var div2 = 'boxC';
	var div3 = 'boxB';
	if ($.bf.app.tuita.checkIsTuitaDetailPage()) {
		var div1 = 'boxT1';
		var div2 = 'boxC1';
		var div3 = 'boxB1';
	}
	
	var tuita_detail_url_html = '<a href="/home/tdetail/sdid/'+tuita_sdid+'/tid/'+tuita_id+'">查看全部<span id="totalNumInCommentTab">'+total_count+'</span>次回应<em class="ftsong">&gt;&gt;</em></a>';
	if ($.bf.app.tuita.checkIsTuitaDetailPage()) {
		tuita_detail_url_html = '';
	}
	
	var form_html = '<div id="commentList" class="commentRepyBox"><a name="commentListPos"></a>\
                        <div class="'+div1+'"><span></span></div>\
                        <div class="'+div2+' repyBox">\
                        	<div class="tabStyle">\
                                <ul id="commentTabList">\
                                <li id="commentListTab"><a href="javascript:;" onclick="$.bf.app.tuita.getTuitaCommentList(this, \''+tuita_id+'\', '+tuita_sdid+', 0);return false;">评论(<span id="commentNumInCommentTab">'+ori_comment_count+'</span>)</a></li>\
                                <li id="upListTab"><a href="javascript:;" onclick="$.bf.app.tuita.getQuickOpUserList(this, \''+tuita_id+'\', 0, \'up\');return false;">顶(<span id="upNumInCommentTab">'+ori_up_count+'</span>)</a></li>\
                                <li id="downListTab"><a href="javascript:;" onclick="$.bf.app.tuita.getQuickOpUserList(this, \''+tuita_id+'\', 0, \'down\');return false;">踩(<span id="downNumInCommentTab">'+ori_down_count+'</span>)</a></li>\
                                <li id="retransmitListTab"><a id="retransmitListBtn" href="javascript:;" onclick="$.bf.app.tuita.getQuickOpUserList(this, \''+tuita_id+'\', 0, \'retransmit\');return false;">转发(<span id="retransmitNumInCommentTab">'+ori_retransmit_count+'</span>)</a></li>\
                                </ul>\
                            </div>\
                              <div class="clear"></div>\
                              <div id="listArea" class="tabCon">\
                              <!-- 评论、顶、踩、转发列表 -->\
                              <!-- <span id="commentListArea" style="display:block;"></span>\
                              	<span id="upListArea" style="display:none;"></span>\
                              	<span id="downListArea" style="display:none;"></span>\
                              	<span id="retransmitListArea" style="display:none;"></span> -->\
                              </div>\
                          <div class="pages_wrap">\
                          	<div class="pages">\
                          		<span id="pageMenuArea">\
	                                <!-- 分页列表 -->\
	                                <!-- <span id="commentListPageMenu" style="display:block;"></span>\
	                              	<span id="upListPageMenu" style="display:none;"></span>\
	                              	<span id="downListPageMenu" style="display:none;"></span>\
	                              	<span id="retransmitListPageMenu" style="display:none;"></span> -->\
                              	</span>\
                                '+tuita_detail_url_html+'\
                            </div>\
                          </div>\
                        </div>\
                        <div class="'+div3+'"><span></span></div>\
                      </div>';
    $(item_html_id).next().remove();
    $(item_html_id).after(form_html);
    
    $.bf.app.tuita.getTuitaCommentList(item_html_id, tuita_id, tuita_sdid, 1);
};

//读取踩、顶操作总数
$.bf.app.tuita.getTuitaOpTotalCount = function(container_id) {
	if (! container_id) {
		return false;
	}
	
	var arr_tids = [];
	$.each($(container_id).find('li'), function() {
		arr_tids[arr_tids.length] = $(this).attr('id');
	});
	
	var tids = arr_tids.join(',');
	$.bf.ajax.request('/tuita/GetOpTotalCount', {tids:tids}, 		
		function(data) {
			var total_count = 0;
			var up_count = 0;
			var down_count = 0;
			var obj = null;
			$.each(data, function(k, val) {
				obj = $('li[id='+val.tuita_id+']');
				up_count = parseInt(val.up_count);
				down_count = parseInt(val.down_count);
				obj.find('#upNum').text(up_count);
				obj.find('#downNum').text(down_count);
				total_count = parseInt(obj.find('#totalOperationCount').text()) + up_count + down_count;
				obj.find('#totalOperationCount').text(total_count);
			});
		}, 
		function(errno, msg) {
			
		}, 
		'post'
	);
};



// bf2.1微博公共部分JS






//获取我收到的评论
$.bf.app.tuita.getReceiveComment = function(page) {
	page = parseInt(page);
	if (page <= 0) {
		page = 1;
	}
	$.bf.app.tuita.page = page;
	
	//切换样式
	$("#receive_comment").addClass("cur");
	$("#send_comment").removeClass("cur");
	
	$("#comment_list").html($.bf.app.tuita.loading_html);
	$.bf.ajax.request('/tuita/getReceiveComment', {page:page},
			function(data) {
				$("#comment_list").html(data);
			},
			function(errno, msg) {
				if ($.bf.app.tuita.debug == true) {
					$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
				}
			}
	);
};

//获取我发出的评论
$.bf.app.tuita.getSendComment = function(page) {
	page = parseInt(page);
	if (page <= 0) {
		page = 1;
	}
	$.bf.app.tuita.page = page;
	
	//切换样式
	$("#receive_comment").removeClass("cur");
	$("#send_comment").addClass("cur");
	
	$("#comment_list").html($.bf.app.tuita.loading_html);
	$.bf.ajax.request('/tuita/getSendComment', {page:page},
			function(data) {
				$("#comment_list").html(data);
			},
			function(errno, msg) {
				if ($.bf.app.tuita.debug == true) {
					$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
				}
			}
	);
};

//删除微博评论
$.bf.app.tuita.delComment = function(cid, sdid, type) {
	sdid = parseInt(sdid);
	if (type == 'sender' || type == 'receiver') {	
		if (cid && sdid) {
			$.bf.module.Confirm.show(
					{
						title: '提示',
						message: '确定要删除这条评论吗？', 
						onEnter: function() {
							$.bf.ajax.request('/tuita/deleteComment', {cid:cid, sdid:sdid, type:type},
									function(result) {
										/*if (type == 'sender') {
											$.bf.app.tuita.getSendComment($.bf.app.tuita.page);
										}else {
											$.bf.app.tuita.getReceiveComment($.bf.app.tuita.page);
										}*/
										$("#feed_ul #comment_"+cid).fadeOut('slow', function(){
											$("#feed_ul #comment_"+cid).remove();
										});
									},
									function(errno, msg) {
										if ($.bf.app.tuita.debug == true) {
											$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
										}
									}
							);
						}
					}
			)
		}
	}
};

//显示评论回复框
$.bf.app.tuita.showReplyCommentDialog = function(cid, tid, t_author, receiver, callback) {
	var content = $("#comment_"+cid).find("#content").html(); //原评论内容
	var sender = $("#comment_"+cid).find("#sender").html();
	var sender_nick = $("#comment_"+cid).find("#sender_nick").html();
	/*$("#comment").val('回复@'+sender_nick+'：');
	$("#comment_id").val(cid);
	$("#receiver").val(receiver);*/
	
	//回复评论对话框HTML
	var dialog_html = '<div class="popup" style="position:relative; width: 100%; ">\
						  	<div class="shadow"></div>\
						    <div class="popupBox">\
						    	<div class="popupTitle"><a tag="close" id="close_reply_sign" href="javascript:void(0)" onClick="$.bf.module.HTMLDialog.hide();return false;" class="r"><span class="iconClose"></span></a>回复评论</div>\
						        <div class="popupMain">\
						        <p class="words">回复'+sender+'的评论：'+content+'</p>\
						            <div class="setName pd5">\
						            <p class="popSmile"><a href="javascript:void(0);" class="smileFace mr5" id="smileFace"></a><span class="iconArrow5"></span></p>\
						            	<textarea id="reply_content" class="text textareaWid">回复@'+sender_nick+'：</textarea>\
						            </div>\
						            <p>\
						            <span class="r mr10">\
						                <a class="btn btn8 mr5" id="commit_reply_comment" href="javascript:void(0);" onClick="$.bf.app.tuita.replyComment(\''+cid+'\', \''+tid+'\', '+t_author+', '+receiver+', \''+sender_nick+'\', '+callback+');return false;"><span>回复</span></a>\
						                <a class="btn btn3" id="cancel_reply_comment" href="javascript:void(0);" onClick="$.bf.module.HTMLDialog.hide();return false;"><span>取消</span></a>\
						            </span>\
						                <input type="checkbox" id="add_tuita" value="1" class="checkbox" /> <label for="b">同时转推该评论</label>\
						            </p>\
						        </div>\
						    </div>\
						</div>';
	
	$.bf.module.HTMLDialog.init(true).setHTML(dialog_html);
	$.bf.module.HTMLDialog.setSize({width:"400px"});
	$.bf.module.HTMLDialog.show();
	$("#reply_content").focus();
	
	//表情框
	var face = null
	$("#smileFace").click(function() {
		if (face == null) {
			face = $.bf.ui.FaceBox.create("#reply_content");
		}
		face.getDialog().toggle();
		face.initPosition("#smileFace", "bottom");
	});
	
	$("#cancel_reply_comment").click(function() {
		face && face.getDialog().hide();
	});
	
	$("#close_reply_sign").click(function() {
		face && face.getDialog().hide();
	});
	
	$("#commit_reply_comment").click(function() {
		face && face.getDialog().hide();
	});
}

//回复评论
//t_author 微博的发表者ID
//receiver 评论的接收者ID（原评论的发表者ID）
//receiver_nick 评论接收者昵称（原评论的发表者昵称）
$.bf.app.tuita.replyComment = function(cid, tid, t_author, receiver, receiver_nick, callback) {	
	receiver = parseInt(receiver);
	t_author = parseInt(t_author);
	var content = $("#reply_content").val();
	var add_tuita = 0;
	if ($("#add_tuita").attr("checked") == true) {
		add_tuita = 1;
	}	
	if (! cid) {
		$.bf.module.Tooltip.show('评论ID不能为空', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (! tid) {
		$.bf.module.Tooltip.show('微博ID不能为空', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (! t_author) {
		$.bf.module.Tooltip.show('微博的发表者不能为空', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (! receiver) {
		$.bf.module.Tooltip.show('评论接收人不能为空', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (! content || content == '回复@'+receiver_nick+'：') {
		$.bf.module.Tooltip.show('评论内容不能为空', $.bf.ui.Tooltip.icons.ERROR);
		$("#reply_content").focus();
		return false;
	}
	
	var receiver_nick = $("#comment_"+cid+" #sender_nick").html();
	content = content.replace("回复@"+receiver_nick+"：","");
	$.bf.ajax.request('/comment/ReplyComment', {cid:cid, tid:tid, receiver:receiver, content:content},
			function(result) {				
				if (add_tuita == 1) {
					$.bf.app.tuita.respostTuita(t_author, tid, content);
				}
				$.bf.module.HTMLDialog.hide();
				callback && callback(0, tid);
			},
			function(errno, msg) {
				callback && callback(errno, msg);
			}
	);	
	
}

//回复我收到的评论回调函数
$.bf.app.tuita.cbReplyReceiveComment = function(errno, msg) {
	if (errno == 0) {
		$.bf.module.Tooltip.show('回复成功', $.bf.ui.Tooltip.icons.OK);
		//$.bf.app.tuita.getReceiveComment(1);
		$.bf.app.my.getComment('receive', 1);
	}else {
		$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
	}
}

//回复单条微博评论列表的回调函数
$.bf.app.tuita.cbReplyComment = function(errno, msg) {
	if (errno == 0) {
		$.bf.module.Tooltip.show('回复成功', $.bf.ui.Tooltip.icons.OK);
		$.bf.app.tuita.getTuitaComment(msg, 1000000);
	}else {
		$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
	}
}

//转推微博
//sdid, 被转推的微博的发表者ID
//tid, 被转推的微博ID
//text , 附加的文本
$.bf.app.tuita.respostTuita = function(sdid, tid, text) {
	sdid = parseInt(sdid);
	if (! tid) {
		$.bf.module.Tooltip.show('被转推的微博ID不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	if (! sdid) {
		$.bf.module.Tooltip.show('被转推的微博作者ID不能为空.', $.bf.ui.Tooltip.icons.ERROR);
		return false;
	}
	
	$.bf.ajax.request('/tuita/repostTuita', {tid:tid, sdid:sdid, content:text}, 
			function(result){
				//alert('转推成功');
			},
			function(errno, msg) {
				$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
			}
	);
	
}

//评论列表页回复评论
$.bf.app.tuita.replyUserComment = function(cid, receiver) {
	var content = $("#comment_"+cid+" #content").html(); //原评论内容
	var sender = $("#comment_"+cid+" #sender").html();
	var sender_nick = $("#comment_"+cid).find("#sender_nick").html();
	
	$("#comment").val('回复@'+sender_nick+'：');
	$("#comment_id").val(cid);
	$("#receiver").val(receiver);
	$("#comment").focus();
}

//发表微博评论
$.bf.app.tuita.addComment = function(tid, t_author) {
	var comment_id = $("#comment_id").val();
	var content = $("#comment").val(); //评论内容
	var add_tuita = 0;
	var max_comment_length = 300;  //评论最多字符数
	
	if ($("#add_twitter").attr("checked") == true) {
		add_tuita = 1;
	}
	
	if (comment_id.length > 0) {
		var receiver = $("#receiver").val();
		var receiver_nick = $("#comment_"+comment_id+" #sender_nick").html();
		content = content.replace("回复@"+receiver_nick+"：","");
		if (content.length <= 0) {
			$.bf.module.Tooltip.show('回复内容不能为空.', $.bf.ui.Tooltip.icons.ERROR);
			return false;
		}else {
			if (content.length > max_comment_length) {
				$.bf.module.Tooltip.show('评论内容不能超过'+max_comment_length+'个字符.', $.bf.ui.Tooltip.icons.ERROR);
				$("#comment").focus();
				return false;
			}
		}
		
		$.bf.ajax.request('/comment/ReplyComment', {cid:comment_id, tid:tid, receiver:receiver, content:content, repost:add_tuita},
				function(result) {
					$("#comment").val('');
					$("#comment_id").val('');
					$("#receiver").val('');
					$("#add_twitter").attr("checked", false);
					
					//更新转推数
					if (add_tuita == 1) {
						var zhuantui_count = parseInt($("#convey_num").html().replace('(', '').replace(')', ''));
						if (! zhuantui_count) {
							zhuantui_count = 0;
						}
						$("#convey_num").html('('+ (zhuantui_count+1) +')');
					}

					$.bf.module.Tooltip.show('添加成功.', $.bf.ui.Tooltip.icons.OK);
					$.bf.app.tuita.getTuitaComment(tid, 1000000);
				},
				function(errno, msg) {
					if (errno == 1006 || errno == 1008) {
						$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
					}else {
						$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
					}
				},'post'
		);
	}else {
		var receiver = parseInt(t_author);
		if (! content) {
			$.bf.module.Tooltip.show('评论内容不能为空.', $.bf.ui.Tooltip.icons.ERROR);
			$("#comment").focus();
			return false;
		}else {
			if (content.length > max_comment_length) {
				$.bf.module.Tooltip.show('评论内容不能超过'+max_comment_length+'个字符.', $.bf.ui.Tooltip.icons.ERROR);
				$("#comment").focus();
				return false;
			}
		}
		if (! tid) {
			$.bf.module.Tooltip.show('微博ID不能为空.', $.bf.ui.Tooltip.icons.ERROR);
			return false;
		}
		if (receiver <= 0) {
			$.bf.module.Tooltip.show('接收者不能为空.', $.bf.ui.Tooltip.icons.ERROR);
			return false;
		}
		
		$.bf.ajax.request('/comment/addComment', {rid:receiver, tid:tid, content:content, repost:add_tuita},
				function(result) {
					$("#comment").val('');
					$("#comment_id").val('');
					$("#receiver").val('');
					$("#add_twitter").attr("checked", false);
					
					//更新转推数
					if (add_tuita == 1) {
						var zhuantui_count = parseInt($("#convey_num").html().replace('(', '').replace(')', ''));
						if (! zhuantui_count) {
							zhuantui_count = 0;
						}
						$("#convey_num").html('('+ (zhuantui_count+1) +')');
					}
					
					$.bf.module.Tooltip.show('添加成功.', $.bf.ui.Tooltip.icons.OK);
					$.bf.app.tuita.getTuitaComment(tid, 1000000);
				},
				function(errno, msg) {
					if (errno == 1008 || errno == 1007) {
						$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
					}else {
						$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
					}
				},'post'
		);
	}
}

//获取某条微博的评论
$.bf.app.tuita.getTuitaComment = function(tid, page) {
	if (! tid) {
		return false;
	}else {
		$.bf.ajax.request('/tuita/getTuitaComment', {tid:tid, page:page},
				function(data){
					if (data.rows == null) {
						return false;
					}else {
						var comment_html = '';
						var d = null;
						var str_d = '';
						var cc = data.rows.length;
						var ci = 1;
						$.each(data.rows, function(key, c) {
							d = new Date(c.adddate*1000);
							str_d = (d.getMonth()+1)+'月'+d.getDate()+'日 '+d.getHours()+':'+d.getMinutes();
							comment_html += '<li id="comment_'+c.cid+'"> <span class="avatar-45 l"><img alt="" src="'+c.avatar_90+'"></span>\
						                      <div class="c t999"> <a href="javascript:void(0);" class="r" onclick="$.bf.app.tuita.replyUserComment(\''+c.cid+'\', '+c.sender+');return false;">回复</a> <span id="sender"><a href="/'+c.sender+'" class="name"><span id="sender_nick">'+c.nick+'</span></a></span>'+str_d+'<p id="content">'+c.content+'</p>\
						                      </div>\
						                    </li>';
	                    	ci++;
						});
						
						if (data.page.total_rows) {
							$("#comment_count").html('('+data.page.total_rows+')');
						}
						$("#comment_list").html(comment_html);
						$("#page_menu").html(data.page_menu);
					}
				},
				function(errno, msg) {
					$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
				}
		);
	}
}

//发表微博
$.bf.app.tuita.cbAddTuita = function(errno, msg) {
	var url = window.location.href;
	if (errno == 0) {
		if (url.indexOf('tuita/my') > 0) {
			$("#tuita_list").prepend(msg.html.replace('<li ', '<li style="display:none" '));
			$("#tuita_list li:first").fadeIn('slow');
		}else {
			$.bf.module.Tooltip.show('发表成功', $.bf.ui.Tooltip.icons.OK);
		}
	}else {
		if (errno == 1003 || errno == 1004 || errno == 1005 || errno == 120 || errno == -12 || errno == -13 || errno == -14) {
			$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
		}else {
			$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
		}
	}
}


//显示评论框的表情框
$.bf.app.tuita.init = function() {
	$.bf.app.tuita.face = $.bf.ui.FaceBox.create("#comment");
	$.bf.app.tuita.init = function() {};
}

$.bf.app.tuita.addFriend = function(fsdid, fnick) {
	var fsdid = parseInt(fsdid);
	if (fsdid > 0) {
		$.bf.common.friends.addFriend(fsdid, fnick, $.bf.app.tuita.cbAddFriend);
	}
};

//添加好友,用于但条微博页面
$.bf.app.tuita.cbAddFriend = function(errno, msg) {
	var success_text = '已是好友';
	if (window.location.href.indexOf('/client') != -1) {
		success_text = '已关注';
	}
	switch (errno) {
		case 0:
			$("#relation_type").text(success_text);
			break;
		case 1004:
			$("#relation_type").text(success_text);
			$.bf.module.Tooltip.show(success_text, $.bf.ui.Tooltip.icons.ERROR);
			break;
		default:
			$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
	}
};


//监听设置
$(document).ready(function() {
	
	//鼠标经过显示通用转发
	$('li #retransmitOpList').live('mouseover', function() {
		$(this).addClass('over');
	});
	
	//鼠标移开隐藏通用转发
	$('li #retransmitOpList').live('mouseout', function() {
		$(this).removeClass('over');
	});
	
	/*$("#smile_face").click(function() {
		$.bf.app.tuita.init();
		$.bf.app.tuita.face.getDialog().toggle();
		$.bf.app.tuita.face.initPosition("#smile_face", 'under');
	});*/
	
	/*var cur_url = window.location.href;
	if (cur_url.indexOf('tuita/my') != -1 || cur_url.indexOf('tuita/comment') != -1) {
		var parent_id = '';
		if (cur_url.indexOf('tuita/my') != -1) {
			parent_id = 'tuita_list';
		}else {
			parent_id = 'comment_list';
		}
		
		//鼠标经过显示删除按钮
		$("#" + parent_id + " li").live('mouseover', function() {
			$(this).addClass('cur');
		});
		
		//鼠标移开隐藏删除按钮
		$("#" + parent_id + " li").live('mouseout', function() {
			$(this).removeClass('cur');
		});
	}*/
	
});












