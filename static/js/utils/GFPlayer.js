/**
 * Gesion Focus Player
 * 
 * @version 1.0.0
 * @author 	gesion<v.wangensheng@snda.com>
 */
(function ($) {
	$.fn.GFPlayer = function (params) {
		params = $.extend({
			autoPlay 	: 1, 			// 自动播放：0（不自动播放）, 1（自动播放）
			showPrev 	: 0, 			// 向前翻页：0（隐藏）, {string}（#id / .class）
			showNext 	: 0, 			// 向后翻页：0（隐藏）, {string}（#id / .class）
			linkStyle 	: 'current', 	// 链接样式：{string}
			showSlider 	: 1,			// 显示滑块：1 / true（显示）, 0 / false（隐藏）
			showDetail 	: 1, 			// 显示描述：1 / true（显示）, 0 / false（隐藏）
			detailAlpha : 1, 			// 描述透明：{int}
			playerSpeed : 'normal', 	// 播放速度：fast / normal / slow / {int}（毫秒）
			playerTimer : 3000, 		// 播放间隔：{int}（毫秒）
			sliderSpeed : 300, 			// 滑动速度：fast / normal / slow / {int}（毫秒）
			sliderTimer : 300 			// 滑动响应：{int}（毫秒）
		}, params);
		
		return this.each(function () {
			$.fn.GFPlayer.start($(this), params);
		});
	};
	
	$.fn.GFPlayer.start = function (e, p) {
		var TID, GFI,
		GFP = $('.GFPlayer', e), GFPI = GFP.children(), LEN = GFPI.length,
		GFT = $('.GFToggle', e), GFTI = GFT.children(),
		GFD = $('.GFDetail', e), GFDI,
		GFS = $('.GFSlider', e),
		GFL = $('.GFLegend', e);
		
		if (p.showDetail) {
			if (GFL.length < 1) {
				$('<div class="GFLegend"></div>').appendTo(e);
				GFL = $('.GFLegend', e);
			}
			GFL.html('&nbsp;');
			GFDI = GFD.children();
			var _GFPI = GFPI.eq(0);
			var _GFLO = GFL.offset();
			var _GFPO = _GFPI.offset();
			if (p.detailAlpha != 1) GFL.css('opacity', p.detailAlpha);
			/*
			GFL.css({
				top : _GFPO.top - _GFLO.top - GFL.height() + _GFPI.height(),
				left : _GFPO.left - _GFLO.left,
				width : _GFPI.width(),
				opacity : p.detailAlpha,
				position : 'relative',
				'z-index' : 20
			});
			*/
		}
		
		if (p.showSlider) {
			GFT.css({position : 'relative', 'z-index' : 10});
			if (GFS.length < 1) {
				$('<div class="GFSlider"></div>').appendTo(e);
				GFS = $('.GFSlider', e);
			}
			var _GFSO = GFS.offset();
			var _GFTI = GFTI.eq(0);
			var _GFTO = _GFTI.offset();
			GFS.css({
				top : _GFTO.top - _GFSO.top,
				left : _GFTO.left - _GFSO.left,
				width : _GFTI.width(),
				height : _GFTI.height(),
				position : 'relative',
				'z-index' : 0
			});
		}
		
		GFPI.css({position : 'absolute'});
		GFPI.eq(0).siblings().css('opacity', 0);
		
		var GFPlayer = function (i) {
			if (typeof i == 'undefined' || i >= LEN) i = 0;
			if (i < 0) i = LEN - 1;
			if (GFI == i) return ;
			
			GFPI.eq(i).animate({opacity:1}, p.playerSpeed).css('z-index', 1);
			GFTI.eq(i).addClass(p.linkStyle);
			if (typeof GFI != 'undefined') {
				GFPI.eq(GFI).animate({opacity:0}, p.playerSpeed).css('z-index', 0);
				GFTI.eq(GFI).removeClass(p.linkStyle);
			}
			
			if (p.showDetail) GFL.html(GFDI.eq(i).html());
			
			if (p.showSlider) {
				var _GFTI = GFTI.eq(i);
				var _GFSO = GFS.offset();
				var _GFTO = _GFTI.offset();
				GFS.animate({
					top : parseInt(GFS.css('top')) + _GFTO.top - _GFSO.top,
					left : parseInt(GFS.css('left')) + _GFTO.left - _GFSO.left,
					width : _GFTI.width(),
					height : _GFTI.height()
				}, p.sliderSpeed);
			}
			
			GFI = i;
		};
		
		var showGFP = function () {
			var i;
			if (typeof GFI != 'undefined') i = GFI + 1;
			GFPlayer(i);
			startGFP();
		};
		
		var startGFP = function () {
			if (!p.autoPlay) return ;
			TID = setTimeout(function () {
				showGFP();
			}, p.playerTimer);
		};
		
		var clearGFP = function () {
			if (TID) clearTimeout(TID);
		};
		
		showGFP();
		
		$('a', e).focus(function () {
			this.blur();
		});
		
		if (p.showDetail) {
			GFL.hover(function () {
				clearGFP();
			}, function () {
				startGFP();
			});
		}
		
		if (p.showPrev) {
			var el = $(p.showPrev);
			el.click(function () {
				clearGFP();
				GFPlayer(GFI - 1);
				return false;
			});
			el.hover(function () {
				clearGFP();
			}, function () {
				startGFP();
			});
		}
		
		if (p.showNext) {
			var el = $(p.showNext);
			el.click(function () {
				clearGFP();
				GFPlayer(GFI + 1);
				return false;
			});
			el.hover(function () {
				clearGFP();
			}, function () {
				startGFP();
			});
		}
		
		if (!p.autoPlay) return ;
		
		GFPI.hover(function () {
			clearGFP();
		}, function () {
			startGFP();
		});
		
		GFTI.hover(function () {
			clearGFP();
			i = GFTI.index(this);
			TID = setTimeout(function () {
				GFPlayer(i);
			}, p.sliderTimer);
		}, function () {
			startGFP();
		});
	};
})(jQuery);
