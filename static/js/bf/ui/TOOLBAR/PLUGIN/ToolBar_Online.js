/**
 * ToolBar Plugin UI Component <ToolBar_Online>
 * @author 陈耀强
 */

$.registerNameSpace("bf.ui.toolbar.plugin");
$.bf.ui.toolbar.plugin.ToolBar_Online = $.Class.create();
$.Class.extend($.bf.ui.toolbar.plugin.ToolBar_Online, $.bf.ui.Dialog, {
	__init__ : function(toolbar, plug)
	{
		this.toolbar = toolbar || null;
		this.plug  = plug || null;
		this.setMasker(false);
		this._friendsData = {};
		this._html = '\
            <div class="hd26">\
				<span class="hdR"></span>\
				<a href="javascript:;"><i class="ico i20" attr="toolbar_close"></i></a>\
				<strong>在线好友</strong>(<span attr="toolbar_online_count">0</span>/<span attr="toolbar_total_count">158</span>)</div>\
            <div class="bd">\
            	<div class="top">\
                    <div class="iptSelect" style="">\
                        <span class="ipt2"><span><input type="text" attr="toolbar_search_input"><i class="ico i98" style="" attr="toolbar_search_btn"></i></span></span>\
                        <div class="over"><div class="iner">这里放内容结构</div></div>\
                    </div>\
                </div>\
                <div class="content" attr="toolbar_contents_container">\
                    <ul class="list16 cl">\
                        <li>\
                        <span class="avatar-30"><img height="30" width="30" alt="30" src="../img/temp/avatar30.jpg"></span>\
                        <div class="c cl"><em>花雨大猫</em><i class="ico i80"></i><i class="ico i77"></i></div>\
                        </li>\
                        <li class="cur">\
                        <span class="avatar-30"><img height="30" width="30" alt="30" src="../img/temp/avatar30.jpg"></span>\
                        <div class="c cl"><em>花雨猫</em><i class="ico i80"></i><span class="t999">已是好友</span></div>\
                        </li>\
                        <li>\
                        <span class="avatar-30"><img height="30" width="30" alt="30" src="../img/temp/avatar30.jpg"></span>\
                        <div class="c cl"><em>花雨大猫</em><i class="ico i80"></i><i class="ico i41"></i></div>\
                        </li>\
                        <li>\
                        <span class="avatar-30"><img height="30" width="30" alt="30" src="../img/temp/avatar30.jpg"></span>\
                        <div class="c cl"><em>花雨大猫</em><i class="ico i80"></i><span class="t999">已是好友</span></div>\
                        </li>\
                        <li>\
                        <span class="avatar-30"><img height="30" width="30" alt="30" src="../img/temp/avatar30.jpg"></span>\
                        <div class="c cl"><em>花雨大猫</em><i class="ico i80"></i><span class="t999">已是好友</span></div>\
                        </li>\
                        <li>\
                        <span class="avatar-30"><img height="30" width="30" alt="30" src="../img/temp/avatar30.jpg"></span>\
                        <div class="c cl"><em>花雨大猫</em><i class="ico i80"></i><span class="t999">已是好友</span></div>\
                        </li>\
					</ul>\
                    <p class="empty hide">你没有任何好友在线</p>\
                </div>\
            </div>\
		';
		this.superclass.build.call(this);
		this._searchBtn       = this.getDialog().find("[attr='toolbar_search_btn']");
		this._searchInput     = this.getDialog().find("[attr='toolbar_search_input']");
		this._searchContainer = this.getDialog().find("[attr='toolbar_contents_container']");
		this._onlineCount     = this.getDialog().find("[attr='toolbar_online_count']");
		this._totalCount      = this.getDialog().find("[attr='toolbar_total_count']");

		this._initEvent();
	},
	_initEvent : function()
	{
		// 关闭	
		this.getDialog().find("[attr='toolbar_close']").click(function(event){
			this.plug && this.plug.popup && this.plug.popup.hide();
			this.toolbar && this.plug && this.plug.menu && this.toolbar.ICleanCls(false);
		}.bind(this));
		
		// 鼠标滑过效果	
		$("[attr='toolbar_friend_list']").live('mouseover', function(){
			$(this).addClass("over");
		}).live('mouseout', function(){
			$(this).removeClass("over");
		});
			
		// 邀请好友一起玩
		$("[attr='toolbar_invite']").live('click', function(){
		});
		
		this._searchBtn.click(function(event){
			this.searchFriends();	
		}.bind(this));
		
		$().keydown(function(event){
			if(event.keyCode == 13)
			{
				this.searchFriends();
			}
		}.bind(this));
	},
	changeContents : function(data, total)
	{
		if(!data.length)
		{
			this._searchContainer.html('<div class="noWord t999 center">您目前没有任何好友在线！</div>');
			this._onlineCount.html('0');
			this._totalCount.html(total);
		}
		else
		{
			if(!total)
			{
				total = data.length;
			}
			this._onlineCount.html(data.length);
			this._totalCount.html(total);
			var tpl = ['<ul class="list16 cl">'];
			for(var i = 0; i < data.length; i++)
			{
				var friend = data[i];
				if(!friend)
				{
					break;
				}
				tpl[tpl.length] = $.sprintf('\
					<li attr="toolbar_friend_list">\
                        <span class="avatar-30"><img height="30" width="30" alt="%s" title="%s" src="%s"></span>\
                        <div class="c cl"><em>%s</em><i class="ico i80"></i><i class="ico i41"></i></div>\
                    </li>\
				', friend.nickname, friend.nickname, friend.avatar_45, friend.nickname);
			}
			tpl[tpl.length] = '\
							</ul>\
							<p class="buttonWrap">\
                                <a href="javascript:;" class="r underline">查看全部</a><a href="javascript:;" class="underline">邀请好友玩游戏</a>\
                            </p>\
                            ';
			this._searchContainer.html(tpl.join(''));
			
			var dialog = this.getDialog();
			if(dialog.outerHeight() >= 250)
			{
				dialog.find("[attr='toolbar_scroll_set']").css("overflow-y", "scroll");
			}
			
		}
	},
	searchFriends : function()
	{
		var data = this._friendsData.rows, total = this._friendsData.total;
		var atc = $.bf.ui.AutoComplete.create({
			urlOrData : data,
			filterKey : 'nickname',
			input     : this._searchInput
		});
		this.changeContents(atc.search(this._searchInput.val()), total);
	},
	doAction : function(options, callback)
	{
		try{
			var friendsList = new Function("return " + options.ToolBar_Online.onlineFriendsList + ";")();
			this._friendsData = friendsList;
			var total = friendsList.total, data = friendsList.rows;
			this.changeContents(data, total);
			/*
			atc.install(null, function(data){
				this.changeContents(data);
			}.bind(this));
			*/
		} catch(e){}
		finally{
			callback && callback();
		}
	}
});