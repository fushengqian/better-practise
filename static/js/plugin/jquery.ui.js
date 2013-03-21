(function ($, undefined) {

	$.ui = $.ui || {};
	if ($.ui.version) { return; }

	$.extend($.ui, {
		version: "1.0.0"
	});

	var ELEMENT_ID_DIALOG = "#_dialog";
	var ELEMENT_ID_DIALOG_BOX = "#_dialog_box";
	var ELEMENT_ID_DIALOG_CONTENT = "#_dialog_content";
	var ELEMENT_ID_DIALOG_SYSTEM = "#_dialog_sys";
	var ELEMENT_ID_DIALOG_BUTTON_OK = "#_dialog_button_ok";
	var ELEMENT_ID_DIALOG_BUTTON_CANCEL = "#_dialog_button_cancel";
	var ELEMENT_ID_DIALOG_BUTTON_CLOSE = "#_dialog_button_close";

	$.fn.extend({
		dialog: function (settings) {
			$.ui.dialog._open(this, settings);
		}
	});

	$.extend($.ui, {
		alert: function (settings) {
			$.ui.dialog._open(null, jQuery.extend({
				type: "alert"
			}, settings));
		},

		confirm: function (settings) {
			$.ui.dialog._open(null, jQuery.extend({
				type: "confirm"
			}, settings));
		},

		dialog: {
			open: function (id, settings) {
				if (id) {
					$.ui.dialog._open($("#{0}".format(id)), settings);
				}
			},

			close: function () {
				$(ELEMENT_ID_DIALOG).hide();
				$(ELEMENT_ID_DIALOG_SYSTEM).remove();
			},

			_ensure: false,

			_open: function (obj, settings) {
				settings = jQuery.extend({
					type: "layer",
					title: "",
					html: "",
					okText: "确定",
					cancelText: "取消",
					okHandler: function () { $.ui.dialog.close(); },
					cancelHandler: function () { $.ui.dialog.close(); },
					closeHandler: function () { $.ui.dialog.close(); }
				}, settings);

				$.ui.dialog._init(settings);

				$(ELEMENT_ID_DIALOG).show();

				switch (settings.type) {
					case "alert":
					case "confirm":
						var flag = settings.type == "confirm";
						$(ELEMENT_ID_DIALOG_CONTENT).append('<div id="_dialog_sys" class="layerBox"><div class="layerBoxTop"><strong>{0}</strong> <a id="_dialog_button_close" href="javascript:void(0);" class="close"><img src="../../images/common/s.gif" class="btn-close" /></a></div><div class="layerContent"><div class="content">{1}</div><div class="optArea"><a id="_dialog_button_ok" href="javascript:void(0);" class="btn-allow">{2}</a>{3}</div></div></div>'.format(settings.title, settings.html, settings.okText, flag ? ' <a id="_dialog_button_cancel" href="javascript:void(0);" class="btn-deny">{0}</a>'.format(settings.cancelText) : ""));
						$(ELEMENT_ID_DIALOG_BUTTON_OK).click(settings.okHandler);
						$(ELEMENT_ID_DIALOG_BUTTON_CLOSE).click(settings.closeHandler);
						if (flag)
							$(ELEMENT_ID_DIALOG_BUTTON_CANCEL).click(settings.cancelHandler);
						break;
					case "layer":
					default:
						obj.show();
						break;
				}

				$(ELEMENT_ID_DIALOG_BOX).css("top", ($(window).height() - $(ELEMENT_ID_DIALOG_BOX).height()) / 2 + $(window).scrollTop() + "px").css("left", ($(window).width() - $(ELEMENT_ID_DIALOG_BOX).width()) / 2 + "px");
			},

			_init: function (settings) {
				if (!$.ui.dialog._ensure) {
					if (!$(ELEMENT_ID_DIALOG).length) {
						$("body").append('<div id="_dialog" style="display: none;"><div class="layer-bg"><!--[if IE 6]><iframe frameBorder="0" class="layer-fix-ie6"></iframe><![endif]--></div><div id="_dialog_box" style="position: absolute; z-index: 2000;"><table class="layer"><tr><td class="top-l"></td><td class="top-c"></td><td class="top-r"></td></tr><tr><td class="mid-l"></td><td id="_dialog_content" class="mid-c"></td><td class="mid-r"></td></tr><tr><td class="bottom-l"></td><td class="bottom-c"></td><td class="bottom-r"></td></tr></table></div></div>');
					}
					$(".layerBox").hide().appendTo(ELEMENT_ID_DIALOG_CONTENT);
					$.ui.dialog._ensure = !$.ui.dialog._ensure;
				}
				else {
					$(".layerBox").hide();
				}
			},

			_height: function () {
				var scrollHeight, offsetHeight;
				if ($.browser.msie && $.browser.version < 7) {
					scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
					offsetHeight = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
					if (scrollHeight < offsetHeight) {
						return $(window).height() + "px";
					} else {
						return scrollHeight + "px";
					}
				} else {
					return $(document).height() + "px";
				}
			},

			_width: function () {
				var scrollWidth, offsetWidth;
				if ($.browser.msie && $.browser.version < 7) {
					scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
					offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
					if (scrollWidth < offsetWidth) {
						return $(window).width() + "px";
					} else {
						return scrollWidth + "px";
					}
				} else {
					return $(document).width() + "px";
				}
			}
		}
	});
})(jQuery);

String.prototype.format = function () {
	args = arguments;
	return this.replace(/\{(\d+)\}/g, function (m, i) {
		return args[i];
	});
}
