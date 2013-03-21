//var $tryCount = 0 //未注册用户做题计数器
var $countNew = 0;//道统计
var $countTimes = 0;//次统计；
var current_subject_id = 0;//当前做到的题号；
var current_result = 0;//当前做题的结果正误；
var bgColor = ""; //当前颜色;
if(window.location.hostname != "www.51zuoti.com" && window.location.hostname != "localhost" && window.location.hostname != "www.zuoti8.com")
window.location.href="http://www.51zuoti.com";
//得到题目
//area:显示题目的区域inner_1,inner_2,inner_3
function getSubject(area){
		$tryCount++; //每次getSubject,未注册用户计数器加1
	    var msg = Ext.get(area); 
	      msg.load({
	      //url: '/subjects/getSubjects/'+$book+'/'+$part+'/'+$chapter+'/'+$section+'/'+$category+'/'+$review_type+'/'+$tryCount+'/'+Number(new Date),	  
		  url: '/get_subject.php?book='+$book+'&part='+$part+'&chapter='+$chapter+'&section='+$section+'&category='+$category+'&review_type='+$review_type+'&try_count='+$tryCount+'&Number='+Number(new Date),
	      text: 'Updating...<br><br>如长时间无法载入题目，请按F5刷新页面，做题记录已经保存，不会从头开始。'
	    }); 
	    msg.show(); 
}
//右下角道次统计
function countNumber(review){	
	if(review==0)
		$countNew++;
	oc=document.getElementById("review_count");
	oc.innerHTML=$countNew+" 道 | "+$countTimes+" 次&nbsp;";
}
//Ajax提交判题结果
function sendResults(subject_id,results) { 
    Ext.Ajax.request({ 
        //url : '/subjects/getResults/'+subject_id+'/'+results, 
		url : '/get_result.php?subject_id='+subject_id+'&results='+results, 
        success : function() { 

        }, 
        failure : function() { 
             //alert('由于网络原因，该题结果没有记录成功。'); 
        }, 
        timeout : 10000, 
        headers : { 
            'my-header' : 'foo' 
        } 
    }) 
            if ($status == 2) getSubject('inner_3');
            else if ($status == 3) getSubject('inner_1');
            else if ($status == 1) getSubject('inner_2');
} 
//Ajax提交用户设置
function changeSetting(motion,size,color) {
	if($name == 'tryUser') return;
	color = color.replace('#','');
    Ext.Ajax.request({ 
        url : '/subjects/changeSetting/'+motion+'/'+size+'/'+color, 
        timeout : 30000, 
        headers : { 
            'my-header' : 'foo' 
        } 
    }) 
} 

