~function($){
	$.fn.extend({
		/**
		* Textarea自适应高度插件
		* @author Jefurry <jefurry.chen@gmail.com>
		* @param onInput 回调方法
		* @param minHeight 最小高度,默认为60px
		* @param allowWordsCount 允许最多字符数,默认为256个字符
		*/
		autoHeight : function(onInput, minHeight, allowWordsCount, maxHeight)
		{
			onInput   = $.isFunction(onInput) && onInput || function(elem){};
			minHeight = minHeight || 85, allowWordsCount = allowWordsCount || 256, maxHeight = maxHeight || 85;
			// 做检测
			var check = function(elem)
			{
				elem = $(elem);
				var val = elem.val();
				//取消超出字符截断
				val.length > allowWordsCount && elem.val(val.substr(0, allowWordsCount));
			};
			return this.each(function(index, item){
				if($.browser.msie)
				{
					this.onpropertychange = function(){
						check(this);
						//这里会导致客户端页面闪烁,暂时注掉
						//onInput.call(this, this);
					}
				}
				else
				{
					var thisCopy = $(this).clone().css({
						"position"   : "absolute",
						"height"     : "0px",
						"display"    : "",
						"visibility" : "hidden",
						"overflow"   : "auto"
					}).appendTo($(this).parent());

					$(this).bind("input", function(event){
						check(this);
						//onInput.call(this, this);
						//thisCopy.val($(this).val());
						//$(this).height(Math.min(maxHeight,Math.max(minHeight, thisCopy.get(0).scrollHeight)));
					});
				}
			});
		}
	});
}(jQuery);