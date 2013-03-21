
$(function () {
	var el = $('.iptSearch'), ipt = $('input:text', el), btn = $('.btn_find', el),
		str = '你找谁？请输入准确名字查找', color = '#666', color_new = '#ccc', color_rgb = 'rgb(204, 204, 204)',
		fn = function () {
			if (ipt.val() == '' || ipt.val() == str) ipt.val(str).css('color', color_new);
			else ipt.css('color', color);
		},
		chk = function () {
			var color_cur = $(ipt).css('color');
			return $(ipt).val() == str && (color_cur == color_new || color_cur == color_rgb);
		},
		smt = function () {
			var key = $.trim(ipt.val());
			if (key && !chk()) window.location.href = '/find/nick/key/'+encodeURIComponent(key);
			else {
				$.bf.module.TxtTips.show(ipt, '请输入搜索信息');
				ipt.focus();
			}
		};
	fn();
	ipt.keydown(function (event) {
		if (event.keyCode == 13) {
			smt();
			return false;
		}
	}).focus(function () {
		chk() && $(this).val('').css('color', color);
	}).blur(function () {
		$.trim($(this).val()) || fn();
	});
	btn.click(function () {
		smt();
	});
	
	$("a[attr='add_friends']").click(function () {
		var obj_f = $(this),
			fsdid = $(this).attr('fsdid'),
			fnick = $(this).attr('fnick');
		if (!fsdid || !fnick) {
			return false;
		}
		$.bf.module.friends.addFriend(fsdid, fnick, function () {
			obj_f.removeClass('btn7').addClass('btn11').html('<span>已关注</span>');
		});
	});
	
	$('a#on_key_focus').click(function () {
		var el = $("a[attr='add_friends']"), len = el.length, sdids = [], $this = this;
		el.each(function () {
			sdids.push($(this).attr('fsdid'));
		});
		$.bf.module.friends.addFriendBatch(sdids.join(','), function (no, msg) {
			if (no == '0' || no == '1004') {
				el.each(function () {
					$(this).removeClass('btn7').addClass('btn11').html('<span>已关注</span>');
				});
				// $.bf.module.TxtTips.show($this, '一键关注成功');
			} else {
				alert(msg);
			}
		});
	});
});
