var $tween = Tween.strongEaseOut;
var $status = 3;
var $order = 2;
var $dont_again = 0;
var $category = '123';
var $isAdd = false;

$(function(){
		
	//禁用右键
	$(document).bind("contextmenu",function(e){  
        return false;
    });
	
	//菜单下拉
	$("#menu_btn").toggle( 
			function () {
				$("#nav_menu").css('display', 'block');
			}, 
			function () { 
				$("#nav_menu").css('display', 'none');
			} 
	);
	
	$("#nextQuestion").bind("mouseover", function(){
		$(".reshow_tip").css("display", "block");
	});
	$("#nextQuestion").bind("mouseleave", function(){
		$(".reshow_tip").css("display", "none");
	});
	
	
	//关灯、开灯
	$("#turnoff").toggle( 
			function () { 
				document.body.style.backgroundColor="#000000";	
				document.getElementById('1').style.backgroundColor="#000000";
				document.getElementById('2').style.backgroundColor="#000000";
				document.getElementById('3').style.backgroundColor="#000000";
				document.getElementById('1').style.color="#0C0";
				document.getElementById('2').style.color="#0C0";
				document.getElementById('3').style.color="#0C0";
				var headID = document.getElementsByTagName("head")[0];         
				var cssNode = document.createElement('link');
				cssNode.type = 'text/css';
				cssNode.rel = 'stylesheet';
				cssNode.href = '/static/css/exerise/lightOff.css';
				cssNode.media = 'screen';
				headID.appendChild(cssNode);
			}, 
			function () { 
				alert('开灯请选择颜色！');
			} 
	);
	
	//章节切换
	$('#changeChapter').bind('click', function(){
		 var GB_ANIMATION = true;
		 GB_showCenter(this.title, '/chapter/app?course_id='+$("#course_id").val(), 0, 550);
		 return;
	});
	
	//绑定点击下一题
	$('#nextQuestion').bind('click', function() {
		//显示上题回顾
		$("#inner_2").css("visibility", "visible");
		
		//判断登录
		var username = $.bf.common.getCookie("51score_account");
		if ($order > 3 && username == null) {
			 var GB_ANIMATION = true;
			 var refer = encodeURI(window.location.href+'&order='+$order);
			 GB_showCenter(this.title, '/login/index?refer='+refer, 360, 470);
			 return;
		}
		
		//动画滑动
		if ($status == 2){
			t1 = new Tween(document.getElementById('1').style,'left',$tween,0,-50,1,'%');
			t1.start();
			t2 = new Tween(document.getElementById('2').style,'left',$tween,50,0,1,'%');
			t2.start();
			t3 = new Tween(document.getElementById('3').style,'left',$tween,100,50,1,'%');
			t3.start();
			$status = 3 ;
		}else if ($status == 3){
			t1 = new Tween(document.getElementById('1').style,'left',$tween,100,50,1,'%');
			t1.start();
			t2 = new Tween(document.getElementById('2').style,'left',$tween,0,-50,1,'%');
			t2.start();
			t3 = new Tween(document.getElementById('3').style,'left',$tween,50,0,1,'%');
			t3.start();
			$status = 1 ;
		}else if ($status == 1){
			t1 = new Tween(document.getElementById('1').style,'left',$tween,50,0,1,'%');
			t1.start();
			t2 = new Tween(document.getElementById('2').style,'left',$tween,100,50,1,'%');
			t2.start();
			t3 = new Tween(document.getElementById('3').style,'left',$tween,0,-50,1,'%');
			t3.start();
			$status = 2 ;
		}
		
		position = document.getElementById($status);
		img_nodes = position.getElementsByTagName('img');
		img_nodes[0].style.visibility = "hidden";
		

		//如果无题了，不进行答题结果的判断
		if('noo' !== 'no') {
			if ($status == 2) {
				getQuestion('inner_3');
			} else if ($status == 3) {
				getQuestion('inner_1');
			} else if ($status == 1) {
				getQuestion('inner_2');
			}
			//判断对错
			check($dont_again);
		} else{
			//empty
		}
	});
	
	//绑定此题我已掌握
	$('#bottom_line').bind('click', function() {
		//显示上题回顾
		$("#inner_2").css("visibility", "visible");
		
		//判断登录
		var username = $.bf.common.getCookie("51score_account");
		if ($order > 3 && username == null) {
			 var GB_ANIMATION = true;
			 var refer = encodeURI(window.location.href+'&order='+$order);
			 GB_showCenter(this.title, '/login/index?refer='+refer, 360, 470);
			 return;
		}
		
		//动画滑动
		if ($status == 2){
			t1 = new Tween(document.getElementById('1').style,'left',$tween,0,-50,1,'%');
			t1.start();
			t2 = new Tween(document.getElementById('2').style,'left',$tween,50,0,1,'%');
			t2.start();
			t3 = new Tween(document.getElementById('3').style,'left',$tween,100,50,1,'%');
			t3.start();
			$status = 3 ;
		}else if ($status == 3){
			t1 = new Tween(document.getElementById('1').style,'left',$tween,100,50,1,'%');
			t1.start();
			t2 = new Tween(document.getElementById('2').style,'left',$tween,0,-50,1,'%');
			t2.start();
			t3 = new Tween(document.getElementById('3').style,'left',$tween,50,0,1,'%');
			t3.start();
			$status = 1 ;
		}else if ($status == 1){
			t1 = new Tween(document.getElementById('1').style,'left',$tween,50,0,1,'%');
			t1.start();
			t2 = new Tween(document.getElementById('2').style,'left',$tween,100,50,1,'%');
			t2.start();
			t3 = new Tween(document.getElementById('3').style,'left',$tween,0,-50,1,'%');
			t3.start();
			$status = 2 ;
		}
		
		position = document.getElementById($status);
		img_nodes = position.getElementsByTagName('img');
		img_nodes[0].style.visibility = "hidden";
		

		//如果无题了，不进行答题结果的判断
		if('noo' !== 'no') {
			if ($status == 2) {
				getQuestion('inner_3');
			} else if ($status == 3) {
				getQuestion('inner_1');
			} else if ($status == 1) {
				getQuestion('inner_2');
			}
			//判断对错
			check(true);
		} else{
			//empty
		}
	});
	
});


