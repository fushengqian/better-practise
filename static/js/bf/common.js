$.registerNameSpace("bf.common");
$.extend($.bf,{});
$.extend($.bf.common, {

	checkstat : function(stat) {
		if (stat.CAS_LOGIN_STATE == '1') {
			window.location.href = 'http://cas.sdo.com/cas/login?service=' + encodeURIComponent(location.href);
		}
	},
	
	replaceString : function(string,exp,str){
		str = str||"";
		var strExp = "";
		if(typeof exp=="string"){
			strExp = exp;
		}else{
			strExp = "["+exp.join("|")+"]";
		}
		var regExp = new RegExp(strExp.replace(/\-/g,"\\-"),"g");
		return string.replace(regExp,str);
	},

	replaceVideoString : function(str){
		var arr_replace = ['- 视频','- 优酷视频','- 在线观看'];
		return this.replaceString(str,arr_replace);
	},
	/*
		@name 返回传入年份和月份的天数
		@param year	int 1-12
		@param month int 0-11
		@return int 
	 */
	getMonthDay : function (year,month)
	{
		return[31,($.bf.common.isLeapYear(year)?29:28),31,30,31,30,31,31,30,31,30,31][month];
	},
	

	/*
		@name 判断传入年份是否是闰年
		@param year	int 1-12
		@return boolean
	 */
	isLeapYear : function(year)
	{
		return(((year%4===0)&&(year%100!==0))||(year%400===0));
	},
	/**
	 * @name	按照传入的用户ID返回用户的HOME地址
	 * @param	string $user 用户ID
	 * @return	string
	 */
	getUserHomeUrl:function(userid)
	{
		return $.bf.config.SITE_URL + "/home/i/uid/" + userid;
	},
	
	/*
	   @name	获取传入的字符串最后一个_后面的string
	   @param	str		传入的字符串
	   @return	最后一个_后面的string	例如:a_b_c_123456 获取123456
	 */
	getLastString : function(str)
	{
		return str.substr(str.lastIndexOf("_")+1,str.length);
	},

	/*
	   @name	设置传入的checkbox name  的状态
	   @param	cb_name	checkbox name
	   @param	flag	true->设置为选中　false->设置为不选中
	   @return  null
	 */
	setAllCheckBox : function (cb_name,flag)
	{
		if(!cb_name)
		{
			return;
		}
		if(flag)
		{
			$("input[name='"+cb_name+"']").attr("checked",true);
		}
		else
		{
			$("input[name='"+cb_name+"']").attr("checked",false);
		}
	},
	
	/*	
		@name	把传入的checkbox name反选(例如:A选中->不选中,B不选中->选中)
		@param	cb_name	checkbox name
		@return null
	 */
	InverseAllCheckBox : function (cb_name)
	{
		if(!cb_name)
		{
			return;
		}
		$("input[name='"+cb_name+"']").each(
			function(){
				if($(this).attr("checked"))
				{
					$(this).attr("checked","false");
				}
				else
				{
					$(this).attr("checked",true);
				}
			}
		);
	},
	
	// correctly handle PNG transparency in Win IE 5.5 & 6.
	correctPNG: function(){ 
		var arVersion = navigator.appVersion.split("MSIE");
		var version = parseFloat(arVersion[1]);
		if ((version >= 5.5) && (document.body.filters)) { 
		   for(var j=0; j<document.images.length; j++) {
			  var img = document.images[j];
			  var imgName = img.src.toUpperCase();
			  if (imgName.substring(imgName.length-3, imgName.length) == "PNG"){ 
				 var imgID = (img.id) ? "id='" + img.id + "' " : "";
				 var imgClass = (img.className) ? "class='" + img.className + "' " : "";
				 var imgTitle = (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' ";
				 var imgStyle = "display:inline-block;" + img.style.cssText;
				 if (img.align == "left") imgStyle = "float:left;" + imgStyle;
				 if (img.align == "right") imgStyle = "float:right;" + imgStyle;
				 if (img.parentElement.href) imgStyle = "cursor:hand;" + imgStyle;
				 var strNewHTML = "<span " + imgID + imgClass + imgTitle
				 + " style=\"overflow:hidden;" + "width:" + img.width + "px; height:" + img.height + "px;" + imgStyle + ";"
				 + "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
				 + "(src=\'" + img.src + "\', sizingMethod='scale');\"></span>";
				 img.outerHTML = strNewHTML;
				 j = j-1;
			  } 
		   } 
		} 
	},
	fixPNG:function (myImage) 
	{
		var arVersion = navigator.appVersion.split("MSIE");
		var version = parseFloat(arVersion[1]);
		if ((version >= 5.5) && (version < 7) && (document.body.filters)) 
		{
		   var imgID = (myImage.id) ? "id='" + myImage.id + "' " : "";
		var imgClass = (myImage.className) ? "class='" + myImage.className + "' " : "";
		var imgTitle = (myImage.title) ? 
				   "title='" + myImage.title  + "' " : "title='" + myImage.alt + "' ";
		var imgStyle = "display:inline-block;cursor:hand;" + myImage.style.cssText;
		var strNewHTML = "<span " + imgID + imgClass + imgTitle
					  + " style=\"" + "width:" + myImage.width 
					  + "px; height:" + myImage.height 
					  + "px;" + imgStyle + ";"
					  + "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
					  + "(src=\'" + myImage.src + "\', sizingMethod='scale');\"></span>";
		$(myImage).replaceWith(strNewHTML);
		//myImage.outerHTML = strNewHTML; 
		}
	},

	htmlspecialchars: function(str) {
		str = str.replace(/&/g,  '&amp;');
		str = str.replace(/</g,  '&lt;');
		str = str.replace(/>/g,  '&gt;');
		str = str.replace(/\"/g, '&quot;');
		str = str.replace(/\'/g, '&#039;');
		return str;
	},
	submit:function(e,submitId){
		if($.browser.msie){
			if(event.keyCode == 13){
				$('#'+submitId).click();
				return false;
			}
		}else{
			if(e.which == 13)
			{
				$('#'+submitId).click();
				return false;
			}
		}
		return true;
	},

	//获取cookie
	getCookie : function(name){
		/*
		var allcookies = document.cookie;
		var cookie_pos = allcookies.indexOf(cookie_name);
		// 如果找到了索引，就代表cookie存在，
		// 反之，就说明不存在。
		if (cookie_pos != -1){
			// 把cookie_pos放在值的开始，只要给值加1即可。
			cookie_pos += cookie_name.length + 1;
			var cookie_end = allcookies.indexOf(";", cookie_pos);
			if (cookie_end == -1){
				cookie_end = allcookies.length;
			}
			var value = unescape(allcookies.substring(cookie_pos, cookie_end));
		}
		return value;
		*/
		var theCookie = document.cookie;
        if(theCookie == "") return null;
        var str = "; " + name + "=", s = name + "=";
        var begin = theCookie.indexOf(str);
        if(begin == -1)
        {
            if(theCookie.indexOf(s) == -1) return null;
            begin=theCookie.indexOf(s);
            //if(!begin) return null;
        }
        else
        {
            begin += 2;
        }
        var end = theCookie.indexOf(";", begin);
        if(end == -1) end = theCookie.length;
        return unescape(theCookie.substring(begin + s.length, end));
	},
	//设置cookie
	setCookie : function(name,value,Days,domainValue)
    {
        var cookieValue = name + "="+ escape(value);
        if(domainValue!=null) {
            cookieValue += ";domain="+domainValue;
        }
        if(Days !=null && Days !=0){
            var exp  = new Date(); 
            exp.setTime(exp.getTime() + Days*24*60*60*1000);
            cookieValue += ";expires=" + exp.toGMTString();	
        }   
        document.cookie = cookieValue;
    },
	//删除cookie
    delCookie : function(name)
    {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval=this.getCookie(name);
        if(cval!=null) {
			document.cookie= name + "="+cval+";expires="+exp.toGMTString();
		}
    },
	//浏览器是否为ie6
	isIE6 : function(){	
		var userAgent = navigator.userAgent.toLowerCase();
		var browserVersion = (userAgent.match( /.+?(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1];
		var isIE6 = (/msie/.test(userAgent) && !/opera/.test(userAgent) && parseInt(browserVersion) < 7);
		return isIE6;
	},

	zipcodeCheck: function(value){
		var ereg = /^[\d]{6}$/;
		return ereg.test(value);
	},

	telCheck: function(value){
		var ereg = /^(\d{5,11})|(\d{3,4}-?\d{7,8})$/;
		return ereg.test(value);
	},

	mobileCheck : function(value){
		var ereg = /^((\+?86)|\(\+?86\))?0?1(3|5|8)(\d){9}$/;
		return ereg.test(value);
	},

	qqCheck : function(value)
	{
		return /^\d{5,11}$/.test(value);
	},

	emailCheck: function(value){
		var ereg = /^\w+([-+.\']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
		return ereg.test(value);
	},

	urlCheck: function(value){
		var ereg = /((?:\w{3,5}:\/\/)?(\w)+\.(\w)+\.(\w)+(?:\/?.*))/;
		return ereg.test(value);
	},

	/**
	 * JQUERY跳转到锚点效果
	 * @param	id		控件ID（为空时跳转到页面顶部）
	 *
	 */

	anchorGo : function(id){
		var def = {timer:1000};
		var top = 0;
		if(id){
			top = $('#'+id).offset().top;
		}
		$('html,body').animate({scrollTop:top},def.timer);
	},

	//长度截取
	strSub: function(str, len,flag){
		if(!str || !len) { return ''; }
		//预期计数：中文2字节，英文1字节
		var a = 0;
		//循环计数
		var i = 0;
		//临时字串
		var temp = '';
		for(i=0;i<str.length;i++){
			if(str.charCodeAt(i)>255){
				//按照预期计数增加2
				a+=2;
			}else{
				a++;
			}
			//如果增加计数后长度大于限定长度，就直接返回临时字符串
			if(a > len) { 
				if(flag==true)temp+="...";
				return temp; }
			//将当前内容加到临时字符串
			temp += str.charAt(i);
		}
		//如果全部是单字节字符，就直接返回源字符串
		return str;
	},

	//长度截取
	utf8StrSub: function(str, len,flag){
		if(!str || !len) { return ''; }
		//预期计数：中文3字节，英文1字节
		var a = 0;
		//循环计数
		var i = 0;
		//临时字串
		var temp = '';
		for(i=0;i<str.length;i++){
			if(str.charCodeAt(i)>255){
				//按照预期计数增加2
				a+=3;
			}else{
				a++;
			}
			//如果增加计数后长度大于限定长度，就直接返回临时字符串
			if(a > len) { 
				if(flag==true)temp+="...";
				return temp; }
			//将当前内容加到临时字符串
			temp += str.charAt(i);
		}
		//如果全部是单字节字符，就直接返回源字符串
		return str;
	},
	getDimX : function(el){   
	  for   (var   lx=0;el!=null;   
	  lx+=el.offsetLeft,el=el.offsetParent);   
	  return   lx; 
	},  
	getDimY:function   (el){   
	  for   (var   ly=0;el!=null;   
	  ly+=el.offsetTop,el=el.offsetParent);   
	  return   ly   ;
	},
	txtHeight:'',
	adaptHeight:function(id){
	  if(this.txtHeight=='')this.txtHeight=$('#'+id).height();
	  if($.browser.msie) {
		document.getElementById(id).onpropertychange=function(){$.bf.common.handle(id)}
	  }else{
		document.getElementById(id).addEventListener("input",function(){$.bf.common.handle(id)},false);
	  }
	},
	handle:function(id){
		if($('#'+id)[0].scrollHeight>this.txtHeight)$('#'+id).height($('#'+id)[0].scrollHeight+'px');
		if($('#'+id).height()>this.txtHeight)$('#'+id).height($('#'+id)[0].scrollHeight+'px');
	},
	//获取滚动条上边距
	getScrollTop:function ()   
	{   
		return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
	}, 
	//获取滚动条左边距
    getScrollLeft : function()
    {
        return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
    },
	//获取游览器窗口可视范围的高度   
	getClientHeight : function() 
	{   
		return (document.compatMode == "CSS1Compat")? document.documentElement.clientHeight : document.body.clientHeight; 
	},
	//获取游览器窗口可视范围的宽度
	getTotalWidth : function()
	{
		return (document.compatMode == "CSS1Compat")? document.documentElement.clientWidth : document.body.clientWidth; 
	},	
	//取文档内容实际宽度   
	getScrollWidth : function()
	{   
		return (document.compatMode == "CSS1Compat")? document.documentElement.scrollWidth : document.body.scrollWidth;  
	},
	//取文档内容实际高度   
	getScrollHeight : function()
	{   
		return (document.compatMode == "CSS1Compat")? document.documentElement.scrollHeight : document.body.scrollHeight;  
	},
	scrollBottom:function(divScroll){
		if(!divScroll){
			if (this.getScrollTop()+this.getClientHeight()==this.getScrollHeight())return true;	//到达底部
			return false;	//没有到达底部 
		}else{
			if($(divScroll)[0].scrollTop==0&&$(divScroll)[0].clientHeight+$(divScroll)[0].scrollTop==$(divScroll)[0].scrollHeight)return false;	//没有滚动条
			else if($(divScroll)[0].clientHeight+$(divScroll)[0].scrollTop==$(divScroll)[0].scrollHeight)return true;	//滚动条滚动底部
			return false;
		}
	},
	prePage:1,
	scrollLoad:function(id,callback,divScroll,options){
		if(!id)return;
		if(!divScroll)divScroll=window;
		$(divScroll).unbind('scroll');
		$(divScroll).scroll(function(){
			var tmp=$.bf.common.scrollBottom(divScroll);
			var page=$('#'+id).attr("value");
			if(tmp==true&&callback&&page&&$.bf.common.prePage!=page){
				$.bf.common.prePage=page;
				if(options&&options.params)callback(page,id,options.params);
				else callback(page,id);
			}
		});
	},
	txtEvent: function(id,content){
		$('#'+id).bind('focus',function(){$.bf.common.txtfocus(id,content);});
		$('#'+id).bind('blur',function(){$.bf.common.txtblur(id,content);});
	},
	txtfocus : function (id,content){
		if($('#'+id).val()==content)$('#'+id).val('');	//文本内容等于默认内容，清空文本框
	},
	txtblur : function (id,content){
		if($('#'+id).val()==content||$('#'+id).val()=='')$('#'+id).val(content); //文本内容等于默认内容或为空时，文本框赋默认值
		
	},
	toggleDiv : function (clickId,divId,flag){	//clickId单击标签id,divId为toggle层id
		if(typeof(flag)!="undefined"){
			$("#"+divId).show();
			$('#'+clickId).addClass('setUnfold');
		}
	    $.bf.common.toggleEffect(clickId,divId);
		
	},
	toggleAction:function(divId){
		var disp=$("#"+divId).css("display"); 
		if(disp=='none'){
			$('#'+divId).show();
		}else{
			$("#"+divId).hide();
		}
	},
	toggleEffectInit:function(clickId,divId){	//初始化层标签
		var disp=$("#"+divId).css("display");
		if(disp=='none'){
			$('#'+clickId).removeClass('setUnfold');
		}else{
			$('#'+clickId).addClass('setUnfold');
		}
	},
	toggleEffect:function(clickId,divId){
		this.toggleEffectInit(clickId,divId);
		$('#'+clickId).mouseover(function(){
			$('#'+clickId).addClass('setHover');
			$('#'+clickId).css('cursor','pointer');
			if($.browser.msie)$('#'+clickId).css('display','inline-block');
		});
		$('#'+clickId).mouseout(function(){$('#'+clickId).removeClass('setHover');});
		$('#'+clickId).click(function(){
			$.bf.common.toggleAction2(clickId,divId);
		});
	},
	flashide:function(){
		$('#ZeroClipboardMovie_1').parent().hide();
		$('#ZeroClipboardMovie_2').parent().hide();
	},
	flashow:function(){
		$('#ZeroClipboardMovie_1').parent().show();
		$('#ZeroClipboardMovie_2').parent().show();
	},
	toggleAction2:function(clickId,divId){
		var disp=$("#"+divId).css("display"); 
		if(disp=='none'){
			$('#'+clickId).addClass('setUnfold');
			$('#'+divId).show();
			if(divId=='invite_div_fold_2')this.flashow();
			var items=$('#'+clickId).parent('div .setItems').siblings();
			if(items.length==0)var items=$('#'+clickId).parent('div .inviteBox').siblings();
			for(var i=0,n=items.length;i<n;i++){
				//debugger;
				if(items.eq(i).children('.setUnfold').length>0){
					items.eq(i).find('.setItemsInfo').hide();
					//alert(items.eq(i).find('.setItemsInfo').attr("id"));
					if(items.eq(i).find('.setItemsInfo').attr("id")!='invite_div_fold_2')this.flashow();
					else this.flashide();
					items.eq(i).children('.setFold').removeClass('setUnfold');
				}
			}
		}else{
			$('#'+clickId).removeClass('setUnfold');
			$('#'+clickId).addClass('setFold');
			$("#"+divId).hide();
			if(divId=='invite_div_fold_2')this.flashide();
		}
	},
	in_array: function(stringToSearch, arrayToSearch) {
		for(s = 0; s <arrayToSearch.length; s++) {
			thisEntry = arrayToSearch[s].toString();
			if (thisEntry == stringToSearch) {
				return true;
			}
		}
		return false;
	},
	//JS判断用户是否登录
	loginJudge: function(){
		if($.cookie('__busa') == null){
			return false;
		}else{
			return $.cookie('__busa');
		}
	},
	//判断用户是否登录，如果未登录则弹出登录提示框
	homeLogin: function(){
		if($.bf.common.loginJudge() == false){
			//todo打开登录框
			//snda.uclib.component.login.showLoginFrame();
			return false;
		}
	},
	
	//获取用户id
    getLoginedUserid: function() {
        return $.bf.common.getCookie('__busa');
    },
	//判断登录
	checkLogin : function(){
		//未登录
		if(!$.cookie('__busa')){
			//todo打开登录框
			//snda.uclib.component.login.showLoginFrame();
			return false;
		}
		return true;
	},
	/*
		@name	获取传入的checkbox name 选中的所有值
		@param	cb_name	checkbox name
		@return array  第一个值是返回个数 第二个是值的数组
	*/
	getAllCheckBox : function (cb_name)
	{
		if(!cb_name)
		{
			return;
		}
		var ret=[];
		var cb_list=[];
		//选中的个数
		var cb_count=$("input[name='"+cb_name+"']:checked").length;
		ret[0]=cb_count;
		$("input[name='"+cb_name+"']:checked").each(
			function(i)
			{
				//选中的值
				cb_list[i]=$(this).val();
			}
		);
		ret[1]=cb_list;
		return ret;
	},
	/**
	* 将多维数组转成一维数组
	* @param arr 数组
	*/
	toSingleArray : function(arr)
	{
		if($.isArray(arr))
		{
			return arr.toString().split(',');
		}

		return [arr];
	},
	
	/**
	* Twitter跨域管理器，主要用于跨域上传
	*/
	TwitterCrossManager : {
		_handlers : [],
		register  : function(twitterObj)
		{
			this._handlers.push(twitterObj);
		},
		dispatch  : function(data)
		{
			if(!data)
			{
				return false;
			}

			if(String === data.constructor)
			{
				data = new Function("return " + data + ";")();
			}
			
			$.each(this._handlers, function(index, twitter){
				if(!twitter.uploadFinished)
				{
					twitter.onImageData && twitter.onImageData(data);
				}
			}.bind(this));
		}
	},
	setUserPanelNick : function(nick)
	{
		$("[attr='user_panel_nick']").text(nick || '');
	},
	fixMinHeight:function(o,height){
		if($(o).length==0){
			return;
		}
		var _min = height;
		$(o).height(function(){
			var tmp = $(this).height();
			if(tmp>=_min){
				return;
			}
			$(this).height(tmp<_min?_min:"auto");
		});
	},
	fixMinWidth:function(o,width){
		if($(o).length==0){
			return;
		}
		var _min = width;
		$(o).width(function(){
			var tmp = $(this).width();
			if(tmp>=_min){
				return;
			}
			$(this).width(tmp<_min?_min:"auto");
		});
	},
	fixMaxHeight:function(o,height){
		if($(o).length==0){
			return;
		}
		var _max = height;
		$(o).height(function(){
			var tmp = $(this).height();
			if(tmp<=_max){
				return;
			}
			$(this).height(tmp>_max?_max:"auto");
		});
	},
	fixMaxWidth:function(o,width){
		if($(o).length==0){
			return;
		}
		var _max = width;
		$(o).width(function(){
			var tmp = $(this).width();
			if(tmp<=_max){
				return;
			}
			$(this).width(tmp>_max?_max:"auto");
		});
	},
	/**
	 * 自适应宽高
	 */
	autoSize:function(){
		var autoWidth=function(){
			if($(".wrap_login").length>0){
				return;
			}
			//$(".header,.container").width($(document.body).width()<=610?"610":$(document.body).width()>=800?"800":$(document.body).width());
			//$(".twitter").width($(document.body).width()<=610?390:"auto");
			//$(".starList").width($(document.body).width()>800?708:$(document.body).width()>680?590:470);
			//$.bf.common.fixMinHeight($(".rcBd_con"),800);
		};
		autoWidth();
		$(window).resize(autoWidth).scroll(function(){
			$.bf.common.autoHeight();
		});
	},
	autoHeight:function(){
		try{
			// $(".footer").offset({top:Math.max(document.documentElement.clientHeight,document.body.clientHeight)-$(".footer").height()-2});
		}catch(e){}
	},
	fixBG:function(){
		if(!document.attachEvent){return}
		setTimeout(function(){
			$(".wrap").removeClass("wrap").addClass("wrap");
		},100);
	},
	/**
	 * textarea设置坐标位置
	 * @element textarea
	 * @location 位置
	 */
	setTextPos:function(element,location){
		if($(element).length==0){return}
		element = $(element).get(0);
		if(element.setSelectionRange){
			element.focus();
			element.setSelectionRange(location,location);
		}else if(document.body.createTextRange){
			var range = document.body.createTextRange();
			range.moveToElementText(element);
			range.collapse(true);        
			range.move('character', location);
			range.select();
		}
	}
});
$(document).ready(function(){
	// $.bf.common.autoSize();
	/*setInterval(function(){
		$.bf.common.fixMaxWidth($(".imgSmall"),200);
		$.bf.common.fixMaxWidth($(".imgLarger"),480);
	},100);*/
	// $.bf.common.fixMaxWidth($(".img_pictures"),116);
	// $.bf.common.fixMaxHeight($(".img_pictures"),155);
	// setTimeout($.bf.common.autoHeight,100);
	try{
		//IE6 logo透明
		DD_belatedPNG.fix('.logo');
	}catch(e){}
	$("#feed_sub_tab a").click($.bf.common.fixBG);
	//setInterval($.bf.common.autoHeight,800);
});