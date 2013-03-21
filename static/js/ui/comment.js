/**
 * 	留言
 * 
 * @author v.zhaoxianghu & modified by gesion<v.wangensheng@snda.com>
 * 
 */
$.registerNameSpace('bf.ui.comment');

$.extend($.bf.ui.comment, {
	//成员变量
	_divId : '',
	_pageIndex : 1,
	_pageSize : 20,
	_hasPager : 0,
	
	/**
	 * 
	 * @author gesion
	 * @param msg {string}
	 * @param type {string} ok : right, error : wrong, doubt : help, sigh : info
	 */
	showMsg : function (msg, type) {
		type = type || 'error';
		$.bf.shortcut.Tooltip.show(msg, $.bf.ui.Tooltip.icons[type.toUpperCase()]);
	},
	// End

	//供外部调用,输入div名字即可(可选pageIndex和pageSize)
	join : function(divIdInput, pageIndexInput, pageSizeInput, hasPagerInput){
		//初始化变量
		this._pageIndex = pageIndexInput || this._pageIndex;
		this._pageSize = pageSizeInput || this._pageSize;
		this._divId = divIdInput;
		this._hasPager = hasPagerInput || this._hasPager;
		
		!divIdInput && alert("no such div");
		
		$.bf.ui.comment.bindActions();

		$.bf.ui.comment.singelPageData(1);
	},

	//home/i页面数据
	singelPageData: function(pageIndex) {
		var homeid = $('#home_uid').val();
		var cid = $('#cid').val();
		$.bf.ui.comment._firstHtmlData = 1;
		var $this = this;
		var cb = function(msg) {
			$('#currentPage').val(pageIndex);
			if(msg.rows == null || msg.type == 'no'){
				$this.showMsg('数据读取失败！');
				return false;
			}
			//将数据写成html显示
			$.bf.ui.comment.htmlSingelData(msg);
			//追加页脚
			$this._hasPager && $('#'+$this._divId).append($.bf.ui.comment.showPageNav(msg.page.total_rows,msg.page.current,msg.page.size,msg.page.total_pages));
		}; // .bind(this)
		var ecb = function (error,msg) {
			$this.showMsg(msg);
		};

		$.bf.ajax.request('/home/getMessage', {'cid' : cid, 'uid' : homeid, 'page' : pageIndex, 'size' : this._pageSize}, cb, ecb, "POST", 10000);
	},
	_firstHtmlData : 1,
	htmlSingelData : function(msg){
		//更新当前留言总数
		$('#totalComments').val(msg.page.total_rows);
		var $this = this;
		if(msg.rows == null){
			$this.showMsg('动态数据读取失败');
			return;
		}
		
		var cnt = msg.rows.length;
		if (cnt != 0){
			this._hasPager || (cnt=Math.min(5,cnt)) ;
		}
		//alert(cnt);
		var tmpArr = [];
		var tmpArrOne = [];
		var faceObj = $.bf.ui.FaceBox.create();
		if (this._hasPager) {
			tmpArr[tmpArr.length] = '<div class="lwlist"><ul id="ul_comment">';
			var del = $("#hid_relation").val() == 9 ? '<a href="javascript:void(0);" class="r" name="homeDelMessage">删除</a>' : '';

			for (var i=0; i<cnt; i++){
				var tmpFirstCss = '';
				if ($.bf.ui.comment._firstHtmlData != 1){
					tmpFirstCss = i == 0 ? ' style="display:none;opacity:0"' : '';
				}
				tmpArr[tmpArr.length] = '<li coinfo="'+msg.rows[i].coinfo+'" name="homeComList"' + tmpFirstCss + ' style="background-color:#FFF;">';
				tmpArr[tmpArr.length] = ' <a href="' + msg.rows[i].sender_link + '" class="avatar-45 l"><img alt="" src="' + msg.rows[i].sender_avatar_45 + '"></a>';
				
				var tmp = msg.rows[i].sender == $.bf.common.loginJudge() ? '我' : msg.rows[i].sender_nick;

				tmpArr[tmpArr.length] = '<div class="c t999">' + del + '<a href="javascript:void(0);" class="r mr5" name="homeReplyMessage">回复</a> <a href="' + msg.rows[i].sender_link + '" class="name">' + tmp + '</a>' + msg.rows[i].time;
				tmpArr[tmpArr.length] = '<p>';
				if(msg.rows[i].parent_cid != null && msg.rows[i].parent_cid != ''){
					tmpArr[tmpArr.length] ='回复<a href="'+msg.rows[i].receiver_link+'">'+msg.rows[i].receiver_nick+'</a>：';
				}
				
				tmpArr[tmpArr.length] =  faceObj.codeToSmile(msg.rows[i].content) +'</p></div></li>';

			}
			tmpArr[tmpArr.length] = '</ul></div>';
		}
		else {
			tmpArr[tmpArr.length] = '<ul id="ul_comment">';
			var del = $("#hid_relation").val() == 9 ? '<a href="javascript:void(0);" class="r" name="homeDelMessage">删除</a>' : '';
			
			for (var i=0; i<cnt; i++){
				var tmpFirstCss = '';
				if ($.bf.ui.comment._firstHtmlData != 1){
					tmpFirstCss = i == 0 ? ' style="display:none;opacity:0"' : '';
				}
				tmpArr[tmpArr.length] = '<li coinfo="'+msg.rows[i].coinfo+'" name="homeComList"' + tmpFirstCss + ' style="background-color:#FFF;">';
				tmpArr[tmpArr.length] = '<a href="' + msg.rows[i].sender_link + '"  class="avatar-45 l"><img alt="" src="' + msg.rows[i].sender_avatar_45 + '"></a>';
				
				var tmp = msg.rows[i].sender == $.bf.common.loginJudge() ? '我' : msg.rows[i].sender_nick;

				tmpArr[tmpArr.length] = '<div class="c t999">' + del + '<a href="javascript:void(0);" class="r mr5" name="homeReplyMessage">回复</a> <a href="' + msg.rows[i].sender_link + '" class="name">' + tmp + '</a>' + msg.rows[i].time;
				tmpArr[tmpArr.length] = '<p>';
				if(msg.rows[i].parent_cid != null && msg.rows[i].parent_cid != ''){
					tmpArr[tmpArr.length] ='回复<a href="'+msg.rows[i].receiver_link+'">'+msg.rows[i].receiver_nick+'</a>：';
				}
				
				tmpArr[tmpArr.length] =  faceObj.codeToSmile(msg.rows[i].content) +'</p></div></li>';
			}
			tmpArr[tmpArr.length] = '</ul>';
		}
		var html = tmpArr.join("");
		if (html == '<ul id="ul_comment"></ul>') {
			html = '<center id="ul_comment">主人还没有留言</center>';
		}
		$("#"+this._divId).html(html);

		//第一个li效果slidown
		if ($.bf.ui.comment._firstHtmlData != 1){
			// $("#ul_comment").children('li:first').slideDown(1000, function(){$.bf.ui.comment.flashin(this, 0);});
			
			var el = $('#ul_comment li:first');
			el.css('opacity', 0);
			el.slideDown(300, function () {
				el.animate({
					opacity : 1
				}, 300);
			});
		}
		$('#ul_comment li:last').css('background-image', 'none');
		$.bf.ui.comment._firstHtmlData += 1;
		
	},

	//feed的动态滑动  定时刷新等效果
	flashin : function(dom, ts) {
		if(ts < 101) {
			$(dom).css('opacity', ts/100);
			ts += 5;
			setTimeout(function(){$.bf.ui.comment.flashin(dom, ts)}, 30);
		}
	},

	//为各控件绑定事件
	bindActions : function(){
		
		//载入表情层
		if($.bf.common.loginJudge() != false){
			// alert($.bf.ui.faceDiv);
			// var faceObj = $.bf.ui.faceDiv.create("homeExpression","homeMessageText","homeexop");
			var faceObj = $.bf.ui.FaceBox.create('#homeMessageText');
			$("#homeExpression").click(function() {
				faceObj.getDialog().toggle();
				faceObj.initPosition("#homeExpression", 'under');
			});
		}else{
			$('#homeExpression').live('click',function(){
				$.bf.common.homeLogin();
				return false;
			});
		}
		
		//监控文本输入框中用户鼠标按下事件
		$('#homeMessageText').live('keydown',function(){
			var a = this;
			$.bf.ui.comment.byteLimit(a,$.bf.config.COMMENT_BYTE_LIMIT);
		});
		//监控提交留言
		$('#homeUpComment').bind('click',function(){
			$.bf.ui.comment.upComment();
		});
		
		//监控Ctrl+Enter事件
		$('#homeMessageText').bind('keypress',function(event){
			if(event.ctrlKey && event.which == 13 || event.which == 10) {
				$.bf.ui.comment.upComment();
			}else if(event.shiftKey && event.which==13 || event.which == 10) {
				$.bf.ui.comment.upComment();
			}
		});
		
		//留言框获取焦点时检查用户是否登录
		$('#homeMessageText').bind('focus',function(){
			if($.bf.common.homeLogin() == false){
				alert("please登录");
				return false;
			}
		});
		//回复留言
		$('a[name="homeReplyMessage"]').live('click',function(){
			var a = this;
			$.bf.ui.comment.homeReplyMess(a);

			//var mynames = this.AddFriendDialog.create();
			//mynames.show();
			//.bind($.bf.ui)
		});
		//删除留言
		$('a[name="homeDelMessage"]').live('click',function(){
			var a = this;
			$.bf.ui.comment.homeDelMess(a);
		});
		/*
		//给他留言提示
		$('#cuicui').live('click',function(){
			$.bf.ui.comment.sendMessage();
		});
		*/

		//$.bf.ui.comment.getOneCommeny();
	},

	//文本框字节数限制
	byteLimit: function(a,limt){
		var num = $.bf.ui.comment.getBytesCount($(a).val());
		if(num > limt){
			var com = $.bf.ui.comment.getStr($(a).val(),limt);
			$(a).val(com);
		}
		return;
	},

	//提交留言
	upComment: function(){
		
		//首先判断用户是否登录
		if($.bf.common.homeLogin() == false){
			return false;
		}
		
		var homeid = $('#home_uid').val();
		var cid = $('#cid').val();
		var receiver = $('#receiver').val();

		var content = $.trim($('#homeMessageText').val());
		content = content.replace("回复@"+$('#receiverNickname').val()+"：","");
		//一个淡入淡出效果 提醒用户 暂时还没输入东西
		if(content.length == 0 || homeid == 0){
			$('#msgMindHome').animate({'opacity':0.1},'fast',function(){
				$('#msgMindHome').animate({'opacity':1},'fast');
			});
			return false;
		}
		$('#homeMessageText').val(' ');
		var $this = this;
		var cb = function(msg) {
			// var alertObj = $.bf.ui.Alert.create();
			if(msg.type == 'login'){
				$this.showMsg('需要login');
				return false;
			}
			if(msg.type == 'black'){
				$this.showMsg('"'+msg.nick+'" 已将你添加至黑名单，你不能够给他留言。');
				return false;
			}
			if(msg.type == 'no'){
				$this.showMsg('错误的数据提交！');
				return false;
			}
			if(msg.type == 'error'){
				$this.showMsg('您发布的留言中包含敏感词，发布失败！');
				return false;
			}
			if(msg.type == 'mis_limit'){
				$this.showMsg('您发表频率太快，请稍候在提交！');
				return false;
			}
			
			$.bf.shortcut.Tooltip.show("发表留言成功", $.bf.ui.Tooltip.icons.OK, {speed: 1500, onClose : function(){}});																			
			

			$.bf.ui.comment.htmlSingelData(msg);
			//追加页脚
			this._hasPager && $('#'+this._divId).append($.bf.ui.comment.showPageNav(msg.page.total_rows,msg.page.current,msg.page.size,msg.page.total_pages));
		}.bind(this)
		var ecb = function (error,msg) {
			$this.showMsg(error + '发送留言失败' + msg);
		}
		var currentPage;
		if($('#currentPage').val() == null || $('#currentPage').val() == 0){
			currentPage = 1;
		}else{
			currentPage = $('#currentPage').val();
		}
		$('#receiver').val('');
		$('#cid').val('');
		$('#receiverNickname').val('');
		var callbackfun='ok';
//alert(receiver);
//alert(homeid);
		$.bf.ajax.request('/home/sendMessage', {'cid': cid, 'uid': homeid, 'receiver': receiver, 'content':content,'page':currentPage}, cb, ecb, "POST", 4000);
		
		//snda.lib.data.request('newhome/sendmessage', {'cid':cid,'home':homeid,'content':content,'page':currentPage,'callback':callbackfun}, cb, ecb, 'POST');
		
	},
	
	//回复留言
	homeReplyMess: function(a){
		//首先判断用户是否登录
		if($.bf.common.homeLogin() == false){
			return false;
		}
		var coinfo = $(a).closest('li[name="homeComList"]').attr('coinfo');
		//coinfo = eval('0||'+$.trim(decodeURIComponent(coinfo)));
		coinfo = coinfo.split("|");
		
		var cid = coinfo[2];
		var sender = coinfo[1];
		var sender_nick = coinfo[0];

		if(sender == $.bf.common.loginJudge()){
			sender_nick = '我';
		}
		$('#receiver').val(sender);
		$('#cid').val(cid);

		$('#receiverNickname').val(sender_nick);
		$('#homeMessageText').val('回复@'+sender_nick+'：');
		$('#homeMessageText').focus(function(){$('#homeMessageText').val($('#homeMessageText').val());});$('#homeMessageText').focus();
		//$('.modTL').get(0).scrollIntoView();
	},
	delCom:null,
	//删除留言
	homeDelMess: function(a){
		//首先判断用户是否登录
		if($.bf.common.homeLogin() == false){
			return false;
		}
		$.bf.ui.comment.delCom = a;

		// var confirmObj = $.bf.ui.Confirm.create();

		$.bf.shortcut.Confirm.show({message : '你确定要删除这条留言吗？', onEnter : function(){$.bf.ui.comment.homeDelComOk();}});
			
	},
	homeDelComOk: function(){
		
		//首先判断用户是否登录
		if($.bf.common.homeLogin() == false){
			return false;
		}
		
		var currentPage;
		if($('#currentPage').val() == null || $('#currentPage').val() == 0){
			currentPage = 1;
		}else{
			currentPage = $('#currentPage').val();
		}

		var coinfo = $($.bf.ui.comment.delCom).closest('li[name="homeComList"]').attr('coinfo');
		
		coinfo = coinfo.split("|");
		
		var homeid = $('#home_uid').val();
		var sendid = coinfo[1];
		var cid = coinfo[2];
		var $this = this;
		var cb = function(msg) {
			if(msg == null){
				$this.showMsg('错误的数据！!');
				return false;
			}
			
			$.bf.ui.comment.htmlSingelData(msg);
			//追加页脚			
			this._hasPager && $('#'+this._divId).append($.bf.ui.comment.showPageNav(msg.page.total_rows,msg.page.current,msg.page.size,msg.page.total_pages));
		}; // .bind(this)
		var ecb = function (error,msg) {
			$this.showMsg(msg);
		};
		$.bf.ajax.request('/home/deleteMessage', {'cid':cid,'uid':homeid,'sid':sendid,'page':currentPage}, cb, ecb, 'POST');
	},
	//返回页脚代码
	showPageNav : function(count,pageIndex,pageSize,pageCount)
    {
		/*
		var count = msg.page.total_rows;
		var pageIndex = msg.page.current;
		var pageSize = msg.page.size;
		var pageCount = msg.page.total_pages;
		*/
		//count=100;pageIndex=66;pageSize=3;pageCount=111;
		//var page = 中间量已经显示了多少个页
        if (!pageCount) {
            pageCount = 10;
        }
        
        if (count <= pageSize) {
            return '';
        }
    
        var nav = '';
        var forward = '';
        var pagerLeft = '';
        var pagerCurrent = '';
        var pagerRight = '';
        var next = '';        
        var maxPage = Math.ceil(count/pageSize);
		
        if (pageIndex > 1) {
            forward += '<a href="javascript:void(0)" class="next" onclick="$.bf.ui.comment.singelPageData(' + (pageIndex - 1) + ')">上一页</a>';
        }
        else {
            forward += '<span>上一页</span>';
        }
    
        if (maxPage > pageIndex) {
            next = '<a href="javascript:void(0)" class="next" onclick="$.bf.ui.comment.singelPageData(' + (pageIndex + 1) + ')">下一页</a>';
        }
        else {
            next = '<span>下一页</span>';
        }

        //all page count
        var page = 0;
		//左边的 1至current
		if (pageIndex > 6){
			pagerLeft += '<a href="javascript:void(0)" onclick="$.bf.ui.comment.singelPageData(' + 1 + ')">' + 1 + '</a>';
			pagerLeft += "...";
			for (i=pageIndex-3;i<=pageIndex-1;i++){
				pagerLeft += '<a href="javascript:void(0)" onclick="$.bf.ui.comment.singelPageData(' + i + ')">' + i + '</a>';
			}
		}
		else {
			for (i=1;i<pageIndex;i++){
				pagerLeft += '<a href="javascript:void(0)" onclick="$.bf.ui.comment.singelPageData(' + i + ')">' + i + '</a>';
			}
			
		}
		page += pageIndex -1;
    
        //current nav number
        pagerCurrent = '<strong>' + pageIndex + '</strong>';
		page += 1;
    
		//current右边的部分
        if (pageCount - pageIndex > 6){
			for (i=pageIndex+1;i<=pageIndex+3;i++){
				pagerRight += '<a href="javascript:void(0)" onclick="$.bf.ui.comment.singelPageData(' + i + ')">' + i + '</a>';
			}
			pagerRight += "...";
			pagerRight += '<a href="javascript:void(0)" onclick="$.bf.ui.comment.singelPageData(' + pageCount + ')">' + pageCount + '</a>';
			
		}
		else {
			for (i=pageIndex+1;i<=pageCount;i++){
				pagerRight += '<a href="javascript:void(0)" onclick="$.bf.ui.comment.singelPageData(' + i + ')">' + i + '</a>';
			}
		}
		page += pageCount - pageIndex;
		
        nav = '<div class="page">' + forward + pagerLeft + pagerCurrent + pagerRight + next + '</div>';
    
        return nav;
    },
	
	//获取字节数
	getBytesCount: function(str){
		var bytesCount = 0;
		if(str != null){
			for(var i = 0; i < str.length; i++){
				var c = str.charAt(i);
				if (/^[\u0000-\u00ff]$/.test(c)){
					bytesCount += 1;
				}else{
					bytesCount += 2;
				}
			}
		}
		return bytesCount;
	},
	//依据字节截取字符
	getStr: function(str,n){
		var tmpStr = str.substr(0,n);
		var tmpCode = tmpStr.replace(/[^\x00-\xff]/g,'\r\n').split('');
		var n = (tmpCode[n-1]=='\r')?n-2:n-1;
		var l = tmpCode.slice(0,n).join('').replace(/\r\n/g,'*').length+1;
		return tmpStr.substr(0,l);
	}
});
