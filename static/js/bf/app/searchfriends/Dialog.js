/*
 * jmodal
 * version: 2.0 (05/13/2009)
 * @ jQuery v1.3.*
 *
 * Licensed under the GPL:
 *   http://gplv3.fsf.org
 *
 * Copyright 2008, 2009 Jericho [ thisnamemeansnothing[at]gmail.com ]
 *
 * modified by g.airwin[at]gmail.com @ 2009.05
*/
var timeoutVal;
var timoutFlag=false;
var Drag=null;
jQuery(function($) {
    var userAgent = navigator.userAgent.toLowerCase();
	var browserVersion = (userAgent.match( /.+?(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1];
	var isIE6 = (/msie/.test(userAgent) && !/opera/.test(userAgent) && parseInt(browserVersion) < 7);
	var doc = $(document);
    $.hideJmodal = $.fn.hideJmodal = function(callback) {
        /*if(isIE6 && $('#jquery-jmodal').css('position') == 'absolute') {
            $(window).unbind('scroll');
        }
        $(window).unbind('resize');*/
        $('#jmodal-overlay').fadeOut(200);
        var call = $.isFunction(callback) ? callback : function(){};
        if($('#jquery-jmodal').length > 0) {
            $('#jquery-jmodal').fadeOut(200, call);
        } else {
            call();
        }
    };
	
	var Class = {
		create: function() {
			return function() { this.initialize.apply(this, arguments); }
		}
	};

	var Id = function (id) {
		return "string" == typeof id ? document.getElementById(id) : id;
	};

	//拖放程序
	Drag = Class.create();
	Drag.prototype = {
		
		isIE : (document.all) ? true : false,

		Extend : function(destination, source) {
			for (var property in source) {
				destination[property] = source[property];
			}
		},

		Bind : function(object, fun) {
			return function() {
				return fun.apply(object, arguments);
			}
		},

		BindAsEventListener : function(object, fun) {
			return function(event) {
				return fun.call(object, (event || window.event));
			}
		},

		CurrentStyle : function(element){
			return element.currentStyle || document.defaultView.getComputedStyle(element, null);
		},

		addEventHandler : function (oTarget, sEventType, fnHandler) {
			if (oTarget.addEventListener) {
				oTarget.addEventListener(sEventType, fnHandler, false);
			} else if (oTarget.attachEvent) {
				oTarget.attachEvent("on" + sEventType, fnHandler);
			} else {
				oTarget["on" + sEventType] = fnHandler;
			}
		},

		removeEventHandler : function (oTarget, sEventType, fnHandler) {
			if (oTarget.removeEventListener) {
				oTarget.removeEventListener(sEventType, fnHandler, false);
			} else if (oTarget.detachEvent) {
				oTarget.detachEvent("on" + sEventType, fnHandler);
			} else { 
				oTarget["on" + sEventType] = null;
			}
		},

	  //拖放对象
	  initialize: function(drag, options) {
		this.Drag = Id(drag);//拖放对象
		this._x = this._y = 0;//记录鼠标相对拖放对象的位置
		this._marginLeft = this._marginTop = 0;//记录margin
		//事件对象(用于绑定移除事件)
		this._fM = this.BindAsEventListener(this, this.Move);
		this._fS = this.Bind(this, this.Stop);
		
		this.SetOptions(options);
		
		this.Limit = !!this.options.Limit;
		this.mxLeft = parseInt(this.options.mxLeft);
		this.mxRight = parseInt(this.options.mxRight);
		this.mxTop = parseInt(this.options.mxTop);
		this.mxBottom = parseInt(this.options.mxBottom);
		this.LockX = !!this.options.LockX;
		this.LockY = !!this.options.LockY;
		this.Lock = !!this.options.Lock;
		
		this.onStart = this.options.onStart;
		this.onMove = this.options.onMove;
		this.onStop = this.options.onStop;
		this._Handle = Id(this.options.Handle) || this.Drag;
		this._mxContainer = Id(this.options.mxContainer) || null;
		
		this.Drag.style.position = "fixed";
		//透明
		if(this.isIE && !!this.options.Transparent){
			//填充拖放对象
			with(this._Handle.appendChild(document.createElement("div")).style){
				width = height = "100%"; backgroundColor = "#fff"; filter = "alpha(opacity:0)"; fontSize = 0;
			}
		}
		//debugger;
		//修正范围
		this.Repair();
		this.addEventHandler(this._Handle, "mousedown", this.BindAsEventListener(this, this.Start));
	  },
	  //设置默认属性
	  SetOptions: function(options) {
		this.options = {//默认值
			Handle:			"",//设置触发对象（不设置则使用拖放对象）
			Limit:			false,//是否设置范围限制(为true时下面参数有用,可以是负数)
			mxLeft:			0,//左边限制
			mxRight:		9999,//右边限制
			mxTop:			0,//上边限制
			mxBottom:		9999,//下边限制
			mxContainer:	"",//指定限制在容器内
			LockX:			false,//是否锁定水平方向拖放
			LockY:			false,//是否锁定垂直方向拖放
			Lock:			false,//是否锁定
			Transparent:	false,//是否透明
			onStart:		function(){},//开始移动时执行
			onMove:			function(){},//移动时执行
			onStop:			function(){}//结束移动时执行
		};
		this.Extend(this.options, options || {});
	  },
	  //准备拖动
	  Start: function(oEvent) {
		if(this.Lock){ return; }
		this.Repair();
		//记录鼠标相对拖放对象的位置
		this._x = oEvent.clientX - this.Drag.offsetLeft;
		this._y = oEvent.clientY - this.Drag.offsetTop;
		//记录margin
		this._marginLeft = parseInt(this.CurrentStyle(this.Drag).marginLeft) || 0;
		this._marginTop = parseInt(this.CurrentStyle(this.Drag).marginTop) || 0;
		//mousemove时移动 mouseup时停止
		this.addEventHandler(document, "mousemove", this._fM);
		this.addEventHandler(document, "mouseup", this._fS);
		if(this.isIE){
			//焦点丢失
			this.addEventHandler(this._Handle, "losecapture", this._fS);
			//设置鼠标捕获
			this._Handle.setCapture();
		}else{
			//焦点丢失
			this.addEventHandler(window, "blur", this._fS);
			//阻止默认动作
			oEvent.preventDefault();
		};
		//附加程序
		this.onStart();
	  },
	  //修正范围
	  Repair: function() {
		if(this.Limit){
			//修正错误范围参数
			this.mxRight = Math.max(this.mxRight, this.mxLeft + this.Drag.offsetWidth);
			this.mxBottom = Math.max(this.mxBottom, this.mxTop + this.Drag.offsetHeight);
			//如果有容器必须设置position为relative或absolute来相对或绝对定位，并在获取offset之前设置
			!this._mxContainer || this.CurrentStyle(this._mxContainer).position == "relative" || this.CurrentStyle(this._mxContainer).position == "absolute" || (this._mxContainer.style.position = "relative");
		}
	  },
	  //拖动
	  Move: function(oEvent) {
		//判断是否锁定
		if(this.Lock){ this.Stop(); return; };
		//清除选择
		window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
		//设置移动参数
		var iLeft = oEvent.clientX - this._x, iTop = oEvent.clientY - this._y;
		//设置范围限制
		if(this.Limit){
			//设置范围参数
			var mxLeft = this.mxLeft, mxRight = this.mxRight, mxTop = this.mxTop, mxBottom = this.mxBottom;
			//如果设置了容器，再修正范围参数
			if(!!this._mxContainer){
				mxLeft = Math.max(mxLeft, 0);
				mxTop = Math.max(mxTop, 0);
				mxRight = Math.min(mxRight, this._mxContainer.clientWidth);
				mxBottom = Math.min(mxBottom, this._mxContainer.clientHeight);
			};
			//修正移动参数
			iLeft = Math.max(Math.min(iLeft, mxRight - this.Drag.offsetWidth), mxLeft);
			iTop = Math.max(Math.min(iTop, mxBottom - this.Drag.offsetHeight), mxTop);
			
		}
		//alert(iLeft);
		//设置位置，并修正margin
		if(!this.LockX){ this.Drag.style.left = iLeft - this._marginLeft + "px"; }
		if(!this.LockY){ this.Drag.style.top = iTop - this._marginTop + "px"; }
		//alert('left:'+this.Drag.style.left+',top:'+this.Drag.style.top);
		//附加程序
		this.onMove();
	  },
	  //停止拖动
	  Stop: function() {
		//移除事件
		this.removeEventHandler(document, "mousemove", this._fM);
		this.removeEventHandler(document, "mouseup", this._fS);
		if(this.isIE){
			this.removeEventHandler(this._Handle, "losecapture", this._fS);
			this._Handle.releaseCapture();
		}else{
			this.removeEventHandler(window, "blur", this._fS);
		};
		//附加程序
		this.onStop();
	  }
	};

    $.jmodal = $.fn.jmodal = function(setting) {
        setting = setting || {};
        var ps = $.extend({
            data: {},
            center: false,
            drag: false,
            marginTop: 150,
            okEvent: function(data,args){args.complete();},
            initWidth: 360,//宽
            fixed: true,
			divTop:0,		//层指定top
			//fixDiv:false,	//固定层在指定位置
            title: '\u63d0\u793a\u4fe1\u606f',
            zIndex: 11000,
            content: (!setting.content) ? $('#'+setting.id).html() : setting.content,
            autoClose: 0,
			docWidth:0,
			docHeight:0,
            noOverlay: false,
            onlyOverlay: false,
            afterSetup: function(){},
            afterClose: function(){}
        }, setting);
        var overLayConfig = $.extend({opacity: 0.5,backgroundColor: '#888',zIndex: ps.zIndex - 1}, setting.overlay||{});
        var buttonText = $.extend({ok: '', cancel: ''}, setting.buttonText||{});

        //private functions
        var resizeJmode = function(e) {
			var scrollTop=snda.core.common.getScrollTop();
            $('#jquery-jmodal').css({
                left: ($(document).width() - ps.initWidth) / 2,
                top: parseInt(ps.marginTop) + parseInt(scrollTop)
            });
            $('#jmodal-overlay').css({height: $(document).height()});
        };

        var showOverlay = function() {
        	if($('#jmodal-overlay').length == 0) {
        		$('<div id="jmodal-overlay" class="jmodal-overlay"/>').appendTo($('body', doc));
        	}
        	var overlayCss = {};
        	if(isIE6) {
        		if($('#jModalIframeHideIe').length == 0) {
        			$('<iframe id="jModalIframeHideIe" style="position:absolute;top:0;left:0;width:100%;height:100%;filter:alpha(opacity=0);"></iframe>')
        			.appendTo($('#jmodal-overlay'));
        		}
        		overlayCss = {
        			position: 'absolute',
        			width: Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth),
        			height: doc.height()
        		};
        	}

        	$('#jmodal-overlay').css($.extend({
        		display: 'block',
        		left: 0,
        		top: 0,
        		width: '100%',
        		height: '100%',
        		position: 'fixed'
        	}, overLayConfig, overlayCss)).fadeTo(250, overLayConfig.opacity||0.5);
        };

        $('#jquery-jmodal').remove();
        $('#jmodal-overlay').stop();

        ps.docWidth = doc.width();
        ps.docHeight = doc.height();

        if(ps.autoClose > 0) {
			timeoutVal=window.setTimeout(function(){$.hideJmodal.call(null,function(){$('#'+setting.id).remove();timoutFlag=false;})}, ps.autoClose*3000);
        }
        if(!ps.noOverlay) {
        	showOverlay();
        } else {
        	$('#jmodal-overlay').hide();
        }
        if(ps.onlyOverlay == true) return;

        if ($('#jquery-jmodal').length == 0) {
            $('<div class="jmodal-main" id="jquery-jmodal">' +
                    '<table cellpadding="0" cellspacing="0" height="auto">' +
                        '<tr>' +
                            '<td class="jmodal-top-left jmodal-png-fiexed"></td>' +
                            '<td class="jmodal-border-top jmodal-png-fiexed"></td>' +
                            '<td class="jmodal-top-right jmodal-png-fiexed"></td>' +
                        '</tr>' +
                   '<tr>' +
                        '<td class="jmodal-border-left jmodal-png-fiexed"></td>' +
                        '<td valign="top" height="auto">' +
                           '<div class="jmodal-title" id="jmodal-title"></div><div id="tc_close"></div>' +
							//'<div class="popupTitle" id="jmodal-title"><a class="r" href="javascript:void(0)"><span class="iconClose" id="jmodal-button-close"></span></a>'+ps.title+'</div>'+
							//'<div class="popupTitle"><a class="r" href="javascript:void(0)"><span class="iconClose" id="jmodal-button-close"></span></a>'+ps.title+'</div>'+
                           '<div class="jmodal-content" id="jmodal-container-content"></div>' +
                           '<div class="jmodal-bottom">' +
                               '<input type="button" id="jmodal-button-ok" class="tc_bt1"/><input type="button" id="jmodal-button-cancel" class="tc_bt2"/>' +
                          '</div><div style="font: 0px/0px sans-serif;clear: both;display: block"> </div>' +
                        '</td>' +
                        '<td class="jmodal-border-right jmodal-png-fiexed"></td>' +
                   ' </tr>' +
                   '<tr>' +
                       '<td class="jmodal-bottom-left jmodal-png-fiexed"></td>' +
                       '<td class="jmodal-border-bottom jmodal-png-fiexed"></td>' +
                       '<td class="jmodal-bottom-right jmodal-png-fiexed"></td>' +
                   '</tr>' +
                  '</table>' +
               ' </div>').hide().appendTo($('body', doc));
        }
        var jmodal = $('#jquery-jmodal');

        // events
        if(ps.autoClose > 0) {
        	$('#jmodal-button-ok,#jmodal-button-cancel').hide();
        } else {
            $('#jmodal-button-ok,#jmodal-button-cancel').css('cursor', 'pointer');
        	$('#jmodal-button-close').one('click', $.hideJmodal).show();
        	if(buttonText.ok && buttonText.ok.length > 0) {
                $('#jmodal-button-ok')
                    .attr('value', buttonText.ok)
                    .unbind('click')
                    .bind('click', function(e) {
                        var args = {
                            complete: $.hideJmodal
                        };
                        ps.okEvent(ps.data, args);
                    }).show();
            } else {
            	$('#jmodal-button-ok').hide();
            }
            if(buttonText.cancel && buttonText.cancel.length > 0) {
                $('#jmodal-button-cancel')
                    .attr('value', buttonText.cancel)
                    .bind('click', $.hideJmodal).show();
            } else {
            	$('#jmodal-button-cancel').hide();
            }
        }
		
        if(typeof(ps.content) == "string"){
            $("#jmodal-container-content").html(ps.content);
        }else if(typeof(ps.content) == "function") {
            var e = $('#jmodal-container-content');
            e.holder = jmodal;
            ps.content(e);
        }
		
        if($.isFunction(ps.afterSetup)) {
            ps.afterSetup();
        }

        if(ps.drag && $.isFunction($.fn.easydrag) && !(ps.fixed && isIE6)) {
            jmodal.easydrag('jmodal-title');
        }
        jmodal.css({
            position: ((ps.fixed && !isIE6) ? 'fixed' : 'absolute'),
            zIndex: ps.zIndex
        }).fadeIn(200);
		var resize=function(){
			var initWidth=$('#'+ps.id+' .popup').width();
			if(!initWidth)initWidth=$('#'+ps.id).width();
			var width=!initWidth ? ps.initWidth : initWidth;
			var initHeight=$('#'+ps.id+' .popup').height();
			if(!initHeight)initHeight=$('#'+ps.id).height();
			var height=!initHeight ? ps.marginTop : initHeight;
			var clientWidth = snda.core.common.getTotalWidth();
			var clientHeight = snda.core.common.getClientHeight();
			var scrollTop=snda.core.common.getScrollTop();
			var top;
			if(ps.divTop)top=parseInt(ps.divTop);
			else top = isIE6 ? (parseInt(clientHeight) - parseInt(height)) / 2 +parseInt(scrollTop) : (parseInt(clientHeight) - parseInt(height)) / 2 ;
			//设置位置
			jmodal.css("left",(parseInt(clientWidth) - parseInt(width)) / 2);
			jmodal.css("top",top);
			jmodal.css("width",width);
			$('.iconClose').css('cursor','pointer');
			return {width:parseInt(width), height:parseInt(height), clientWidth:parseInt(clientWidth), clientHeight:parseInt(clientHeight)};
		};
		var Handle="popupTitle";

		if($('#'+Handle).length==0){
			$("."+Handle).attr("id",Handle);
		}
		var dragDiv=function(flag){
			if(ps.drag){
				if($('#'+ps.id).length==0)return false;
				$('#'+Handle).css('cursor','move');
				if($.browser.msie)$('#'+Handle).css('display','inline-block');
				var divPos=resize();
				var drag=null;
				drag=new Drag(ps.id, {Handle: Handle,Limit: true,Lock:false,mxLeft:0,mxTop:0,mxRight:parseInt(divPos.clientWidth)-parseInt(divPos.width),mxBottom:parseInt(divPos.clientHeight)-parseInt(divPos.height)
					/*onStart: function(){ document.title = "开始拖放"; },
					onMove: function(){ document.title = "left："+this.Drag.offsetLeft+"；top:"+this.Drag.offsetTop; },
					onStop: function(){ document.title = "结束拖放"; }*/
				});
			}else{
				resize();
			}
		};
		dragDiv();
		$(window).unbind("resize");
		$(window).bind("resize", function(){
			dragDiv();
		});
		if(ps.fixed && isIE6) {
			$("body").css({
				"margin":0,
				"padding":0,
				"background-attachment":"fixed"
			});
            $(window).bind("scroll",function(){
				dragDiv();
			});
        }
    };
});

function divDrag(){
var $=function(id){return document.getElementById(id)};
Array.prototype.extend=function(C){for(var B=0,A=C.length;B<A;B++){this.push(C[B]);}return this;}
                var A,B;
        var zIndex=100;
        this.dragStart=function(e){
                e=e||window.event;
                if((e.which && (e.which!=1))||(e.button && (e.button!=1)))return;
                var pos=this.$pos;
                                if(document.defaultView){
                                        _top=document.defaultView.getComputedStyle(this,null).getPropertyValue("top");
                                        _left=document.defaultView.getComputedStyle(this,null).getPropertyValue("left");}
                                else{
                                        if(this.currentStyle){_top=this.currentStyle["top"];_left=this.currentStyle["left"];}
                                }
                pos.ox=(e.pageX||(e.clientX+document.documentElement.scrollLeft))-parseInt(_left);
                pos.oy=(e.pageY||(e.clientY+document.documentElement.scrollTop))-parseInt(_top);
                                if(!!A){
                                         if(document.removeEventListener){
                        document.removeEventListener("mousemove",A,false);
                        document.removeEventListener("mouseup",B,false);
                                        }else{
                        document.detachEvent("onmousemove",A);
                        document.detachEvent("onmouseup",B);
                                                document.detachEvent("ondragstart",G);
                        }
                                }
                                A=this.dragMove.create(this);
                B=this.dragEnd.create(this);
                if(document.addEventListener){
                                        document.addEventListener("mousemove",A,false);
                    document.addEventListener("mouseup",B,false);
                }else{
                                        document.attachEvent("onmousemove",A);
                    document.attachEvent("onmouseup",B);
                                                G=function(){return false};
                                                document.attachEvent("ondragstart",G);
                }
                this.style.zIndex=(++zIndex);
                this.stop(e);
        }
        this.dragMove=function(e){
                                e=e||window.event;
                                var pos=this.$pos;
                this.style.top=(e.pageY||(e.clientY+document.documentElement.scrollTop))-parseInt(pos.oy)+'px';
                this.style.left=(e.pageX||(e.clientX+document.documentElement.scrollLeft))-parseInt(pos.ox)+'px';
                                this.stop(e);}
        this.dragEnd=function(e){
                var pos=this.$pos;              
                e=e||window.event;
                                
                                if((e.which && (e.which!=1))||(e.button && (e.button!=1)))return;
                if(document.removeEventListener){
                        document.removeEventListener("mousemove",A,false);
                        document.removeEventListener("mouseup",B,false);
                                }else{
                        document.detachEvent("onmousemove",A);
                        document.detachEvent("onmouseup",B);
                                                document.detachEvent("ondragstart",G);
                }
                A=null;
                B=null;
                this.style.zIndex=(++zIndex);
                this.stop(e);
        }
        this.position=function (e){ 
                var t=e.offsetTop;
                var l=e.offsetLeft;
                while(e=e.offsetParent){ 
                                t+=e.offsetTop; 
                                l+=e.offsetLeft; 
                }
                return {x:l,y:t,ox:0,oy:0}
        }
        this.stop=function(e){
                if(e.stopPropagation){
                        e.stopPropagation();
                }else{
                        e.cancelBubble=true;}
                        
						if(e.preventDefault){
								e.preventDefault();}
						else{e.returnValue=false;}
				}
                this.stop1=function(e){
                        e=e||window.event;
                if(e.stopPropagation){
                        e.stopPropagation();
                }else{
                        e.cancelBubble=true;}

        }
        this.create=function(bind){
                var B=this;
                var A=bind;
                return function(e){
                        return B.apply(A,[e]);
                }
        }
        this.dragStart.create=this.create;
        this.dragMove.create=this.create;
        this.dragEnd.create=this.create;
        
        this.initialize=function(){
                for(var A=0,B=arguments.length;A<B;A++){
                        var C=arguments[A];
                        C=(typeof(C)=='object')?C:(typeof(C)=='string'?$(C):null);
                        if(!C)continue;
                        C.$pos=this.position(C);
                        C.dragMove=this.dragMove;
                        C.dragEnd=this.dragEnd;
                        C.position=this.position;
                        C.stop=this.stop;
                                                var $A=[];
                                                $A=$A.extend(C.getElementsByTagName('span')||[]).extend(C.getElementsByTagName('input')||[]);
                                                for(var D=0,E=$A.length;D<E;D++){
                                                        if(C.addEventListener){
                                $A[D].addEventListener("mousedown",this.stop1,false);
                                                                $A[D].addEventListener("mousemove",this.stop1,false);
                                        }else{
                                $A[D].attachEvent("onmousedown",this.stop1);
                                                                $A[D].attachEvent("onmousemove",this.stop1);
                                }
                                                }
                        if(C.addEventListener){
                                C.addEventListener("mousedown",this.dragStart.create(C),false);
                        }else{
                                C.attachEvent("onmousedown",this.dragStart.create(C));
                        }
                }
				//debugger;

        }
        this.initialize.apply(this,arguments);
        
}

/*------------------- 提示对话框-dialog --------------------*/
(function(){

	initNameSpace('snda.uclib.component');
	
	snda.uclib.component.dialog = {
		popupDivIdId:'',
		popupIdHtml:'',
		option:{'title':'温馨提示','width':'288px'},
		alertflag:false,
		drag:'',
		//关闭弹出框
		close: function(hasFlash){
			if(hasFlash) {
				snda.uclib.component.dialog.restoreFlash();
			}
			if(snda.uclib.component.dialog.popupDivId.indexOf('popupHtmlDiv')>=0) {
				$.hideJmodal.call(null, function(){
					$('#'+snda.uclib.component.dialog.popupDivId).remove();
				});
			}else {
				$.hideJmodal.call(null, function(){
					$('#'+snda.uclib.component.dialog.popupDivId).remove();
				});
				$(snda.uclib.component.dialog.popupIdHtml).hide().appendTo($('body', $(document)));
			}
		},
		alert : function(content,option,callback){
			if(timoutFlag==false){	//防止重复弹出框
				timoutFlag=true;
				snda.uclib.component.dialog.popupDivId='dialog_alertDiv'+new Date().getSeconds()+new Date().getMilliseconds();
				var divId=snda.uclib.component.dialog.popupDivId;
				if(typeof(option)=='undefined'||option==''||option=='{}'){
					title=this.option.title;
					width=this.option.width;
				}else{
					title=(typeof(option.title)=='undefined'||option.title=='') ? this.option.title : option.title;	//弹出框标题
					width=(typeof(option.width)=='undefined'||option.width=='') ? this.option.width : option.width;	//弹出框宽度
				}
				
				var arr=[];
				arr.push('<div id="'+divId+'" style="width: '+width+';" class="popup">');
				arr.push('<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>');
				arr.push('<div class="popupBoxL">');
				arr.push('<div class="popupBoxR">');
				arr.push('<div class="popupBox">');
				arr.push('<div class="popupTitle"><a class="r" href="javascript:void(0)" onclick="snda.uclib.component.dialog.close();" tag="close"><span class="iconClose"></span></a>'+title+'</div>');
				arr.push('<div class="popupMain">');
				arr.push('<p class="words">'+content+'</p>');
				arr.push('</div></div></div></div>');
				arr.push('<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div></div>');
				
				snda.uclib.component.dialog.hideFlash();
				
				$.jmodal({id:divId, content:arr.join(''), noOverlay:true, autoClose:1, initWidth:width});
				if(callback)callback();
				
				arr = null;
			}
		},
		//有确定和取消按钮
		confirm : function(content,submit,cancel,option,params){
			if(timoutFlag==true){	//清除定时器
				timoutFlag=false;
				window.clearTimeout(timeoutVal);
				snda.uclib.component.dialog.close();
			}
			snda.uclib.component.dialog.popupDivId='popupHtmlDiv'+new Date().getSeconds()+new Date().getMilliseconds();
			var divId = snda.uclib.component.dialog.popupDivId,
				closeDiv = "snda.uclib.component.dialog.close();",
				title = '',
				width = 0;
				
			if(typeof(option)=='undefined'||option==''||option=='{}'){
				title=this.option.title;
				width=this.option.width;
			}else{
				title=(typeof(option.title)=='undefined'||option.title=='') ? this.option.title : option.title;	//弹出框标题
				width=(typeof(option.width)=='undefined'||option.width=='') ? this.option.width : option.width;	//弹出框宽度
			}

			var param = '',
				submitFun = '',
				arr = [];
				
			if(option&&option.param){
				param=option.param;
				submitFun = (typeof(submit)=='undefined'||submit=='') ? '' : submit+"('"+param+"')";
			}
			if(param=='' && params){
				for(var i in params){
					arr[arr.length] = "'" + i + "':'" + params[i]+"'";
				}
				param='{'+arr.join(',')+'}';
			}

			if (submitFun == '') {
				submitFun = (typeof(submit)=='undefined'||submit=='') ? '' : submit+"("+param+")";
			}

			var cancelFun = (typeof(cancel)=='undefined'||cancel=='') ? closeDiv  : cancel+"("+param+");"+closeDiv;
			arr = [];
			arr[arr.length] = '<div id="'+divId+'" style="width: '+width+';" class="popup">';
			arr[arr.length] = '<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>';
			arr[arr.length] = '<div class="popupBoxL">';
			arr[arr.length] = '<div class="popupBoxR">';
			arr[arr.length] = '<div class="popupBox">';
			arr[arr.length] = '<div class="popupTitle"><a class="r" href="javascript:void(0)" onclick="'+closeDiv+'" tag="close"><span class="iconClose"></span></a>'+title+'</div>';
			arr[arr.length] = '<div class="popupMain">';
			arr[arr.length] = '<p class="words">'+content+'</p>';
			arr[arr.length] = '<p align="center" class="submit">';
			arr[arr.length] = '<span class="button"><span><input type="button" value="确认" onclick="var res='+submitFun+';if(res==false)return false;else '+closeDiv+'"/></span></span>';
			arr[arr.length] = '<span class="button buttonGray"><span><input type="button" value="取消" onclick="'+cancelFun+'"></span></span>';
			arr[arr.length] = '</p></div></div></div></div>';
			arr[arr.length] = '<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div></div>';
			
			snda.uclib.component.dialog.hideFlash();
			$.jmodal({id:divId, content:arr.join(''), initWidth:width});
			
			arr = null;
		},
		//只有确定按钮
		confirm2 : function(content, submit, option, params)
		{
			var _this = snda.uclib.component.dialog;
			if(timoutFlag == true){
				timoutFlag=false;
				window.clearTimeout(timeoutVal);
				_this.close();
			}
			_this.popupDivId = 'popupHtmlDiv' + new Date().getSeconds() + new Date().getMilliseconds();
			
			var divId = _this.popupDivId,
				closeDiv = "snda.uclib.component.dialog.close();",
				title = '',
				width = 0;
				
			if(typeof(option)=='undefined'||option==''||option=='{}'){
				title = _this.option.title;
				width = _this.option.width;
			}else{
				title = (typeof(option.title)=='undefined'||option.title=='') ? _this.option.title : option.title;	//弹出框标题
				width = (typeof(option.width)=='undefined'||option.width=='') ? _this.option.width : option.width;	//弹出框宽度
			}
			
			var param = '',
				arr = [];
				
			if(option && option.param){
				param = option.param;
			}
			if(param==''&&params){
				for(var i in params){
					arr[arr.length] = "'" + i + "':'" + params[i] + "'";
				}
				param='{'+arr.join(',')+'}';
			}
			
			var submitFun = (typeof(submit)=='undefined' || submit=='') ? closeDiv : submit+"("+param+");"+closeDiv;
			arr = [];
			arr[arr.length] = '<div id="'+divId+'" style="width:'+width+';" class="popup">';
			arr[arr.length] = '<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>';
			arr[arr.length] = '<div class="popupBoxL">';
			arr[arr.length] = '<div class="popupBoxR">';
			arr[arr.length] = '<div class="popupBox">';
			arr[arr.length] = '<div class="popupTitle"><a class="r" href="javascript:void(0);" onclick="'+closeDiv+'" tag="close"><span class="iconClose"></span></a>'+title+'</div>';
			arr[arr.length] = '<div class="popupMain">';
			arr[arr.length] = '<p class="words">'+content+'</p>';
			arr[arr.length] = '<p class="submit" style="text-align:center;">';
			arr[arr.length] = '<span class="button"><span><input type="button" value="确认" onclick="'+submitFun+'"/></span></span>';
			arr[arr.length] = '</p></div></div></div></div>';
			arr[arr.length] = '<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div></div>';
		
			_this.hideFlash();
			$.jmodal({id:divId, content:arr.join(''), initWidth:width});
			
			arr = null;
		},
		propmt : function(content,submit,cancel,option,params){
			if(timoutFlag==true){
				timoutFlag=false;
				window.clearTimeout(timeoutVal);
				snda.uclib.component.dialog.close();
			}
			snda.uclib.component.dialog.popupDivId='popupHtmlDiv'+new Date().getSeconds()+new Date().getMilliseconds();
			var divId = snda.uclib.component.dialog.popupDivId,
				closeDiv = "snda.uclib.component.dialog.close()",
				title = '',
				width = 0;
				
			if(typeof(option)=='undefined'||option==''||option=='{}'){
				title=this.option.title;
				width=this.option.width;
			}else{
				title=(typeof(option.title)=='undefined'||option.title=='') ? this.option.title : option.title;	//弹出框标题
				width=(typeof(option.width)=='undefined'||option.width=='') ? this.option.width : option.width;	//弹出框宽度
			}
			var param='';
			if(option&&option.param){
				param=option.param;
			}
			if(param==''&&params){
				var arr=[];
				for(var i in params){
					arr.push("'" + i + "':'" + params[i]+"'");
				}
				str=arr.join(',');
				param='{'+str+'}';
			}

			var submitFun = (typeof(submit)=='undefined'||submit=='') ? closeDiv : submit+"("+param+");"+closeDiv;
			var cancelFun = (typeof(cancel)=='undefined'||cancel=='') ? closeDiv  : cancel+"("+param+");"+closeDiv;
			var arr=[];
			arr.push('<div id="'+divId+'" style="width: '+width+';" class="popup">');
			arr.push('<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>');
			arr.push('<div class="popupBoxL">');
			arr.push('<div class="popupBoxR">');
			arr.push('<div class="popupBox">');
			arr.push('<div class="popupTitle"><a class="r" href="javascript:void(0)" onclick="'+closeDiv+'"><span class="iconClose"></span></a>'+title+'</div>');
			arr.push('<div class="popupMain">');
			arr.push('<p class="words">'+content+'</p>');
			arr.push('<p><input type="text" class="text inputCol" /></p>');
			arr.push('<p align="center" class="submit">');
			arr.push('<span class="button"><span><input type="button" value="确认" onclick="'+submitFun+'"/></span></span>');
			arr.push('<span class="button buttonGray"><span><input type="button" value="取消" onclick="'+cancelFun+'"/></span></span>');
			arr.push('</p>');
			arr.push('</div></div></div></div>');
			arr.push('<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div></div>');

			snda.uclib.component.dialog.hideFlash();
			$.jmodal({id:divId, content:arr.join(''), initWidth:width});
			
			arr = null;
		},
		popupId : function(divId, option){
			if(timoutFlag==true){
				timoutFlag=false;
				window.clearTimeout(timeoutVal);
				snda.uclib.component.dialog.close();
			}
			
			var top = 0;
			if(option) {
				top = (typeof(option.top)=='undefined'||option.top=='') ? 0 : option.top;
			}
			
			snda.uclib.component.dialog.popupDivId=divId;
			var content='<div id="'+divId+'">'+$('#'+divId).html()+'</div>';
			snda.uclib.component.dialog.popupIdHtml=content;
			$('#'+divId).remove();
			snda.uclib.component.dialog.hideFlash();
			$.jmodal({id:divId,content:content, initWidth:400, divTop:top});
		},
		//弹出遮罩层,内容层居中
		popupHtml : function(content, noOverlay, option){
			if(timoutFlag==true){
				timoutFlag=false;
				window.clearTimeout(timeoutVal);
				snda.uclib.component.dialog.close();
			}
			
			var flag = !noOverlay ? false : true;
			var width,fixed,divDrag;
			
			if(typeof(option)=='undefined' || option=='' || option=='{}'){
				width=this.option.width;
				divDrag=false;
			}else{
				width=(typeof(option.width)=='undefined'||option.width=='') ? 550 : option.width;	//弹出框宽度
				divDrag=(typeof(option.drag)=='undefined'||option.drag=='') ? false : option.drag;	//弹出框是否拖拽
			}
			
			//弹出框高度
			var top = (!option || typeof(option.top)=='undefined' || option.top=='') ? 0 : option.top;	
			snda.uclib.component.dialog.popupDivId = 'popupHtmlDiv'+new Date().getSeconds()+new Date().getMilliseconds();
			var divId=snda.uclib.component.dialog.popupDivId;
			content='<div id="'+divId+'">'+content+'</div>';
			snda.uclib.component.dialog.hideFlash();
			
			$.jmodal({id:divId, content:content, initWidth:width, noOverlay:flag, drag:divDrag, divTop:top});
		},
		hideFlash : function() {
			var objs = document.getElementsByTagName("object");
			for (var i = 0; i < objs.length ; ++i) {
				objs[i]._width = objs[i].width;
				objs[i]._height = objs[i].height;
				objs[i].width = 1;
				objs[i].height = 1;
			}
			
			objs = document.getElementsByTagName("embed");
			for (var i = 0; i < objs.length ; ++i) {
				objs[i]._width = objs[i].width;
				objs[i]._height = objs[i].height;
				objs[i].width = 1;
				objs[i].height = 1;
			}
			objs = null;
		},
			
		restoreFlash : function() {
			var objs = document.getElementsByTagName("object"),
				n = objs.length;
			for (var i = 0; i < n ; i++) {
				if(objs[i]._width){
					objs[i].width = objs[i]._width;
				}
				if(objs[i]._height){
					objs[i].height = objs[i]._height;
				}
			}
			
			objs = document.getElementsByTagName("embed");
			n = objs.length;
			for (var j = 0; j < n ; j++) {
				if(objs[j]._width){
					objs[j].width = objs[j]._width;
				}
				if(objs[j]._height){
					objs[j].height = objs[j]._height;
				}
			}
			objs = null;
		},
		_getScroll : function(){
			var scrollTop=snda.core.common.getScrollTop();
			return {scrollTop:scrollTop};
		},
		
		scrolltop:'',
		animateTimeout:'',
		follow : function(id,initTop){
			$("body").css({
				"margin":0,
				"padding":0,
				"background-attachment":"fixed"
			});
			$('#'+id).css('position','absolute');
			
			$(window).unbind("scroll");
			$(window).bind("scroll",function(){
				var f_top = snda.core.common.getScrollTop();
				if(snda.uclib.component.dialog.animateTimeout) {
					window.clearTimeout(snda.uclib.component.dialog.animateTimeout);
				}
				$('#'+id).css('top', f_top+initTop);
				if($("#alertFrame").length>0){
					$("#alertFrame").css({
						"height":$('#'+id).height(),
						"width":$('#'+id).width(),
						"top":parseInt($('#'+id).css('top')),
						"left":parseInt($('#'+id).css('left'))
					});
				}
				if(snda.uclib.component.dialog.drag){
					var initHeight=$('#'+id+' .popup').height();
					if(!initHeight)initHeight=$('#'+id).height();
					var height=!initHeight ? 150 : initHeight;
					var clientWidth = (document.body.clientWidth<document.documentElement.clientWidth)?document.body.clientWidth:document.documentElement.clientWidth;
					var clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
					snda.uclib.component.dialog.drag.mxTop=f_top;
					snda.uclib.component.dialog.drag.mxBottom=parseInt(clientHeight)-parseInt(height)+parseInt(f_top);
				}
			});
		},
		/*------------------------------- 提示框 ----------------------------------------- */
		tipTimeOut:'',
		tipContainerId : "cssrain", //提示容器的id
		alertTip : function(content, option, callback){
			window.clearTimeout(snda.uclib.component.dialog.tipTimeOut);
			var tipContainerId = this.tipContainerId,
				tipContainer = '#'+tipContainerId,
				contentDiv = '#'+tipContainerId+' #contentDiv',
				scrollTop = snda.core.common.getScrollTop();
				
			//提示框未创建
			if($(tipContainer).length == 0) 
			{
				//创建提示框
				var tpl = [];
				tpl[tpl.length] = '<div class="popup" id="'+tipContainerId+'">';
				tpl[tpl.length] = '<iframe id="alertFrame" frameborder="0" scrolling="no" tabindex="-1" style="position:absolute;left:0;top:0;width:0;height:0;z-index:-1;opacity:0;filter:alpha(opacity=0);" src="javascript:false;"></iframe>';
				tpl[tpl.length] = '<div class="popSysT" >';
				tpl[tpl.length] = '<div class="popSysB">';
				tpl[tpl.length] = '<div class="popSys">';
				tpl[tpl.length] = '<div class="popGreenClose"><a href="javascript:;" onclick="snda.uclib.component.dialog.tipHide();" class="r iconCloseGreen"></a></div>';
				tpl[tpl.length] = '<div class="popSysText" style="padding-bottom:10px;font-weight: bold;" id="contentDiv">'+content+'</div>';
				tpl[tpl.length] = '</div></div></div></div>';
				
				$(tpl.join('')).appendTo($('body', $(document)));
				
				if($.browser.msie) {
					this.bindScroll(tipContainerId, 5);
				}
				
				tpl = null;
			}
			
			if(content != $(contentDiv).html()) {
				//更新内容
				$(contentDiv).html(content);
			}

			var width = 300,
				height = $(tipContainer).height(),
				top = $.browser.msie ? (scrollTop-height+5) : (-height+5) ,
				topNav = $("div.topNav"),
				left = topNav.offset().left + topNav.width() - width;

			$(tipContainer).css({
				'z-index' : '15000',
				'width' : width,
				'word-wrap' : 'break-word'
			});
			
			$(tipContainer).css('left', left);
			$(tipContainer).css("top", top);
			$("#alertFrame").css({
				"width" : width,
				"height" : height
			});
			
			if(!$.browser.msie) {
				$(tipContainer).css('position','fixed');
			}

			//显示
			this.tipShow(tipContainerId);
			
			//一定时间后自动关闭
			snda.uclib.component.dialog.tipTimeOut = window.setTimeout(function(){
				snda.uclib.component.dialog.tipHide();
				if(callback) {
					callback();
				}
			}, 2000); //自动关闭时间
			
			$(tipContainer).hover(
				function(){
					window.clearTimeout(snda.uclib.component.dialog.tipTimeOut);
				},
				function(){
					snda.uclib.component.dialog.tipHide();
					if(callback) {
						callback();
					}
				}
			);
		},
		//显示
		tipShow : function(){
			var tipContainer = $('#'+snda.uclib.component.dialog.tipContainerId),
			scrollTop = $.browser.msie ? snda.core.common.getScrollTop() : 0;
			
			tipContainer.stop();
			tipContainer.show();
			tipContainer.animate({top: '+'+scrollTop+"px"}, 900);
		},
		//隐藏
		tipHide : function(){
			window.clearTimeout(snda.uclib.component.dialog.tipTimeOut);
			var tipContainer = '#'+snda.uclib.component.dialog.tipContainerId,
				scrollTop = $.browser.msie ? snda.core.common.getScrollTop() : 0;
			
			$(tipContainer).stop();
			$(tipContainer).animate({top: '-'+scrollTop+"px"}, 900, function(){
				$(tipContainer).hide();
			});
		},
		//绑定滚动事件
		bindScroll : function(id,initTop){
			$("body").css({
				"margin":0,
				"padding":0,
				"background-attachment":"fixed"
			});
			$('#'+id).css('position','absolute');
			
			$(window).bind("scroll",function(){
				$('#'+id).css('top', snda.core.common.getScrollTop() + initTop);
			});
		},
		/*-------------------------弹出确定框 ---------------------------*/
		popUpConfirm : function(content,submit,cancel,option,params){
			var divId = "popUpConfirmId";
			var closeDiv = "$('#"+divId+"').remove();this.drag='';";
			
			if(typeof(option)=='undefined'||option==''||option=='{}'){
				title=this.option.title;
				width=this.option.width;
			}else{
				title=(typeof(option.title)=='undefined'||option.title=='') ? this.option.title : option.title;	//弹出框标题
				width=(typeof(option.width)=='undefined'||option.width=='') ? this.option.width : option.width;	//弹出框宽度
			}

			var param='';
			if(option&&option.param){
				param=option.param;
			}
			if(param==''&&params){
				var arr=new Array();
				for(var i in params){
					arr.push("'" + i + "':'" + params[i]+"'");
				}
				str=arr.join(',');
				param='{'+str+'}';
			}
			var submitFun = (typeof(submit)=='undefined'||submit=='') ? '' : submit+"("+param+")";
			var cancelFun = (typeof(cancel)=='undefined'||cancel=='') ? closeDiv  : cancel+"("+param+");"+closeDiv;
			if($('#'+divId).length==0) {
				$('<div id="'+divId+'"><div style="width: '+width+
				';" class="popup"><div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div><div class="popupBoxL"><div class="popupBoxR"><div class="popupBox"><div class="popupTitle" id="'+divId+
				'_popupTitle"><a class="r" href="javascript:void(0);" onclick="'+closeDiv+
				'"><span class="iconClose"></span></a>'+title+
				'</div><div class="popupMain"><p class="words">'+content+
				'</p><p align="center" class="submit"><span class="button"><span><button title="确认" type="button" onclick="var res='+submitFun+
				';if(res==false)return false;else '+closeDiv+
				'">确认</button></span></span><span class="button buttonGray"><span><button title="取消" type="button" onclick="'+cancelFun+
				'">取消</button></span></span></p></div><div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div></div></div>').hide().appendTo($('body', $(document)));
			}
			snda.uclib.component.dialog.hideFlash();
			this.modal(divId,width);
		},
		modal:function(id,initWidth){
			var marginTop=150;
			$('#'+id).css({
				position: ((!$.browser.msie) ? 'fixed' : 'absolute'),
				width: parseInt(initWidth),
				'z-index':'12000'
			});
			this.resize(id,initWidth,marginTop,true);
			$(window).bind("resize", function(){
				if($('#'+id).length==0)return false;
				snda.uclib.component.dialog.resize(id,initWidth,marginTop,true);
			});
			$('#'+id).show();
		},
		resize:function(id,iWidth,marginTop,drag){
			var initWidth=$('#'+id+' .popup').width();
			if(!initWidth)initWidth=$('#'+id).width();
			var width=!initWidth ? iWidth : initWidth;
			var initHeight=$('#'+id+' .popup').height();
			if(!initHeight)initHeight=$('#'+id).height();
			var height=!initHeight ? marginTop : initHeight;
			var clientWidth = (document.body.clientWidth<document.documentElement.clientWidth)?document.body.clientWidth:document.documentElement.clientWidth;
			var clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
			var scrollTop=snda.core.common.getScrollTop();
			var top=$.browser.msie ? (parseInt(clientHeight) - parseInt(height)) / 2 +parseInt(scrollTop) : (parseInt(clientHeight) - parseInt(height)) / 2;
			var absoluteTop=(parseInt(clientHeight) - parseInt(height)) / 2;
			$('#'+id).css("left",(parseInt(clientWidth) - parseInt(width)) / 2);
			$('#'+id).css("top",top);
			var Handle=id+"_popupTitle";
			
			if(drag){
				$('#'+Handle).css('cursor','move');
				var drag=null;
				this.drag=new Drag(id, {Handle: Handle,Limit:true,Lock:false,mxLeft:0,mxTop:scrollTop,mxRight:parseInt(clientWidth),mxBottom:parseInt(clientHeight)-parseInt(height)+parseInt(scrollTop)});
			}
			if($.browser.msie&&$.browser.version<7) {
				$('#'+Handle).css('display','inline-block');
				$('.iconClose').css('cursor','pointer');
				this.follow(id,parseInt(absoluteTop));
			}
		}
	};
})();