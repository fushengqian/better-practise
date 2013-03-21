$.registerNameSpace("bf.app.apps.play");

$.extend($.bf.app.apps.play,{
	callback : function()
	{
		$.bf.shortcut.Tooltip.show("添加收藏成功", $.bf.ui.Tooltip.icons.OK)
		$("#p_collection").setTemplateElement("ta_colletion");
		$("#p_collection").processTemplate(null);
		$("#p_collection").addClass("mgt5");
	}
});

//收藏app的操作
$("#collection_app").live('click' , function (){
	var app_id = $(this).attr("app_id");
	$.bf.app.apps.collection.addCollectionData(app_id,function(){$.bf.app.apps.play.callback();});
});

var showInvite = function()
{
	$("#toolbar_online").click();
	$("#invite_friends").click();
}