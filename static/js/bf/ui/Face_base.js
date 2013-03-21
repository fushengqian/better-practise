/**
 * 插入表情插件
 * @author Jefurry <jefurry@taomee.com>
 */

~function($){
	$.fn.extend({
		insertFace: function(valInput)
		{
			
			var val = $.bf.ui.Face.editCode(valInput);
			
			var elem = $(this)[0];
			
			if (document.selection)
			{
				this.focus();
				var sel = document.selection.createRange();
				sel.text = val;
				this.focus();
			}
			else if(elem.selectionStart || elem.selectionStart == '0')
			{
				var startPos = elem.selectionStart;
				var endPos = elem.selectionEnd;
				var scrollTop = elem.scrollTop;
				elem.value = elem.value.substring(0, startPos) + val + elem.value.substring(endPos, elem.value.length);
				this.focus();
				elem.selectionStart = startPos + val.length;
				elem.selectionEnd = startPos + val.length;
				elem.scrollTop = scrollTop;
			}
			else
			{
				this.value += val;
				this.focus();
			}
		}
	});
}(jQuery);

$.registerNameSpace('bf.ui.Face');
$.extend($.bf.ui.Face , {
	sndaFaceCfg : [],
	config : function(){
		var sndaFaceCfg = this.sndaFaceCfg;
		sndaFaceCfg[0]=['\\[大笑\\]','1.gif','大笑'];
		sndaFaceCfg[1]=['\\[愤怒\\]','2.gif','愤怒'];
		sndaFaceCfg[2]=['\\[色\\]','3.gif','色'];
		sndaFaceCfg[3]=['\\[耍酷\\]','4.gif','耍酷'];
		sndaFaceCfg[4]=['\\[泪奔\\]','5.gif','泪奔'];
		sndaFaceCfg[5]=['\\[晕\\]','6.gif','晕'];
		sndaFaceCfg[6]=['\\[衰\\]','7.gif','衰'];
		sndaFaceCfg[7]=['\\[茫然\\]','8.gif','茫然'];
		sndaFaceCfg[8]=['\\[吐舌头\\]','9.gif','吐舌头'];
		sndaFaceCfg[9]=['\\[眨眼\\]','10.gif','眨眼'];
		sndaFaceCfg[10]=['\\[bye\\]','11.gif','bye'];
		sndaFaceCfg[11]=['\\[闭嘴\\]','12.gif','闭嘴'];
		sndaFaceCfg[12]=['\\[得意\\]','13.gif','得意'];
		sndaFaceCfg[13]=['\\[干杯\\]','14.gif','干杯'];
		sndaFaceCfg[14]=['\\[害羞\\]','15.gif','害羞'];
		sndaFaceCfg[15]=['\\[钱钱\\]','16.gif','钱钱'];
		sndaFaceCfg[16]=['\\[礼物\\]','17.gif','礼物'];
		sndaFaceCfg[17]=['\\[流口水\\]','18.gif','流口水'];
		sndaFaceCfg[18]=['\\[汗\\]','19.gif','汗'];
		sndaFaceCfg[19]=['\\[吃惊\\]','20.gif','吃惊'];
		sndaFaceCfg[20]=['\\[月饼\\]','21.gif','月饼'];
	},
	editCode : function(index) {
		return '[' + $.bf.ui.Face.sndaFaceCfg[index][2] + ']';
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

		$.bf.ui.Face.config();
		if(!baseUrl)baseUrl = $.bf.config.getStaticPath()+"/img/face/";
		var imgtxt = '';
		var array_search = function(str,arr){
			for(var i in arr){
				if(arr[i][0]==str)return i;
			}
			return false;
		};
		
		var index,imgtxt,reg;
		for (var i in this.sndaFaceCfg){
			index = array_search(this.sndaFaceCfg[i][0],this.sndaFaceCfg);
			imgtxt = '<img src='+baseUrl+this.sndaFaceCfg[index][1]+' title='+this.sndaFaceCfg[index][2]+' height="22px" width="22px"/>';
			reg = new RegExp(this.sndaFaceCfg[i][0],"g"); //创建正则RegExp对象
			content=content.replace(reg,imgtxt);
		}

		return content;
	}
});
