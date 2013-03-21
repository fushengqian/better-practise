$.registerNameSpace("bf.app.setting.UserInfo");
$.bf.app.setting.UserInfo.uploadFace = function(msg){
	msg = eval('(' + msg + ')');	
	var data   = msg.data;
	data.errno = msg.errno;
	data.msg   = msg.msg;
	$.bf.ajax.request("/setting/upload", data,
			function(result)
			{
				if(!result)
				{
					return false;
				}
				$("[attr='avatar_90']").attr('src',result.avatar_90);
			},
			function(errno, error)
			{
				if(errno == $.bf.config.errors.E_NEED_LOGIN)
				{
					$.bf.module.Tooltip.show('未登录或登录超时', $.bf.ui.Tooltip.icons.ERROR);
				}
			}
	);
}
