
$.registerNameSpace('bf.app.my');

$.bf.app.my = {
		
	current_tab_name: 'feed_all', //feed_all, tuita_my, tuita_star
	sub_tab_name: 'feed_sub_all', //tuita_my, tuita_atme, comment_receive, comment_send
	_interval_feed: null,
	_interval_feed_time: 30000, //unit: msec 
	_interval_tuita: null,
	_interval_tuita_time: 300000, //unit: msec
	_feed_all_time: 0,
	_feed_list_page_size: 25,
	_tolerance: false,
	_feed_try_max_times: 3,
	_feed_already_try_times: 1,
	_err_msg_feed: '<div class="blank_feed" id="status_err_feed"><p class="mt10">系统忙,<a class="font12" href="javascript:;" onclick="$.bf.app.my.getFeeds(\'all\', 0, 0);">请点此重试.</a></p></div>',

	_initialize: function() {
		if (! this._loading_img) {
			this._loading_img = '<div class="blank" style="text-align:center;"><img src="'+$.bf.config.getStaticPath()+'/img/loading.gif"></div>';
		}
	},
	
	//获取微博：我的分享、@提到我的
	my_share_cur_sub_tab: 'all',
	getTuita: function(tuita_type, page, type) {
		this._initialize();
		page = parseInt(page);
		if (page <= 0) {
			page = 1;
		}
		if (! type) {
			type = '';
		}
		
		if (page > 1) {
			$('html,body').animate({scrollTop:0},200);
		}
		
		$('#tuitaPageMenu').html('');
		$("#feed_ul").html(this._loading_img);
		
		var request_url = '';
		if (tuita_type == 'atme') {
			request_url = '/my/atmeTuita';
		}else {
			$('#shareTotalCount').html('');
			this.my_share_cur_sub_tab = type;
			request_url = '/my/myTuita';
		}
		
		$.bf.ajax.request(request_url, {page:page, type:type}, 
			function(data) {
				var total = 0;
				if (tuita_type == 'my') {
					total = data.total_count;
					$('#shareTotalCount').html(total);
				}else {
					total = data.total;
				}
				if (total > 0) {
					$("#feed_ul").html(data.tuita_html);
					$('#tuitaPageMenu').html(data.page_menu);
				}else {
					var no_msg_txt = '<div class="blank">';
					switch (tuita_type) {
						case 'atme':
							no_msg_txt += '你还未被任何人提到，加油！';
							break;
						case 'my':
							no_msg_txt += '很遗憾，您还没有发表过任何微博，快发一条试试吧~';
							break;
						default:
							no_msg_txt = '';
					}
					no_msg_txt = no_msg_txt ? no_msg_txt + '</div>' : '';
					$("#feed_ul").html(no_msg_txt);
				}
			}.bind(this),
			function(errno, msg) {
				var err_msg = '<div class="blank_feed" id="status_err_feed"><p class="mt10">系统忙,<a class="font12" href="javascript:;" onclick="$.bf.app.my.getTuita(\''+tuita_type+'\', 1);">请点此重试.</a></p></div>';
				$("#feed_ul").html(err_msg);
			}
		);
	},
	
	//获取评论：我收到的、我发出的
	current_comment_page_num: 1,
	getComment: function(comment_type, page) {
		this._initialize();
		page = parseInt(page);
		if (page <= 0) {
			page = 1;
		}
		
		var total_pages = parseInt($('#commentTotalPages').text());
		if (page > total_pages) {
			page = total_pages;
		}
		this.current_comment_page_num = page;
		if (page > 1) {
			$('html,body').animate({scrollTop:0},200);
		}
		
		$('#commentPageMenu').html('');
		$("#commentList").html(this._loading_img);
		var request_url = '';
		if (comment_type == 'receive') {
			request_url = '/my/GetReceiveComment';
		}else {
			request_url = '/my/GetSendComment';
		}
		$.bf.ajax.request(request_url, {page:page}, 
			function(data) {
				if (data.total > 0) {
					$("#commentList").html(data.comment_html);
					$('#commentPageMenu').html(data.page_menu);
					$('#commentTotalPages').text(data.total_pages);
				}else {
					var no_msg_txt = '<div class="blank">';
					switch (comment_type) {
						case 'receive':
							no_msg_txt += '你还未收到任何评论，加油！';
							break;
						case 'send':
							no_msg_txt += '你还未进行任何评论，赶快试试评论1条吧！';
							break;
						default:
							no_msg_txt = '';
					}
					no_msg_txt = no_msg_txt ? no_msg_txt + '</div>' : '';
					$("#commentList").html(no_msg_txt);
				}
			}.bind(this),
			function(errno, msg) {
				var err_msg = '<div class="blank_feed" id="status_err_feed"><p class="mt10">系统忙,<a class="font12" href="javascript:;" onclick="$.bf.app.my.getComment(\''+comment_type+'\', 1);">请点此重试.</a></p></div>';
				$("#commentList").html(err_msg);
			}
		);
	},
	
	//获取明星微博FEED, bf2.1未用
	getStarTuitaFeed: function(page) {
		this._initialize();
		page = parseInt(page);
		if (page <= 0) {
			page = 1;
		}
		
		$("#more_activate").hide();
		$("#pageLast").hide();
		$("#feed_ul").html('<div style="padding-top: 49px;"><div>'+this._loading_img);
		$.bf.ajax.request('/my/starTuita', {page:page}, 
			function(data) {
				//明星列表
				if (data.star_html) {
					$(".starList").html(data.star_html);
					this.addFollowToStarList(); //给明星列表加关注功能
					$(".starModCon").show();
				}
				//明星微博列表
				if (data.feed_html) {
					$("#star_tuita_feed").html(data.feed_html);
					var feed_count = $("#star_tuita_feed li").length;					
					this.freeListenDelEvent();
					//this.addFollowToFeed(0); //给feed列表加关注功能
					$.bf.module.Feed.deleteVSign("#star_tuita_feed"); //删除V标签
					$("#feed_ul").html($("#star_tuita_feed").html());
					if (feed_count >= this._feed_list_page_size) {
						$("#more_activate").show();
					}
					$("#star_tuita_feed").html('');
				}else {
					$("#feed_ul").html('<div class="blank">很遗憾,还没有任何微博.</div>');
				}
			}.bind(this),
			function(errno, msg) {
				if (this._tolerance) {
					this.getStaticStar();
				}else {
					var err_msg = '<div class="blank_feed" id="status_err_feed"><p class="mt10">系统忙,<a class="font12" href="javascript:;" onclick="$.bf.app.my.getStarTuitaFeed(1);">请点此重试.</a></p></div>';
					$("#feed_ul").html(err_msg);
				}				
			}.bind(this)
		);
	},
	
	// bf2.1未用
	getStaticStar: function() {
		$.bf.ajax.request(
				'/my/getStatic',
				{},
				function(data) {
					$(".starList").html(data.star_html);
					//this.addFollowToStarList(); //给明星列表加关注功能
					$(".starModCon").show();
					$.bf.app.starScroll.start();
					$("#feed_ul").html(data.feed_html);
					
					//解除删除操作绑定的事件
					this.freeListenDelEvent();
				}.bind(this),
				function(errno, msg) {
					
				}
		);
	},
	
	//给明星列表加关注功能, bf2.1未用
	addFollowToStarList: function() {
		var uids = [];
		$.each($(".follow"), function(k, v) {
			uids[k] = $(this).attr("sdid");
		});
		
		$.bf.ajax.request(
			'/my/getRelation',
			{uid: uids.join(',')},
			function(data) {
				$.each(data, function(sdid, relation) {
					var relation_msg = '';
					if (relation == 1 || relation == 3) {
						relation_msg = '已关注';
					}else {//relation == 0 或 relation == 2
						var user_nick = $(".starList #nick_"+sdid).first().text();
						relation_msg = '<a href="javascript:;" onclick="$.bf.app.my.addFriend('+sdid+', \''+user_nick+'\', \'star_list\')"><i class="mr5 ico i43"></i>加关注</a>';
					}
					$("#hallStart #follow_"+sdid).html(relation_msg);
				});
				$.bf.app.starScroll.start();
			},
			function(errno, msg) {
				
			}
		);
	},
	
	//给feed列表加关注功能, bf2.1未用
	addFollowToFeed: function(more) {
		more = parseInt(more);
		var uids = this._getUseridFromFeedHtml();

		$.bf.ajax.request('/my/getRelation', {uid:uids}, 
			function(data) {
				$.each($("#star_tuita_feed").find("li"), function() {
					var user_id = 0;
					var home_url = $(this).find(".avatar-45 a").attr("href");
					user_id = home_url.substr(home_url.lastIndexOf('/')+1);
					var user_nick = $(this).find(".avatar-45 a img").attr("title");
					var avatar_html = $(this).children(".avatar-45").html();
					var user_in_data = false;//判断用户ID是否为data的一个索引
					$.each(data, function(key, val) {
						if (key == user_id) {
							user_in_data = true;
						}
					});
					var new_avatar_html = '';
					if (user_in_data == true && data[user_id] == 0) {
						new_avatar_html = '<div class="l avatar-con"><div class="avatar-45">' + avatar_html + '</div><p class="follow" id="follow_'+user_id+'"><a href="javascript:;" onclick="$.bf.app.my.addFriend('+user_id+', \''+user_nick+'\', \'tuita_list\');"><i class="mr5 ico i43"></i>加关注</a></p></div>';
					}else {
						var relation = '';
						if (user_in_data == true) {							
							if (data[user_id] == 1) {
								relation = '已关注';
							}else if (data[user_id]) {
								relation = '互相关注';
							}
						}
						new_avatar_html = '<div class="l avatar-con"><div class="avatar-45">' + avatar_html + '</div><p class="follow" id="follow_'+user_id+'">'+relation+'</p></div>';
					}
					$(this).find(".avatar-45").remove();
					$(this).prepend(new_avatar_html);
				});
				
				$.bf.module.Feed.deleteVSign("#star_tuita_feed"); //删除V标签
				if (more == 1) {
					$("#loading").hide();
					$("#feed_ul").append($("#star_tuita_feed").html());
					$("#more_activate").show();
				}else {
					$("#feed_ul").html($("#star_tuita_feed").html());
					$("#more_activate").show();
				}
				$("#star_tuita_feed").html('');
			},
			function(errno, msg) {
				$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
			}
		);
	},
	
	// bf2.1未用
	_getUseridFromFeedHtml: function() {
		var uids_arr = [];
		$.each($("#star_tuita_feed").find("li"), function(key, val) {
			var home_url = $(this).find(".avatar-45 a").attr("href");
			uids_arr[key] = home_url.substr(home_url.lastIndexOf('/')+1);
		});
		
		return $.unique(uids_arr).join(',');
	},
	
	//检查是否有新评论、新ATME信息, bf2.1未用
	loopGetNewTuitaMsg: function() {
		$.bf.ajax.request('/my/newTuitaMsg', {}, 
			function(data) {
				if (data.new_atme_count > 0) {
					if ($.bf.app.my.current_tab_name == 'tuita_my' && $.bf.app.my.sub_tab_name == 'tuita_atme') {
						$.bf.app.my.sub_tab_name = '';
					}
					$("#tuita_atme .total_num").find("#total_count").html(data.new_atme_count);
					$("#tuita_atme .total_num").show();
				}
				if (data.new_comment_count > 0) {
					if ($.bf.app.my.current_tab_name == 'tuita_my' && $.bf.app.my.sub_tab_name == 'comment_receive') {
						$.bf.app.my.sub_tab_name = '';
					}
					$("#comment_receive .total_num").find("#total_count").html(data.new_comment_count);
					$("#comment_receive .total_num").show();
				}
				if (this.current_tab_name != 'tuita_my' && (data.new_atme_count > 0 || data.new_comment_count > 0)) {
					if ($("#tuita_my").find(".i_new").length <= 0) {
						$("#tuita_my").append('<i class="i_new"></i>');
						
						//浏览器选项卡变色
						var msg_count = data.new_atme_count > 0 ? data.new_atme_count : data.new_comment_count;
						this.awokeBrowser(msg_count);
					}
				}
			}.bind(this),
			function(errno, msg) {
				
			}
		);
	},
	
	//检测是否有新FEED信息
	loopGetNewFeeds: function(show) {
		if (show) {
			var new_msg = this.getFeedNewMsgAwoke();
			this.clearFeedNewMsgAwoke();
			if ($('#feed_ul li').length > 0) {
				$("#feed_ul").prepend(new_msg);
			}else {
				$("#feed_ul").html(new_msg);
			}
			this.createFeedInterval();
		}else {
			if (! this.getFeedNewMsgAwoke()) {
				this.getFeeds(this.sub_tab_name, 0, 1);
			}
		}
	},
	
	//获取FEED里的微博数据，分全部、图片、视频三个TAB
	getFeeds: function(feed_type, more, get_new) {
		if (get_new == 1) {
			var in_progress = $.bf.app.tuita.in_progress;
			if (in_progress) return;
		}
		
		this._initialize();
		
		more = parseInt(more); //more=1表示取更多操作
		get_new = parseInt(get_new); //get_new=1表示取最新信息操作
		var time = 0;
		if (more == 1) {
			$("#more_activate").hide();
			$("#loading").show();
			time = $("#feed_ul li:last").attr('time');
		}else {
			more = 0;
			if (get_new == 1) {
				if (this.current_tab_name == 'feed_all') {
					time = $("#feed_ul li:first").attr('time');
					this._feed_all_time = time;
				}else {
					time = this._feed_all_time;
				}
			}else {
				this.clearFeedInterval();
				//$("#feed_all").removeClass('new');
				$("#new_feed_all_msg").html('');
				$("#more_activate").hide();
				$("#feed_ul").html(this._loading_img);
			}
		}
		
		var request_url = '/my/';
		switch(feed_type) {
			case 'feed_tuita':			
			case 'tuita_star':
				request_url += 'getTuita';
				break;
			case 'game':
				request_url += 'getGameFeeds';
				break;
			case 'feed_video':
			case 'feed_photo':
			case 'all':
			default:
				request_url += 'GetTuitaFeeds';
				break;
		}
		var params = {more:more, time:time, newly:get_new};
		switch (feed_type) {
			case 'feed_tuita':
				params.tab = 'tuita';
				break;
			case 'feed_video':
				//params.tab = 'tuita';
				params.type = 'video';
				break;
			case 'feed_photo':
				//params.tab = 'tuita';
				params.type = 'photo';
				break;
			case 'tuita_star':
				params.tab = 'tuita_star';
				params.scope = 'friends';
				break;
			default:
		}
		
		$.bf.ajax.request(request_url, params, 
			function(rs) {
				var data = {};
				data.feed_html = rs;
				if (more == 1) {
					if (data.feed_html) {
						if ($.bf.app.my.current_tab_name == 'tuita_star') {//明星微博FEED
							$("#star_tuita_feed").html(data.feed_html);
							//this.addFollowToFeed(1);
							$.bf.module.Feed.deleteVSign("#star_tuita_feed"); //删除V标签
							$("#loading").hide();
							$("#feed_ul").append($("#star_tuita_feed").html());
							$("#more_activate").show();
						}else {
							$("#loading").hide();
							//$('#temp_tuita_feed').html(data.feed_html);
							//$.bf.module.Feed.deleteVSign("#temp_tuita_feed");
							//$("#feed_ul").append($('#temp_tuita_feed').html());
							//$('#temp_tuita_feed').html('');
							$("#feed_ul").append(data.feed_html);
							$("#more_activate").show();
						}
					}else {
						$("#loading").hide();
						$("#pageLast").show();
					}
				}else {
					if (get_new == 1) {
						if (in_progress || $.bf.app.tuita.in_progress) return;
						
						if (rs == 'disabled_interval') {
							this.clearFeedInterval();
							return;
						}
						
						if (data.feed_html) {
							this.clearFeedInterval();
							$("#new_feed_all_msg").html(data.feed_html);
							var new_id = '';
							$("#new_feed_all_msg").find('li').each(function() {
								new_id = $(this).attr('id');
								if ($('ul[id="feed_ul"] li#' + new_id).length) {
									$(this).remove();
								}
							});
							
							var msg_count = $("#new_feed_all_msg li").length;
							if (msg_count <= 0) {
								this.createFeedInterval();
							}else {
								if (this.current_tab_name == 'feed_all') {
									$("#new_feed_all_count").text(msg_count);
									$("#new_feed_awoke").show();
								}else {
									//$("#feed_all").addClass('new');
									//$("#feed_all").append('<i class="new"></i>');
									
									//浏览器选项卡变色
									//this.awokeBrowser(msg_count);
								}
							}
						}
					}else {
						if (data.feed_html) {
							$("#feed_ul").html(data.feed_html);
							var feed_count = $("#feed_ul li").length;
							//$.bf.module.Feed.deleteVSign("#feed_ul"); //删除V标签							
							//this.createListenDelEvent();
							if (feed_count >= this._feed_list_page_size) {
								$("#more_activate").show();
							}
							this.createFeedInterval();
						}else {
							//this.showNoFeedPage();
							$('#feed_ul').html('你还未进行任何分享，赶快试试分享1条吧！');
						}
					}
				}
				
				this._feed_already_try_times = 1; //重置重试的次数
			}.bind(this),
			function(errno, msg) {
				if (more == 1) {
					$("#loading").hide();
					$("#more_activate").show();
					if (this._feed_already_try_times < this._feed_try_max_times) {
						$.bf.app.my.getFeeds('feed_sub_all', 1, 0);
						this._feed_already_try_times++;
						return;
					}
				}else {
					if (get_new == 1) {
						this.createFeedInterval();
					}else {
						if ($.bf.app.my.sub_tab_name == 'feed_sub_all' && this._tolerance) {
							$.bf.app.my.current_tab_name = 'tuita_star';
							$.bf.app.my.clearFeedNewMsgAwoke();
				    		$(".hd40 .tabs a").removeClass('cur');
							$("#tuita_star").addClass('cur');
							$("#tuita_my_sub_tab").hide();
							$("#feed_sub_tab").hide();
							$("#more_activate").hide();
							$("#pageLast .bg").html('没有更多内容了');
							$("#pageLast").hide();
							$.bf.app.my.getStarTuitaFeed(1);
						}else {
							if (this._feed_already_try_times < this._feed_try_max_times) {
								$.bf.app.my.getFeeds('feed_sub_all', 0, 0);
								this._feed_already_try_times++;
								return;
							}
							$("#feed_ul").html(this._err_msg_feed);
							return;
						}
					}
				}
				if (get_new != 1 && ! this._tolerance) {
					$.bf.module.Tooltip.show('系统忙，请稍候重试。', $.bf.ui.Tooltip.icons.ERROR);
				}
			}.bind(this)
		);
	},
	
	//当加载首页发生错误时，尝试重新拉FEED
	onErrorTryGetFeeds: function() {
		var follow_count = parseInt($('#pageRightFollowTotalCount').text());
		var weibo_count = parseInt($('#pageRightWeiboTotalCount').text());
		
		if (! follow_count || ! weibo_count) {
			return false;
		}
		if (weibo_count <= 0 && follow_count <= 0) {
			return false;
		}
		if ($('#feed_ul li').length > 0) {
			return false;
		}
		
		if (this._feed_already_try_times < this._feed_try_max_times) {
			$.bf.app.my.getFeeds('feed_sub_all', 0, 0);
			this._feed_already_try_times = 1;
		}
		
		return true;
	},
	
	// bf2.1未用
	showNoFeedPage: function() {
		$.bf.ajax.request(
				'/my/userRecomment',
				{},
				function(data){
					$("#feed_ul").html(data);
				},
				function(errno, msg) {
					
				}
		);
	},
	
	// bf2.1未用
	awokeBrowser: function(count) {
		window.external.OnUpdateWeiboNewMsg && window.external.OnUpdateWeiboNewMsg(count);
	},
	
	createFeedInterval: function() {
		if (! this._interval_feed) {
			this._interval_feed = setInterval("$.bf.app.my.loopGetNewFeeds(false)", this._interval_feed_time);
		}
	},
	
	clearFeedInterval: function() {
		if (this._interval_feed) {
			clearInterval(this._interval_feed);
		}
		this._interval_feed = null;
	},
	
	// bf2.1未用
	createTuitaAwokeInterval: function() {
		if (! this._interval_tuita) {
			this._interval_tuita = setInterval('$.bf.app.my.loopGetNewTuitaMsg()', this._interval_tuita_time);
		}
	},
	
	// bf2.1未用
	clearTuitaAwokeInterval: function() {
		if (this._interval_tuita) {
			clearInterval(this._interval_tuita);
		}
		this._interval_tuita = null;
	},
	
	getFeedNewMsgAwoke: function() {
		return $("#new_feed_all_msg").html();
	},
	
	clearFeedNewMsgAwoke: function() {
		$("#new_feed_awoke").hide();
		$("#new_feed_all_msg").html('');
	},
	
	addTuitaCb: function(errno, msg) {
		var url = window.location.href;
		if (errno == 0) {
			if ((url.indexOf('/my/share') != -1 && $.bf.app.my.my_share_cur_sub_tab == 'all') || 
				 ((url.indexOf('/my') != -1 || url.indexOf('/') != -1) && url.indexOf('/my/share') == -1 && url.indexOf('/my/atme') == -1 && url.indexOf('/my/comment') == -1 && $.bf.app.my.current_tab_name == 'feed_all' && $.bf.app.my.sub_tab_name == 'feed_sub_all') 
				) {
				
				$("#temp_tuita_feed").html(msg.tuita_html);
				var new_li = $("#temp_tuita_feed").html().replace('<li ', '<li style="display:none;" ');
				$("#temp_tuita_feed").html('');
				
				if ($('#feed_ul li').length > 0) {
					$("#feed_ul").prepend(new_li);
					$("#feed_ul li:first").fadeIn('slow');
				}else {
					$("#feed_ul").html(new_li);
					$("#feed_ul li:first").fadeIn('slow');
				}				
				
				if (url.indexOf('/my/share') != -1) {
					var share_total_count = parseInt($('#pageRightWeiboTotalCount').text());
					share_total_count++;
					
					$('#pageRightWeiboTotalCount').text(share_total_count);					
					$('#shareTotalCount').text(share_total_count);					
				}
			}
			$("[attr='twitter_success']").fadeIn().delay(1000).fadeOut("slow");
			//$.bf.module.Tooltip.show('发表成功.', $.bf.ui.Tooltip.icons.OK);
		}else {
			if (errno == 1003 || errno == 1004 || errno == 1005 || errno == 120 || errno == -12 || errno == -13 || errno == -14) {
				$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
			}else {
				$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
			}
		}
	},
	
	// bf2.1未用
	addFriend: function(fsdid, fnick, from) {
		var fsdid = parseInt(fsdid);
		if (fsdid > 0) {
			var cb_function = null;
			if (from == 'star_list') {
				cb_function = $.bf.app.my.cbAddFriend;
			}else {
				cb_function = $.bf.app.my.cbAddFriendFromTuitaList;
			}
			$.bf.module.friends.addFriend(fsdid, fnick, cb_function);
		}
	},
	
	// bf2.1未用
	cbAddFriend: function(errno, msg) {
		switch (errno) {
			case 0:
				$(".starList #follow_"+msg).html('已关注');
				break;
			case 1004:
				$(".starList #follow_"+msg).html('已关注');
				$.bf.module.Tooltip.show('您已关注过', $.bf.ui.Tooltip.icons.ERROR);
				break;
			default:
				$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
		}
	},
	
	// bf2.1未用
	addFriendByBatch: function() {
		var fsdids = [];
		$.each($("#feed_ul").find("input[name=fsdid]:checked"), function() {
			fsdids[fsdids.length] = $(this).val();
		});
		if (fsdids.length > 0) {
			$.bf.module.friends.addFriendBatch(fsdids.join(','), $.bf.app.my.cbAddFriendByBatch);
		}
	},
	
	// bf2.1未用
	cbAddFriendByBatch: function(errno, msg) {
		if (errno == 0) {
			var fsdid_arr = msg.split(',');
			$.each(fsdid_arr, function(key, val) {
				$("#feed_ul").find("#relation_status_"+val).text('已是好友');
			});
			$.bf.module.Tooltip.show('添加成功.', $.bf.ui.Tooltip.icons.OK);
		}else {
			$.bf.module.Tooltip.show('系统忙，请稍候再试.', $.bf.ui.Tooltip.icons.ERROR);
		}
	},
	
	// bf2.1未用
	cbAddFriendFromTuitaList: function(errno, msg) {
		switch (errno) {
			case 0:
				$("#feed_ul").find("li #follow_"+msg).html('已关注');
				break;
			case 1004:
				$("#feed_ul").find("li #follow_"+msg).html('已关注');
				$.bf.module.Tooltip.show('您已关注过', $.bf.ui.Tooltip.icons.ERROR);
				break;
			default:
				$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
		}
	},
	
	//解除删除操作绑定的事件, bf2.1未用
	freeListenDelEvent: function() {		
		$("#feed_ul li").die('mouseover');
		$("#feed_ul li").die('mouseout');
	},
	
	//鼠标悬停显示删除功能事件, bf2.1未用
	createListenDelEvent: function() {		
		$("#feed_ul li").live('mouseover', function() {
			$(this).addClass('cur');
		});
		
		$("#feed_ul li").live('mouseout', function() {
			$(this).removeClass('cur');
		});
	}
};


