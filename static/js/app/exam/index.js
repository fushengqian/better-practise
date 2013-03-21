//进入做题页面
$.registerNameSpace("bf.app.exam.index");

//直接走下一题，不答本题
$.bf.app.exam.index.goNextDirect = function() {
	 var test_id = $("#test_id").val();
	 var order_num = $("#order_num").val();
	 $.ajax({
	        type:'post',
	        url:'/practice/getQuestion',
	        async:false,
	        dataType:"json",
	        data:{"test_id": test_id, "order_num":  (parseInt(order_num) + parseInt(1))},
	        success:function(data) {
	            if (data.data.code == 200) {
	            	//将序号置为当前
	            	$("#order_num").val(data.data.order_num);
	            	$("#question_id").val(data.data.id);
	            	
	            	$("#question_content_pre").html($("#question_content_next").html());
	            	$("#question_content_next").html(data.data.content);
	            	
	            } else {
	            	$.bf.module.Tooltip.show(data.data.msg, $.bf.ui.Tooltip.icons.ERROR);
	            }
	        }
	    });
	    
	    //清空解析区域
	    $("#analysis_content").html('');
}

//点击下一题
$.bf.app.exam.index.nextQuestion = function() {
	
	//题目ID
	var question_id = $("#question_id").val();
	
	//测试ID
	var test_id = $("#test_id").val();
	
	//题目序号
	var order_num = $("#order_num").val();
	
	//用户的回答
	var answer = '';
	
	//回答是否正确
	var result = '';
	
	//获取选中的题目
	var option_name = 'answer_option_'+order_num;
    $("input[name="+option_name+"]").each(function(){
        if (this.checked == true) {
        	answer = answer+this.value;
        }
    });
    
    if (answer.length > 0) {
    	//读取数据库，匹配答案
	    $.ajax({
	        type:'post',
	        url:'/practice/answer',
	        async:false,
	        dataType:"json",
	        data:{"answer": answer, "question_id": question_id},
	        success:function(data) {
	            if (data.data.code == 200) {
	            	result = 1;
	            	is_right = 1;
	            } else if(data.data.code == 201) {
	            	result = 2;
	            	is_right = 2;
	            } else {
	            	result = 3;
	            	is_right = 2;
	            }
	        }
	    });
		//判断回答是否正确
		if (result == 1) {				
				//获取下一题
				$.bf.app.exam.index.goNextDirect();
				
			    //显示打钩
			    $('#answer_wrong').css('display','none');
				$('#answer_correct').css('display','block');
				
				$("#go_next").val('2');
		} else if(result == 2) {
			   $.bf.app.exam.index.goNextDirect();
			   $.bf.app.exam.index.showAnlysis(question_id);
			   
			   //做错，保存记录
			   //$.bf.app.exam.index.saveExam(question_id, is_right, 0);
	    }
	    
    } else {
    	//隐藏对错符号
	    $('#answer_wrong').css('display','none');
		$('#answer_correct').css('display','none');
		
    	//不作答，直接走下一题
    	$.bf.app.exam.index.goNextDirect();
    }
};

//保存做题结果
$.bf.app.exam.index.saveExam = function(question_id, is_right, is_mark) {
	if (question_id.length < 0 || is_right.length < 0) {
		return false;
	}
	$.ajax({
	    type:'post',
	    url:'/practice/saveExamResult',
	    async:false,
	    dataType:"json",
	    data:{"question_id": question_id, "is_right":is_right, "is_mark":is_mark},
	    success:function(data) {
	        //empty
	    }
	});
}

//显示解析
$.bf.app.exam.index.showAnlysis = function(question_id) {
	$.ajax({
        type:'post',
        url:'/practice/getAnalysis',
        async:false,
        dataType:"json",
        data:{"question_id": question_id},
        success:function(data) {
            if (data.data.code == 200) {
            	$("#analysis_content").html(data.data.content);
            	
				//显示岔号
 			   $('#answer_correct').css('display','none');
 			   $('#answer_wrong').css('display','block');
            } else {
            	$("#analysis_content").html('抱歉，暂无解析。');
            }
        }
    });
}

$(function(){
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
	
	//绑定标注按钮
	$('#make_mark').live('click', function() {
		var question_id = $("#question_id").val();
		$("#mark_"+question_id).attr('class', 'icon-flag');
	});
	
	//绑定鼠标移动到选项上
	$('li').live('mouseover', function() {
		$(this).find('label').css("background-color","#E6E6FA");
	});
	$('li').live('mouseleave', function() {
		$(this).find('label').css("background-color","");
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