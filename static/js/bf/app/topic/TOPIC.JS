$.registerNameSpace('bf.app.topic');

$.bf.app.topic = {
	page : 1,
	polling : 1,
	time_id : 0,
	topic_id : 0,
	loading : '<br /><div style="text-align:center;"><img src="'+$.bf.config.getStaticPath()+'/img/loading.gif" /></div><br />',
	addTuitaCb : function (errno, msg, topic) {
		if (errno == 0) {
			$("#temp_tuita_feed").html(msg.tuita_html);
			if ($.trim($('#temp_tuita_feed span#weiboContent').text()).indexOf($.trim(topic)) == 0) {
				var new_li = $("#temp_tuita_feed").html().replace('<li ', '<li style="display:none;" ');
				$("#feed_ul").prepend(new_li);
				$("#feed_ul center").remove();
				$("#feed_ul li:first").fadeIn('slow');
				$('#shareTotalCount').html(parseInt($('#shareTotalCount').html()) + 1);
			}
			$("#temp_tuita_feed").html('');
			$("[attr='twitter_success']").fadeIn().delay(1000).fadeOut("slow");
			//$.bf.module.Tooltip.show('发表成功.', $.bf.ui.Tooltip.icons.OK);
		} else {
			if (errno == 1003 || errno == 1004 || errno == 1005 || errno == 120 || errno == -12 || errno == -13 || errno == -14) {
				$.bf.module.TxtTips.show($("[attr='twitter_publish_btn']"),msg);
				//$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
			} else {
				$.bf.module.TxtTips.show($("[attr='twitter_publish_btn']"),msg);
				//$.bf.module.Tooltip.show(msg, $.bf.ui.Tooltip.icons.ERROR);
			}
		}
	},
	getTuita : function (id, page) {
		if (!id) return ;
		page = parseInt(page) || 1;
		var el = $('#topicTuita'), pos = $('.eventList').offset();;
		// alert([$(document).scrollTop(), pos.top]);
		$('html,body').animate({scrollTop:pos.top-12}, 200);
		el.html(this.loading);
		$.get('/topic/' + id + '/' + page, {from : 'ajax'}, function (data) {
			el.html('');
			if (data) {
				el.html(data);
			}
		});
	},
	addFocus : function (id) {
		this.setFocus(id, 1);
	},
	delFocus : function (id) {
		this.setFocus(id, 0);
	},
	setFocus : function (id, focus) {
		if (id) {
			$.post('/topic/setfocus', {id : id, focus : focus}, function (data) {
				if (data == 'succ') {
					var html = focus ? '<span class="t999">已关注，</span><a href="javascript:;" onclick="$.bf.app.topic.delFocus(' + id + ')">取消关注</a>' : '<a href="javascript:;" onclick="$.bf.app.topic.addFocus(' + id + ')" class="ifollow"><i>+</i>关注</a>';
					$('p#focusButton').html(html);
				}
			});
		}
	},
	getNewTuita : function () {
		if (!this.topic_id) return ;
		var in_progress = $.bf.app.tuita.in_progress;
		if (in_progress) return;
		var cur_tuita_total = $('#shareTotalCount').html(), $this = this;
		$.get('/topic/getnewtuita', {id : this.topic_id, total : $('#shareTotalCount').html()}, function (data) {
			if (in_progress || $.bf.app.tuita.in_progress) return;
			if (data) {
				if (data == 'Polling disabled.') {
					$this.polling = 0;
					$this.stopTimer();
					return ;
				}
				$('#temp_new_tuita').html(data).find('li').each(function () {
					var id = $(this).attr('id');
					if ($('#feed_ul li#' + id).length) {
						$(this).remove();
					}
				});
				var len = $('#temp_new_tuita li').length;
				if (len) {
					$('#new_tuita_count').html(len);
					$('#new_tuita_awoke').css('display', '');
				}
			}
		});
	},
	showNewTuita : function () {
		this.stopTimer();
		var int_tuita = $('#temp_new_tuita li').length;
		if (!int_tuita) return ;
		var str_tuita = $('#temp_new_tuita').html().replace('<li ', '<li style="display:none;" ');
		$('#temp_new_tuita').html('');
		$("#feed_ul").prepend(str_tuita);
		$("#feed_ul li:first").fadeIn('slow');
		$('#shareTotalCount').html(parseInt($('#shareTotalCount').html()) + int_tuita);
		$('#new_tuita_awoke').css('display', 'none');
		this.startTimer();
	},
	setTopicId : function (id) {
		this.topic_id = id;
	},
	startTimer : function () {
		if (!this.polling) return this.stopTimer();
		var $this = this;
		this.time_id = setInterval(function () {
			$this.getNewTuita();
		}, 30000);
	},
	stopTimer : function () {
		if (this.time_id) clearInterval(this.time_id);
	}
};

$(function () {
	$("a[attr='add_friends']").click(function () {
		var el = $(this), sdid = el.attr('fsdid'), nick = el.attr('fnick');
		if (!sdid || !nick) return ;
		$.bf.module.friends.addFriend(sdid, nick, function () {
			el.parent('p').html('已关注');
		});
	});
});
