$.registerNameSpace('bf.app.friends.Friend');

$.bf.app.friends.debug = true;

//显示和关闭指定ID的内容
$.bf.app.friends.Friend.showAndHidden = function (off_id, on_id) {

	if (off_id) {
		$("#"+off_id).hide();
	}
	if (on_id) {
		$("#"+on_id).show();
	}
};

//同一个ID关闭和打开
$.bf.app.friends.Friend.repeatOffAndOn = function (id) {
	if ($("#"+id).css('display') != 'none') {
		$("#"+id).hide();
	}else {
		$("#"+id).show();
	}
};

// 取消创建分组
$.bf.app.friends.Friend.cancelAddGroup = function(){
	$("[attr='add_group_btn']").show();
	$("[attr='add_group_form']").find(".inputSearch").val("请输入分组名称").end().hide();
};

//显示分组编辑框
$.bf.app.friends.Friend.modifyGroupArea = function (gid) {
	$("#mgname_"+gid).val($("#gname_"+gid).html());
	$.bf.app.friends.Friend.showAndHidden("group_list_"+gid, "modify_group_"+gid);
};

//提交分组修改数据
$.bf.app.friends.Friend.modifyGroup = function (gid) {
	var old_gname = $("#gname_"+gid).html();
	var new_gname = $("#mgname_"+gid).val();
	if (new_gname != old_gname) {
		if (new_gname.length > 10) {
			$.bf.module.Tooltip.show('请不要超过10个字符', $.bf.ui.Tooltip.icons.ERROR);
			return false;
		}
		
		$.bf.ajax.request('/friends/updateGroupName', {gid:gid, name:new_gname}, 
						  function(result) {
							  $("#gname_"+gid).html(new_gname);
							  $.bf.app.friends.Friend.showAndHidden("modify_group_"+gid, "group_list_"+gid);
						  },
						  function(errno, msg) {
							  switch (errno) {
								case 100:
									$.bf.module.Tooltip.show('请不要超过10个字符', $.bf.ui.Tooltip.icons.ERROR);
									break;
								case -10235005:
									$.bf.module.Tooltip.show('该名称已存在', $.bf.ui.Tooltip.icons.ERROR);
									break;
								default:
									$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
							}
						  }
		);
	}else {
		$.bf.app.friends.Friend.showAndHidden("modify_group_"+gid, "group_list_"+gid);
	}
};

//删除分组
$.bf.app.friends.Friend.delGroup = function (gid) {
	$.bf.module.Confirm.show(
		{
			title: '提示',
			message: '确定要删除该分组吗？<br>删除分组不会删除分组里的好友，删除后，该分组的好友被放到未分组分类中。',
			onEnter: function() {
				$.bf.ajax.request('/friends/deleteGroup', {gid:gid}, 
					function(result){
						$("#group_"+gid).remove();						
						if (window.location.href.indexOf('/friends') != -1 && window.location.href.indexOf('/friends/') == '-1') {//用于好友列表页面
							$.bf.app.friends.FrisList.friends.delGroupUpdateCache(gid);
							var current_gid = parseInt($("#current_gid").val());
							current_gid == gid && $.bf.app.friends.FrisList.friends.Start('', 0);
						}
					},
					function(errno, msg){
						$.bf.module.Tooltip.show('系统忙，请稍候重试', $.bf.ui.Tooltip.icons.ERROR);
					}
						
				);
			}
		}
	);
};

//添加分组
$.bf.app.friends.Friend.addGroup = function (add_gname_input_id, groups_list_id, page) {
	
	var gname = $("#"+add_gname_input_id).val();
	if (! gname || gname == '请输入分组名称') {
		$.bf.module.Tooltip.show('请输入分组名称', $.bf.ui.Tooltip.icons.ERROR);
		$("#"+add_gname_input_id).focus();
		return false;
	}else if(gname.length > 10) {
		$.bf.module.Tooltip.show('请不要超过10个字符', $.bf.ui.Tooltip.icons.ERROR);
		$("#"+add_gname_input_id).focus();
		return false;
	}else {
		$.bf.ajax.request('/friends/addGroup', {name:gname}, function(result){		
			var gid = result.gid;
			if (page == 'manage') {
				html_data = '<span id="group_'+gid+'">\
								<ul attr="group_items">\
								 <li id="group_list_'+gid+'" style="display:block">\
									<a href="javascript:;" attr="get_friends_btn" group_id="'+gid+'" onclick="$.bf.app.friends.FrisList.friends.Start(\'\', '+gid+');">\
										<span class="barT"><span></span></span>\
										<span class="barC">\
											<span class="tool">\
												<i class="ico i36" group_id="'+gid+'" onclick="$.bf.app.friends.Friend.modifyGroupArea('+gid+')"></i>\
												<i class="ico i102" group_id="'+gid+'" onclick="$.bf.app.friends.Friend.delGroup('+gid+');"></i>\
											</span>\
										<span id="gname_'+gid+'">'+gname+'</span>(<span attr="friends">0</span>)\
										</span>\
										<span class="barB"><span></span></span>\
									</a>\
								 </li>\
								<li id="modify_group_'+gid+'" style="display:none">\
								<div class="leftFrm">\
									<div class="rc2Hd"><span></span></div>\
									<div class="rc2Bd">\
										<span class="ipt"><span>\
										<input name="mgname_'+gid+'" id="mgname_'+gid+'" type="text" class="inputSearch" maxlength="10" value="" />\
										</span></span>\
										 <p class="buttonW">\
											<a class="btn btn3" href="javascript:void(0);" onclick="$.bf.app.friends.Friend.modifyGroup('+gid+')"><span>确认</span></a>\
											<a class="btn btn3" href="javascript:void(0);" onclick="$.bf.app.friends.Friend.showAndHidden(\'modify_group_'+gid+'\', \'group_list_'+gid+'\');"><span>取消</span></a>\
										 </p>\
									</div>\
									<div class="rc2Ft"><span></span></div>\
								</div>\
							  </li>\
							  </ul>\
							  </span>';
			}else {
				html_data = '<p><input name="gid" type="checkbox" value="'+gid+'" />'+gname+'</p>';
			}
			$.bf.app.friends.Friend.cancelAddGroup();
			$("#"+groups_list_id).append(html_data);
		}, function(errno, msg) {
				switch (errno) {
					case 1201:
						if (page == 'manage') {
							$.bf.module.Tooltip.show('最多可创建10个分组', $.bf.ui.Tooltip.icons.ERROR);
							//$("#too_many_groups").show();
						}else {
							$("#err_msg").html('最多可创建10个分组。');
						}
						break;
					case 18005104:
					case -10235005:
						$.bf.module.Tooltip.show('该名称已存在', $.bf.ui.Tooltip.icons.ERROR);
						break;
					default:
						$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
				}		   		
		   });
	}
}


