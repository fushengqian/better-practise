// JavaScript Document
$.registerNameSpace("bf.app.game.index");

$.bf.app.game.index = {
	getTuita : function(tuita_id,user_id,type,total_count){
		if(!tuita_id || !user_id || !type)
		{
			return false;
		}
		var data = {"tuita_id" : tuita_id , "user_id" : user_id , "type" : type};
		$.bf.ajax.request("/game/getTuita" , data , 
			function(result)
			{
				result = result[tuita_id];
				result.total_count = total_count;
				$("#div_hot_info").css({top:"",left:""});
				
				$("#div_hot_info").setTemplateElement('tmp_hot_info').processTemplate(result);
				if(type == 1)
				{
					$("#div_hot_info").css({width:485,height:385});
					swfobject.embedSWF(result.attachment.original_url, 'hot_video_swf', "482", "385", "9.0.0", $.bf.config.STATIC_URL+"/img/expressInstall.swf",{},{wmode:"transparent",allowfullscreen:"true"});
				}
				var offset = {
					top:$(window).scrollTop()+$(window).height()/2-$("#div_hot_info").height()/2,
					left:$(window).scrollLeft()+$(window).width()/2-$("#div_hot_info").width()/2
				}
				if($("#div_hot_info img").length>0){
					$("#div_hot_info img").get(0).onload=function(){
						try{
							$(window).resize();
						}catch(e){}
					}
				}
				
				$("#div_hot_info").offset(offset);
				$("#div_hot_info").fadeIn(200);
				try{
					$(window).delay(200).resize();
				}catch(e){}
			},
			function(errno,error)
			{
				return false;
			}
		);
	}
};


$(function(){
	$("[attr='hot']").click(
		function(){
			$.bf.app.game.index._offset = $(this).offset();
			$.bf.app.game.index._index = $(this).parent().index();
			$.bf.app.game.index.getTuita($(this).attr('tuita_id'),$(this).attr('user_id'),$(this).attr('type'),$(this).attr('total_count'));
			return false;
		}
	);
	$("[attr='hot']").attr("title","单击查看");

	$("[attr='add_friends']").click(function(){
		var obj_f = $(this),
			fsdid = $(this).attr('fsdid'),
			fnick = $(this).attr('fnick');
		if(!fsdid || !fnick)
		{
			return false;
		}
		$.bf.module.friends.addFriend(fsdid,fnick,function(){
			obj_f.parent('p').html('已关注');
		});
	});
	var center = function(){
				var offset = {
					top:$(window).scrollTop()+$(window).height()/2-$("#div_hot_info").height()/2,
					left:$(window).scrollLeft()+$(window).width()/2-$("#div_hot_info").width()/2
				}
				$("#div_hot_info").offset(offset);
	};
	$(window).resize(center);//.scroll(center);
	$(document).click(function(event){
		$("#div_hot_info").fadeOut(100);
	});
	$("#div_hot_info").click(function(event){
		if(event.target==$("[attr='video_close']").get(0)){
			$("#div_hot_info").fadeOut(100);
		}else if(event.target.tagName&&(event.target.tagName.toLowerCase()=="a"||event.target.tagName.toLowerCase()=="img")){
			return true;
		}
		return false;
	});
$.bf.app.videoScroll = {
	timer : 0,
	offset : 0,
	start:function(){
		$(window).resize();
		//el - ul
		var el = $('#hallStart'), li = $('li', el);
		var w = 164, l = li.length, $this = this, pos = 'left', proc = 0;
		for (var i = 0; i < l; i++) {
			$(li[i]).clone().appendTo(el);
		}
		el.css('width', (w * l * 2) + 'px');
		//el.css('width',"660px");
		//$(".starList").css("width",660);
		var pause = function () {
			clearInterval($this.timer);
		};
		
		var left = function () {
			if (proc)return;
			pos = 'left';
			//proc = 1;
			if ($this.offset == l) {
				$this.offset = 0;
				el.parent().get(0).scrollLeft = 0;
			}
			$this.offset++;
			o = $this.offset * w;
			el.parent().stop(false,false).animate({
				scrollLeft : o
			}, function () {
				if ($this.offset == l) {
					$this.offset = 0;
					el.parent().get(0).scrollLeft = 0;
				}
				proc = 0;
			});
		};
		
		var right = function () {
			if (proc) return;
			pos = 'right';
			//proc = 1;
			if ($this.offset == 0) {
				$this.offset = l;
				el.parent().get(0).scrollLeft = l * w;
			}
			$this.offset--;
			o = $this.offset * w;
			el.parent().stop(false,false).animate({
				scrollLeft : o
			}, function () {
				if ($this.offset == 0) {
					$this.offset = l;
					el.parent().get(0).scrollLeft = l * w;
				}
				proc = 0;
			});
		};

		var auto = function (speed) {
			speed = speed || 3000;
			$this.timer = setInterval(function () {
				pos == 'right' ? right() : left();
			}, speed);
		};
		
		//$('li', el).hover(pause, function () { pause(); auto(); });
		$('.starNextBtn').hover(function () { /*pos = 'left'; pause(); auto(1000);*/$(this).removeClass("starNextGray")}, function () {/*pause(); auto();*/$(this).addClass("starNextGray")}).click(left);
		$('.starPreBtn').hover(function () { /*pos = 'right'; pause(); auto(1000);*/$(this).removeClass("starPreGray")}, function () { /*pause(); auto();*/$(this).addClass("starPreGray")}).click(right);
		//auto();
		//$('.starNextBtn').click();
	}
};
try{
	$.bf.app.videoScroll.start();
}catch(e){}
});
