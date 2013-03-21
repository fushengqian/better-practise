$.registerNameSpace("bf.app.setting.Authority");


//绑定事件
$(function(){
	$("#save_authority").click(function(){
		this.saveAuthority(true);
	}.bind($.bf.app.setting.Authority));
	$("#set_default").click(function(){
		this.saveAuthority(false);
	}.bind($.bf.app.setting.Authority));
});

//保存和设置默认的操作
$.bf.app.setting.Authority.saveAuthority = function(flag)
{
	var data;
	//点击保存获取的值
	if(flag)
	{
		var set_search;
		if($("#set_search").attr("checked"))
		{
			set_search = 1;
		}
		else
		{
			set_search = 0;
		}
		data = {
			"set_myhome"    : $("#set_myhome").val(),
			"set_search"   : set_search
		};
	}
	//点击设置默认值
	else
	{
		data = {"set_myhome"  : 1,
			    "set_search"     : 1
		};
	}
	//执行ajax
	$.bf.ajax.request("/setting/setsecret", data, function(result){	
		$.bf.module.Tooltip.show('已成功保存');
		if(!flag)
		{
			$("#set_myhome").val("1");
			$("#set_search").attr("checked", "checked");
		}
	}, function(errno, error){
		if(errno == $.bf.config.errors.E_NEED_LOGIN)
		{
			$.bf.module.Tooltip.show('未登录或登录超时', $.bf.ui.Tooltip.icons.ERROR);
		}
		else
		{
			$.bf.module.Tooltip.show('系统错误,请稍后操作.', $.bf.ui.Tooltip.icons.ERROR);
		}
	}, 'POST');
}
