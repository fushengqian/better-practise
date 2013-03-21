
$.registerNameSpace('bf.app.guide.friend');

$.bf.app.guide.friend = {
	clicked : false,
	init : function () {
		$('.nearFri li').hover(function () {
			$(this).attr('class', 'cur');
		}, function () {
			$(this).attr('class', '');
		});
		
		$('.nearFriInfo a.r').click(function () {
			var el = $(this), sdid = el.attr('sdid'), input = $('#sdids');
			if (el.hasClass('cancel')) {
				el.removeClass('cancel').addClass('choosed');
				input.val(input.val()+','+sdid);
			} else {
				el.removeClass('choosed').addClass('cancel');
				input.val(input.val().replace(','+sdid, ''));
			}
		});
		
		$('#sdids').next().click(function () {
			if (this.clicked) return ;
			var $this = this, sdids = $($this).prev().val().replace(/^,|,$/, '');
			if (!sdids) {
				// $.bf.module.Tooltip.show('未选中任何好友', $.bf.ui.Tooltip.icons.ERROR);
				$.bf.module.TxtTips.show($this, '未选中任何好友');
				return ;
			}
			$.bf.module.friends.addFriendBatch(sdids, function (no, msg) {
				if (no == '0' || no == '1004') {
					// $.bf.module.Tooltip.show('一键关注成功');
					$.bf.module.TxtTips.show($this, '一键关注成功');
					$this.clicked = true;
					setTimeout(function () {
						window.location = '/';
					}, 500);
				} else {
					alert(msg);
				}
			});
		});
	}
};

$(function () {
	$.bf.app.guide.friend.init();
});
