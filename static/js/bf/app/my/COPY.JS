// JavaScript Document
$.registerNameSpace("bf.app.my.copy");
var clip=null;
$(function() {
	clip = new ZeroClipboard.Client();
	clip.setHandCursor(true);
	clip.addEventListener('mouseOver', $.bf.app.my.copy);
	clip.addEventListener('complete', $.bf.app.my.copy.complete);
	clip.setText($("#copyContent").text());
	clip.glue('copyDomain');
});

$.bf.app.my.copy.complete = function(client) {
	try{
		window.clipboardData.setData("Text",$("#copyContent").text());
	}catch(e){}
	$.bf.module.TxtTips.show($("#copyDomain"),'复制成功');
	//$.bf.module.Tooltip.show('复制成功.', $.bf.ui.Tooltip.icons.OK);
};