//滑动动作
function action($dont_again){
	//如果未购买或未登录，弹出对话框
	if($name == 'tryUser' || $notBuy){
		if($book != 116){//如果是116开心辞典，就不弹出对话框
			if(Number($tryCount)>Number($totalTryCount)){
				JSclick(document.getElementById('light'));
				return;
			}
		}
	}
	if($xufei == 1){
		JSclick(document.getElementById('xufei'));
		return;
	}
	//如果未推广，做5道题后弹出推广对话框
	/* if($name != 'tryUser' && $notBuy && ($has_tuiguang==0 || $has_tuiguang==3)){
			if(Number($tryCount)>5){
				JSclick(document.getElementById('tuiguang'));
				return;
			}
	} */
	//如果未同意协议，弹出协议对话框
	//if($name != 'tryUser' && $notBuy && $xieyi== 0 && ($has_tuiguang==1 || $has_tuiguang==2)){
	/*
	if($name != 'tryUser' && $notBuy && $xieyi== 0 ){
		if(Number($tryCount)>3){
				JSclick(document.getElementById('xieyi'));
				return;
		}
	}
	*/
		
	old_position = document.getElementById($status);
	input_nodes = old_position.getElementsByTagName("input");
	if(!input_nodes['id']) return;
	if ($status == 2){
		t1 = new Tween(document.getElementById('1').style,'left',$tween,0,-50,1,'%');
		t1.start();
		t2 = new Tween(document.getElementById('2').style,'left',$tween,50,0,1,'%');
		t2.start();
		t3 = new Tween(document.getElementById('3').style,'left',$tween,100,50,1,'%');
		t3.start();
		//getSubject('inner_1');
		$status =3 ;
	}
	else if ($status == 3){
		t1 = new Tween(document.getElementById('1').style,'left',$tween,100,50,1,'%');
		t1.start();
		t2 = new Tween(document.getElementById('2').style,'left',$tween,0,-50,1,'%');
		t2.start();
		t3 = new Tween(document.getElementById('3').style,'left',$tween,50,0,1,'%');
		t3.start();
		//getSubject('inner_2');
		$status =1 ;
	}else if ($status == 1){
		t1 = new Tween(document.getElementById('1').style,'left',$tween,50,0,1,'%');
		t1.start();
		t2 = new Tween(document.getElementById('2').style,'left',$tween,100,50,1,'%');
		t2.start();
		t3 = new Tween(document.getElementById('3').style,'left',$tween,0,-50,1,'%');
		t3.start();
		//getSubject('inner_3');
		$status =2 ;
	}
	position = document.getElementById($status);
	img_nodes = position.getElementsByTagName('img');
	img_nodes[0].style.visibility = "hidden";

	
	//如果无题了，不进行答题结果的判断
	if(input_nodes['id'].value == 'no')
	{
		if ($status == 2) getSubject('inner_3');
	            else if ($status == 3) getSubject('inner_1');
	            else if ($status == 1) getSubject('inner_2');
	}
	else //如果有题，才进行结果判断
	{		
		$countTimes++;//次统计累加
		check($dont_again);
	}

}

