
$.registerNameSpace('bf.app.friends');

$.bf.app.friends.FrisList = $.Class.create();
$.bf.app.friends.FrisList.implement({
	__init__:function() {
		this._friends_data = []; //好友数据
		this._friends_cache = []; //缓存数据
		this._app_style = [ 							//APP应用class样式名称
		                   ['tags color1', 'font12'], 
		                   ['tags color2', 'font12'], 
		                   ['tags color3', 'font12'], 
		                   ['tags color4', 'font12']
		                  ];
		this._cache_id = "#ul_list_id"; //缓存ID
		this._page_id = "#page_id"; //分页列表ID
		this._cache_name = "friends_cache"; //缓存名称
		this._page_size = 25; //页大小
		this._cur_page = 1; //当前页码
		
		this._get_friends_url = '/friends/getFriends'; //好友请求URL
		this._read_page_size = 125; //异步读取好友数据，每次读取的个数,最大125个每次
		this._read_total_page = 0; //总共需要读取的次数
		this._readed_page_count = 1; //已读取的次数
		
		this._search_key = ''; //搜索的关键字
		this._group_id = -1; //当前显示的分组好友
	},
	
	//入口函数
	getFriendsStart: function() {
		var friends_count = parseInt($("[attr='total_friends']").text());
		this._read_total_page = Math.ceil(friends_count/this._read_page_size);
		if (this._read_total_page > 0) {
			$("#ul_list_id").html('<br><div style="text-align:center;"><img src="'+$.bf.config.getStaticPath()+'/img/loading.gif"></div><br>');
			this._getFriends();
		}else {
			$("#ul_list_id").html('<br><div style="text-align:center;">您还没有好友信息</div><br>');
		}
	},
	
	//请求数据
	_getFriends: function() {
		if (this._readed_page_count <= this._read_total_page) {
			var page = this._readed_page_count;
			
			$.bf.ajax.request(this._get_friends_url, {page:page, num:this._read_page_size},
				function(data) {
					if (data) {
						this._receiveFriendsData(data);
						this._readed_page_count++;
						this._getFriends();
					}else {
						if (page == 1) {
							$("#ul_list_id").html('<br><div style="text-align:center;">您还没有好友信息</div><br>');
						}
					}
				}.bind(this),
				function(errno, msg) {
					
				}
			);
		}
	},
	
	//接收请求数据
	_receiveFriendsData: function(data) {
		this._friends_cache = this._friends_cache.concat(data);
		$(this._cache_id).data(this._cache_name, this._friends_cache);
		
		if (this._readed_page_count == 1) {
			this.Start('', -1);
		}else {
			var increment_data = [];
			if (this._group_id > -1 && this._search_key) {
				increment_data = this._search_nick(this._search_key, data);
				increment_data = this._search_group(this._group_id, increment_data);				
			}else {
				if (this._group_id > -1) {
					increment_data = this._search_group(this._group_id, data);
				}else if (this._search_key) {
					increment_data = this._search_nick(this._search_key, data);
				}else {
					increment_data = data;
				}
			}
			if (increment_data.length > 0) {
				this._friends_data = this._friends_data.concat(increment_data);
				this._make_html(this._cur_page);
			}
		}
	},
	
	/**
	* 删除好友
	* @param int sdid 好友的ID
	* @param string bind_selector 绑定的选择器前缀，后面一般跟sdid如果填写该项，用户改变页面显示状态:已是好友 =》加为好友
	* @param gids 好友组ID字符串，为'0'或'4534,6565'
	*/
	delFriend: function(sdid, bind_selector, gids) {
		var sdid = parseInt(sdid);
		if (sdid > 0) {
			$.bf.module.Confirm.show({message : '确定将该用户从您的好友列表移除吗？', title : '删除好友', onEnter : function(){
				$.bf.ajax.request('/friends/deleteFriends', {sdid:sdid}, function(data){
					if (bind_selector) {
						$(bind_selector+sdid).html('<a href="javascript:;" onClick="this.addFriend(' + sdid + ');"><i class="ico i42"></i>加为好友</a>');
					}
					if(gids)
					{
						// 更新全部好友数
						var tfriends = $("[attr='total_friends']");
						var tcount = parseInt(tfriends.text());
						if(!isNaN(tcount))
						{
							tfriends.text(tcount - 1);
						}
						
						// 更新未分组好友数
						if(gids == '0')
						{
							var ufriends = $("#group_0").find("[attr='friends']"); // 未分组
							var ucount = parseInt(ufriends.text());
							if(!isNaN(ucount))
							{
								ufriends.text(ucount - 1);
							}
						}
						else
						{
							// 更新已分组好友数
							$.each(gids.split(','), function(index, gid){
								var groupBar = $("#group_" + gid).find("[attr='friends']");
								var count = parseInt(groupBar.text());
								if(!isNaN(count))
								{
									groupBar.text(count - 1);
								}
							});
						}
					}
					
					//删除缓存中的元素
					this._delCacheFriend(sdid);
					$("#ul_list_id #"+sdid).fadeOut();
					
				}.bind(this), function(errno, error){
					$.bf.module.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR);
				});
			}.bind(this)});
		}
	},
	
	//删除缓存中的好友
	_delCacheFriend: function(fsdid) {
		var new_friends = [];
		$.each($(this._cache_id).data(this._cache_name), function(key,val){
			$.each(val, function(k,v) {
				if (k == 'fsdid' && v != fsdid) {
					new_friends[new_friends.length] = val;
				}
			});
		});
		$(this._cache_id).removeData(this._cache_name);
		$(this._cache_id).data(this._cache_name, new_friends);
	},
	
	setupGroups: function(fsdid, fnick, old_groups) {
		$.bf.module.friends.setupGroupsDialog(fsdid, fnick, old_groups, $.bf.app.friends.FrisList.friends.setupGroupsCb);
	},
	
	setupGroupsCb: function(errno, msg) {
		if (errno == 0) {
			$.bf.app.friends.FrisList.friends.updateCacheFriendGroups(msg.fsdid, msg.new_groups, msg.old_groups);
		}else {
			//出错处理
		}
	},
	
	//设置分组更新缓存数据
	updateCacheFriendGroups: function(fsdid, new_groups, old_groups) {
		var arr_new_groups = null;
		$.each($(this._cache_id).data(this._cache_name), function(key, val){
			$.each(val, function(k, v) {
				if (k == 'fsdid' && v == fsdid) {
					if (!new_groups || new_groups == '0') {
						val.groups = ["未分组"];
					}else {
						arr_new_groups = new_groups.split(',');
						var newg = {};
						$.each(arr_new_groups, function(key, val) {
							newg[val] = $("#groups_list_left #gname_"+val).text();
						});
						val.groups = newg;
					}
				}
			});
		});
		
		//更新分组名称
		var group_list = '';
		var fnick = $("#ul_list_id #"+fsdid+" .c h3 a").text();
		if (! new_groups || new_groups == '0') {
			group_list = '<a onclick="$.bf.app.friends.FrisList.friends.setupGroups('+fsdid+', \''+fnick+'\', \''+new_groups+'\');" href="javascript:;">未分组</a>';
		}else {
			var gname_list = [];
			var all_gname = '';
			$.each(arr_new_groups, function(key, val) {
				gname_list[gname_list.length] = $("#groups_list_left #gname_"+val).text();
			});
			all_gname = gname_list.join(',');
			if (gname_list.length == 1) {
				gname_list = gname_list.join(',');
			}else {
				gname_list = gname_list[0] + '...';
			}
			if (gname_list.length > 6) {
				gname_list = gname_list.substr(0, 6) + '...';
			}
			group_list = '<a title="'+all_gname+'" onclick="$.bf.app.friends.FrisList.friends.setupGroups('+fsdid+', \''+fnick+'\', \''+new_groups+'\');" href="javascript:;">'+gname_list+'</a>';
		}
		$("#ul_list_id #"+fsdid+" .groupWrap").html(group_list);
		
		//更新分组数量
		var arr_old_groups = old_groups.split(',');
		if (new_groups && new_groups != '0') {
			$.each(arr_new_groups, function(key, val) {
				var groupBar = $("#group_" + val).find("[attr='friends']");
				var count = parseInt(groupBar.text());
				if(!isNaN(count)) {
					groupBar.text(count + 1);
				}
			});
		}else {
			if (old_groups && old_groups != '0') {
				var ufriends = $("#group_0").find("[attr='friends']"); // 未分组
				var ucount = parseInt(ufriends.text());
				if(!isNaN(ucount)) {
					ufriends.text(ucount + 1);
				}
			}
		}
		
		if (old_groups && old_groups != '0') {
			$.each(old_groups.split(','), function(key, val) {
				var groupBar = $("#group_" + val).find("[attr='friends']");
				var count = parseInt(groupBar.text());
				if(!isNaN(count)) {
					groupBar.text(count - 1);
				}
			});
		}else {
			if (new_groups && new_groups != '0') {
				var ufriends = $("#group_0").find("[attr='friends']"); // 未分组
				var ucount = parseInt(ufriends.text());
				if(!isNaN(ucount)) {
					ufriends.text(ucount - 1);
				}
			}
		}
	},
	
	//删除分组时更新缓存
	delGroupUpdateCache: function(gid) {
		var new_grp = {};
		var new_grp_count = 0;
		$.each($(this._cache_id).data(this._cache_name), function(key, val) {
			$.each(val, function(k, v) {				
				if (k == 'groups') {
					$.each(v, function(group_id, group_name) {
						if (group_id == gid) {
							$.each(v, function(g_id, g_name) {
								if (g_id != gid) {
									new_grp[g_id] = g_name;
									new_grp_count++;
								}
							});

							if (new_grp_count == 0) {
								val.groups = ["未分组"];
								//更新未分组好友数
								var ufriends = $("#group_0").find("[attr='friends']"); // 未分组
								var ucount = parseInt(ufriends.text());
								if(!isNaN(ucount)) {
									ufriends.text(ucount + 1);
								}
							}else {
								val.groups = new_grp;
							}
							new_grp = {};
							new_grp_count = 0;
						}
					});
				}
			});
		});
	},
	
	make_content_list: function(obj) {
			var age = '';
			var xingzuo = '';
			var location_name = '';
			var fans_num = 0;
			if (obj.age) {
				age = obj.age+'岁';
			}
			if (obj.xingzuo) {
				xingzuo = obj.xingzuo+'';
			}
			if (obj.location_name) {
				location_name = obj.location_name+'';
			}
			if (obj.fans_num) {
				fans_num = obj.fans_num;
			}else {
				fans_num = 0;
			}
			var html = '<li id="'+obj.fsdid+'">\
						<span class="avatar-45 l"><a href="/home/'+obj.fsdid+'"><img src="'+obj.avatar_45+'" title="点击进入该好友首页" /></a></span>';
						
						var ogid = '';
						var all_group_name = '';
						var group_info = '';
						if (obj.groups) {							
							var gname = [];
							var gid = [];
							$.each(obj.groups, function(key, val){
								gname[gname.length] = val;
								gid[gid.length] = key;
							});
							all_group_name = gname.join(",");
							
							if (gname.length == 1) {
								group_info = gname.join(",");
							}else {
								if (gname.length == 2) {
									if (gname[1] == '未分组' || gname[0] == '未分组') {
										group_info = gname[0] == '未分组' ? gname[1] : gname[0];
									}else {
										group_info = gname[0];
									}
								}else {
									group_info = gname[0];
								}
							}
							ogid = gid.join(",");
						}else {
							group_info = '未分组';
						}
						if (group_info.length > 6) {
							group_info = group_info.substr(0,6) + '...';
						}
						
			html += '<div class="Status">\
						<div id="set_groups_'+obj.fsdid+'" class="groupWrap" attr="short_gname"><a href="javascript:;" title="'+all_group_name+'" onclick="$.bf.app.friends.FrisList.friends.setupGroups('+obj.fsdid+', \''+obj.nick+'\', \''+ogid+'\');">';
								
			html += group_info;		
			
			html +=				'</a></div>\
							<div id="delete_friend"><a class="ico i16" href="javascript:;" onclick="$.bf.app.friends.FrisList.friends.delFriend(' + obj.fsdid + ', null, \'' + ogid + '\');"></a></div>\
						</div>';						
						
				html += '<div class="c">\
						<h3><a href="/home/'+obj.fsdid+'">'+(obj.nick ? obj.nick : obj.fsdid)+'</a></h3><p class="player"><span class="t999"><em class="mr10">粉丝: '+fans_num+'</em><em class="mr10">'+age+'</em><em class="mr10">'+xingzuo+'</em><em>'+location_name+'</em></span></p>';
						
					
					
					
			
			html += 	'</div><div class="clear"></div>\
					</li>';
					
		return html;
	},

	//分页栏
	make_page_menu: function(obj) {
		
		if (obj.total_page <= 0) {
			html = '未找到匹配数据';
		}else {		
			var shouye='_make_html(1)';
			var moye='_make_html('+obj.total_page+')';
		
			var html='共'+obj.total_page+'页';
			if(obj.total_page>1){
				html+='&nbsp;&nbsp;';
				//html+='&nbsp;&nbsp;<a href="javascript:'+shouye+';">首页&nbsp;&nbsp;</a>';
			var page_sum=5;
			var page=Math.floor(page_sum/2);
			
			
			var begin=obj.page-page;
			var end=obj.page+page;
			begin=begin<1?1:begin;
			
			var temp=end-begin;
			if(temp<(page_sum-1)){
				temp=page_sum-temp-1;
				end=end+temp;
			}
		
			if(end>obj.total_page){
				temp=end-obj.total_page;
				begin=begin-temp;
				end=obj.total_page;
				begin=begin<1?1:begin;
			}
		
			//var c=obj.page;
			if(obj.page>1){
					html+='<a href="javascript:void(0);" onclick="javascript:$.bf.app.friends.FrisList.friends._make_html('+(obj.page-1)+');">上一页&nbsp;&nbsp;</a>';
			}else{
				//html+='<a>上一页&nbsp;&nbsp;</a>';
			}
		
			for(var c=begin;c<=end;c++){
				if(c==obj.page){
					html+='<a  class="cur">'+c+'&nbsp;&nbsp;</a>';
				}else{
					html+='<a href="javascript:void(0);" onclick="javascript:$.bf.app.friends.FrisList.friends._make_html('+c+');">'+c+'&nbsp;&nbsp;</a>';
				}
			}
		
			if(obj.page<obj.total_page){
			html+='<a href="javascript:void(0);" onclick="javascript:$.bf.app.friends.FrisList.friends._make_html('+(obj.page+1)+');">下一页&nbsp;&nbsp;</a>';
			}else{
			//html+='<a>下一页&nbsp;&nbsp;</a>';
			}
			}
		
			//html+='<a href="javascript:'+moye+';">尾页</a>';
		}
		
		return html;
	},
	
	/**翻页**/
	_make_html: function(page) {
		var length = this._friends_data.length;
		
		var total_page=Math.ceil(length/this._page_size);
		if (page <= 0) {
			page = 1;
		}else {
			if (total_page < page) {
				page = total_page;
			}
		}
		this._cur_page = page;
		var begin=(page-1)*this._page_size;
		var end=page*this._page_size;
	
		var message_obj=new Object();
		message_obj.page=page;
		message_obj.total_page=total_page;
	
		var buf=[];
		for(var i=0; i<length; i++){
			if(i >= begin && i < end) {
				buf[buf.length] = this.make_content_list(this._friends_data[i]);
			}
		}
	
		//显示数据
		$(this._cache_id).html(buf.join(""));
		$(this._page_id).html(this.make_page_menu(message_obj));
	},
	
	//搜索分组
	_search_group: function(gid, search_data) {
		var result = [];
		var length=search_data.length;
		
		if (gid >= 0) {
			for (var c=0; c<length; c++) {
				if (gid == 0) {
					if (search_data[c].groups == '未分组') {
						result[result.length] = search_data[c];
					}
				}else {
					if (search_data[c].groups) {
						$.each(search_data[c].groups, function(entryIndex, entry) {
							if (entryIndex == gid) {
								result[result.length] = search_data[c];
							}
						}.bind(this));
					}
				}
			}
		}
		
		return result;
	},
	
	//搜索昵称
	_search_nick: function(nick, search_data) {
		var result = [];
		if (! search_data) {
			search_data = this._friends_cache;
		}
		var options = {
				'input'     : '',
				'urlOrData' : search_data,
				'filterKey' : 'nick',
				'mode'      : 'fuzzy'
			};

		var atc = $.bf.ui.AutoComplete.create(options);
		result = atc.search(nick);
		
		return result;
	},
	
	//搜索函数
	search_start: function(page, key_words, gid) {
		if (key_words.lenght <= 0 && gid.length <= 0) { return};
		
		var length=this._friends_cache.length;
		if (gid >= 0 && ! key_words) {
			this._friends_data = this._search_group(gid, this._friends_cache);
		}else {//昵称搜索
			var search_data = [];
			var gid = parseInt($("#current_gid").val());
			if (gid >= 0) {
				search_data = this._search_group(gid, this._friends_cache);
			}else {
				search_data = this._friends_cache;
			}
			
			this._friends_data = this._search_nick(key_words, search_data);
			
			/*for (var c=0; c<length; c++) {
				if (this._friends_cache[c].nick.toLowerCase().indexOf(key_words.toLowerCase()) != -1) {
					this._friends_data[this._friends_data.length] = this._friends_cache[c];
				}
			}*/
		}
		
		//加载分页
		this._make_html(1);
	},	
	
	Start: function(key_words, gid) {
		gid = parseInt(gid);
		if (gid == -1) {
			$("#current_gid").val('');
		}else {//gid = 0 or gid > 0 or gid = NaN
			gid >= 0 && $("#current_gid").val(gid);
			var cur_gid = parseInt($("#current_gid").val());
			if (cur_gid >= 0) {
				gid = cur_gid;
			}
		}

		this._clear();
		$("ul li").removeClass("cur");
		
		if ($(this._cache_id).data(this._cache_name)) {
			this._friends_cache=$(this._cache_id).data(this._cache_name);
			
			if (key_words || gid >= 0) {
				if (gid >= 0) {
					$("#group_list_" + gid).addClass("cur");				
				}else {
					$("#group_list_all").addClass("cur");
				}
				this._search_key = key_words;
				this._group_id = gid;
				this.search_start(this._cur_page, key_words, gid);
			}else {
				$("#group_list_all").addClass("cur");
				this._friends_data = this._friends_cache;
				this._make_html(this._cur_page);
			}
		}else {
			this.getFriendsStart();
		}
	},
	
	//清除变量数据
	_clear: function() {
		this._search_key = '';
		this._group_id = -1;
		this._friends_data = [];
	}
});