//获取试题
var getQuestion = function(position) {
	 var course_id = $("#course_id").val();
	 var part = $("#part").val();
	 var chapter_id = $("#chapter_id").val();
	 var section = $("#section").val();
	 var exam_id = $("#exam_id").val();
	 var target_id = $("target_id").val();
	 var question_id = ''; //上一题
	 var result = '1';
	 var user_answer = '';

	 //是否登录
	 var username = $.bf.common.getCookie("51score_account");
	 if ($order > 3 && username == null && !$.bf.common.isIE6()) {
		 return;
	 }
	 
	 //是否添加
	 if ($isAdd != true && username != null) {
		 $.ajax({
		        url:'/exercise/addCourse',
		        dataType:"json",
		        data:{"course_id": course_id, "username":username,"token":'abc', "t": new Date()},
		        contentType: "application/json; charset=utf-8",
		        global:false,
	            async: true,
		        success:function(data) {
		            if (data.code == 0) {
		            	$isAdd = true;
		            }
		        }
		 });
	 }
	 
	 $.ajax({
	        url:'/exercise/getQuestion',
	        dataType:"json",
	        data:{"course_id": course_id, "question_id":question_id,"target_id":target_id, "exam_id":exam_id, 'result':result, 'user_answer':user_answer,'part':part, 'chapter_id':chapter_id, 'section':section, "order": $order,"type":$category, "t": new Date()},
	        contentType: "application/json; charset=utf-8",
	        global:false,
            async: true,
	        success:function(data) {
	            if (data.code == 0) {
	            	$("#"+position).html(data.result.content);
	            	if (data.result.add_order == '1') {
	            		$order++;
	            	}
	            } else {
	            	if (data.code == '202') {
	            		 var GB_ANIMATION = true;
	        			 var refer = encodeURI(window.location.href+'&order='+$order);
	        			 GB_showCenter(this.title, '/login/index?refer='+refer, 360, 470);
	        			 return;
	            	} else {
	            		$.bf.module.Tooltip.show(data.msg, $.bf.ui.Tooltip.icons.ERROR);
	            	}
	            }
	        }
	 });
}

//保存做题
var saveResult = function(question_id, result, user_answer) {
	var course_id = $("#course_id").val();
	 var part = $("#part").val();
	 var chapter_id = $("#chapter_id").val();
	 var section = $("#section").val();
	 var exam_id = $("#exam_id").val();
	 var target_id = $("#target_id").val();
	 
	 //是否登录
	 var username = $.bf.common.getCookie("51score_account");
	 if (username == null) {
		 return;
	 }

	 $.ajax({
	        url:'/exercise/saveResult',
	        dataType:"json",
	        data:{"course_id": course_id, "question_id":question_id,'result':result,"target_id":target_id, "exam_id":exam_id, 'user_answer':user_answer,'part':part, 'chapter_id':chapter_id, 'section':section, "t": new Date()},
	        contentType: "application/json; charset=utf-8",
	        global:false,
            async: true,
	        success:function(data) {
	            if (data.code == 0) {
	            	//empty
	            } else {
	            	//$.bf.module.Tooltip.show(data.result.msg, $.bf.ui.Tooltip.icons.ERROR);
	            }
	        }
	 });
	
}