//判断正误
function check($dont_again){
	
	if($status == 1){
		position = document.getElementById(3);
	}else{
		position = document.getElementById($status-1);
	}
	input_nodes = position.getElementsByTagName("input");
	img_nodes = position.getElementsByTagName('img');
	img_nodes[0].style.visibility = "visible";
	if(input_nodes['category'].value != 'cloze')
	if(input_nodes['user_answer'].value == '' && input_nodes['category'].value != 'blank')
	{
			alert("直接过题算做错，会落入错题漩涡，请认真作答。");
	}
	
	//调用右下角计数函数
	if(input_nodes['review'])
		countNumber(1);
	else
		countNumber(0);
	//单选判断正误
	if(input_nodes['category'].value == 'simple_select'){
		if(input_nodes['user_answer'].value == input_nodes['answer'].value){
			results = '1';
			img_nodes[0].className = 'correct';
		}else{
			results = '0';
			img_nodes[0].className = 'wrong';
			answer_nodes = position.getElementsByTagName('h1');
			//if($notBuy )
			//	answer_nodes[0].innerHTML="非正式用户";
			answer_nodes[0].style.display = 'inline';
		}
		//comment_nodes = position.getElementsByTagName('h2');
		//if(comment_nodes.length>0){ comment_nodes[0].style.display = 'block'; }
	}
	//分析题判断正误
	if(input_nodes['category'].value == 'subjectives'){
		if(input_nodes['user_answer'].value == input_nodes['answer'].value){
			results = '1';
			img_nodes[0].className = 'correct';
		}else{
			results = '0';
			img_nodes[0].className = 'wrong';
		}
		answer_nodes = position.getElementsByTagName('h2');
		//if($notBuy )
		//	answer_nodes[0].innerHTML="只有正式用户可查看所有题目答案";
		answer_nodes[0].style.display = 'block';
	}
	//多选判断正误
	if(input_nodes['category'].value == 'multi_select'){
		useranswer = input_nodes['user_answer'].value;
		useranswer = useranswer.split("").sort().toString().replace(/,/gi,"");
		if(useranswer == input_nodes['answer'].value.split("").sort().toString().replace(/,/gi,"")){
			results = '1';
			img_nodes[0].className = 'correct';
		}else{
			results = '0';
			img_nodes[0].className = 'wrong';
			answer_nodes = position.getElementsByTagName('h1');
			//if($notBuy )
			//	answer_nodes[0].innerHTML="非正式用户";
			answer_nodes[0].style.display = 'inline';
		}
		//comment_nodes = position.getElementsByTagName('h2');
		//if(comment_nodes.length>0){ comment_nodes[0].style.display = 'block'; }
	}
	//填空判断正误
	if(input_nodes['category'].value == 'blank'){
		answer_array = new Array();
		//answer_array = [input_nodes['answer'].value];
		answer_array = input_nodes['answer'].value.split(",");
		results ='1';
		img_nodes[0].className = 'correct';
		for(i=0;i<answer_array.length;i++){
			if(input_nodes['review']){j=i+1}else{j=i}//当出现复习题的时候
			if(input_nodes[j].value != answer_array[i].replace(/^\s+|\s+$/g,"")){
				results = '0';
				img_nodes[0].className = 'wrong';
				answer_nodes = position.getElementsByTagName('h3');
				//if($notBuy )
				//	answer_nodes[i].innerHTML="非正式用户";
				answer_nodes[i].style.display = 'inline';
			}
		}
		//comment_nodes = position.getElementsByTagName('h2');
		//if(comment_nodes.length>0){ comment_nodes[0].style.display = 'block'; }
	}
	//完型填空判断正误
	if(input_nodes['category'].value == "cloze"){
			answer_array = new Array();
			results ='1';
			img_nodes[0].className = 'correct';
			subject = position.getElementsByTagName("select");
			answer_array = input_nodes['answer'].value.split('');
			answer_nodes = position.getElementsByTagName('h1');
			for(i=0;i<answer_array.length;i++){
				//alert(subject[i].value);
				subject[i].style.color = 'white';
				if(subject[i].value == answer_array[i])
					subject[i].style.backgroundColor = 'green';
				else{
					subject[i].style.backgroundColor = 'red';
					results ='0';
					//if($notBuy )
					//	answer_nodes[i].innerHTML="非正式用户";
					answer_nodes[i].style.display = 'inline';
					img_nodes[0].className = 'wrong';
				}
			} 
	}
	//如果有解析，就显示解析
	comment_nodes = position.getElementsByTagName('h2');
	if(comment_nodes.length>0){ 
		comment_nodes[0].style.display = 'block'; 
		//if($notBuy && results == '0')
		//	comment_nodes[0].innerHTML="【解析】非正式用户";
	}
	//如果有用户贡献解析，就显示出来
	comment_nodes_users = position.getElementsByTagName('h6');
	if(comment_nodes_users.length>0){ 
		comment_nodes_users[0].style.display = 'block'; 
	}
	//如果有用户自己的笔记，就显示出来
	nodes_users = position.getElementsByTagName('h5');
	if(nodes_users.length>0){ 
		nodes_users[0].style.display = 'block'; 
	}
	
	//切换记忆曲线图片
		if(results =='1')
			document.getElementById('review_chart').style.backgroundImage="url(/images/quxian"+input_nodes['review_times'].value+".png)";
		else
			document.getElementById('review_chart').style.backgroundImage="url(/images/quxian0.png)";//如答案错误，回到记忆起点
		//document.getElementById('review_chart_url').href="/subjects/rememberChart/";
		current_subject_id = input_nodes['id'].value;//当前做到的题号
		
		current_result = results;
		document.getElementById('view_detail').style.visibility='visible';
	//不再复习该题
	if($dont_again){
		if(results =='1'){
		alert("点击此处，该题将作为已掌握题目，不会再次出现。如只是想做下一道题目，请点击右侧的【查看答案】按钮！");
		sendResults(input_nodes['id'].value,2);
		}else{
			alert("由于该题没有做对，10分钟后还会再次出现。");
			sendResults(input_nodes['id'].value,0);	
		}
	}else
	//发送判题结果给服务器
		sendResults(input_nodes['id'].value,results);
}
//单选，选择操作
function s_select(item){
	position_id = $status;
	position = document.getElementById(position_id);
	obj = position.getElementsByTagName('span');
	if (obj[item].className == 'selected'){
		//obj[item].className = 'select';
		obj[item].setAttribute('className', "select") || obj[item].setAttribute('class', "select");
		input_nodes = position.getElementsByTagName("input");
		input_nodes[0].value = '';
	}else{
		clear();
		//obj[item].className = 'selected';
		obj[item].setAttribute('className', "selected") || obj[item].setAttribute('class', "selected");
		input_nodes = position.getElementsByTagName("input");
		input_nodes['user_answer'].value = String.fromCharCode(65+Number(item));
	}
}
//多选，选择操作
function m_select(item){
	position_id = $status;
	position = document.getElementById(position_id);
	obj = position.getElementsByTagName('span');
	if (obj[item].className == 'selected'){
		//obj[item].className = 'select';
		obj[item].setAttribute('className', "select") || obj[item].setAttribute('class', "select");
		input_nodes = position.getElementsByTagName("input");
		select_item = String.fromCharCode(65+Number(item));
		input_nodes['user_answer'].value = input_nodes['user_answer'].value.replace(select_item,'');
	}else{
		//clear();
		//obj[item].className = 'selected';
		obj[item].setAttribute('className', "selected") || obj[item].setAttribute('class', "selected");
		input_nodes = position.getElementsByTagName("input");
		input_nodes['user_answer'].value = input_nodes['user_answer'].value + String.fromCharCode(65+Number(item));
	}
}
//清除选择题选项
function clear(){
	position_id = $status;
	position = document.getElementById(position_id);
	message_nodes=position.getElementsByTagName("span");
	num=message_nodes.length;
	for (i=0;i<num;i++ )
	{
	  //message_nodes[i].className="select";
	  message_nodes[i].setAttribute('className', "select") || message_nodes[i].setAttribute('class', "select");
	}
}
function changeFontSize(value){
	document.body.style.fontSize=value+'px';
}

