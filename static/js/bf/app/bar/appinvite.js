/*
$.registerNameSpace('bf.app.bar.appinvite');


//更新在线好友选中了几个
$.bf.app.bar.appinvite.updateUserCount=function(){
	var ret=$.bf.common.getAllCheckBox('cb_user');
	if(parseInt(ret[0])>0)
	{
		$("#cb_user_count").html("您选中了"+ret[0]+"个好友");
		$("#cb_user_count").append("<input type='hidden' id='checked_count' name='checked_count' value='"+ret[0]+"' />");
	}
	else
	{
		$("#cb_user_count").html("您未选中任何用户");
		$("#cb_user_count").append("<input type='hidden' id='checked_count' name='checked_count' value='0' />");
	}
}*/


/*邀请APP在线好友的操作, 一期暂时不做, 请不要删除
//更新APP在线用户选中了几个
$.bf.app.bar.appinvite.updateAppUserCount=function(){
	var ret=$.bf.common.getAllCheckBox('cb_app_user');
	if(parseInt(ret[0])>0)
	{
		$("#cp_app_user_count").html("您选中了"+ret[0]+"个用户");
		$("#cp_app_user_count").append("<input type='hidden' id='app_checked_count' name='app_checked_count' value='"+ret[0]+"' />");
	}
	else
	{
		$("#cp_app_user_count").html("您未选中任何用户");
		$("#cp_app_user_count").append("<input type='hidden' id='app_checked_count' name='app_checked_count' value='0' />");
	}
}*/

//轮询设置用户状态
/*
$.bf.app.bar.appinvite.setOnlinePool=function(){
		$.bf.ajax.request("/bar/setOnlinePool",null,
			  function(result)
			  {
				  //alert('写入成功');
				  //轮询执行时间间隔 1分钟
				  var interval_time=60000;
				  setTimeout("$.bf.app.bar.appinvite.setOnlinePool()",interval_time);
			  },
			  function(errno,error)
			  {
				  $.bf.shortcut.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR);
			  }
		);
};*/


/*
$(function(){
	
	//点击邀请在线好友的操作
	$("#start_invite").click(function (){
		var online_total=parseInt($("#online_total"));
		if(online_total<=0)
		{
			alert('您没有在线的用户,可以尝试别的邀请方式哦');
		}
		else
		{
			//获取选中的checkbox个数
			var checked_count=$("input[name='cb_user']:checked").length;
			if(parseInt(checked_count)>0)
			{
				var user_ids;
				$("input[name='cb_user']:checked").each(
						function()
						{
							user_ids += ","+$(this).val();
						}
				);
				var data = {"user_ids" : user_ids};
				$.bf.ajax.request("/bar/SendAppInvite",data, 
					function(result)
					{
						$.bf.shortcut.Tooltip.show("发送成功", $.bf.ui.Tooltip.icons.OK);
					},
					function(errno,error)
					{
						$.bf.shortcut.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR);
					}
				);
				
				
			}
			else
			{
				$.bf.shortcut.Tooltip.show("您还没有选中用户哦,不可以发送邀请", $.bf.ui.Tooltip.icons.ERROR);
			}
		}
	});
	
	
	//在线好友点击某个checkbox的操作
	$("input[name='cb_user']").bind("click",function(){
			$.bf.app.bar.appinvite.updateUserCount();
		});
	
	//在线好友全选的操作
	$("#check_all").click(function (){
		//选中状态
		if($(this).attr("checked"))
		{
			$.bf.common.setAllCheckBox('cb_user',true);
		}
		//未选中状态
		else
		{
			$.bf.common.setAllCheckBox('cb_user',false);
		}
		$.bf.app.bar.appinvite.updateUserCount(); 
	});
	
	
	//切换tab时的操作
	$("#nav_tab a").each(
		function ()
		{
			$(this).hover(
				function ()
				{
					$("#nav_tab a").each(function (){
							$(this).removeClass();
					});
					$(this).addClass("cur");
					$("#online_friends_wrap").css("display","none");
					$("#app_user_wrap").css("display","none");
					$("#outside_invite_wrap").css("display","none");
					var tab_id=$(this).attr("id");
					$("#"+tab_id+"_wrap").css("display","block");
				}
			);
		}
	);
	
	*/
	
	/*   邀请APP在线好友的操作, 一期暂时不做, 请不要删除
	//点击邀请游戏在线好友的操作
	$("#app_online_invite").click(function (){
		var app_online_total=parseInt($("#app_online_total"));
		if(app_online_total<=0)
		{
			$.bf.shortcut.Tooltip.show("该游戏没有在线用户...", $.bf.ui.Tooltip.icons.ERROR);
		}
		else
		{
			//获取选中的checkbox个数和value
			var ret=$.bf.common.getAllCheckBox('cb_app_user');
			if(parseInt(ret[0])>0)
			{
				var user_ids=ret[1]+"";
				var data={"app_id":$("#app_id").val(),"user_ids":user_ids};
				$.bf.ajax.request("/bar/sendappinvite/",data,
						function(result)
						{
							$.bf.shortcut.Tooltip.show("发送成功", $.bf.ui.Tooltip.icons.OK);
						},
						function(errno,error)
						{
							$.bf.shortcut.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR);
						}
				);
			}
			else
			{
				$.bf.shortcut.Tooltip.show("您还没有选中用户哦,不可以发送邀请", $.bf.ui.Tooltip.icons.ERROR);
			}
		}
	});
	
	
	//点击某个checkbox的操作
	$("input[name='cb_app_user']").bind("click",function(){
			$.bf.app.bar.appinvite.updateAppUserCount();
		});
	
	
	//APP在线用户邀请全选的操作
	$("#check_all_app_user").click(function (){
		//选中状态
		if($(this).attr("checked"))
		{
			$.bf.common.setAllCheckBox('cb_app_user',true);
		}
		//未选中状态
		else
		{
			$.bf.common.setAllCheckBox('cb_app_user',false);
		}
		$.bf.app.bar.appinvite.updateAppUserCount();
	});
	
	//换一组看看的操作
	$("#random_app_user").click(function(){
			var data={"app_id":$("#app_id").val()}
			$.bf.ajax.request("/bar/randomAppUser",data,
				function(result)
				{
					$("#app_user_list").html(result);
					//绑定checkbox操作
					$("input[name='cb_app_user']").bind("click",function(){
						$.bf.app.bar.appinvite.updateAppUserCount();
					});
					$("#check_all_app_user").attr("checked",false);
					//重新设定选中人数
					$.bf.app.bar.appinvite.updateAppUserCount();
				},
				function(errno,error)
				{
					$.bf.shortcut.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR);
				}
			);
	});
	
	$.bf.app.bar.appinvite.setOnlinePool();
	
});
*/