//单选，选择操作
var simple_select = function(item) {
	position_id = $status;
	position = document.getElementById(position_id);
	obj = position.getElementsByTagName('span');
	if (obj[item].className == 'selected'){
		obj[item].setAttribute('className', "select") || obj[item].setAttribute('class', "select");
		input_nodes = position.getElementsByTagName("input");
		input_nodes[0].value = '';
	} else {
		clear();
		obj[item].setAttribute('className', "selected") || obj[item].setAttribute('class', "selected");
		input_nodes = position.getElementsByTagName("input");
		input_nodes[0].value = String.fromCharCode(65+Number(item));
	}
}

//多选，选择操作
var multiple_select = function(item){
	position_id = $status;
	position = document.getElementById(position_id);
	obj = position.getElementsByTagName('span');
	if (obj[item].className == 'selected'){
		obj[item].setAttribute('className', "select") || obj[item].setAttribute('class', "select");
		input_nodes = position.getElementsByTagName("input");
		select_item = String.fromCharCode(65+Number(item));
		input_nodes['user_answer'].value = input_nodes['user_answer'].value.replace(select_item,'');
	} else {
		obj[item].setAttribute('className', "selected") || obj[item].setAttribute('class', "selected");
		input_nodes = position.getElementsByTagName("input");
		input_nodes[0].value = input_nodes[0].value + String.fromCharCode(65+Number(item));
	}
}

//清除选择
var clear = function(){
	position_id = $status;
	position = document.getElementById(position_id);
	message_nodes=position.getElementsByTagName("span");
	num = message_nodes.length;
	for (i=0;i<num;i++ ) {
	   message_nodes[i].setAttribute('className', "select") || message_nodes[i].setAttribute('class', "select");
	}
}

//判断正误
var check = function($dont_again) {
	if($status == 1) {
		position = document.getElementById(3);
	} else {
		position = document.getElementById($status-1);
	}
	
	input_nodes = position.getElementsByTagName("input");
	img_nodes = position.getElementsByTagName('img');
	img_nodes[0].style.visibility = "visible";
	var user_answer = '';
	
	//单选判断正误
	if(input_nodes[2].value == '[单选]' || input_nodes[2].value == '[A型]' || input_nodes[2].value == '[判断]') {
		if(input_nodes[0].value == input_nodes[1].value){
			results = '1';
			img_nodes[0].className = 'correct';
		} else {
			results = '0';
			img_nodes[0].className = 'wrong';
			answer_nodes = position.getElementsByTagName('h1');
			answer_nodes[0].style.display = 'inline';
		}
		user_answer = input_nodes[0].value;
	}
	
	//分析题判断正误
	if(input_nodes[2].value == '[分析]'){
		if(input_nodes[0].value == input_nodes[1].value){
			results = '1';
			img_nodes[0].className = 'correct';
		} else {
			results = '0';
			img_nodes[0].className = 'wrong';
		}
		answer_nodes = position.getElementsByTagName('h2');
		answer_nodes[0].style.display = 'block';
		user_answer = input_nodes[0].value;
	}
	
	//多选判断正误
	if(input_nodes[2].value == '[多选]' || input_nodes[2].value == '[不定项]' || input_nodes[2].value == '[X型]'){
		useranswer = input_nodes[0].value;
		useranswer = useranswer.split("").sort().toString().replace(/,/gi,"");
		if(useranswer == input_nodes[1].value.split("").sort().toString().replace(/,/gi,"")){
			results = '1';
			img_nodes[0].className = 'correct';
		} else {
			results = '0';
			img_nodes[0].className = 'wrong';
			answer_nodes = position.getElementsByTagName('h1');
			answer_nodes[0].style.display = 'inline';
		}
		user_answer = useranswer;
	}
	
	//填空判断正误
	if(input_nodes[2].value == '[填空]'){
		answer_array = new Array();
		answer_array = input_nodes[1].value.split(",");
		results ='1';
		img_nodes[0].className = 'correct';
		for (i=0; i<answer_array.length; i++) {
			if(input_nodes['review']){j=i+1}else{j=i}//当出现复习题的时候
			if(input_nodes[j].value != answer_array[i].replace(/^\s+|\s+$/g,"")){
				results = '0';
				img_nodes[0].className = 'wrong';
				answer_nodes = position.getElementsByTagName('h3');
				answer_nodes[i].style.display = 'inline';
			}
		}
		user_answer = answer_array;
	}
	//完型填空判断正误
	if(input_nodes[2].value == "[完型]"){
			answer_array = new Array();
			results ='1';
			img_nodes[0].className = 'correct';
			subject = position.getElementsByTagName("select");
			answer_array = input_nodes[1].value.split('');
			answer_nodes = position.getElementsByTagName('h1');
			for (i=0; i<answer_array.length; i++) {
				subject[i].style.color = 'white';
				if(subject[i].value == answer_array[i])
					subject[i].style.backgroundColor = 'green';
				else{
					subject[i].style.backgroundColor = 'red';
					results ='0';
					answer_nodes[i].style.display = 'inline';
					img_nodes[0].className = 'wrong';
				}
			}
	}
	
	//如果有解析，就显示解析
	comment_nodes = position.getElementsByTagName('h2');
	if(comment_nodes.length>0) { 
		comment_nodes[0].style.display = 'block';
	}
	
	//如果有用户贡献解析，就显示出来
	comment_nodes_users = position.getElementsByTagName('h6');
	if(comment_nodes_users.length>0) { 
		comment_nodes_users[0].style.display = 'block'; 
	}
	
	//如果有用户自己的笔记，就显示出来
	nodes_users = position.getElementsByTagName('h5');
	if(nodes_users.length>0) { 
		nodes_users[0].style.display = 'block'; 
	}
	
	//不再复习该题
	if($dont_again) {
		if(results == '1'){
			//正常状态
			saveResult(input_nodes[3].value, results, user_answer);
		} else {
			if (user_answer.length > 0) {
				//落入错题记录
				sendResults(input_nodes[3].value, 0, user_answer);
			}	
		}
	} else {
		//发送判题结果给服务器
		saveResult(input_nodes[3].value, results, user_answer);
	}
}

