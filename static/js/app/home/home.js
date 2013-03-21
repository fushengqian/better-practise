$.registerNameSpace('bf.app.home');

$.bf.app.home.fnick = '';
$.bf.app.home.fsdid = 0;

//获取原创、视频、图片推他
$.bf.app.home.sub_tab = 'allTab';
$.bf.app.home.loading_html = '<br><div style="text-align:center;"><img src="'+$.bf.config.getStaticPath()+'/img/loading.gif"></div><br>';
$.bf.app.home.getTuita = function(page) {
	page = parseInt(page);
	if (page <= 0) {
		page = 1;
	}
	var type = $.bf.app.home.sub_tab.replace('Tab', '');
	var sdid = $('div[id="userSdid"]').text();
	
	if (page > 1) {
		$('html,body').animate({scrollTop:0},200);
	}
	$('#tuitaTabList a').removeClass('cur');
	$('#'+$.bf.app.home.sub_tab).addClass('cur');
	$('#tuitaPageMenu').html('');
	$("#feed_ul").html($.bf.app.home.loading_html);
	//IE6 bug
	$.bf.common.fixBG();
	$.bf.ajax.request('/home/getTuita', {page:page, type:type, sdid:sdid}, 
		function(data) {
			var total = 0;
			total = data.total_count;
			$('#shareTotalCount').html(total);
			if (total > 0) {
				$("#feed_ul").html(data.tuita_html);
				$('#tuitaPageMenu').html(data.page_menu);
			}else {
				var no_msg_txt = '<div class="blank">';
				switch (type) {
				case 'video':
					no_msg_txt += 'TA还没有发表过任何视频微博.';
					break;
				case 'img':
					no_msg_txt += 'TA还没有发表过任何图片微博.';
					break;
				default:
					no_msg_txt += 'TA还没有发表过任何微博.';
					break;
				}				
				no_msg_txt = no_msg_txt ? no_msg_txt + '</div>' : '';
				$("#feed_ul").html(no_msg_txt);
			}
			$(document).scrollTop($("#tuitaTabList").offset().top);
			//IE6 bug
			if(page>1){
				//$.bf.common.fixBG();
			}
		}.bind(this),
		function(errno, msg) {
			var err_msg = '<div class="blank_feed" id="status_err_feed"><p class="mt10">系统忙,<a class="font12" href="javascript:;" onclick="$.bf.app.home.getTuita(1);">请点此重试.</a></p></div>';
			$("#feed_ul").html(err_msg);
		}
	);
};


//获取添加好友HTML
$.bf.app.home.getAddFriendHtml = function(fsdid, fnick) {
	return '<a class="btn btn8" href="javascript:;" onclick="$.bf.app.home.addFriend('+fsdid+', \''+fnick+'\')"><span><i class="ico i2"></i>立即关注</span></a>';
};

//获取设置分组HTML
$.bf.app.home.getSetGroupsHtml = function(fsdid, fnick) {
	return '<span class="t999">已关注，</span>\
			<a href="javascript:;" onclick="$.bf.app.home.delFriend('+fsdid+', \''+fnick+'\')">取消关注</a>';
	
	return '<div class="relaWrap">\
		    <div id="span_frd_group" class="friendW"><div id="tmpset"></div><div id="tmpdel"></div>\
		    <span class="btn btn22" onclick="$.bf.app.home.showSetPage()">\
		    <em>已是好友</em>\
		    <a href="#"><i class="ico iset"></i><span class="none">设置</span></a>\
		    </span>\
		    <a id="p1_a_goComment" href="javascript:;" class="ml5 ico i9"><span class="none">留言</span></a>\
				<div style="width: 102px; left:70%; top:46%; display:none;" class="popupM" id="setup_page">\
		         <div class="shadow"></div>\
		         <div class="popupBox">\
		               <div style="display:" id="div_frd_group" class="grouplist">\
		                 <ul>\
		                     <li><a id="li_frd_group" href="javascript:;" onclick="$.bf.app.home.setGroups('+fsdid+', \''+fnick+'\')">设置分组</a></li>\
		                     <li><a id="li_frd_del" href="javascript:;" onclick="$.bf.app.home.delFriend('+fsdid+', \''+fnick+'\')">解除关系</a></li>\
		                     <li><a id="li_frd_del" href="javascript:;">加入黑名单</a></li>\
		                 </ul>\
		                 <div class="clear"></div>\
		               </div>\
		         </div>\
		     </div>\
		  </div>\
		</div>';
};

