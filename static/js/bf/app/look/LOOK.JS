$.registerNameSpace('bf.app.look');
$.bf.app.look = {
	_main_menu : 'free_look',
	_tuitaTabSubMenu:'happen',
	_loading_html : '<br><div style="text-align:center;"><img src="'+$.bf.config.getStaticPath()+'/img/loading.gif"></div><br>',
	_error_html : '<div style="text-align:center;">系统忙,请稍后再试.</div>',
	_more_page : 1,
	_free_type : 5,//当前查看的type类型
	_free_page : 1,
	_default_free_type : 5,//默认查看的type类型
	_page_size : 20,
	
	//清除子菜单样式
	clearSubClass: function(menu) {
		if (menu == 'feed') {
			$("#a_feed_all").removeClass('cur');
			$("#a_feed_tuita").removeClass('cur');
		}else if (menu == 'tuita') {
			$("#tuita_happening").removeClass('cur');
			$("#tuita_hot_forward").removeClass('cur');
			$("#tuita_hot_comment").removeClass('cur');
			$("#stars_tuita").removeClass('cur');
		}
	},

	//是否是现实明星tab页
	showStarTab : function(flag){
		if(flag)
		{
			$("#star_wrap").show();
			$("#tuita_wrap").hide();
		}
		else
		{
			$("#all_say").hide();
			$("#star_wrap").hide();
			$("#tuita_wrap").show();
		}
		
	},
	
	//获取推他广场信息
	getTuitaSquare: function() {
		this.hideMore();
		this.hideNoMsg();
		$("#tuita_list").html(this._loading_html);
		$.bf.ajax.request('/look/hotTuita', {tab:this._tuitaTabSubMenu, more:0}, 
			function (jsonData) {
				if (jsonData) {
					$("#tuita_list").html(jsonData);
					var tuita_count = $("#tuita_list li").length;
					if (tuita_count >= this._page_size) {
						this.showMore();
					}
				}else {
					var no_msg = '<div class="blank">';
					switch(this._tuitaTabSubMenu) {
						case 'transmit':
							no_msg += '还没有热门转推信息.';
							break;
						case 'comment':
							no_msg += '还没有热门评论信息.';
							break;
						default:							
					}
					no_msg += '</div>';
					$("#tuita_list").html(no_msg);
				}
			}.bind(this),
			function (errno, msg) {
				this._tuitaTabSubMenu = '';
				$("#tuita_list").html(this._error_html);
			}.bind(this)
		);
	},
	
	getMoreInfo: function() {
		if (this._main_menu == 'free_look') {
			this.freeLookMore();
		}else if (this._main_menu == 'tuita') {
			this.getTuitaSquareMore();
		}
	},
	
	//获取推他广场更多信息
	getTuitaSquareMore: function() {
		this.hideMore();
		this.showLoading();
		$.bf.ajax.request('/look/hotTuita', {tab:this._tuitaTabSubMenu, more:1, page:this._more_page}, 
			function (jsonData) {
				this.hideLoading();
				if (jsonData) {
					$("#tuita_list").append(jsonData);					
					this.showMore();
					this._more_page++;
				}else {
					this.showNoMsg();
				}
			}.bind(this),
			function (errno, msg) {
				this.hideLoading();
				this.showMore();
				$.bf.module.Tooltip.show('系统忙,请稍后再试.', $.bf.ui.Tooltip.icons.ERROR);
			}.bind(this)
		);
	},

	//切换明星页tab 
	changeStarTab : function(){
		if(this._tuitaTabSubMenu !="star")
		{
			this._tuitaTabSubMenu = "star";
			this.showStarTab(true);
			var star_wrap = $("#star_wrap");
			star_wrap.html(this._loading_html);
			this.clearSubClass('tuita');
			$("#stars_tuita").addClass('cur');
			$.bf.ajax.request('/look/star',null,
				function(result){
					result = eval('('+result+')');
					$("#star_wrap").setTemplateURL($.bf.config.SITE_URL+"/template/star/look_star_template.html",null,{filter_data : false});
					$("#star_wrap").processTemplate(result);

					$.data(document.body,'page_size',result.page_size);
					$.data(document.body,'page_count',result.page_count);
					this.starSkipPage(1,result.page_size,result.page_count);
				}.bind(this),
				function(errno,msg){
					$.bf.module.Tooltip.show('系统忙,请稍后再试.', $.bf.ui.Tooltip.icons.ERROR);
				}.bind(this)
			);
		}
	},
	
	//明星页 切换跳转页
	starSkipPage : function(page){
		page = page || 1;
		page_size = $.data(document.body, 'page_size') || 20;
		var page_count = $.data(document.body, 'page_count') || 20;
		if(page > page_count)
		{
			return false;
		}

		if(page == page_count)
		{
			$("[attr='next_page']").hide();
		}
		else
		{
			$("[attr='next_page']").show();
		}
		
		if(page == 1)
		{
			$("[attr='prev_page']").hide();
		}
		else
		{
			$("[attr='prev_page']").show();
		}

		$("#page_div > a[attr='page']").removeClass('cur');
		$("#page_div > a[attr='page']").eq(page-1).addClass('cur');
		$("#star_ul > li").hide();
		$("#star_ul > li").slice((page-1)*page_size,page*page_size).show();
	},

		
	freeLook : function(type,page,more){
		this.hideMore();
		this.hideNoMsg();
		var type = type || 1,
			page = page || 1,
			more = more || false;
		if(more)
		{
			this.showLoading();
		}
		else
		{
			$("#tuita_list").html(this._loading_html);
		}
		this._free_page = page;
		this._free_type = type;
		$.bf.ajax.request("/look/Free",{"type":type,"page":page,"bf_count":$("#bf_count").val(),"cy_count":$("#cy_count").val()},
			function(result){
				result = eval('('+result+')');
				var bf_count = result.bf_count || 0,
					cy_count = result.cy_count || 0;
				$("#bf_count").val(bf_count);
				$("#cy_count").val(cy_count);

				if(result.count)
				{
					if(more){
						this.hideLoading();
						$("#tuita_list").append(result.data);
					}else{
						$("#tuita_list").html(result.data);
					}
					this.showMore();
				}
				else
				{
					if(more){
						this.hideLoading();
						this.showNoMsg();
					}else{
						$("#tuita_list").html('<li style="text-align:center">暂无内容</li>');
						this.hideMore();
					}
					
				}
			}.bind(this),
			function(errno , msg){
				$.bf.module.Tooltip.show('系统忙,请稍后再试.', $.bf.ui.Tooltip.icons.ERROR);
				this.hideLoading();
				this.showMore();
			}.bind(this)
		);
		
	},
	
	freeLookMore : function(){
		var type = this._free_type,
			page = this._free_page;
		page++;
		this.freeLook(type,page,true);
	},
	
	hideMore: function() {
		$("#more_activate").hide();
	},
	
	showMore: function() {
		$("#more_activate").css('display', 'block');
	},
	
	hideNoMsg: function() {
		$("#pageLast").hide();
	},
	
	showNoMsg: function() {
		$("#pageLast").css('display', 'block');
	},
	
	showLoading: function() {
		$("#loading").css('display', 'block');
	},
	
	hideLoading: function() {
		$("#loading").hide();
	},
	
	bindTuitaTab: function() {

		//正在发生
		$("#tuita_happening").click(function() {
			if (this._tuitaTabSubMenu != 'happen') {				
				$("#bf_count").val(0);
				$("#cy_count").val(0);
				this.showStarTab(false);
				$("[attr='look_type']").removeClass('cur');
				$("a[type='"+this._default_free_type+"']").addClass('cur');
				$("#all_say").show();
				this.clearSubClass('tuita');
				$("#tuita_happening").addClass('cur');
				this._tuitaTabSubMenu = 'happen';
				this._main_menu = "free_look";
				this.freeLook(this._default_free_type);
			}
		}.bind(this));
		
		//热门转推
		$("#tuita_hot_forward").click(function() {
			this.showStarTab(false);
			if (this._tuitaTabSubMenu != 'transmit') {				
				this.clearSubClass('tuita');
				$("#tuita_hot_forward").addClass('cur');
				this._tuitaTabSubMenu = 'transmit';
				this._main_menu = "tuita";
				this.getTuitaSquare();
			}
		}.bind(this));
		
		//热门评论
		$("#tuita_hot_comment").click(function() {
			this.showStarTab(false);
			if (this._tuitaTabSubMenu != 'comment') {				
				this.clearSubClass('tuita');
				$("#tuita_hot_comment").addClass('cur');
				this._tuitaTabSubMenu = 'comment';
				this._main_menu = "tuita";
				this.getTuitaSquare();
			}
		}.bind(this));
		
		//取更多信息向下排列
		$('#more_activate').click(function() {
			this.getMoreInfo();
		}.bind(this));

		$("#stars_tuita").click(function(){
			this.changeStarTab();
		}.bind(this));
	},

	//添加好友操作
	addFriend: function(fsdid, fnick) {
		var fsdid = parseInt(fsdid);
		if (fsdid > 0) {
			$.bf.module.friends.addFriend(fsdid, fnick, this.cbAddFriend);
		}else{
			$.bf.module.Tooltip.show('系统错误,请稍后再试....', $.bf.ui.Tooltip.icons.ERROR);
		}
	},

	//添加好友callbck
	cbAddFriend: function(errno, msg) {
		switch (errno) {
			case 0:
				$("#fridend_" + msg).html("已是好友");
				break;
			case 1003:
				$.bf.module.Tooltip.show('不可以添加自己为好友噢~', $.bf.ui.Tooltip.icons.ERROR);
				break;
			case 1004:
				$.bf.module.Tooltip.show('您已关注过该好友~', $.bf.ui.Tooltip.icons.ERROR);
				break;
			case $.bf.config.errors.E_NEED_LOGIN:
				setTimeout(function(){location.href=$.bf.config.SITE_URL+"/login?refer="+encodeURIComponent($.bf.config.SITE_URL+"/look");},2000);
				break;
			default:
				$.bf.module.Tooltip.show('系统忙，请稍候再试。', $.bf.ui.Tooltip.icons.ERROR);
		}
	}
	
};


$(document).ready(function() {
	$.bf.app.look.bindTuitaTab();
	
	//明星页 页面跳转
	$("[attr='page']").live('click',function(){
		$.bf.app.look.starSkipPage($(this).html());
	});

	//明星页 上一页跳转
	$("[attr='prev_page']").live('click',function(){
		$.bf.app.look.starSkipPage(parseInt($(this).siblings(".cur").html())-1);
	});

	//明星页 下一页跳转
	$("[attr='next_page']").live('click',function(){
		$.bf.app.look.starSkipPage(parseInt($(this).siblings(".cur").html())+1);
	});

	//明星页 添加好友
	$("[attr='add_friends']").live('click',function(){
		$.bf.app.look.addFriend($(this).attr('sdid'),$(this).attr('nick'));
	});

	$("[attr='look_type']").live('click',function(){
		
		if(parseInt($("[attr='look_type']").filter(".cur").attr('type')) == parseInt($(this).attr("type")))
		{
			return false;
		}
		else
		{
			$("[attr='look_type']").removeClass('cur');
			$(this).addClass('cur');
			$.bf.app.look.freeLook($(this).attr('type'));
		}
	});
	
});