$.registerNameSpace('bf.app.exchange');

$.bf.app.exchange = {
	timer : 0,
	offset : 0,
	start_cutover : function () {
		var el = $('.cutover_list:first'), li = $('li', el);
		var w = 170, l = li.length, $this = this, pos = 'left', proc = 0;
		for (var i = 0; i < l; i++) {
			$(li[i]).clone().appendTo(el);
		}
		el.css('width', (w * l * 2) + 'px');
		
		var pause = function () {
			clearInterval($this.timer);
		};
		
		var left = function () {
			if (proc) return;
			proc = 1;
			if ($this.offset == l) {
				$this.offset = 0;
				el.parent().get(0).scrollLeft = 0;
			}
			$this.offset++;
			o = $this.offset * w;
			el.parent().animate({
				scrollLeft : o
			}, function () {
				if ($this.offset == l) {
					$this.offset = 0;
					el.parent().get(0).scrollLeft = 0;
				}
				proc = 0;
			});
		};
		
		var right = function () {
			if (proc) return;
			proc = 1;
			if ($this.offset == 0) {
				$this.offset = l;
				el.parent().get(0).scrollLeft = l * w;
			}
			$this.offset--;
			o = $this.offset * w;
			el.parent().animate({
				scrollLeft : o
			}, function () {
				if ($this.offset == 0) {
					$this.offset = l;
					el.parent().get(0).scrollLeft = l * w;
				}
				proc = 0;
			});
		};
		
		var auto = function (speed) {
			speed = speed || 3000;
			$this.timer = setInterval(function () {
				pos == 'right' ? right() : left();
			}, speed);
		};
		
		$('li', el).hover(pause, function () { pause(); auto(); });
		$('#cutover_left').hover(function () { pos = 'left'; pause(); auto(1000); }, function () { pause(); auto(); }).click(left);
		$('#cutover_right').hover(function () { pos = 'right'; pause(); auto(1000); }, function () { pause(); auto(); }).click(right);
		auto();
	},
	
	u_time : 0,
	u_offset : 0,
	u_start : function () {
		var el = $('.exchanging ul:first'), li = $('li', el);
		var h = 140, l = li.length, $this = this, proc = 0;
		for (var i = 0; i < l; i++) {
			$(li[i]).clone().appendTo(el);
		}
		
		var pause = function () {
			clearInterval($this.u_time);
		};
		
		var auto = function () {
			$this.u_time = setInterval(function () {
				if (proc) return;
				proc = 1;
				if ($this.u_offset == (l / 5)) {
					$this.u_offset = 0;
					el.get(0).scrollTop = 0;
				}
				$this.u_offset++;
				o = $this.u_offset * h;
				el.animate({
					scrollTop : o
				}, function () {
					if ($this.u_offset == (l / 5)) {
						$this.u_offset = 0;
						el.get(0).scrollTop = 0;
					}
					proc = 0;
				});
			}, 3000);
		};
		
		$('li', el).hover(pause, function () { pause(); auto(); });
		
		auto();
	}
};

$(function () {
	$.bf.app.exchange.start_cutover();
	setTimeout(function () {$.bf.app.exchange.u_start();}, 1000);
});