$.registerNameSpace("bf.app.setting.Block");

$(function(){

	var new_tipc = $("[attr='new_tips_container']");

	$().keydown(function(event){
		if(event.keyCode == 13)
		{
			$.bf.app.setting.Block.searchUser();
		}
	});

	$("[attr='tips_close']").click(function(event){
		event.preventDefault();
		event.stopPropagation();
		
		$(this).parent().parent().parent().hide();
	});

	$("[attr='user_close']").click(function(event){
		event.preventDefault();
		event.stopPropagation();

		$(this).parent().parent().parent().hide();
	});

	$.extend($.bf.app.setting.Block, {
		tipc  : $("[attr='tips_container']"), // 消息提示总容器
		msgc  : $("[attr='tips_container']").find("[attr='tips']"), // 消息容器
		utc   : $("[attr='user_container']"), // 用户列表总容器
		ucc   : $("[attr='user_count']"), // 用户个数容器
		userc : $("[attr='user_list']"), // 用户列表容器
		// 添加提示信息
		addTips : function(msg)
		{
			this.msgc.text(msg || "");
			this.tipc.show();
		},
		// 搜索用户
		searchUser : function()
		{
			var search_key = $.trim($("[attr='search_key']").val());
			if(!search_key)
			{
				//$.bf.app.setting.Block.tipc.show();
				$.bf.app.setting.Block.utc.hide();
				$.bf.module.TxtTips.show(new_tipc,'请输入昵称');
				//$.bf.app.setting.Block.msgc.text("请输入昵称").show();
				return;
			}

			var data = {
				"search_key" : search_key
			};

			$.bf.ajax.request('/setting/searchuser', data, function(result){
				var data = new Function("return " + result + ";")();
				var total = parseInt(data.total);
				if(total > 0)
				{
					for(var key in data.rows)
					{
						data.rows[key]['sdid'] = key;
					}
					$.bf.app.setting.Block.tipc.hide();
					$.bf.app.setting.Block.ucc.text($.sprintf("找到%s个用户", total));
					$.bf.app.setting.Block.userc.setTemplateElement("search_return_tpl").processTemplate(data);
					$.bf.app.setting.Block.utc.show();
				}
				else
				{
					//$.bf.app.setting.Block.tipc.show();
					$.bf.app.setting.Block.utc.hide();
					$.bf.module.TxtTips.show(new_tipc,'你查找的用户不存在');
					//$.bf.app.setting.Block.msgc.text("").show();
				}
			}, function(errno, error){
				//$.bf.app.setting.Block.tipc.show();
				$.bf.app.setting.Block.utc.hide();
				if(errno == $.bf.config.errors.E_NEED_LOGIN)
				{
					$.bf.module.Tooltip.show('未登录或登录超时', $.bf.ui.Tooltip.icons.ERROR);
				}
				else
				{
					$.bf.module.TxtTips.show(new_tipc,'你查找的用户不存在');
					//$.bf.app.setting.Block.msgc.text("").show();
				}
			}, 'POST');
		},
		// 添加用户进入黑名单
		addBlockUser : function(userid, callback)
		{
			if(!userid)
			{
				this.addTips("你添加的用户不存在");
				return false;
			}
			var data = {"id" : userid};
			$.bf.ajax.request("/setting/addblockuser", data, function(result){
				callback && callback();
				if(result)
				{
					$("[attr='has_block_title']").show();
					$("<span></span>").appendTo($("[attr='block_container']")).end().show().setTemplateElement("block_users_tpl").processTemplate(result).show();
					$("[attr='no_block_title']").hide();
					$("[attr='block_container']").show();
					var size = $("[attr='user_list']").children('li').size();
					if(size <= 0)
					{
						$("[attr='user_container']").hide();
					}
					else
					{
						$("[attr='user_count']").html("找到"+size+"个用户");
					}
				}
				$.bf.module.Tooltip.show('已成功添加');
			}, function(errno, error) {
				if(errno == $.bf.config.errors.E_NEED_LOGIN)
				{
					$.bf.module.Tooltip.show('未登录或登录超时', $.bf.ui.Tooltip.icons.ERROR);
				}
				else
				{
					this.addTips(error);
				}
			}.bind(this), 'POST');
		},
		// 从黑名单中删除用户
		delBlockUser : function(userid, callback)
		{
			if(!userid)
			{
				this.addTips("你删除的用户不存在");
				return false;
			}
			var data = {
				"id" : userid
			};
			$.bf.ajax.request("/setting/delblockuser", data, function(result){
				callback && callback();
				if(result)
				{
					if(result.count <= 0)
					{
						$("[attr='has_block_title']").hide();
						$("[attr='block_container']").hide();
						$.bf.app.setting.Block.tipc.hide();
						$("[attr='no_block_title']").show();
					}
				}
				$.bf.module.Tooltip.show('已成功删除');
			}, function(errno, error){
				if(errno == $.bf.config.errors.E_NEED_LOGIN)
				{
					$.bf.module.Tooltip.show('未登录或登录超时' , $.bf.ui.Tooltip.icons.ERROR);
				}
				else
				{
					this.addTips(error);
				}
			}.bind(this));
		}
	});

	// 加入黑名单事件
	$("[attr='add_block_user']").live('click', function(event){
		var sdid = $(this).attr("sdid"); // 获取用户SDID
		$.bf.app.setting.Block.addBlockUser(sdid, function(){
			$(this).parent().parent().remove();
		}.bind(this));
	});
	
	// 从黑名单中删除
	$("[attr='del_block_user']").live('click', function(event){
		var sdid = $(this).attr("sdid"); // 获取用户SDID
		$.bf.app.setting.Block.delBlockUser(sdid, function(){
			$(this).parent().parent().remove();
		}.bind(this));
	});
	// 查找用户
	$("[attr='search_btn']").click(function (event){
		$.bf.app.setting.Block.searchUser();
	});
});
