
$.registerNameSpace('bf.app.guide.index');

$.bf.app.guide.index = {
	
	nick_timer : 0,
	nick_procc : 0,
	
	init : function () {
		var $this = this;
		$('#submit_btn').click(function () {
			$this.form_submit();
		});
		$('input:text').keydown(function (event) {
			if (event.keyCode == 13) {
				$this.form_submit();
				return false;
			}
		});
		$('#nickname').blur(function () {
			$this.nick_check();
		}).keyup(function () {
			$this.nick_check(1);
		});
		$('#realname').blur(function () {
			$this.real_check();
		}).keyup(function () {
			$this.real_check();
		});
		$.bf.utils.City.City.joinCity('prov', 'city', 'dist');
		$.bf.utils.time.joinTime('year', 70, 'month', 'day', 'xingzuo', '1990');
	},
	pre_check : function (nick) {
		var ereg = /[`~·～！\!@#￥\$%……\^\&\*\(\)（）\-——\+=\{\}\[\]『』【】\|\\、;；:\：“‘\'\"<>《》,\.，。\/\?？]/;
		var len = nick.replace(/[^\x00-\xff]/g, '**').length, msg;
		if (ereg.test(nick)) msg = '昵称包含非法字符';
		else if (len > 14 || len < 4) msg = '昵称长度为4-14位字符';
		if (msg) {
			var el = $('#nickname'), tip = $('#nick_tip');
			el.parent().parent().attr('class', 'inputRed');
			tip.attr('class', 'errorC');
			tip.html('<span>'+msg+'</span>');
			el.focus();
		} else return true;
	},
	nick_check : function (keyup, fn) {
		var $this = this;
		
		if ($this.nick_timer) clearTimeout($this.nick_timer);
		if (keyup) {
			$this.nick_timer = setTimeout(function () {
				$this.nick_check(0, fn);
			}, 500);
			return ;
		}
		
		var el = $('#nickname'), tip = $('#nick_tip'), nick = $.trim(el.val());
		if (!$this.pre_check(nick)) return ;
		
		if ($this.nick_procc) return ;
		$this.nick_procc = 1;
		
		$.bf.ajax.request('/guide/nickcheck', {nickname : nick}, function (data) {
			el.parent().parent().attr('class', 'inputGreen');
			tip.attr('class', 'none');
			$this.nick_procc = 0;
			fn && fn();
		}, function (errno, error) {
			el.parent().parent().attr('class', 'inputRed');
			tip.attr('class', 'errorC');
			tip.html('<span>'+error+'</span>');
			el.focus();
			$this.nick_procc = 0;
		}, 'POST');
	},
	real_check : function () {
		var el = $('#realname'), tip = $('#real_tip'), name = $.trim(el.val());
		var ereg = /^[\u4e00-\u9fa5]/;
		if (name && !ereg.test(name)) {
			el.parent().parent().attr('class', 'inputRed');
			tip.attr('class', 'errorC');
			tip.html('<span>必须以汉字开头</span>');
			el.focus();
			return false;
		} else {
			el.parent().parent().attr('class', (name ? 'inputGreen' : 'inputM'));
			tip.attr('class', 'none');
			return true;
		}
	},
	form_submit : function () {
		var $this = this;
		$this.nick_check(0, function () {
			if ($this.real_check()) $('#guide_form').submit();
		});
		return false;
	}
};

$(function () {
	$.bf.app.guide.index.init();
});
