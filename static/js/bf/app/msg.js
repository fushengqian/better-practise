/**
 * 消息模块JS
 * @author: 吴志坚 <wuzhijian@snda.com>
 * @date : 2010-10-22
 */
$.registerNameSpace("bf.app.Msg");

$(function(){
	var $ns = $.bf.app.Msg;
	$ns.curTab = $('#storage').data('msg_tab');


	$('#msg_list > li').live('mouseover', function (){
		if (!$(this).hasClass("cur")){
			$(this).addClass("over");
		}
		$('#msg_list > li').find(".del").hide();
		$(this).find(".del").show();
	}).live('mouseout', function (){
		$(this).removeClass("over");
		//if (!$(this).hasClass("cur")){
			$(this).find(".del").hide();
		//}
	}).live('click', function(){
		$('#msg_list > li').removeClass("cur");
		$(this).addClass("cur").find("div.c").addClass("read"); //选中+已读
		$(this).find(".del").show();

		var msg_id   = $(this).attr('id').substr(4);
		var msg_type = $(this).attr('data');
		$ns.lastClickedMsgId = msg_id;

		if ($ns.curTab == 'notice') {
			$ns.displayMsgDetailsPanel('notice', msg_id, msg_type);
		} else if ($ns.curTab == 'request') {
			$ns.displayMsgDetailsPanel('request', msg_id, msg_type);
		} else if ($ns.curTab == 'broadcast') {
			$ns.displayBroadcastPanel(msg_id, msg_type);
		}
	});

	//默认载入第一行
	if ($ns.getListItemNum() > 0) {
		$ns.loadFirstLine();
	}

	/**
	 * "删除"按钮
	 */
	$("[id^='msg_del_']").live('click', function(e){
		e.stopPropagation();

		var msg_id=$(this).attr('id').substr(8);
		$.bf.shortcut.Confirm.show({'message' : "确定要删除吗？", 'onEnter' : function(){$ns.deleteMsg(msg_id);}});

		return false; //“return false”与“e.stopPropagation();”一起作用于阻止冒泡行为
	});

	/**
	 * "全部已读"按钮
	 */
	$('#btn_set_all_read').click(function(){
		$ns.setAllRead();
	});

	/**
	 * 删除已读通知
	 */
	$('#del_already_read_notice').click(function(){
		$.bf.shortcut.Confirm.show({'message' : "您确定要删除全部已读通知吗？", 'onEnter' : function(){$ns.deleteAlreadyReadNotice();}});
	});

	/**
	 * “请求”中的忽略全部按钮
	 */
	$('#req_all_ignore').click(function(){
		$.bf.shortcut.Confirm.show({'message' : "确定要全部忽略吗？", 'onEnter' : function(){$ns.deleteMsgAll();}});
	});


	/**
	 * "请求"中的忽略按钮。如邀请玩游戏中的“忽略”、加好友中的“忽略”
	 */
	$("[id^='req_ignore_']").live('click', function(){
		var msg_id=$(this).attr('id').substr(11);

		$('#req_add_fri_'+msg_id).attr('id', 'add_fri_null');         //disable click
		$('#req_ignore_' +msg_id).attr('id', 'ignore_null');          //disable click

		$.bf.ajax.request(
			$.bf.ajax.createURL("message/IgnoreFriendReq"),
			{"msg_id": msg_id},
			function(resp) {
				$.bf.shortcut.Tooltip.show('忽略成功！');
				$.bf.app.Msg.delAndLoadNext(msg_id);
			},
			function(errno, error) {
				$.bf.shortcut.Tooltip.show(error);

				$('#add_fri_null').attr('id', 'req_add_fri_'+msg_id); //enable click
				$('#ignore_null').attr('id',  'req_ignore_'+msg_id);  //enable click
			},
			'POST'
		);
	});

	/**
	 * "请求"加为好友按钮
	 */
	$("[id^='req_add_fri_']").live('click', function(){
		var msg_id = $(this).attr('id').substr(12);
		var data   = $(this).attr('data');
		var friend_id   = data.split("|")[0];
		var friend_name = data.split("|")[1];

		$.bf.ajax.request(
			$.bf.ajax.createURL("message/AddFriendReq"),
			{"msg_id": msg_id},
			function(resp) {
				if (resp.code == 1) {
					$.bf.common.friends.setupGroupsCancelCallback = '$.bf.app.Msg.delAndLoadNext('+msg_id+')';
					$.bf.common.friends.setupGroupsDialog(friend_id, friend_name, '', 'function(result_type, msg) {$.bf.app.Msg.delAndLoadNext('+msg_id+');}');
				}else {
					$.bf.shortcut.Tooltip.show(resp.msg);
					$.bf.app.Msg.delAndLoadNext(msg_id);
				}
			},
			function(errno, error) {
				$.bf.shortcut.Tooltip.show(error);

				$('#add_fri_null').attr('id', 'req_add_fri_'+msg_id); //enable click
				$('#ignore_null').attr('id',  'req_ignore_'+msg_id);  //enable click
			},
			'POST'
		);
	});

});