//清空好友查找输入框内容
$.bf.app.friends.Friend.clearQueryInput = function() {
	$("#query_key").val('');
	$.bf.app.friends.FrisList.friends.Start();
};


$(document).ready(function() {
	$.bf.app.friends.FrisList.friends = $.bf.app.friends.FrisList.create();
	$.bf.app.friends.FrisList.friends.getFriendsStart();
	
	$("#clearQueryInputText").click(function() {
		$.bf.app.friends.Friend.clearQueryInput();
	});

	// 显示创建分组表单
	$("[attr='add_group_btn']").click(function(event){
		event.preventDefault();
		event.stopPropagation();

		$(this).hide();
		$("[attr='add_group_form']").show();
	});

	// 取消创建分组
	$("[attr='cancel_add_group_btn']").click(function(event){
		event.preventDefault();
		event.stopPropagation();

		$.bf.app.friends.Friend.cancelAddGroup();
	});

	// 确定创建分组
	$("[attr='enter_add_group_btn']").click(function(event){
		event.preventDefault();
		event.stopPropagation();

		$.bf.app.friends.Friend.addGroup('agname', 'groups_list_left', 'manage');
	});

	$("[attr='add_group_form']").find(".inputSearch").focus(function(event){
		event.preventDefault();
		event.stopPropagation();

		if($(this).val() == '请输入分组名称')
		{
			$(this).val('');
		}
	}).blur(function(event){
		event.preventDefault();
		event.stopPropagation();

		if($(this).val() == ''){
			$(this).val('请输入分组名称');
		}
	});

	// 确定修改分组
	$("[attr='enter_modify_group_btn']").click(function(event){
		event.preventDefault();
		event.stopPropagation();

		var group_id = $(this).attr("group_id");
		$.bf.app.friends.Friend.modifyGroup(group_id);
	});

	// 取消修改分组
	$("[attr='cancel_modify_group_btn']").click(function(event){
		event.preventDefault();
		event.stopPropagation();

		var group_id = $(this).attr("group_id");
		$("#modify_group_" + group_id).hide();
		$('#group_list_' + group_id).show();
	});

	// 获取分组好友
	$("[attr='group_items']").find("[attr='get_friends_btn']").click(function(event){
		event.preventDefault();
		event.stopPropagation();
		
		var group_id = $(this).attr('group_id');
		//$("#current_gid").val(group_id);
		$.bf.app.friends.FrisList.friends.Start('', group_id);
	}).end()
	.find(".tool .i36").click(function(event){
		event.preventDefault();
		event.stopPropagation();
		
		var group_id = $(this).attr("group_id");
		$.bf.app.friends.Friend.modifyGroupArea(group_id);
	}).end()
	.find(".tool .i102").click(function(event){
		event.preventDefault();
		event.stopPropagation();

		var group_id = $(this).attr("group_id");
		$.bf.app.friends.Friend.delGroup(group_id);		
	});
	
	//悬停更换背景和显示删除功能/恢复前面更改
	$("#ul_list_id li").live('mouseover', function() {
		$(this).addClass('over');
	});
	$("#ul_list_id li").live('mouseout', function() {
		$(this).removeClass('over');
	});
});
