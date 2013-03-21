/**
 * @author gesion<gesion@163.com>
 */

$.registerNameSpace('bf.app.login.index');

$.bf.app.login.index = {
	empty_usr : '请输入账号',
	init : function () {
		var $this = this;
		
		// Captcha
		if ($('.captcha_frame').length) {
			$('.captcha_image').focus(function () {
				$(this).blur();
			}).click(function () {
				$this.captcha_refresh();
			});
		}
		
		// Login
		$('.btn_login').focus(function () {
			$(this).blur();
		});
		$('#login_form').submit(function () {
			return $this.login_submit();
		});
		
		var el_usr = $('#username'), color = el_usr.css('color'), color_new = '#ccc', color_rgb = 'rgb(204, 204, 204)',
			fn = function () {
				el_usr.val($this.empty_usr).css('color', color_new);
			},
			chk = function () {
				var color_cur = el_usr.css('color');
				return el_usr.val() == $this.empty_usr && (color_cur == color_new || color_cur == color_rgb);
			};
		fn();
		el_usr.focus(function () {
			chk() && $(this).val('').css('color', color);
		}).blur(function () {
			$.trim($(this).val()) || fn();
		});
		el_usr.focus();
	},
	retry_times : 0,
	login_submit : function () {
		var $this = this, data = {};
		
		var el_usr = $('#username'), usr = el_usr.val();
		if (!usr || usr == $this.empty_usr) {
			$.bf.module.Tooltip.show('请输入账号', $.bf.ui.Tooltip.icons.ERROR);
			el_usr.focus();
			return false;
		}
		data.username = usr;
		
		var el_pwd = $('#password'), pwd = el_pwd.val();
		if (!pwd) {
			$.bf.module.Tooltip.show('请输入密码', $.bf.ui.Tooltip.icons.ERROR);
			el_pwd.focus();
			return false;
		}
		data.password = pwd;
		
		if ($('.captcha_frame').length) {
			var el_cpt = $('#captcha'), cpt = el_cpt.val();
			if (!cpt) {
				$.bf.module.Tooltip.show('请输入验证码', $.bf.ui.Tooltip.icons.ERROR);
				el_cpt.focus();
				return false;
			}
			data.captcha = cpt;
		}
		
		data.refer = $('#refer').val() || '';
		data.auto_login = ($('#autologin').attr('checked') ? 1 : 0);
		
		$.bf.ajax.request('/login/validate', data, function (re) {
			if (typeof re['redirect_url'] != 'undefined') window.location = re['redirect_url'];
		}, function (errno, error) {
			$.bf.module.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR);
			if (typeof el_cpt != 'undefined') {
				el_cpt.val('');
				el_cpt.focus();
				error == '验证码不正确' || $this.captcha_refresh();
			}
			if (error == '您输入的账号和密码不匹配') {
				if (typeof el_cpt == 'undefined') {
					$this.retry_times++;
					$this.retry_times < 3 || window.location.reload();
				}
				el_pwd.val('');
				el_pwd.focus();
			}
		}, 'POST');
		
		return false;
	},
	captcha_refresh : function () {
		var el = $('.captcha_image'), ele = $('img', el), src = ele.attr('src').split('?'), img = new Image();
		img.src = src[0] + '?' + (new Date()).getTime();
		el.html('<img src="' + img.src + '" width="120" height="60" onerror="$.bf.app.login.index.captcha_handler();" />');
	},
	captcha_handler : function () {
		$('.captcha_frame').remove();
	}
};

$(function () {
	$.bf.app.login.index.init();
});