//添加好友
$.bf.app.home.addFriend = function(fsdid, fnick) {
	$.bf.app.home.fnick = fnick;
	fsdid = parseInt(fsdid);
	$.bf.app.home.fsdid = fsdid;
	if (fsdid > 0) {
		$.bf.module.friends.addFriend(fsdid, fnick, $.bf.app.home.cbAddFriend);
	}
};

// 私信显示框
$.bf.app.home.msgReplyDialog = function () {
    $.bf.module.HTMLDialog.init(true).setHTML($(".reply_dialog").html());
    $.bf.module.HTMLDialog.setSize({width:"400px"});
    $.bf.module.HTMLDialog.show();
};


//添加好友回调
$.bf.app.home.cbAddFriend = function(errno, msg) {
	if (errno == 0) {
		$("#followStatus").html($.bf.app.home.getSetGroupsHtml(msg, $.bf.app.home.fnick));
		$('#privateLetterSendBtn').html('<a class="btn btn12 mr5 reply" href="javascript:;" onclick="$.bf.app.home.msgReplyDialog();"><span>私信</span></a>');
	}else {
		if (errno == -50000) {
			$.bf.module.Tooltip.show('您还未登陆，不能添加好友.', $.bf.ui.Tooltip.icons.ERROR);
		}else {
			//$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
		}
	}
};

//删除好友
$.bf.app.home.delFriend = function(fsdid, fnick) {
	$.bf.app.home.fnick = fnick;
	fsdid = parseInt(fsdid);
	if (fsdid > 0) {
		$.bf.module.friends.delFriend(fsdid, $.bf.app.home.cbDelFriend);
		$.bf.app.home.showSetPage();
	}
};

//删除好友回调函数
$.bf.app.home.cbDelFriend = function(errno, msg) {
	if (errno == 0) {
		$("#followStatus").html($.bf.app.home.getAddFriendHtml(msg, $.bf.app.home.fnick));
		$('#privateLetterSendBtn').html('');
		//$.bf.module.Tooltip.show('删除成功', $.bf.ui.Tooltip.icons.OK);
	}else {
		$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
	}
};

//显示/隐藏好友设置页面
$.bf.app.home.showSetPage = function() {
	$("#setup_page").toggle();
}

//设置分组
$.bf.app.home.setGroups = function(fsdid, fnick) {
	fsdid = parseInt(fsdid);
	if (fsdid > 0) {
		$.bf.module.friends.setupGroupsDialog(fsdid, fnick);
		$.bf.app.home.showSetPage();
	}
}

//设置黑名单
$.bf.app.home.addToBlackList = function(sdid) {
	sdid = parseInt(sdid);
	
	$.bf.app.home.showSetPage();
	if (sdid > 0) {
		$.bf.ajax.request(
			'/home/addToBlackList',
			{sdid: sdid},
			function(data) {
				$.bf.module.Tooltip.show('确定要加入黑名单吗？', $.bf.ui.Tooltip.icons.OK);
			},
			function(errno, msg) {
				$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
			}
		);
	}
};

//取消黑名单
$.bf.app.home.deleteFromBlackList = function(sdid) {
	sdid = parseInt(sdid);
	if (sdid <= 0) {
		return false;
	}
	
	$.bf.module.Confirm.show(
			{
			 title: '提示', 
			 message: '确定取消黑名单吗？',
			 onEnter: function() {
				$.bf.ajax.request('/home/deleteFromBlackList', {sdid:sdid}, 
					function(data) {
						$('#blackUserList').remove();
						$.bf.module.Tooltip.show('取消成功', $.bf.ui.Tooltip.icons.OK);
					},
					function (errno, msg) {
						$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
					}
				);
			}
			}
		);
};

//显示拉黑功能


$.bf.app.home.sendMsg = function(sdid,nick){
	var sdid = sdid || 0,
		nick = nick || '';

	if(!sdid || !nick)
	{
		return false;
	}
	$.bf.module.friends.setupMsgDialog(sdid,nick,
		function(){
			
			//点击取消绑定事件
			$("a[attr='msg_cancel']").click(function(){
				$("textarea[attr='msg_txt']").val('');
			});
			
			
			//点击关闭 隐藏窗口和表情窗口
			$("[tag='close']").click(function(){
				$(this).hide();
				$("[attr='face_close_btn']").click();
			});
			
			//点击发送绑定事件
			$("a[attr='msg_send']").click(function(){
				var msg_body = $("textarea[attr='msg_txt']").val();
				
				if(!sdid)
				{
					$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
					return false;
				}
				
				if(!msg_body)
				{
					$.bf.module.Tooltip.show('发送内容不能为空', $.bf.ui.Tooltip.icons.ERROR);
					return false;
				}
				
				var data = {"sdid" : sdid , "msg_body" : msg_body};


				$.bf.ajax.request('/message/SendMsg', data ,
					function(result){
						$.bf.module.Tooltip.show('发送成功', $.bf.ui.Tooltip.icons.OK);
					},
					function(errno , error){
						$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
					},
					'post'
				);
				$("[tag='close']").click();
			});
		}
	);
}


