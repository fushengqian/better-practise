    var se,m=0,h=0,s=0,ss=0;  
    function second(){  
	    if((ss%120)==0){
	    	s+=1;ss=1;
	    }  
	    if(s>0 && (s%60)==0){
	    	m+=1;s=00;
	    }  
	    if(m>0 && (m%60)==0){
	    	h+=1;m=00;
	    }  
	    t=h+":"+m+":"+s+"";  
		$("#show_time").html(t);
	    ss+=1;  
    }  
    function startclock(){se=setInterval("second()",1);}  
    function pauseclock(){clearInterval(se);}  
    function stopclock(){clearInterval(se);ss=1;m=h=s=0;}
    
//窗口最大化
window.moveTo(0,0);
if (document.all) {
       top.window.resizeTo(screen.availWidth,screen.availHeight);
}else if (document.layers||document.getElementById) {
       if (top.window.outerHeight<screen.availHeight||top.window.outerWidth<screen.availWidth){
               top.window.outerHeight = screen.availHeight;
               top.window.outerWidth = screen.availWidth;
      }
}

//进入做题页面
$.registerNameSpace("bf.app.exam.index");

//直接走下一题，不答本题
$.bf.app.exam.index.goNextDirect = function(pre_question_id, result, user_answer) {
	 var course_id = $("#course_id").val();
	 var part = $("#part").val();
	 var chapter_id = $("#chapter_id").val();
	 var section = $("#section").val();
	 var order = $("#order").val();
	 var question_id = $("#question_id").val();
	 
	 //题型过滤
     var type = $('input[name="question_type"]:checked').val();
     
	 //$("#question_content_pre").html($("#question_content_next").html());
	 
	 //是否登录
	 var username = getCookie("51score_account");
	 if (parseInt(order) >= 2 && username.length < 6) {
		 var GB_ANIMATION = true;
		 //打开复层
		 var refer = encodeURI(window.location.href+'&order='+order);
		 GB_showCenter(this.title, '/login/index?refer='+refer, 360, 470);
		 return;
	 }
	 
	 
	 //动画
	 var t = rtween(0,0,0.1);
	 var t = rtween($('#question_left').offset().left+'px','-100px', 1, 'linear'); 
     t.run = function(ps) 
     { 
         $('#question_left').css('left',ps); 
     } 
     t.complete = function()
     { 
         /*rtween($('#main_question_next').css('left'),'10px', 1, 'linear').run = function(ps) 
         { 
             $('#main_question_next').css('left',ps); 
         }*/
     } 
	 
	 //var load_html = '<br/><div style="text-align:center;"><img src="/static/images/common/loading.gif" /></div><br/>';
	 //$("#question_content_next").html(load_html);
	 $.ajax({
	        url:'/practice/getQuestion',
	        dataType:"json",
	        data:{"course_id": course_id, "question_id":question_id,'result':result, 'user_answer':user_answer,'part':part, 'chapter_id':chapter_id, 'section':section, "order":  (parseInt(order) + parseInt(1)),"type":type, "t": new Date()},
	        contentType: "application/json; charset=utf-8",
	        global:false,
            async: true,
	        success:function(data) {
	            if (data.result.code == 200) {
	            	/*$("#order").val(parseInt(order) + parseInt(1));
	            	$("#process").html(parseInt(order) + parseInt(1));
	            	$("#question_id").val(data.result.question_id);
	            	$("#sys_answer").val(data.result.answer);
	            	$("#question_content_next").html(data.result.content);
	            	$("#analysis_content_pre").html($("#analysis_content_next").html());
	            	$("#analysis_content_next").html(data.result.analysis);
	            	$("#answer_tip_"+question_id).css("display", "inline");*/
	            } else {
	            	$.bf.module.Tooltip.show(data.result.msg, $.bf.ui.Tooltip.icons.ERROR);
	            	$("#question_content_next").html('');
	            }
	        }
	    });
}

