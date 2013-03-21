$.registerNameSpace("bf.app.home.login");
$.bf.app.home.login = {
	save : function() {
		//Ajax提交
		var user_name = $('#user_name').val();
		var password = $('#password').val();
        $.ajax({
            type:'post',
            url:'/login/Dologin',
            async:false,
            dataType:"json",
            data:{"user_name": user_name, "password": password},
            success:function(data) {
                if (data.data.code == 200) {
            		$.bf.module.Tooltip.show('登录成功!', $.bf.ui.Tooltip.icons.OK);	
                	location.href = '/';
                }else {
            		$.bf.module.Tooltip.show('登录失败!', $.bf.ui.Tooltip.icons.ERROR);	
                }
            }
        });      
	}
};

//表单验证
function checklogin() {
	var user_name = $('#user_name').val();
	var password = $('#password').val();
	if (user_name.length < 1 || password.length < 1) {
		$.bf.module.Tooltip.show('请核对您的登录信息！', $.bf.ui.Tooltip.icons.ERROR);
		$('#user_name').focus();
		return false;
	}
	$.bf.app.home.login.save();
}