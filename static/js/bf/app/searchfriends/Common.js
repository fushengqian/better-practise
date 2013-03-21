/**
 * 全局初始化函数
 */
;initNameSpace('snda.core');
snda.core.common = {
	// correctly handle PNG transparency in Win IE 5.5 & 6.
	correctPNG: function(){ 
		var arVersion = navigator.appVersion.split("MSIE") ;
		var version = parseFloat(arVersion[1]) ;
		if ((version >= 5.5) && (document.body.filters)) { 
		   for(var j=0; j<document.images.length; j++) {
			  var img = document.images[j] ;
			  var imgName = img.src.toUpperCase() ;
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
				 + "(src=\'" + img.src + "\', sizingMethod='scale');\"></span>" 
				 img.outerHTML = strNewHTML;
				 j = j-1 
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
	getCookie:function(cookie_name){
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
	},
	isIE6:function(){	//浏览器是否为ie6
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
		var ereg = /^[\d]{5,11}$/;
		return ereg.test(value);
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
		document.getElementById(id).onpropertychange=function(){snda.core.common.handle(id)}
	  }else{
		document.getElementById(id).addEventListener("input",function(){snda.core.common.handle(id)},false);
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
	//取文档内容实际高度   
	getScrollHeight : function()
	{   
		return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);   
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
			var tmp=snda.core.common.scrollBottom(divScroll);
			var page=$('#'+id).attr("value");
			if(tmp==true&&callback&&page&&snda.core.common.prePage!=page){
				snda.core.common.prePage=page;
				if(options&&options.params)callback(page,id,options.params);
				else callback(page,id);
			}
		});
	},
	txtEvent: function(id,content){
		$('#'+id).bind('focus',function(){snda.core.common.txtfocus(id,content);});
		$('#'+id).bind('blur',function(){snda.core.common.txtblur(id,content);});
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
	    snda.core.common.toggleEffect(clickId,divId);
		
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
			snda.core.common.toggleAction2(clickId,divId);
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
	flag:false,
	py:'',
	getPY:function(callback){
		//var py;
		if(snda.core.common.flag==false){
			snda.core.common.flag=true;
			$.getScript(snda.lib.constant.__STATIC_URL+'/js/uclib/data/pinyin.lib.js',function(){
				//py=_py;
				//alert('cc');
				//alert(_py);
				//try {
					callback(_py);
				//}catch(error){}
			});
		}else{
			try {
				callback(_py);
			}catch(error){}
		}
	},
	chineseToPY:function(data,callback){
		var pycb=function(py){
			this.py=py;
			var myarr=new Array();
			//debugger;
			for(var d=0,n=data.length;d<n;d++){
				myarr[d]=new Array();
				var temp = [""];
				var tempPY = [""];
				for (var i=0,s=data[d].length;i<s;i++) {			
					tmpstr=data[d].substr(i,1);
					var pinyin = this.py[tmpstr];
					if (!pinyin) pinyin=tmpstr;
					var parts=new Array();
					parts = pinyin.split(",");
					size=parts.length;	
					var tsize = temp.length;
					for (var j = 1; j < size; ++j) {
						for (var k = 0; k < tsize; ++k) {
							temp[j * tsize + k] = temp[k];
							tempPY[j * tsize + k] = tempPY[k];
						}
					}
					step=0;
					if(size>0)step = temp.length / size;
					for (var j = 0; j < temp.length; ++j) {
						temp[j] += parts[parseInt(j / step)];
						tempPY[j]+=parts[parseInt(j / step)][0];
					}
				}

				for(var k=0,index=0,t=temp.length;k<t;k++,index++){
					myarr[d][index]=[temp[k],tempPY[k]];
				}
			}
			//debugger;
			callback(myarr);
		};

		this.getPY(pycb);

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
	//获取用户id
    getLoginedUserid: function() {
        return snda.core.common.getCookie('__uusa');
    },
	//判断登录
	checkLogin : function(){
		//未登录
		if(!$.cookie('__uusa')){
			//打开登录框
			snda.uclib.component.login.showLoginFrame();
			return false;
		}
		
		return true;
	}
};

//糖果寻友
var intUp=0;
function openUser(){
	var inte = parseInt(Math.random()*(luantan_user.length-1)+1);
	if(intUp == inte){
		inte = parseInt(Math.random()*(luantan_user.length-1)+1);
	}
	intUp = inte;
	var user = luantan_user[inte];
	window.top.location.href = snda.lib.constant.__SITE_URL+'/home/'+user;
}