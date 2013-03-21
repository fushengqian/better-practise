/**
 * 插入表情插件
 * @author Jefurry <jefurry@taomee.com>
 */

~function($){
	$.fn.extend({
		insertFace: function(code)
		{
			var elem = $(this)[0];
			if (document.selection)
			{
				this.focus();
				var sel = document.selection.createRange();
				sel.text = code;
				this.focus();
			}
			else if(elem.selectionStart || elem.selectionStart == '0')
			{
				var startPos = elem.selectionStart;
				var endPos = elem.selectionEnd;
				var scrollTop = elem.scrollTop;
				elem.value = elem.value.substring(0, startPos) + code + elem.value.substring(endPos, elem.value.length);
				this.focus();
				elem.selectionStart = startPos + code.length;
				elem.selectionEnd   = startPos + code.length;
				elem.scrollTop      = scrollTop;
			}
			else
			{
				this.value += code;
				this.focus();
			}
		}
	});
}(jQuery);

/**
* 表情窗体
* @author 陈耀强
*/

$.registerNameSpace("bf.ui");
$.bf.ui.FaceBox = $.Class.create();

$.Class.extend($.bf.ui.FaceBox, $.bf.ui.Dialog, {
	__init__ : function(textarea)
	{
		this._textarea = this.setTextarea(textarea); 
		this.setMasker(false);
		this._smileArray               = [
			['\\[大笑\\]', '1.gif', '大笑'],
			['\\[愤怒\\]','2.gif','愤怒'],
			['\\[色\\]', '3.gif', '色'],
			['\\[耍酷\\]', '4.gif', '耍酷'],
			['\\[泪奔\\]', '5.gif', '泪奔'],
			['\\[晕\\]', '6.gif', '晕'],
			['\\[衰\\]', '7.gif', '衰'],
			['\\[茫然\\]', '8.gif', '茫然'],
			['\\[吐舌头\\]', '9.gif', '吐舌头'],
			['\\[眨眼\\]', '10.gif', '眨眼'],
			['\\[bye\\]', '11.gif', 'bye'],
			['\\[闭嘴\\]', '12.gif', '闭嘴'],
			['\\[得意\\]', '13.gif', '得意'],
			['\\[干杯\\]', '14.gif', '干杯'],
			['\\[害羞\\]', '15.gif', '害羞'],
			['\\[钱钱\\]', '16.gif', '钱钱'],
			['\\[礼物\\]', '17.gif', '礼物'],
			['\\[流口水\\]', '18.gif', '流口水'],
			['\\[汗\\]', '19.gif', '汗'],
			['\\[吃惊\\]', '20.gif', '吃惊'],
			['\\[月饼\\]', '21.gif', '月饼']
		]; // 表情数组
		this._html = '\
			<div class="popup" style="z-index: 36000; width: 400px; top: 85%; display: none;">\
				<div class="shadow"></div>\
				<span class="popArrow"></span>\
				<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
				<div class="popupBoxL">\
					<div class="popupBoxR">\
						<div class="popupBox">\
							<div class="popGreenClose"><a attr="face_close_btn" onclick="return false" href="javascript:;" class="r iconClose"></a></div>\
							<div class="popupMain">\
								<div class="smileList" attr="twitter_smile_container"></div>\
							</div>\
						</div>\
					 </div>\
				</div>\
				<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
			</div>\
		';
		this.superclass.build.call(this);
		this._smileContainer = this.getDialog().find("[attr='twitter_smile_container']"); // 表情容器
		this._faceCloseBtn   = this.getDialog().find("[attr='face_close_btn']"); // 关闭表情对话框按钮

		this._initEvent();
		this._initSmile(); // 初始化表情
	},
	/**
	 * 设置显示位置
	 * @param target 需要对齐的目标
	 * @param pos 方位，放置在上面或下面，取值为over(在上面)或under(在下面)
	 * @param offset 偏移对象
	 */
	initPosition : function(target, pos, offset)
	{
		offset = offset || {top : 60, left : 0};
		offset.top = offset.top || 0, offset.left = offset.left || 0;
		target = $(target);
		var targetHeight = target.height(), targetOffset = target.offset();
		var cssProperty = null;
		pos = pos || "over";
		if(pos == "over")
		{	
			cssProperty = {
				top  : targetOffset.top - this._textarea.height() - offset.top,
				left : targetOffset.left + offset.left
			};
		}
		else
		{
			offset.top = 10;
			cssProperty = {
				top  : targetOffset.top + targetHeight + offset.top,
				left : targetOffset.left + offset.left
			};
		}
		this.getDialog().css(cssProperty);
		return this;
	},
	_initEvent : function()
	{
		// 关闭表情对话框
		this._faceCloseBtn.click(function(event){
			this.hide();
		}.bind(this));
	},
	setTextarea : function(textarea)
	{
		this._textarea = textarea && $(textarea) || null;
		return this._textarea;
	},
	/**
	* 初始化表情
	*/
	_initSmile : function()
	{
		var smileBaseURL = $.bf.config.getStaticPath() + "/img/face/";
		var tpl = [];
		$.each(this._smileArray, function(index, arr){
			tpl[tpl.length] = $.sprintf('<a href="javascript:;" code="[%s]" title="%s" alt="%s"><img src="%s"></a>', arr[2], arr[2], arr[2], smileBaseURL + arr[1]);
		});
		
		var $this = this;
		this._smileContainer.html(tpl.join('')).find("a").click(function(event){
			event.preventDefault();
			event.stopPropagation();

			var code = $.trim($(this).attr("code"));
			$this.onSelect(code);
		});
	},
	/**
	* 在选择表情时触发
	* @param code 表情代号
	*/
	onSelect : function(code)
	{
		if(!this._textarea || !code)
		{
			return false;
		}
		this._textarea.insertFace(code);
		this.hide();
	},
	setPosition : function()
	{
	},
	codeToSmile : function(content,convert,baseUrl){
		if (convert) { //js htmlsepcialchars
			content = content.replace(/&/g, '&amp;');
			content = content.replace(/</g, '&lt;');
			content = content.replace(/>/g, '&gt;');
			content = content.replace(/\"/g, '&quot;');
			content = content.replace(/\'/g, '&#039;');
		}

		content = content.replace(/\[url=http:\/\/t.sdo.com\/(.+?)\](.+?)\[\/url\]/gi,"<a href=\"http://t.sdo.com/$1\" target=\"_blank\">$2</a>");

		// $.bf.ui.Face.config();
		if(!baseUrl)baseUrl = $.bf.config.getStaticPath()+"/img/face/";
		var imgtxt = '';
		var array_search = function(str,arr){
			for(var i in arr){
				if(arr[i][0]==str)return i;
			}
			return false;
		};
		
		var index,imgtxt,reg;
		for (var i in this._smileArray){
			index = array_search(this._smileArray[i][0],this._smileArray);
			imgtxt = '<img src='+baseUrl+this._smileArray[index][1]+' title='+this._smileArray[index][2]+' height="22px" width="22px"/>';
			reg = new RegExp(this._smileArray[i][0],"g"); //创建正则RegExp对象
			content=content.replace(reg,imgtxt);
		}

		return content;
	}
});
