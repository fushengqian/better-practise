$.registerNameSpace('bf.app.my.comment');

$.bf.app.my.comment = {
	checkAll: function() {
		var check_all = $('input[name="checkAllBtn"]').val();
		
		if (check_all == 1) {
			$('input[name="cid"]').attr('checked', false);
			$('input[name="checkAllBtn"]').val(0);
			$('input[name="checkAllBtn"]').attr('checked', false);
		}else {
			$('input[name="cid"]').attr('checked', true);
			$('input[name="checkAllBtn"]').val(1);
			$('input[name="checkAllBtn"]').attr('checked', true);
		}
	},
	
	delComment: function(cid, sender, receiver, type) {
		sender = parseInt(sender);
		receiver = parseInt(receiver);

		if (cid && sender && receiver) {
			$.bf.module.Confirm.show(
					{
						title: '提示',
						message: '确定要删除这条评论吗？', 
						onEnter: function() {
							$.bf.ajax.request('/tuita/deleteComment', {cid:cid, sender:sender, receiver:receiver, deltype:'single'},
									function(result) {
										/*$("#commentList #comment_"+cid).fadeOut('slow', function() {
											$("#commentList #comment_"+cid).remove();
										});*/
										$("#commentList #comment_"+cid).remove();
										
										if ($('#commentList li').length <= 0) {
											if (type == 'sender') {
												$.bf.app.my.getComment('send', $.bf.app.my.current_comment_page_num-1);
											}else {
												$.bf.app.my.getComment('receive', $.bf.app.my.current_comment_page_num-1);
											}
										}
									},
									function(errno, msg) {
										$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
									}
							);
						}
					}
			);
		}
	},

	delCommentBatch: function() {
		var cids = [];		
		$.each($('input[name="cid"]:checked'), function() {
			cids[cids.length] = $(this).val();
		});
		if (cids.length <= 0) {
			$.bf.module.Tooltip.show('请先选择要删除的评论.', $.bf.ui.Tooltip.icons.ERROR);
			return false;
		}
		var str_cids = cids.join(',');
		
		var comment_type = '';
		if ($.bf.app.my.sub_tab_name == 'comment_send') {
			comment_type = 'sender';
		}else {
			comment_type = 'receiver';
		}
		
		$.bf.module.Confirm.show(
				{
					title: '提示',
					message: '确定要删除选定的评论吗？', 
					onEnter: function() {
						$.bf.ajax.request('/tuita/deleteComment', {cid:str_cids, deltype:'batch'},
								function(result) {									
									var arr = [];
									$.each(cids, function(key, val) {
										arr = val.split('|');
										$("#commentList #comment_"+arr[0]).remove();
										/*$("#commentList #comment_"+arr[0]).fadeOut('slow', function() {
											$("#commentList #comment_"+arr[0]).remove();
										});*/
									});
									
									if ($('#commentList li').length <= 0) {
										if (comment_type == 'sender') {
											$.bf.app.my.getComment('send', $.bf.app.my.current_comment_page_num-1);
										}else {
											$.bf.app.my.getComment('receive', $.bf.app.my.current_comment_page_num-1);
										}
									}
									$('input[name="checkAllBtn"]').val(0);
									$('input[name="checkAllBtn"]').attr('checked', false);
								},
								function(errno, msg) {
									$('input[name="checkAllBtn"]').val(0);
									$('input[name="checkAllBtn"]').attr('checked', false);
									$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
								}, 
								'post'
						);
					}
				}
		);
	}
};