//点击下一题
$.bf.app.exam.index.nextQuestion = function() {
	
	var course_id = $("#course_id").val();
	
	//测试ID
	var chapter_id = $("#chapter_id").val();
	
	//题目序号
	var order = $("#order").val();
	
	var question_id = $("#question_id").val();
	
	var sys_answer = $("#sys_answer").val();
	
	 var pre_question_id = $("#question_id").val();
	
	//用户的回答
	var answer = '';
	
	//回答是否正确
	var result = '';
	
	//获取选中的题目
	var option_name = 'answer_option_'+question_id;
	
    $("input[name="+option_name+"]").each(function(){
        if (this.checked == true) {
        	answer = answer+this.value;
        }
    });
    
    if (answer.length > 0) {
    	//匹配答案
        if(sys_answer == answer) {
	         result = 1;
	    } else {
	         result = 2;
	    }
	    
		//判断回答是否正确
		if (result == 1) {				
				//获取下一题
				$.bf.app.exam.index.goNextDirect(pre_question_id, 1, answer);
			    //显示打钩
		        $("#main_question_pre").css('background-image','url(/static/images/exam/correct.png)');
		        $("#main_question_pre").css('background-repeat', 'no-repeat');
		        $("#main_question_pre").css('background-position', 'right');
				$("#go_next").val('2');
		} else if(result == 2) {
			    $.bf.app.exam.index.goNextDirect(pre_question_id, 2, answer);
		        $("#main_question_pre").css('background-image','url(/static/images/exam/wrong.png)');
		        $("#main_question_pre").css('background-repeat', 'no-repeat');
		        $("#main_question_pre").css('background-position', 'right');
	    }
	    
    } else {
    	//隐藏对错符号
        $("#main_question_pre").css('background-image','none');
    	//不作答，直接走下一题
    	$.bf.app.exam.index.goNextDirect(pre_question_id, 3, '');
    }
};

//获取cookie值
function getCookie(c_name) {
	if(document.cookie.length>0){
	   c_start=document.cookie.indexOf(c_name + "=")
	   if(c_start!=-1){
	     c_start=c_start + c_name.length+1
	     c_end=document.cookie.indexOf(";",c_start)
	     if(c_end==-1) c_end=document.cookie.length
	     return unescape(document.cookie.substring(c_start,c_end))
	   }
	}
	return ""
}


$(function(){
	//初始化窗口大小
	var height = (500 * $(window).height())/696;
	var width = (700 * $(window).width())/1440;
	$(".bd").css('height', height+'px');
	$(".exam-opt").css('width', width+'px');
	
	//打开章节的窗口
	var reg = new RegExp("(^|&)select_chapter=([^&]*)(&|$)", "i");    
	var r = window.location.search.substr(1).match(reg);    
	if (r != null) {
		var select_chapter = unescape(r[2]);
		if (select_chapter == 1)
		{
			var GB_ANIMATION = true; 
			var t = this.title || $(this).text() || this.href;
			
			//课程名称
			var course_name = $("#course_name").val();
			//打开复层
			GB_showCenter(t, '/practice/change?course_id='+$("#course_id").val());
		}
	}

	//开始计时
	startclock();
	
	 //绑定点击下一题
	$('#nextQuestion').live('click', function() {
		 $.bf.app.exam.index.nextQuestion();
	});
	
	//绑定关闭按钮
	$('#getout').live('click', function(){
		var getout =  confirm( "确认要关闭窗口吗？ ");
        if(getout == true) {
             window.close();
        } 
	});
	
	//点击暂停
	$("#stop").toggle( 
		function () { 
			clearInterval(se);
		}, 
		function () { 
			se=setInterval("second()",1);
		} 
	);
	
	//绑定鼠标移动到选项上
	$('li').live('mouseover', function() {
		$(this).find('label').css("color","red");
	});
	$('li').live('mouseleave', function() {
		$(this).find('label').css("color","");
	});
	
	//点击选中
	$("li").live('click', function() {
		if($(this).children('label').children('input').attr('checked')) {
			if ($(this).children('label').children('input').attr('type') == 'radio') {
				 $(this).parent().find('em').removeClass('answer-selected');
				 $(this).children('label').children('em').addClass('answer-selected');
			} else {
				 $(this).children('label').children('em').addClass('answer-selected');
			}
		} else {
			     $(this).children('label').children('em').removeClass('answer-selected');
	    }
	});	
});