// JavaScript Document
$.registerNameSpace("bf.utils.copy");
$.bf.utils.copy=function(txt,id){
	//txt - 复制文本
	//id - 复制按钮id
	var clip=null;
	$(function(){
		clip = new ZeroClipboard.Client();
		clip.setHandCursor(true);
		clip.addEventListener('mouseOver', $.bf.utils.copy);
		clip.addEventListener('complete', $.bf.utils.copyComplete);
		clip.setText(txt);
		clip.glue(id);
	});
}
$.bf.utils.copyComplete=function(client){
	$.bf.shortcut.Tooltip.show("复制成功", $.bf.ui.Tooltip.icons.OK);
}