//删除好友关系
$.bf.app.friends.Friend.delFromFriends = function (sdid) {
	var sdid = parseInt(sdid);
	if (sdid > 0) {
		if (confirm('确定将该用户从您的好友列表移除吗？')) {
			$.bf.ajax.request('/friends/deleteFriends', {sdid:sdid}, 
							  function(data){
								  $("#friend_status_"+sdid).html('<a href="javascript:void(0)" onClick="$.bf.app.friends.Friend.addToFriends('+sdid+');"><i class="ico i42"></i>加为好友</a>');
								  $("#ul_list_id").removeData("friends_cache");
								 
								  $.bf.module.Tooltip.show('删除成功.', $.bf.ui.Tooltip.icons.OK);
								  $.bf.app.friends.FriendsList.friends.Start();
							  },
							  function(errno, msg){
								  if ($.bf.app.friends.debug == true) {
									  $.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
								  }
							  });
		}
	}else {
		return false;
	}
}

//创建添加好友组件
$.bf.app.friends.init = function() {
	$.bf.app.friends.friend = $.bf.module.friends.create();
	$.bf.app.friends.init = function() {};
}

//添加好友
$.bf.app.friends.Friend.addFriend = function(fsdid, fnick) {
	var fsdid = parseInt(fsdid);
	//$.bf.app.friends.init();
	if (fsdid > 0) {
		$.bf.module.friends.addFriend(fsdid, fnick, $.bf.app.friends.Friend.cbAddFriend);
	}
}

//添加好友回调函数
$.bf.app.friends.Friend.cbAddFriend = function(errno, msg) {
	switch (errno) {
		case 0:
			$("#friend_status_"+msg).html('已是好友');
			break;
		case 1004:
			$("#friend_status_"+msg).html('已是好友');
			$.bf.module.Tooltip.show('已是好友', $.bf.ui.Tooltip.icons.ERROR);
			break;
		default:
			$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
	}
}

//设置分组回调函数
$.bf.app.friends.Friend.cbSetGroups = function(result, msg) {
	switch (result) {
		case 'success':
			$.bf.module.Tooltip.show('设置成功.', $.bf.ui.Tooltip.icons.OK);
			break;
		case 'cancel':
			break;
		default:
			if ($.bf.app.friends.debug == true) {
				$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
			}
	}
}

//删除粉丝
$.bf.app.friends.Friend.delFan = function(fans_sdid, bind_selector) {
	var fans_sdid = parseInt(fans_sdid);
	if (fans_sdid > 0) {		
		$.bf.module.Confirm.show(
				{
					title: '提示',
					message: '确定要删除这个粉丝吗？',
					onEnter: function() {
						$.bf.ajax.request('/friends/deleteFan', {sdid:fans_sdid},
								function(result) {
									if (bind_selector) {
										
									}
									var fans_num = parseInt($("#fans_num").text());									
									$(".friCon ul #"+fans_sdid).fadeOut('slow');
									$("#fans_num").text(fans_num-1);
								},
								function(errno, msg) {
									$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
								}
						);
					}
				}
		);
	}
}

//按应用查找
$.bf.app.friends.Friend.searchByApp = function () {
	var app_name = $("#app").val();
	if (! app_name || app_name == '输入应用名称查找') {		
		$.bf.module.Tooltip.show('请输入应用名称', $.bf.ui.Tooltip.icons.ERROR);
		$("#app").focus();
		return false;
	}else {
		document.search_form.submit();
		return false;
	}
}

//按昵称或帐号查找
$.bf.app.friends.Friend.searchByName = function() {
	var name = $("#name").val();
	if (! name || name == '请输入要查找的昵称' || name == '支持边锋/茶苑/赢家/金游账号查找') {
		$.bf.module.Tooltip.show('请输入要查找的昵称', $.bf.ui.Tooltip.icons.ERROR);
		$("#name").focus();
		return false;
	}else {
		document.search_form.submit();
		return false;
	}
};

$(document).ready(function() {
	var url = window.location.href;
	if (url.indexOf('/fans') != -1 && url.indexOf('/home') == -1) {
		//悬停更换背景和显示删除功能/恢复前面更改
		$(".friCon li").live('mouseover', function() {
			$(this).addClass('over');
		});
		$(".friCon li").live('mouseout', function() {
			$(this).removeClass('over');
		});
	}
});

