$.registerNameSpace('bf.ui');
	
	$.bf.ui.dialoguc = {
		popupDivIdId:'',
		popupIdHtml:'',
		option:{'title':'温馨提示','width':'288px'},
		alertflag:false,
		drag:'',
		//关闭弹出框
		close: function(hasFlash){
			if(hasFlash) {
				$.bf.ui.dialoguc.restoreFlash();
			}
			if($.bf.ui.dialoguc.popupDivId.indexOf('popupHtmlDiv')>=0) {
				$.hideJmodal.call(null, function(){
					$('#'+$.bf.ui.dialoguc.popupDivId).remove();
				});
			}else {
				$.hideJmodal.call(null, function(){
					$('#'+$.bf.ui.dialoguc.popupDivId).remove();
				});
				$($.bf.ui.dialoguc.popupIdHtml).hide().appendTo($('body', $(document)));
			}
		},
		alert : function(content,option,callback){
			if(timoutFlag==false){	//防止重复弹出框
				timoutFlag=true;
				$.bf.ui.dialoguc.popupDivId='dialog_alertDiv'+new Date().getSeconds()+new Date().getMilliseconds();
				var divId=$.bf.ui.dialoguc.popupDivId;
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
				arr.push('<div class="popupTitle"><a class="r" href="javascript:void(0)" onclick="$.bf.ui.dialoguc.close();" tag="close"><span class="iconClose"></span></a>'+title+'</div>');
				arr.push('<div class="popupMain">');
				arr.push('<p class="words">'+content+'</p>');
				arr.push('</div></div></div></div>');
				arr.push('<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div></div>');
				
				$.bf.ui.dialoguc.hideFlash();
				
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
				$.bf.ui.dialoguc.close();
			}
			$.bf.ui.dialoguc.popupDivId='popupHtmlDiv'+new Date().getSeconds()+new Date().getMilliseconds();
			var divId = $.bf.ui.dialoguc.popupDivId,
				closeDiv = "$.bf.ui.dialoguc.close();",
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
			
			$.bf.ui.dialoguc.hideFlash();
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
				closeDiv = "$.bf.ui.dialoguc.close();",
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
				$.bf.ui.dialoguc.close();
			}
			$.bf.ui.dialoguc.popupDivId='popupHtmlDiv'+new Date().getSeconds()+new Date().getMilliseconds();
			var divId = $.bf.ui.dialoguc.popupDivId,
				closeDiv = "$.bf.ui.dialoguc.close()",
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

			$.bf.ui.dialoguc.hideFlash();
			$.jmodal({id:divId, content:arr.join(''), initWidth:width});
			
			arr = null;
		},
		popupId : function(divId, option){
			if(timoutFlag==true){
				timoutFlag=false;
				window.clearTimeout(timeoutVal);
				$.bf.ui.dialoguc.close();
			}
			
			var top = 0;
			if(option) {
				top = (typeof(option.top)=='undefined'||option.top=='') ? 0 : option.top;
			}
			
			$.bf.ui.dialoguc.popupDivId=divId;
			var content='<div id="'+divId+'">'+$('#'+divId).html()+'</div>';
			$.bf.ui.dialoguc.popupIdHtml=content;
			$('#'+divId).remove();
			$.bf.ui.dialoguc.hideFlash();
			$.jmodal({id:divId,content:content, initWidth:400, divTop:top});
		},
		//弹出遮罩层,内容层居中
		popupHtml : function(content, noOverlay, option){
			if(timoutFlag==true){
				timoutFlag=false;
				window.clearTimeout(timeoutVal);
				$.bf.ui.dialoguc.close();
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
			$.bf.ui.dialoguc.popupDivId = 'popupHtmlDiv'+new Date().getSeconds()+new Date().getMilliseconds();
			var divId=$.bf.ui.dialoguc.popupDivId;
			content='<div id="'+divId+'">'+content+'</div>';
			$.bf.ui.dialoguc.hideFlash();
			
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
				if($.bf.ui.dialoguc.animateTimeout) {
					window.clearTimeout($.bf.ui.dialoguc.animateTimeout);
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
				if($.bf.ui.dialoguc.drag){
					var initHeight=$('#'+id+' .popup').height();
					if(!initHeight)initHeight=$('#'+id).height();
					var height=!initHeight ? 150 : initHeight;
					var clientWidth = (document.body.clientWidth<document.documentElement.clientWidth)?document.body.clientWidth:document.documentElement.clientWidth;
					var clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
					$.bf.ui.dialoguc.drag.mxTop=f_top;
					$.bf.ui.dialoguc.drag.mxBottom=parseInt(clientHeight)-parseInt(height)+parseInt(f_top);
				}
			});
		},
		/*------------------------------- 提示框 ----------------------------------------- */
		tipTimeOut:'',
		tipContainerId : "cssrain", //提示容器的id
		alertTip : function(content, option, callback){
			window.clearTimeout($.bf.ui.dialoguc.tipTimeOut);
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
				tpl[tpl.length] = '<div class="popGreenClose"><a href="javascript:;" onclick="$.bf.ui.dialoguc.tipHide();" class="r iconCloseGreen"></a></div>';
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
			$.bf.ui.dialoguc.tipTimeOut = window.setTimeout(function(){
				$.bf.ui.dialoguc.tipHide();
				if(callback) {
					callback();
				}
			}, 2000); //自动关闭时间
			
			$(tipContainer).hover(
				function(){
					window.clearTimeout($.bf.ui.dialoguc.tipTimeOut);
				},
				function(){
					$.bf.ui.dialoguc.tipHide();
					if(callback) {
						callback();
					}
				}
			);
		},
		//显示
		tipShow : function(){
			var tipContainer = $('#'+$.bf.ui.dialoguc.tipContainerId),
			scrollTop = $.browser.msie ? snda.core.common.getScrollTop() : 0;
			
			tipContainer.stop();
			tipContainer.show();
			tipContainer.animate({top: '+'+scrollTop+"px"}, 900);
		},
		//隐藏
		tipHide : function(){
			window.clearTimeout($.bf.ui.dialoguc.tipTimeOut);
			var tipContainer = '#'+$.bf.ui.dialoguc.tipContainerId,
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
			$.bf.ui.dialoguc.hideFlash();
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
				$.bf.ui.dialoguc.resize(id,initWidth,marginTop,true);
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