function changeBgColor(value){
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
		cssNode.href = '/css/subjects.css';
		cssNode.media = 'screen';
		headID.appendChild(cssNode);
	$color = value;
}

function lightOff(){
	if(document.body.style.backgroundColor != "#000000"){
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
		cssNode.href = '/css/lightOff.css';
		cssNode.media = 'screen';
		headID.appendChild(cssNode);
	}else{
		document.body.style.backgroundColor=$color;	
		document.getElementById('1').style.backgroundColor=$color;
		document.getElementById('2').style.backgroundColor=$color;
		document.getElementById('3').style.backgroundColor=$color;
		document.getElementById('1').style.color="#333333";
		document.getElementById('2').style.color="#333333";
		document.getElementById('3').style.color="#333333";
		var headID = document.getElementsByTagName("head")[0];         
		var cssNode = document.createElement('link');
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = '/css/subjects.css';
		cssNode.media = 'screen';
		headID.appendChild(cssNode);
	}
}

function changeTween(value){
	switch (value) {
		case '1': $tween = Tween.strongEaseOut;	break;
		case '2': $tween = Tween.backEaseIn;	break;
		case '3': $tween = Tween.regularEaseIn;	break;
		case '4': $tween = Tween.elasticEaseOut;break;
		case '5': $tween = Tween.backEaseIn;	break;
	}
}

function changeCategory(object){
	if(object.checked == true){
		if($category.indexOf(object.value)<0){
			$category = $category+object.value;
		}
	}else{
		$category = $category.replace(object.value,"");
	}
}

function getRemind() { 
	var msg1 = Ext.get('scrollDiv'); 
	      msg1.load({
	      url: '/get_remind.php?book='+$book+'&part='+$part+'&chapter='+$chapter+'&section='+$section+'&number='+Number(new Date),
		  params:'',
	      text: 'Updating...'
	    }); 
	    msg1.show();
} 

