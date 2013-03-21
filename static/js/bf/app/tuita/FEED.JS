/**
 * 通用feed组件封装
 * @author: 朱崴 <zhuwei04@snda.com>
 */
var ttPage = 0;
;initNameSpace('snda.uclib.component');
snda.uclib.component.feed = {
	_firstclick: true,
	_loading: false,
	_pushing: true,
	feedLimit : 30, //每次获取推他的数量
	needLogin : 1, //是否需要登录才能获取动态(1:需要 0:不需要)
	timestamp : '', //默认获取推他动态时的时间戳
	FeedSmallImageMaxWidth: 300, //动态图片小图最大宽度
	
	//初始化
	init: function(poll) {
		//是否要轮询
		if(typeof(poll)=="undefined") poll = false;
		//绑定feed筛选器事件
		$('#feed_filter_tab a').bind('click', this.getFeed);
		$('#sub_feed_filter_tab a').bind('click', this.getFeed);
		$('#sub_tuita_filter_tab a').bind('click', this.getFeed);
		//绑定获取更多feed按钮事件
		$('a#more_activate').bind('click', this.moreFeed);
		//评论下拉层，李文魁封装
		$('a.comment_activate').live('click', function(){
			//判断登录
			var isLogin = snda.core.common.checkLogin();
			if(isLogin == false){
				return false;
			}
			var objid = $(this).attr('objid');
			var user_id = $(this).attr('user_id');
			if(!objid||!user_id) return false;
			var comment_url = $(this).attr('url');
			//判断转推,获取不同的参数
			var replydivid = 'detail_'+objid;
			var numid = 'comment_no_'+objid;
			//李文魁提供的函数
			snda.lib.comment.commentexpand(replydivid, user_id, objid, 'twitter', comment_url, numid);
			return false;
		});
		//转推弹出层
		$('a.retweet_activate').live('click', function(e){
			//判断登录
			var isLogin = snda.core.common.checkLogin();
			if(isLogin == false){
				return false;
			}
			var twitter_id = $(this).attr('twitter_id');
			//需要转推的推他的几个属性
			var source_mood_id = $(this).attr('objid');
			var retweet = $(this).attr('retweet');
			var znick = $(this).attr('znick');
			var zcontent = $(this).attr('zcontent');
			var source_user_id = $(this).attr('user_id');
			var source_user_name = $(this).attr('nickname');
			
			//张丽媛提供的函数
			if(retweet)
				showConveyPopup(twitter_id,source_mood_id,source_user_id, znick, true, source_user_name, zcontent, 'my');
			else
				showConveyPopup(twitter_id,source_mood_id,source_user_id, source_user_name, false, '', '', 'my');
			
			return false;
		});
		
		//动态删除标记
		if($('#feed_filter_tab').attr('deleteable')==1) {
			$("#feed_area li").live('mouseover mouseout', function(e){
				if($('#feed_filter_tab a.cur').attr('filter') == 'recommend') return false;
				if($(this).attr('fid')&&$(this).attr('fid')!=-1) {
					if(e.type=='mouseover') {
						$(this).addClass('cur');
					} else {
						$(this).removeClass('cur');
					}
				}
			});
			
			$('#feed_area li a.iconItemClose').live('click', function(){
				var feedli = $(this).parents('li:first');
				var feedid = feedli.attr('fid');
				var sdid = feedli.attr('sdid');
				var atype = feedli.attr('acttype');
				var objid = feedli.attr('objid');
				snda.lib.data.request('feed/delfeed', {feedid: feedid, sdid: sdid, atype: atype, objid: objid}, function(data){
					if(data=='success') {
						feedli.fadeOut('slow', function(){feedli.remove();});
					}
				}, snda.uclib.component.feed.error_handle, 'POST');
				return false;
			});
		}
		
		/*
		//自动滚屏开关
		$('.tabbg a.pushing').click(function(){
			var title = $(this).attr('title');
			if(title=='滚动'){
				$(this).removeClass('iconSwitch').addClass('iconSwitchClose').attr('title', '停止');
				snda.uclib.component.feed._pushing = true;
			} else if(title=='停止') {
				$(this).removeClass('iconSwitchClose').addClass('iconSwitch').attr('title', '滚动');
				snda.uclib.component.feed._pushing = false;
			}
			return false;
		})
		*/
		
		//定时获取新动态
		if(poll) setTimeout(this.pushFeed, snda.lib.constant.__POLL_INTERVAL);
	},
	//获取动态
	getFeed: function(e) {
		if(snda.uclib.component.feed._loading) return false;
		//获取的用户id
		var user_id = parseInt($(this).parent().attr('user_id'));
		//获取筛选器
		var filter = $(this).attr('filter');
		
		//自己还是好友动态的标示
		var flag = parseInt($(this).attr('flag'));
		//获取ID
		var parent_id = $(this).parent().attr('id');
		
		//tab激活状态
		if(!$(this).hasClass('cur')) {
			$('#'+parent_id+' a').removeClass('cur');
			$(this).addClass('cur');

			//好友动态显示子TAB
			if(filter=='all'||filter=='tuita'||filter=='game'){
				$("#sub_tuita_filter_tab").hide();
				$("#sub_feed_filter_tab").show();
				$('#sub_'+parent_id+' a').removeClass('cur');
				$('#sub_'+parent_id+' a:first-child').addClass('cur');
				$('#sub_'+parent_id).css('display','block');
			}else if(filter=='happen'||filter=='transmit'||filter=='comment'){//推他广场
			    $("#sub_feed_filter_tab").css('display','none');
				$("#sub_tuita_filter_tab").show();
				$('#sub_tuita_filter_tab a').removeClass('cur');
				if(filter=='happen'){
				  $('#sub_tuita_filter_tab  a:first-child').addClass('cur');
				}else{
					$(this).addClass('cur');
				}
				$('#sub_tuita_filter_tab').css('display','block');
			}else{
				$('#sub_'+parent_id).css('display','none');
				$('#sub_tuita_filter_tab').css('display','none');
			}
		}
		//清空feed显示区域
		$('ul#feed_area').empty();
		$('div#pageLast').hide();
		$('p#emptycontent').hide();
		$('a#more_activate').hide();
		//loading标志
		$('p#getloading').show();
		snda.uclib.component.feed._loading = true;

		//发起ajax请求
		if(filter != 'happen'&&filter != 'transmit'&&filter != 'comment'){
			$('#feed_area').removeClass();

			snda.lib.data.request('feed/getfeed', {
				filter : filter, 
				flag : flag, 
				user_id : user_id, 
				limit : snda.uclib.component.feed.feedLimit,
				needlogin : snda.uclib.component.feed.needLogin,
				timestamp : snda.uclib.component.feed.timestamp
			}, function(data){
				snda.uclib.component.feed.feedReturn(data);					
			}, snda.uclib.component.feed.getfeed_error_handle, 'GET');
		}else{//推他广场
		    $('#feed_area').addClass("feedArea");
			ttPage = 1;
			var page_size =20;
			if(filter == 'happen'){
				page_size =40;
			}
			snda.lib.data.request('my/tuitasquarelist',{'page':ttPage,'type_tab':filter,'page_size':page_size},function(data){
				ttPage++;
				snda.uclib.component.feed.feedReturn(data);
			},
			snda.uclib.component.feed.getfeed_error_handle,'GET');
		}
		
		//获取棒棒糖用户请求
		if(filter=='recommend'&&flag==3){
			if($('#bangbangtang').length==0) {
				snda.lib.data.request('feed/bangbangtang', '', function(data){
					$('#feed_div').prepend(data);
				});
			}
			$('#spread_html').hide();
		} else {
			$('#bangbangtang').remove();
			$('#spread_html').show();
		}
		return false;
	},
	//展示返回的信息
	feedReturn: function(data){
		$('p#getloading').hide();
		snda.uclib.component.feed._loading = false;
		var hook = $('<ul></ul>');
		hook.html(data);

		if(snda.uclib.component.feed._firstclick){
			if(hook.children('li').length>=3) {
				//填充数据
				$('p#emptycontent').hide();
				$('ul#feed_area').html(data).show();
				$('a#more_activate').css('display','block');
			} else {
				if($('#feed_filter_tab a.cur').attr('flag')==3&&$('#feed_filter_tab a.cur').attr('filter')!='recommend') {
					$('#feed_filter_tab a[filter=recommend]').click();
				} else {
					if(data && data !='null') {
						$('p#emptycontent').hide();
						$('ul#feed_area').html(data).show();
						$('a#more_activate').css('display','block');
					} else {
						var emptyContent = $('p#emptycontent');
						if(emptyContent.html() == ''){
							emptyContent.html('没有新的内容');
						}
						emptyContent.show();
					}
				}
			}
		} else {
			if(data && data !='null'){
				//填充数据
				$('p#emptycontent').hide();
				$('ul#feed_area').html(data).show();
				$('a#more_activate').css('display','block');
			} else {
				//根据不同的tab显示不同的空提示语
				if($('#feed_filter_tab a.cur').attr('flag')==3&&$('#feed_filter_tab a.cur').attr('filter')!='recommend'){
					$('p#emptycontent').html('暂时没有好友最新的动态，去 <a href="#" onclick="$(\'#feed_filter_tab a[filter=recommend]\').click();return false;">糖果奇遇</a> 看看吧！').show();
				} else {
					var emptyContent = $('p#emptycontent');
					if(emptyContent.html() == ''){
						emptyContent.html('没有新的内容');
					}
					emptyContent.show();
				}
			}
		}
	   snda.uclib.component.feed._firstclick = false;
	},
	//更多动态
	moreFeed: function() {
		//等待状态，不触发请求
		if($(this).attr('loading')==true)
			return false;
		//返回自身dom对象方便使用
		var moredom = this;
		//获取筛选器
		var parent_filter = $('#feed_filter_tab a.cur').attr('filter');
		
		//获取时间戳
		var timestamp = parseInt($('ul#feed_area li:last').attr('time'))-1;
		//获取的用户id
		var user_id = parseInt($('#feed_filter_tab a.cur').parent().attr('user_id'));
		//自己还是好友动态的标示
		var flag = $('#feed_filter_tab a.cur').attr('flag');
		if(parent_filter == 'all'){//好友动态
		    var filter = $('#sub_feed_filter_tab a.cur').attr('filter');
		}else if(parent_filter == 'happen'){//推他广场
		   var filter = $('#sub_tuita_filter_tab a.cur').attr('filter');
		}else{
			var filter = parent_filter;
		}

		//发起ajax请求
		if(filter != 'happen'&&filter != 'transmit'&&filter != 'comment'){
		
			snda.lib.data.request('feed/getfeed', {
				timestamp: timestamp, 
				filter: filter, 
				flag: flag, 
				user_id: user_id,
				limit : snda.uclib.component.feed.feedLimit,
				needlogin : snda.uclib.component.feed.needLogin 
			}, function(data){if(data){
				//填充数据
				$('ul#feed_area').append(data);
			} else {
				$('a#more_activate').hide();
				$('div#pageLast').show();
			}
			//等待状态复原
			$(moredom).attr('loading', false);
			}, snda.uclib.component.feed.error_handle, 'GET');
		}else{
			snda.lib.data.request('my/tuitasquarelist',{'page':ttPage,'type_tab':filter},
				function(data){
					ttPage++;
					if(data!='null'){
						//填充数据
						$('ul#feed_area').append(data);
					} else {
						$('a#more_activate').hide();
						$('div#pageLast').show();
					}
			    },
			    snda.uclib.component.feed.getfeed_error_handle,'GET');
		}
		$(this).attr('loading', true);
		return false;
	},
	//自动获取新动态,poll是否轮询
	pushFeed: function() {
		
		if($('#feed_filter_tab a.cur').length&&$('ul#feed_area li').length&&$('ul#feed_area li').length<300&&snda.uclib.component.feed._pushing == true) {
			//获取筛选器
			var parent_filter = $('#feed_filter_tab a.cur').attr('filter');
			//获取的用户id
			var user_id = parseInt($('#feed_filter_tab a.cur').parent().attr('user_id'));
			//自己还是好友动态的标示
			var flag = $('#feed_filter_tab a.cur').attr('flag');
			var previous = false;
			var timestamp = $('ul#feed_area li:first').attr('time');
			if(parent_filter == 'all'){//好友动态
				var filter = $('#sub_feed_filter_tab a.cur').attr('filter');
			}else if(parent_filter == 'happen'){//推他广场
			   var filter = $('#sub_tuita_filter_tab a.cur').attr('filter');
			}else{
				var filter = parent_filter;
			}
			//发起ajax请求
			
			if(filter != 'happen'&& filter!= 'transmit'&& filter!= 'comment'){
				snda.lib.data.request('feed/getfeed', {
						timestamp: timestamp, 
						filter: filter, 
						flag: flag, 
						user_id: user_id, 
						previous: previous,
						limit : snda.uclib.component.feed.feedLimit,
						needlogin : snda.uclib.component.feed.needLogin 
					},
					snda.uclib.component.feed.pushFeedCb,
					snda.uclib.component.feed.error_handle, 'GET');
			}else if(filter == 'happen'){//推他广场-正在发生
				if($("#feed_area").length > 0){
					var newest_id =$('#feed_area').children().first().attr('id');
					new_hot_start_id = newest_id.replace(/twitter_/g,'');//记录下此次最新热门记录id
				}
				snda.lib.data.request("tuita/newrandomlist", 
					{"type":0,"start_id":new_hot_start_id}, 
					snda.uclib.component.feed.pushRandomTuitaFeedCb,
					snda.uclib.component.feed.error_handle,'GET'
					);

			}
		} else {
			//$('#feed_filter_tab a.cur').click();
		}
		setTimeout(arguments.callee, snda.lib.constant.__POLL_INTERVAL);
	},
	pushFeedCb: function(data) {
		$('p#emptycontent').hide();
		var filter = $('#feed_filter_tab a.cur').attr('filter');
		var hook = $('<span></span>');
		hook.html(data);
		if($(hook).children('li').length){
			$(hook).children('li').each(function(i){
				var objid = $(this).attr('objid');
				if(!snda.core.common.in_array($(this).attr('acttype'), eval("snda.uclib.component.feed.slideable."+filter))||$('li[objid='+objid+']').length){
					$(this).remove();
				}
			});
			
			$(hook).children('li').hide().prependTo('ul#feed_area').slideDown('slow');
		}
	},
	pushRandomTuitaFeedCb: function(data) {
		$('p#emptycontent').hide();
		var filter = $('#feed_filter_tab a.cur').attr('filter');
		var hook = $('<span></span>');
		hook.html(data);
		if($(hook).children('li').length){
			$(hook).children('li').each(function(i){
				$(hook).children('li').hide().prependTo('ul#feed_area').slideDown('slow');
			});
		}
	},
	postPush: function(n) {
		if(typeof(n)=="undefined") n = 0;
		
		if($('#feed_filter_tab a.cur').length&&$('ul#feed_area li').length&&$('ul#feed_area li').length<300) {
			//获取筛选器
			var filter = $('#feed_filter_tab a.cur').attr('filter');
			//获取的用户id
			var user_id = parseInt($('#feed_filter_tab a.cur').parent().attr('user_id'));
			//自己还是好友动态的标示
			var flag = $('#feed_filter_tab a.cur').attr('flag');
			var previous = false;
			var timestamp = $('ul#feed_area li:first').attr('time');
			//发起ajax请求
			snda.lib.data.request('feed/getfeed',{
					timestamp: timestamp, 
					filter: filter, 
					flag: flag, 
					user_id: user_id, 
					previous: previous,
					limit : snda.uclib.component.feed.feedLimit,
					needlogin : snda.uclib.component.feed.needLogin 
				},
				function(data){
					$('p#emptycontent').hide();
					var filter = $('#feed_filter_tab a.cur').attr('filter');
					var hook = $('<span></span>');
					hook.html(data);
					if($(hook).children('li').length){
						$(hook).children('li').each(function(i){
							if(snda.core.common.in_array($(this).attr('acttype'), eval("snda.uclib.component.feed.slideable."+filter))){
								var objid = $(this).attr('objid');
								if($('li[objid='+objid+']').length==0) {
									$(this).hide().prependTo('ul#feed_area').slideDown('slow');
								}
							}
						});
					} else {
						if(n++<3) setTimeout(function(){snda.uclib.component.feed.postPush(n);}, 500);
					}
				},
				snda.uclib.component.feed.error_handle, 'GET');
		} else {
			if($('#feed_filter_tab a.cur').attr('filter')=='all'||$('#feed_filter_tab a.cur').attr('filter')=='tuita')
				$('#feed_filter_tab a.cur').click();
		}
	},
	slideable: {
		all: [1002003, 1002005, 1002007, 1002009],
		tuita: [1002003, 1002005, 1002007, 1002009],
		game: [1001998, 1001004],
		recommend: [1002003, 1002005, 1002007, 1002009]
	},
	//激活视频
	enableVideo: function(dom, url, title, is_retransmit) {
		var flash = $(dom).attr('flashvar');
		var objid = $(dom).parents('li:first').attr('id');
		var flashdivid = "flash_"+objid;
		if (! is_retransmit) {
			is_retransmit = false;
		}
		
		title = $.bf.common.replaceVideoString(title);
		var bigflash_html = '';
		if (! $("#"+flashdivid).length) {
			if (is_retransmit) {
				bigflash_html = '<div class="bigSize"><p class="topic"></p>\
					 <div class="center">\
					  <p class="title"><i class="ico ifold mr5"></i><a href="javascript:;" class="iconSmall" onclick="snda.uclib.component.feed.disableVideo(this);">收起</a>&nbsp;&nbsp;<a href="'+url+'" class="iconLarger" target="_blank">'+title+'</a></p>\
					  <span id="'+flashdivid+'"></span>\
					 </div>\
					</div>';
			}else {
				bigflash_html = '<div class="bigSize">\
								 <div class="boxT"><span></span></div>\
								 <div class="center boxC itemsBox">\
								  <p class="title"><i class="ico ifold mr5"></i><a href="javascript:;" class="iconSmall" onclick="snda.uclib.component.feed.disableVideo(this);">收起</a>&nbsp;&nbsp;<a href="'+url+'" class="iconLarger" target="_blank">'+title+'</a></p>\
								  <span id="'+flashdivid+'"></span>\
								 </div>\
								<div class="boxB"><span></span></div>\
								</div>';
			}

			if ($(dom).parents('.ztBox').length > 0) {//是否转推框中
				$(dom).parent().after(bigflash_html);
			}else {
				$(dom).parent().parent().after(bigflash_html);
			}
			bigflash_html = '';
		}
		swfobject.embedSWF(url, flashdivid, "480", "375", "9.0.0", snda.lib.constant.__STATIC_URL+"/img/expressInstall.swf",{},{wmode:"transparent",allowfullscreen:"true"});
		$(dom).parent().hide().next().show();
		
		return false;
	},
	//结束视频
	disableVideo: function(dom) {
		if ($(dom).parents('.ztBoxbg').length > 0) {//是否转推框中
			$(dom).parents('.bigSize:first').hide().prev().show();
		}else {
			$(dom).parents('.bigSize:first').hide().prev().children().show();
		}
		
		$(dom).parents('.bigSize:first').remove();
		
		return false;
	},
	//放大图片
	magnifyPic: function(dom) {
		$(dom).parent().hide().next().show();
		return false;
	},
	//缩小图片
	minifyPic: function(dom) {
		$(dom).parents('.bigSize:first').hide().prev().show();
		return false;
	},
	//图片或者视频缩略图加载失败处理函数
	noImgContract: function(obj){
		var src = $.bf.config.STATIC_URL+'/img/photo_error.png';
		obj.onerror = null;
		obj.src = src;
	},
	/**
	* 设定图片宽度
	* @params string   dom: 当前dom对象
	* @params string   times: 倍数
	*/
	SndaFeedSetPictureWidth: function(dom, times)
	{
		var maxWidth = snda.uclib.component.feed.FeedSmallImageMaxWidth;
		var imgWidth = 0;
		if(times){
			//maxWidth = maxWidth * times;
			maxWidth = 480;
		}
		
		if ($.browser.msie) {
			var image=new Image();
	        image.src=dom.src;
	        imgWidth = image.width;
			image = null;
		}else {
			imgWidth = dom.width;
		}

		if (imgWidth > maxWidth){
			dom.width = maxWidth;
		}
		return false;
	},
	noVideoContract: function(obj){
		var src = $.bf.config.STATIC_URL +'/img/video_error.png';
		obj.src=src;
		obj.onerror = null;
	},
	//错误处理
	error_handle: function(errno, errmsg) {
		$('#feed_div p#getloading').hide();
		snda.uclib.component.feed._loading = false;
		return;
	},
	//getfeed错误处理
	getfeed_error_handle: function(errno, errmsg) {
		$('#feed_div p#getloading').hide();
		snda.uclib.component.feed._loading = false;
		//根据不同的tab显示不同的空提示语
		if($('#feed_filter_tab a.cur').attr('flag')==3&&$('#feed_filter_tab a.cur').attr('filter')!='recommend'){
			$('p#emptycontent').html('暂时没有好友最新的动态，去 <a href="#" onclick="$(\'#feed_filter_tab a[filter=recommend]\').click();return false;">糖果奇遇</a> 看看吧！').show();
		} else {
			$('p#emptycontent').html('没有新的内容').show();
		}
		return;
	}
};