/**
 *   by v.zhaoxianghu
 *   在my 和 home 页面使用
 */

$.registerNameSpace('bf.event');

$.bf.event.loopfeed = {
	loopFeed : function() {
		if($.bf.event.loopfeed._feedhook) {
			var hook = $.bf.event.loopfeed._feedhook.clone();
			var showfeedids = [];
			var showsdids = [];
			
			$('ul#tuita_list li').each(function(i) {
				showfeedids[showfeedids.length] = $(this).attr('fid');
				showsdids[showsdids.length] = $(this).attr('sdid');
			});
			
			$(hook).children('li').each(function() {
				var fid = $(this).attr('fid');
				var sdid = $(this).attr('sdid');
				if($.bf.event.in_array(fid, showfeedids)||$.bf.event.in_array(sdid, showsdids)) {
					$(this).remove();
				}
			});
			
			var length = hook.children('li').length;		
			if(length) {
				var randindex = Math.floor(Math.random()*length);
				var randfeedid = $(hook).children('li:eq('+randindex+')').attr('fid');
				
				$(hook).children('li:eq('+randindex+')').hide().css('opacity', 0).prependTo('ul#tuita_list').slideDown(1000, function(){
					flashin(this, 0);
					if($('ul#tuita_list li').length>4) { 
						$('ul#tuita_list li:last').remove();
					}
				});
			}
			hook = null;
		}
		setTimeout(loopFeed, 5000);
	},

	_feedhook: null,
	_showfeedids: [],
	_showfeeduids: [],
	
	
	getBackGroudFeed : function (index, showNow, scope) {
		if (showNow == 0) {
			//如果用户不点击查看，则停止检查是否新消息
			if ($("#span_show_back").css('display') != 'none') {
				return;
			}
		}
		
		var tm = $("#feed_ul li:first").attr("time");
		if (! tm) {
			tm = 0;
		}
		//return;
		/*$('#feed_ul li').each(function () {
			var tt = $(this).attr('time');
			if (tt > tm) tm = tt;
		});*/
		var homeid = $('#home_uid').val();
		scope = scope || 'ALL';
		
		$.bf.ajax.request('/home/getFeeds', {'tm' : tm, 'uid' : homeid, 'index' : index, 'size' : 25, 'direct' : 2, 'scope' : scope},
			function(data) {
				if (showNow){
					$.bf.event.loopfeed.pushFeedShowNow(data);
				}else {
					$.bf.event.loopfeed.welcomePushfeedCb(data);
				}
			},
			function(errno, msg) {
				//啥也不干
				/*
				var alertObj = $.bf.ui.Alert.create();
				alertObj.show({
					title   : '系统提示',
					message : '错误代码:' + errno + ':' + msg });
				*/
			}
		);
		
		
	},

	pushFeedShowNow : function (data) {
		$.bf.event.loopfeed._feedhook = $("#feed_ul_backgroud");
		
		$.bf.event.loopfeed._feedhook.html(data);

		if (data != ''){
			var hook = $.bf.event.loopfeed._feedhook.children().clone();

			$(hook).css('opacity', 0).prependTo('#feed_ul').slideDown(1000, function(){
				$.bf.event.loopfeed.flashin(this, 0);
			});

			$("#span_show_back").hide();
		}
	},

	welcomePushfeedCb : function (data) {
		//alert(data);
		$.bf.event.loopfeed._feedhook = $("#feed_ul_backgroud");
		
		$.bf.event.loopfeed._feedhook.html(data);
			
		$.bf.event.Feed.deleteVSign('#feed_ul_backgroud');

		data && $("#span_show_back").show();
	},
	
	showPushFeed : function (data) {
		var hook = $.bf.event.loopfeed._feedhook.children().clone();
		
		$(hook).css('opacity', 0).prependTo('#feed_ul').slideDown(1000, function(){
			$.bf.event.loopfeed.flashin(this, 0);
		});

		$("#span_show_back").hide();
	},

	//feed的动态滑动  定时刷新等效果
	flashin : function(dom, ts) {
		if(ts < 101) {
			$(dom).css('opacity', ts/100);
			ts += 5;
			setTimeout(function(){$.bf.event.loopfeed.flashin(dom, ts)}, 30);
		}
	}
};