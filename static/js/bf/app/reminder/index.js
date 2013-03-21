$.registerNameSpace("bf.app.reminder.index");
$.bf.app.reminder.index = {

	_interval_code : "",

	setLastLiClass : function(){
		if(!$("#message_tips_ul > li").length)
		{
			$("#message_tips").hide();
		}
		$("#message_tips_ul > li").last().attr("class","end");
	},
	getMsg : function(){
		$.bf.ajax.request("/reminder/GetMsg", {}, 
			function (result) {
				if (result.count) {
					$("#message_tips").show();
					// $("#message_tips").setTemplateURL($.bf.config.SITE_URL+"/template/message/reminder_message_template.html",null,{filter_data : false}).processTemplate(result.data);
					
					var html = '<div class="mailBox"><div style="display: none;" class="arrow"></div><div class="t"><span></span></div><div class="w"><div class="c"><div class="con"><ul class="ul_li" id="message_tips_ul">';
					for (var i in result.data) {
						var data = result.data[i];
						html += '<li><p class="r"><a class="mr15" href="/reminder/skip?type_id=' + data.type_id + '">查看</a><a href="javascript:void(0)" tag="close" title="删除" attr="message_close" message_type="' + data.type_id + '"><span class="iconItemClose"></span></a></p><p><a class="tOrange" href="/reminder/skip?type_id=' + data.type_id + '"><strong>' + data.type_count + '</strong></a> ' + data.type_str + '</p></li>';
					}
					html += '</ul></div></div></div><div class="b"><span></span></div></div>';
					$("#message_tips").html(html);
					
					this.setLastLiClass();
				}
			}.bind(this),
			function (errno , error) {
				//$.bf.module.Tooltip.show(error , $.bf.ui.Tooltip.icons.ERROR);
				if (this._interval_code) clearInterval(this._interval_code);
			}.bind(this)
		);
	},
	
	IgnoreMsg : function(type_id){
		if(!type_id)
		{
			$.bf.module.Tooltip.show('系统出错,请稍后再试' , $.bf.ui.Tooltip.icons.ERROR);
			return false;
		}
		var data = {"type_id" : type_id};
		$.bf.ajax.request("/reminder/IgnoreMsg" , data , 
			function(result){
				$("[message_type='"+type_id+"']").parents("li").remove();
				this.setLastLiClass();
			}.bind(this),
			function(errno , error){
				//$.bf.module.Tooltip.show(error , $.bf.ui.Tooltip.icons.ERROR);
			}.bind(this)
		);
	}
};

$(function(){
	setTimeout(function(){$.bf.app.reminder.index.getMsg();},1);
	$.bf.app.reminder.index._interval_code = setInterval(function(){$.bf.app.reminder.index.getMsg();},300000);
	
	$("[attr='message_close']").live('click',function(){
		$.bf.app.reminder.index.IgnoreMsg($(this).attr('message_type'));
	});
	
});