$.bf.app.home.overMore = function(){
	var obj_block = $("[attr='add_block']");
	if(obj_block.css('display') == "none")
	{
		obj_block.show();
	}
	else
	{
		obj_block.hide();
	}
	$("[attr='link_more']").addClass('over');
}


$.bf.app.home.outMore = function(){
	var obj_block = $("[attr='add_block']");
	obj_block.hide();
	$("[attr='link_more']").removeClass('over');
}

//显示详细联系信息
$(document).ready(function() {
	$('#allTab').click(function() {
		if ($.bf.app.home.sub_tab == 'allTab') {
			return false;
		}
		
		$.bf.app.home.sub_tab = 'allTab';
		$.bf.app.home.getTuita(1);
	});
	
	$('#originalTab').click(function() {
		if ($.bf.app.home.sub_tab == 'originalTab') {
			return false;
		}
		
		$.bf.app.home.sub_tab = 'originalTab';
		$.bf.app.home.getTuita(1);
	});
	
	$('#videoTab').click(function() {
		if ($.bf.app.home.sub_tab == 'videoTab') {
			return false;
		}
		
		$.bf.app.home.sub_tab = 'videoTab';
		$.bf.app.home.getTuita(1);
	});
	
	$('#imgTab').click(function() {
		if ($.bf.app.home.sub_tab == 'imgTab') {
			return false;
		}
		
		$.bf.app.home.sub_tab = 'imgTab';
		$.bf.app.home.getTuita(1);
	});
	
	
	var el = $("#contact_info"), w = el.width(), tg = $('#show_contact'), tw = tg.width(), th = tg.height();
	
	$(".tool .i7").click(function() {
		$(this).hide();
		el.hide();
		$('#show_contact').show();
	});

	$(".tool .i8").click(function() {
		var pos = $(this).offset();
		// el.css({
		// 	top : pos.top + th + 'px',
		// 	left : pos.left + tw + tw - w + 'px'
		// }).show();
		el.show();
		$(this).hide();
		$('#hide_contact').show();
	});
	
	//显示私信框
	$("#p1_a_goComment").live('click',function(){
		$.bf.app.home.sendMsg($(this).attr('sdid'),$(this).attr('nick'));
	});
	

	$("[attr='link_more']").hover(
		function()
		{
			$.bf.app.home.overMore();
		},
		function()
		{
			$.bf.app.home.outMore();
		}
	);

	$("[attr='add_block']").click(function(){
		$.bf.app.home.outMore();
		var sdid = $(this).attr('sdid'),
			nick = $(this).attr('nick'),
			data = { id : sdid};
		$.bf.ajax.request('/setting/addblockuser',data , 
			function(result)
			{
				$("[attr='div_del_block']").show();
				$("[attr='div_all_block']").hide();
				//$("#followStatus").htmp($.bf.app.home.getAddFriendHtml(sdid,nick));
				//$.bf.module.Tooltip.show('操作成功');
				
			},
			function(errno , error)
			{
				$.bf.module.Tooltip.show(error , $.bf.ui.Tooltip.icons.ERROR);
			}
		);
	});

	$("[attr='del_block']").click(function(){
		$.bf.app.home.outMore();
		var sdid = $(this).attr('sdid'),
			nick = $(this).attr('nick'),
			data = { id : sdid};
		$.bf.ajax.request("/setting/delblockuser", data,
			function(result)
			{
				$("[attr='div_del_block']").hide();
				$("[attr='div_all_block']").show();
				$("#followStatus").html($.bf.app.home.getAddFriendHtml(sdid,nick));
				$("#privateLetterSendBtn").html('');
				//$.bf.module.Tooltip.show('操作成功');
			},
			function(errno , error)
			{
				$.bf.module.Tooltip.show(error , $.bf.ui.Tooltip.icons.ERROR);
			}
		);
	});


	
});