$.bf.app.Msg = {
	lastClickedMsgId:0, //上一次点击的消息ID
	curTab:"",          //当前所在tab
	curPage:1,          //当前页码
	pageSize:7,         //页长

	/**
	 * 用于notice&request的右侧详细面板展示
	 * @param: msg enum['notice','request'] 通知或请求
	 * @param: msg_id long 消息ID
	 * @param: msg_type int 消息类型
	 */
	displayMsgDetailsPanel: function(msg, msg_id, msg_type) {
		if (msg != 'notice' && msg != 'request')              return false;
		if (parseInt(msg_id) <= 0 || parseInt(msg_type) <= 0) return false;

		var action = msg == 'notice' ? 'getNoticeDetails' : 'getRequestDetails';

		$.bf.ajax.request(
			$.bf.ajax.createURL("message/"+action),
			{"msg_id": msg_id, "msg_type": msg_type},
			function(msg_body) {
				if (msg_id != $.bf.app.Msg.lastClickedMsgId) { return false; }//被多次点击，忽略响应
				
				$('#msg_details').html(msg_body);
			},
			function(errno,error) {
				if (msg_id != $.bf.app.Msg.lastClickedMsgId) { return false; }//被多次点击，忽略响应
				$.bf.shortcut.Alert.show({'message':error});
			}
		);
	},

	/**
	 * 用于broadcast的右侧详细面板展示
	 */
	displayBroadcastPanel: function(msg_id, msg_type) {
		if (parseInt(msg_id) <= 0 || parseInt(msg_type) <= 0) return false;

		$.bf.ajax.request(
			$.bf.ajax.createURL("message/getBroadcastDetails"),
			{"msg_id": msg_id, "msg_type": msg_type},
			function(msg_body) {
				if (msg_id != $.bf.app.Msg.lastClickedMsgId) { return false; }//被多次点击，忽略响应
				
				$('#msg_details').html(msg_body);
			},
			function(errno,error) {
				if (msg_id != $.bf.app.Msg.lastClickedMsgId) { return false; }//被多次点击，忽略响应
				$.bf.shortcut.Alert.show({'message':error});
			}
		);
	},
	
	/**
	 * 取当前页的消息条数
	 */
	getListItemNum: function () {
		var num     = $('#msg_list >li').length;
		//todo: 若是letter，须做进一步处理
		//var cur_tab = $('#storage').data('msg_tab');

		//if (cur_tab == 'letter') {
		//	num--;
		//}

		return num;
	},

	/**
	 * 载入第一行消息
	 */
	loadFirstLine: function() {
		$('#msg_list > li:nth-child(1)').click();
		//todo: 若是letter，须做进一步处理
		return true;
	},

	deleteMsg: function(msg_id) {
		//todo: 若是letter, 须做进一步处理
		msg_id = parseInt(msg_id);
		if (msg_id <= 0) { return false; }

		$.bf.ajax.request(
			$.bf.ajax.createURL("message/deleteMsg"),
			{"msg_id": msg_id, "msg_type": this.curTab},
			function(resp) {
				$.bf.shortcut.Tooltip.show('删除成功！');
				$.bf.app.Msg.delAndLoadNext(msg_id);
			},
			function(errno, error) {
				$.bf.shortcut.Tooltip.show(error, '', {"onClose": function(){location.reload()}, "speed":2000});
			},
			'POST'
		);
	},

	/**
	 * 删除一条后，自动载入下一条
	 */
	loadNext: function() {
		var next_order = (this.curPage-1)*this.pageSize+this.getListItemNum();
		var action;
		var ns = this;

		if      (this.curTab == 'request') { action = 'RequestLoadNext';}
		else if (this.curTab == 'letter')  { action = 'LetterLoadNext'; }
		else if (this.curTab == 'notice')  { action = 'NoticeLoadNext'; }
		else {return false;}

		$.bf.ajax.request(
			$.bf.ajax.createURL("message/"+action),
			{"order": next_order},
			function(resp) {
				if(typeof($('#msg_'+resp.msg_id).attr('id')) == 'undefined') {//避免重复 why? forgotten!
					if (ns.getListItemNum() < ns.pageSize) {                  //避免过长
						$('#msg_list').append(resp.html);
					}
				}
			}
		);
	},
	
	setAllRead: function() {
		$.bf.ajax.request(
			$.bf.ajax.createURL("message/setAllRead"),
			{"msg_type": this.curTab},
			function(resp) {
				$('#msg_list > li').addClass("read");
				$.bf.shortcut.Tooltip.show("成功！");
				setTimeout(function () {location.reload();}, 1000);
			},
			function(errno, error) {
				$.bf.shortcut.Tooltip.show(error);
			},
			'POST'
		);
	},

	delAndLoadNext: function(msg_id) {
		$("#msg_"+msg_id).remove();
		$('#msg_details').html('');
		
		$.bf.app.Msg.loadFirstLine();
		$.bf.app.Msg.loadNext();
	},

	deleteAlreadyReadNotice: function() {
		$.bf.ajax.request(
			$.bf.ajax.createURL("message/DeleteAlreadyReadNotice"),
			{},
			function(resp) {
				location.reload();
			},
			function(errno, error) {
				$.bf.shortcut.Tooltip.show(error);
			},
			'POST'
		);
	},

	deleteMsgAll: function() {
		$.bf.ajax.request(
			$.bf.ajax.createURL("message/deleteMsgAll"),
			{"msg_type": this.curTab},
			function(resp) {
				location.reload();
			},
			function(errno, error) {
				location.reload();
			},
			'POST'
		);
	}
}