$(document).ready(function() {
	var url = window.location.href;
	if (url.indexOf('/my/atme') == -1 && url.indexOf('/my/share') == -1 && url.indexOf('/my/comment') == -1 && url.indexOf('topic') == -1) {
		if ($("#feed_ul li").length < $.bf.app.my._feed_list_page_size) {
			$("#more_activate").hide();
		}
		$.bf.app.my._feed_all_time = $("#feed_ul li:first").attr('time'); //获取最新一条动态的时间
		$.bf.app.my.onErrorTryGetFeeds();
		
		//如果鼠标在5分钟内没有任何动作，停止轮循
		var follow_total_count = parseInt($('#pageRightFollowTotalCount').text());
		if (follow_total_count || follow_total_count > 0) {
			var t_proc;
			var clearStatus = 1;			
			var fn = function() {
				if (t_proc) clearTimeout(t_proc);
				t_proc = setTimeout(function () {
					$.bf.app.my.clearFeedInterval();
					clearStatus = 1;
				}, 60000);
				
				if (clearStatus == 1) {
					$.bf.app.my.loopGetNewFeeds(false);
					$.bf.app.my.createFeedInterval();
					clearStatus = 0;
				}
			};
			
			$(window).scroll(fn);
			$('body').mousemove(fn);
		}
	}
	
	if (url.indexOf('/my/comment') != -1) {
		$.bf.app.my.sub_tab_name = 'comment_send';
	}
    
    //获取我的微博
    $("#tuita_my").click(function() {
    	if ($.bf.app.my.current_tab_name == 'tuita_my') {
    		return false;
    	}else {
    		$.bf.app.my.current_tab_name = 'tuita_my';
    		$.bf.app.my.sub_tab_name = 'tuita_my';
    		$.bf.app.my.clearFeedNewMsgAwoke();
    		$(".hd40 .tabs a").removeClass('cur');
			$(this).addClass('cur');
			$(".starModCon").hide();
			$("#feed_sub_tab").hide();
			$("#tuita_my_sub_tab a").removeClass('cur');
			$("#tuita_my_sub").addClass('cur');
			$("#tuita_my_sub_tab").show();
			$("#tuita_my").find('.i_new').remove();
			$.bf.app.my.getTuita('my', 1);
    	}
    });

    $("#tuita_my_sub").click(function() {
    	if ($.bf.app.my.current_tab_name == 'tuita_my' && $.bf.app.my.sub_tab_name == 'tuita_my') {
    		return false;
    	}else {
    		$.bf.app.my.sub_tab_name = 'tuita_my';
    		$("#tuita_my_sub_tab a").removeClass('cur');
			$("#tuita_my_sub").addClass('cur');
			$.bf.app.my.getTuita('my', 1);
    	}
    });
    
    //获取@到我的微博
    $("#tuita_atme").click(function() {
    	if ($.bf.app.my.current_tab_name == 'tuita_my' && $.bf.app.my.sub_tab_name == 'tuita_atme') {
    		return false;
    	}else {
    		$.bf.app.my.sub_tab_name = 'tuita_atme';
    		$("#tuita_my_sub_tab a").removeClass('cur');
			$("#tuita_atme").addClass('cur');
			//$("#tuita_atme .total_num").hide();
			$.bf.app.my.getTuita('atme', 1);
    	}
    });
    
    //获取我收到的评论
    $("#comment_receive").click(function() {
    	if ($.bf.app.my.sub_tab_name == 'comment_receive') {
    		return false;
    	}else {
    		$.bf.app.my.sub_tab_name = 'comment_receive';
    		$("#tuitaCommentTab a").removeClass('cur');
			$("#comment_receive").addClass('cur');
			//$("#comment_receive .total_num").hide();
			$.bf.app.my.getComment('receive', 1);
    	}
    });
    
    //获取我发出的评论
    $("#comment_send").click(function() {
    	if ($.bf.app.my.sub_tab_name == 'comment_send') {
    		return false;
    	}else {
    		$.bf.app.my.sub_tab_name = 'comment_send';
    		$("#tuitaCommentTab a").removeClass('cur');
			$("#comment_send").addClass('cur');
			$.bf.app.my.getComment('send', 1);
    	}
    });
	
	//获取子分类中全部FEED
	$("#feed_sub_all").click(function() {
		if ($.bf.app.my.current_tab_name == 'feed_all' && $.bf.app.my.sub_tab_name == 'feed_sub_all') {
			return false;
		}else {
			$.bf.app.my.sub_tab_name = 'feed_sub_all';
			$.bf.app.my.clearFeedNewMsgAwoke();
			$("#pageLast").hide();
			$("#feed_sub_tab a").removeClass('cur');
			$(this).addClass('cur');
			$.bf.app.my.getFeeds('all', 0, 0);
		}
	});
	
	//获取视频FEED
	$("#feed_video").click(function() {
		if ($.bf.app.my.current_tab_name == 'feed_all' && $.bf.app.my.sub_tab_name == 'feed_video') {
			return false;
		}else {
			$.bf.app.my.sub_tab_name = 'feed_video';
			$.bf.app.my.clearFeedNewMsgAwoke();
			$("#pageLast").hide();
			$("#feed_sub_tab a").removeClass('cur');
			$(this).addClass('cur');
			$.bf.app.my.getFeeds('feed_video', 0, 0);
		}
	});
	
	//获取图片FEED
	$("#feed_photo").click(function() {
		if ($.bf.app.my.current_tab_name == 'feed_all' && $.bf.app.my.sub_tab_name == 'feed_photo') {
			return false;
		}else {
			$.bf.app.my.sub_tab_name = 'feed_photo';			
			$.bf.app.my.clearFeedNewMsgAwoke();
			$("#pageLast").hide();
			$("#feed_sub_tab a").removeClass('cur');
			$(this).addClass('cur');
			$.bf.app.my.getFeeds('feed_photo', 0, 0);
		}
	});
	
	$("#show_feed_awoke").click(function() {
		$.bf.app.my.loopGetNewFeeds(true);
	});
	
	//获取更多FEED
	$("#more_activate").click(function() {
		var feed_type = $.bf.app.my.current_tab_name;
		switch(feed_type) {
			case 'tuita_star':
				$.bf.app.my.getFeeds('tuita_star', 1, 0);
				break;
			case 'game':
				$.bf.app.my.getFeeds('game', 1, 0);
				break;
			case 'feed_all':
				$.bf.app.my.getFeeds($.bf.app.my.sub_tab_name, 1, 0);
				break;
			default:
				$.bf.app.my.getFeeds('all', 1, 0);
				break;
		}
	});
});