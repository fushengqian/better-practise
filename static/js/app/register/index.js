
//刷新父窗口
function closeWindow() {
	var from = $('#from').val();
	if (from == 'web') {
		parent.location.href = '/';
	} else {
		parent.parent.location.reload();
		parent.parent.GB_hide();
	}
}

//表单验证
$(function() {
	 //确认注册
	 $('#do_register').live('click', function(){
			if ($("#username").val().length < 1) {
				alert('请输入您的邮箱！');
				return false;
			}
			
		 	var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
		 	if(!myreg.test($("#username").val())) {
		 		alert('您的邮箱格式有误！');
				return false;
	 		}

			if ($("#password").val().length < 6) {
				alert('请输入您的密码，不能少于6位且不能大于20位！');
				return false;
			}

			if ($("#password1").val().length < 6) {
				alert('请确认您的密码！');
				return false;
			}

			if ($("#password").val() != $("#password1").val()) {
				alert('密码两次输入不一致！');
				return false;
			}
			
			$.ajax({
			        url:'/register/do',
			        dataType:"json",
			        data:{"username": $("#username").val(), "password":$("#password").val(), "password1":$("#password1").val()},
			        contentType: "application/json; charset=utf-8",
		            async: false,
			        success:function(data) {
			            if (data.result == 200) {
			            	alert('恭喜，注册成功！');
							window.setTimeout('closeWindow();', 1);
			            } else {
			            	alert('抱歉，注册失败，请稍后再试！');
			            }
			        }
			 });
	 }); 
});