$.registerNameSpace("bf.app.info.index");
$.bf.app.info.index = {
	saveAsk : function() {
		//Ajax提交
		var content = $('#content').val();
		
		if (content.length < 2) {
			$.bf.module.Tooltip.show('请填写提问内容！', $.bf.ui.Tooltip.icons.ERROR);
			return false;
		}
		
        $.ajax({
            type:'post',
            url:'/ask/save',
            async:false,
            dataType:"json",
            data:{"content": content},
            success:function(data) {
                if (data.data.code == 200) {
                	$.bf.module.Tooltip.show('提问成功，我们会尽快给您回复。', $.bf.ui.Tooltip.icons.OK);	
                } else {
                	$.bf.module.Tooltip.show('服务器忙碌，请稍后再试！', $.bf.ui.Tooltip.icons.ERROR);	
                }
            }
        });      
	}
};

$(function(){
    //提交问答
    $("#submit_btn").live('click' , function (){
    	$.bf.app.info.index();
    });
});