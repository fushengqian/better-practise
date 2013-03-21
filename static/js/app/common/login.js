$.registerNameSpace("bf.app.common.login");
$.bf.app.common.login = {
	
	save : function() {
		//Ajax提交
		var user_name = $('#pop_user_name').val();
		var password = $('#pop_password').val();
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
            		$.bf.module.Tooltip.show('登录失败,请核对您的账号信息!', $.bf.ui.Tooltip.icons.ERROR);	
                }
            }
        });      
	},
	
	checklogin:function(user_name,password) {
		if (user_name.length < 1) {
			$.bf.module.Tooltip.show('请输入您的用户名！', $.bf.ui.Tooltip.icons.ERROR);
			$('#pop_user_name').focus();
			return false;
		}
		
		if (password.length < 1) {
			$.bf.module.Tooltip.show('请输入您的密码！', $.bf.ui.Tooltip.icons.ERROR);
			$('#pop_password').focus();
			return false;
		}
		return true;
	},
	
	//弹出登录窗口
	popLogin:function() {
		var dialog_html = '<div id="login_pop" class="popup"><div class="layer-bg">\
				 <!--[if IE 6]><iframe frameBorder="0" class="layer-fix-ie6"></iframe><![endif]--></div>\
			     <div><table class="layer popupBox">\
			     <tr><td></td><td></td><td></td></tr><tr><td></td><td><div class="layerBox" style="display: block;">\
				 <div class="layerBoxTop"><strong>快速登录</strong><a href="javascript:;" class="close" onclick="$.bf.module.HTMLDialog.hide();">\
				 <img src="/static/images/common/s.gif" class="btn-close"></a></div><div class="layerContent"><div class="content">\
				 <div class="public-form s-form form-signin mt20px"><form id="login_form" name="login_form" method="post">\
				 <div class="row" style="padding-left:100px;"><label class="hd">帐号：</label>\
				 <div class="bd"><input type="text" id="pop_user_name" name="user_name" autocomplete="off" class="inp-text">\
				 </div></div><div class="row" style="padding-left:100px;">\
				 <label class="hd">密码：</label>\
				 <div class="bd"><input type="password" id="pop_password" name="password" autocomplete="off" class="inp-text"></div></div>\
				 <div class="opt-area" style="padding-left:100px;padding-top:20px;"><p class="btn-submit"><span id="login_submit">登录</span></p>&nbsp;\
				 <a href="javascript:;">忘记密码？</a><span class="gray"> | </span><a href="/register">免费注册</a></div></form></div></div></div></div></td>\
				 <td></td></tr><tr><td></td><td></td><td></td></tr></table></div></div>';
				 
		$.bf.module.HTMLDialog.init(true).setHTML(dialog_html);
		$.bf.module.HTMLDialog.setSize({width:"484px",height:"212px"});
		$.bf.module.HTMLDialog.show();
	}
	
};

$(function () {
	  $('#login_submit').live('click', function() {
			var user_name = $('#pop_user_name').val();
			var password = $('#pop_password').val();
			if ($.bf.app.common.login.checklogin(user_name, password) == true) {
				$.bf.app.common.login.save();
			}
		});
	});