function gotoSubject(book,part,chapter,section){
	dataForm = document.subjects;
	dataForm.book.value = book;
	dataForm.part.value = part;
	dataForm.chapter.value = chapter;
	dataForm.section.value = section;
	dataForm.submit();
}
function interval(){
	changeFontSize($size );
	changeBgColor($color);
	changeTween($motion);
	
	document.getElementById('size').value = $size;
	document.getElementById('color').value = $color;
	document.getElementById('motion').value = $motion;
	
}
//显示公共题干部分
function show_stem($imgObj){
	position_id = $status;
	position = document.getElementById(position_id);
	obj = position.getElementsByTagName('h4');
	
	img = $imgObj.getElementsByTagName('img');
	if(obj[0].style.display=='block' || obj[0].style.display==''){
		obj[0].style.display='none';
		img[0].src='/images/arrow_state_blue_expanded.png';
	}
	else{
		obj[0].style.display='block';
		img[0].src='/images/arrow_state_blue_collapsed.png';
	}
}
//显示用户笔记
function show_note($imgObj){
	position_id = $status;
	position = document.getElementById(position_id);
	obj = position.getElementsByTagName('h5');
	
	img = $imgObj.getElementsByTagName('img');
	if(obj[0].style.display=='block' || obj[0].style.display==''){
		obj[0].style.display='none';
		img[0].src='/images/arrow_state_blue_expanded.png';
	}
	else{
		obj[0].style.display='block';
		img[0].src='/images/arrow_state_blue_collapsed.png';
	}
}
//显示用户笔记
function show_comment($imgObj){
	position_id = $status;
	position = document.getElementById(position_id);
	obj = position.getElementsByTagName('h6');
	
	img = $imgObj.getElementsByTagName('img');
	if(obj[0].style.display=='block' || obj[0].style.display==''){
		obj[0].style.display='none';
		img[0].src='/images/arrow_state_blue_expanded.png';
	}
	else{
		obj[0].style.display='block';
		img[0].src='/images/arrow_state_blue_collapsed.png';
	}
}

//导航菜单
function contrl_menu(){
	var menu = document.getElementById("nav_menu");
	if(menu.style.display == 'none'  || menu.style.display=='')
	menu.style.display = 'block';
	else
	menu.style.display = 'none';
}
var $tween = Tween.strongEaseOut;
//点击查看大图片
function lookimg(str)
{
var newwin=window.open()
newwin.document.write("<img src="+str+" />")
}
//左侧滑动窗口控制
function show_remember(){
	ob=document.getElementById('show_re');
	if(ob.style.left==-255+'px')
		ob.style.left=0+'px';
	else
		ob.style.left=-255+'px';
}

//参与本题讨论
function discus(){
	if($name == 'tryUser'){
		JSclick(document.getElementById('light'));
	}else{
		if(current_subject_id>0)
		window.open("/discus/add/" + current_subject_id);
	}
}
function wrong_r(){
	if(current_subject_id>0){
		JSclick(document.getElementById('wrong'));	
	}
}
function note_r(){
	if($name == 'tryUser'){
		JSclick(document.getElementById('light'));
	}else{
		if(current_subject_id>0)
		JSclick(document.getElementById('note'));	
	}
}
function add_r(){
	if($name == 'tryUser'){
		JSclick(document.getElementById('light'));
	}else{
		if(current_subject_id>0)
		JSclick(document.getElementById('add'));	
	}
}
function gocopy(){
	 if (document.selection === undefined || document.selection.type === undefined) {
         window.close();
     }else{document.selection.empty()}	
}
//键盘监听事件
/* function fxn (e) {
	Ext.MessageBox.alert('51zuoti.com', '　　　　用户名不能超过20个字符！　　　');
	if(window.event) // IE
	{
		keynum = e.keyCode
	}else if(e.which) // Netscape/Firefox/Opera
	{
		keynum = e.which
	}
	alert(keynum);
} */