var changeTween = function(value){
	switch (value) {
		case '1': $tween = Tween.strongEaseOut;	break;
		case '2': $tween = Tween.backEaseIn;	break;
		case '3': $tween = Tween.regularEaseIn;	break;
		case '4': $tween = Tween.elasticEaseOut;break;
		case '5': $tween = Tween.backEaseIn;	break;
	}
}

var changeBgColor = function(value){
	document.body.style.backgroundColor=value;
	document.getElementById('1').style.backgroundColor=value;
	document.getElementById('2').style.backgroundColor=value;
	document.getElementById('3').style.backgroundColor=value;
	document.getElementById('1').style.color="#333333";
	document.getElementById('2').style.color="#333333";
	document.getElementById('3').style.color="#333333";
	var headID = document.getElementsByTagName("head")[0];         
		var cssNode = document.createElement('link');
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = '/static/css/exerise/style.css';
		cssNode.media = 'screen';
		headID.appendChild(cssNode);
	$color = value;
}

var changeFontSize = function(value){
	document.body.style.fontSize=value+'px';
}

//弹出确认框
var sure_layer = function (url) {
	var getout =  confirm( "您确认离开练习页面吗？ ");
    if(getout == true) {
         window.location = url;
    } 
}

//我要报错
var add_wrong = function() {
	if($status == 1) {
		position = document.getElementById(3);
		prediv = 3;
	} else {
		position = document.getElementById($status-1);
		prediv = $status-1;
	}
	
	if ($("#inner_"+prediv).css('visibility') == 'hidden') {
		return;
	}
	
	input_nodes = position.getElementsByTagName("input");
    var question_id = input_nodes[3].value;
	
	var GB_ANIMATION = true;
	GB_showCenter(this.title, '/pop/wrong?id='+question_id);
	return;
}

//添加笔记
var add_note = function() {
	var username = $.bf.common.getCookie('51score_account');
	if (username == null) {
		var GB_ANIMATION = true;
		GB_showCenter(this.title, '/login',360, 470);
		return;
	}
	
	if($status == 1) {
		position = document.getElementById(3);
		prediv = 3;
	} else {
		position = document.getElementById($status-1);
		prediv = $status-1;
	}
	
	if ($("#inner_"+prediv).css('visibility') == 'hidden') {
		return;
	}
	
	input_nodes = position.getElementsByTagName("input");
    var question_id = input_nodes[3].value;
	
	var GB_ANIMATION = true;
	GB_showCenter(this.title, '/pop/note?id='+question_id);
	return;
}

//添加解析
var add_analysis = function() {
	if($status == 1) {
		position = document.getElementById(3);
		prediv = 3;
	} else {
		position = document.getElementById($status-1);
		prediv = $status-1;
	}
	
	if ($("#inner_"+prediv).css('visibility') == 'hidden') {
		return;
	}
	
	input_nodes = position.getElementsByTagName("input");
    var question_id = input_nodes[3].value;
	
	var GB_ANIMATION = true;
	GB_showCenter(this.title, '/pop/analysis?id='+question_id);
	return;
}

//题型选择
var setCategory = function(object) {
	if(object.checked == true){
		if($category.indexOf(object.value) < 0){
			$category = $category + object.value;
		}
	} else {
		$category = $category.replace(object.value, "");
	}
}