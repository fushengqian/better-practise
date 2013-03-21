$.registerNameSpace('bf.module');

$.bf.module.friends = {
		
	//取消设置分组的回调函数
	setupGroupsCancelCallback: null,
	
	//删除好友
	delFriend: function(fsdid, callback) {
		//callback && callback(0, fsdid);return;
		fsdid = parseInt(fsdid);
		if (fsdid > 0) {
			$.bf.ajax.request('/friends/deleteFriends', {sdid:fsdid}, 
				  function(result){
					  callback && callback(0, fsdid);
				  },
				  function(errno, msg){
					  if (errno == -50000) {
						  $.bf.module.Tooltip.show('您还未登录，<br>登录后才可进行此操作.', $.bf.ui.Tooltip.icons.ERROR);
					  }else {
						  callback && callback(errno, msg);
					  }
				  }
			);
			
			/*$.bf.module.Confirm.show(
				{
					title: '提示',
					message: '确定将这个用户从您的好友列表移除吗？',
					onEnter: function() {
						$.bf.ajax.request('/friends/deleteFriends', {sdid:fsdid}, 
							  function(result){
								  callback && callback(0, fsdid);
							  },
							  function(errno, msg){
								  if (errno == -50000) {
									  $.bf.module.Tooltip.show('您还未登录，<br>登录后才可进行此操作.', $.bf.ui.Tooltip.icons.ERROR);
								  }else {
									  callback && callback(errno, msg);
								  }
							  }
						);
					}
				}
			);*/
		}
	},
	
	//设置好友分组，用于设置新增加好友
	setupFriendGroups: function(fsdid, old_groups, callback) {		
		var gids = '';
		var arr_gids = [];
		$.each($("input:checked[name=groupId]"), function(key, gid) {
			arr_gids[arr_gids.length] = $(this).val();
		});
		gids = arr_gids.join(',');
		
		if (gids.length > 0 || (old_groups && old_groups != 'undefined')) {
			if (gids.length == 0 && (old_groups == '0' || !old_groups)) {
				this.setupGroupsCancel();
				return false;
			}
			this._setupGroups(fsdid, gids, old_groups, callback);
		}else {
			this.setupGroupsCancel();
		}
	},
	//私信对话框
	setupMsgDialog: function(sdid, nick, callback) {
		var html = '';
		callback = callback||function(){};
		html = this._getMsgHTML(sdid,nick);
		var dialog = $.bf.module.HTMLDialog.init(true).setSize({width:"400px",height:"auto"}).setHTML(html).show();
		this._face = $.bf.ui.FaceBox.create($('[attr=msg_txt]'));
		//this._face.getDialog().show();
		var _this = this;
		_this._face.initPosition($('[attr=face_select]'),"under");
		$(window).resize(function(){
			_this._face.initPosition($('[attr=face_select]'),"under");
		});
		$(window).scroll(function(){
			_this._face.initPosition($('[attr=face_select]'),"under");
		});
		callback();
	},
	_getMsgHTML:function(sdid,nick){
		return '<div class="popupBox">\
    	<div class="popupTitle"><a class="r" href="javascript:;" onclick="$.bf.module.HTMLDialog.hide();" tag="close"><span class="iconClose"></span></a>发信</div>\
        <div class="popupMain">\
		<p class="receiver"><span class="t333">收件人：</span><a href="javascript:;" attr="'+sdid+'">'+nick+'</a></p>\
            <div class="setName pd5">\
            <textarea attr="msg_txt" class="text textareaMid"></textarea>\
            </div>\
            <div class="mb15 buttontool">\
                <span class="r mr10">\
                    <a href="javascript:;" onclick="$(\'[attr=face_close_btn]\').click();return false" attr="msg_send" class="mr10 btn btn9"><span>发送</span></a>\
                    <a href="javascript:;" onclick="$.bf.module.HTMLDialog.hide();" tag="close" attr="msg_cancel" class="btn btn1"><span>取消</span></a>\
                </span>\
             <a class="smileFace mr5" href="javascript:;" attr="face_select" onclick="$.bf.module.friends._face.getDialog().toggle();return false"></a>\
            </div>\
        </div>\
    </div>';
	},
	//设置好友对话框，适用于新增加的好友
	setupGroupsDialog: function(fsdid, fnick, old_groups, callback) {
		var html = '';
		var groups_html = '';
		if (old_groups) {
			var arr_old_groups = old_groups.split(',');
		}
		
	    //读取分组
       $.bf.ajax.request('/friends/groupList', {},
   			function(data) {
    	   		$.each(data, function(key, val) {
    	   			groups_html += '<li><input type="checkbox" class="checkbox" value="'+val.groupId+'" id="groupId" name="groupId"';
    	   			if (old_groups && old_groups != '0') {
    	   				if ($.inArray(val.groupId.toString(), arr_old_groups) > -1) {
    	   					groups_html += ' checked="checked"';
    	   				}
    	   			}
    	   			groups_html += '>'+val.groupName+'</li>\n';    	   			
    	   		}.bind(this));
    	   		
    	   		html = this._getSetGroupsHtml(groups_html, fsdid, fnick, old_groups, callback);
    	   		$.bf.module.HTMLDialog.init(true).setSize({width:"350px"}).setHTML(html).show().stopEffect(true, true, true);
   			}.bind(this),
   			function(errno, msg) {
				if (errno == -50000) {
					$.bf.module.Tooltip.show('您还未登录，<br>登录后才可设置分组', $.bf.ui.Tooltip.icons.ERROR);
				}else {
					$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
				}
   				return false;
   			}
   		);
	},
	
	//设置分组对话框HTML代码，适用于新增加的好友
	_getSetGroupsHtml: function(group_html, fsdid, fnick, old_groups, callback_set_group, callback_add_group) {
		var html = '<div class="popupTitle"><a href="javascript:;" class="r" onclick="$.bf.module.friends.setupGroupsCancel();"><span class="iconClose"></span></a>设置分组</div>\
			        	<div class="popupMain">\
			                <div class="setGroup">\
			                <p>将<strong>'+fnick+'</strong>加入分组</p>\
			                   <ul class="ul_li2 cl mt5">'+group_html+'</ul>\
			                   <p class="mt5">\
			                   <span class="ipt"><span><input type="text" id="groupName" maxlength="10"></span></span>\
			                   <a class="btn btn3" href="javascript:;" onclick="$.bf.module.friends.addGroup();"><span>新建</span></a>\
			                   <span class="tRed"></span>\
			                   </p>\
			                   <p class="center buttonW">\
				                   <a href="javascript:;" class="mr10 btn btn3" onclick="$.bf.module.friends.setupFriendGroups('+fsdid+', \''+old_groups+'\', '+callback_set_group+');"><span>确定</span></a>\
				                   <a href="javascript:;" class="btn btn3 cancel" onclick="$.bf.module.friends.setupGroupsCancel();"><span>取消</span></a>\
				               </p>\
			              </div>\
			           </div>';
		
		return html;
	},
	
	//设置分组
	_setupGroups: function(fsdid, new_groups, old_groups, callback) {
		
		//删除旧分组(有优化空间)todo

		var gids = new_groups;
		
		//设置新分组
		if (gids.length > 0 || old_groups.length > 0) {
			$.bf.ajax.request('/friends/addFriendToGroups', {sdid:fsdid, gid:gids, ogid:old_groups},
				function (result) {
					var msg = {fsdid: fsdid, old_groups: old_groups, new_groups: new_groups};
					callback && callback(0, msg);
					$.bf.module.HTMLDialog.hide();
					$.bf.module.Tooltip.show('设置成功', $.bf.ui.Tooltip.icons.OK);
				},
				function (errno, msg) {
					callback && callback(errno, msg);
					$.bf.module.HTMLDialog.hide();
					$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
				}
			);
		}
	},
	
	//批量添加好友,fsdids 多个用,号分开
	addFriendBatch: function(fsdids, callback) {
		if (fsdids.length > 0) {
			$.bf.ajax.request('/friends/addFriends', {sdid:fsdids},
				function(result) {
					callback && callback(0, fsdids);
				},
				function(errno, msg) {
					callback && callback(errno, msg);
				}
			);
		}
	},
	
	//添加好友
	addFriend: function(fsdid, fnick, cbAddFriend) {
		
		//cbAddFriend && cbAddFriend(0, fsdid);
		//this.addFriendSuccessDialog(fsdid, fnick);return;
		fsdid = parseInt(fsdid);
		if (fsdid && fsdid > 0) {
			$.bf.ajax.request('/friends/addFriends', {sdid:fsdid}, 
			   function (data) {
					cbAddFriend && cbAddFriend(0, fsdid);
					//this.addFriendSuccessDialog(fsdid, fnick);
			   }.bind(this),
			   function (errno, msg) {
				   switch(errno) {
				   	   case 1001:
				   		   $.bf.module.Tooltip.show('您已经将其添加至黑名单,<br>不能再添加TA为好友', $.bf.ui.Tooltip.icons.ERROR);
				   		   break;
					   case 1002:
						   $.bf.module.Tooltip.show('TA已将你添加至黑名单,<br>你不能够添加TA为好友.', $.bf.ui.Tooltip.icons.ERROR);
						   break;
					   case 1004:
						   cbAddFriend && cbAddFriend(errno, fsdid);
						   break;
					   case -50000:
						   $.bf.module.Tooltip.show('您还未登录，<br>登录后才可添加好友', $.bf.ui.Tooltip.icons.ERROR);
						   cbAddFriend && cbAddFriend(errno, msg);
						   break;
					   default:
						   cbAddFriend && cbAddFriend(errno, msg);
						   break;
				   }				   
			   }
			);
		}
	},
	
	//添加好友成功对话框
	addFriendSuccessDialog: function(fsdid, fnick) {
		var html = '<a href="javascript:;" class="r mr5" onclick="$.bf.module.HTMLDialog.hide();"><span class="iconClose"></span></a>\
				        <!--S-->\
				        <div class="msgBox">\
				            <i class="icon_succeed"></i>\
				            <span class="txt font12">\
							已成功添加<strong>'+fnick+'</strong>为好友.\
				            </span>\
							<p class="p_style" style="display:none;"><a href="javascript:;" class="a_set font12" onclick="$.bf.module.friends.setupGroupsDialog('+fsdid+', \''+fnick+'\')">设置分组&gt;&gt;</a></p>\
							<p class="p_button mt10"><a class="btn btn3" href="javascript:;" onclick="$.bf.module.HTMLDialog.hide();"><span>确认</span></a></p>\
				      </div>\
				      <!--E-->';

				      $.bf.module.HTMLDialog.init(true).setSize({width:"260px"}).setHTML(html).show().startEffect(true,2000,2000);
	},
	
	//读取分组信息
	addGroup: function () {
		var groupName = $("#groupName").val();
		if (groupName.length <= 0) {
			$(".tRed").text('请输入分组名称');
			return false;
		}else {
			if (groupName.length > 10) {
				$(".tRed").text('请不要超过10个字符');
				return false;
			}
		}
		
		$.bf.ajax.request('/friends/addGroup', {name:groupName}, 
			function(result) {
				$(".ul_li2").append('<li><input type="checkbox" class="checkbox" value="'+result.gid+'" id="groupId" name="groupId">'+groupName+'</li>\n');
				$("#groupName").val('');
				
				var url = window.location.href;				
				if (url.indexOf('/friends') != -1 && url.indexOf('/friends/') == -1) {//只用于好友页面
					var gid = result.gid;
					var gname = groupName;
					var groups_list_id = 'groups_list_left';
					
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
										<input name="mgname_'+gid+'" id="mgname_'+gid+'" type="text" class="inputSearch" maxlength="10" value="'+gname+'" />\
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
					$("#"+groups_list_id).append(html_data);
				}
			 },
			 function (errno, msg) {
				 if (errno == 10 || errno == 100 || errno == 101 || errno == 1201 || errno == -10235005 || errno == 18005104) {
					 $(".mt5 .tRed").text(msg);
				 }else {
					 $.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
				 }
			 }
		);
	},
	
	//取消设置分组
	setupGroupsCancel: function() {
		this.setupGroupsCancelCallback && eval(this.setupGroupsCancelCallback);
		$.bf.module.HTMLDialog.hide();
	}
};

$(document).ready(function() {
	$("#groupName").live('focus', function() {
		$(".tRed").text('');
	})
});

