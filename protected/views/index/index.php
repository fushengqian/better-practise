<html xmlns="http://www.w3.org/1999/xhtml" class=" ext-strict"><head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
<meta content="“no-catch”" http-equiv="“Pragma”">
<meta content="“-1”" http-equiv="“Expires”">
<meta content="IE=7" http-equiv="X-UA-Compatible">
<link rel="shortcut icon" href="/static/favicon.ico"/>
<title><?php echo $title;?></title>
<meta name="Keywords" content="课程题库网,<?php echo $keyword;?>" /> 
<meta name="description" content="课程题库网 ,<?php echo $desc;?>" />
<meta name="ROBOTS" content="noarchive">
<link href="/static/css/exercise/style.css" type="text/css" rel="stylesheet">
<script type="text/javascript">
    var GB_ROOT_DIR = "/static/js/plugin/GreyBox/greybox/";
</script>
<!--[if lte IE 6]>
	<link href="/static/css/exercise/style-ie6.css" type="text/css" rel="stylesheet">
<![endif]-->
<link href="/static/css/exercise/nav.css" type="text/css" rel="stylesheet">
<link href="/static/js/plugin/GreyBox/greybox/gb_styles.css" rel="stylesheet" type="text/css" />
<style type="text/css">
.selected{width:34px;height:30px;padding-top:5px;padding-left:6px;padding-bottom:2px;padding-right:5px;background:url(/static/images/exercise/selected.png) no-repeat;background-size:34px 30px;}
.select{width:34px;height:30px;padding-top:5px;padding-left:6px;padding-bottom:2px;padding-right:5px;}
</style>
<script type="text/javascript" src="/static/js/jquery.js"></script>
<script type="text/javascript" src="/static/js/core.js"></script>
<script type="text/javascript" src="/static/js/common.js"></script>
<script type="text/javascript" src="/static/js/config/main.js"></script>
<script type="text/javascript" src="/static/js/module/dialog.js"></script>
<script type="text/javascript" src="/static/js/ui/dialog.js"></script>
<script type="text/javascript" src="/static/js/plugin/GreyBox/greybox/AJS.js"></script>
<script type="text/javascript" src="/static/js/plugin/GreyBox/greybox/AJS_fx.js"></script>
<script type="text/javascript" src="/static/js/plugin/GreyBox/greybox/gb_scripts.js"></script>
<script type="text/javascript" src="/static/js/plugin/jstween/Tween.js"></script>
<script type="text/javascript" src="/static/js/app/exercise/index.js?130130"></script>
</head>
<body style="font-size: 18px; class="ext-gecko ext-gecko2">
<!-- 导航开始 -->
<div style="z-index: 1; position: absolute; opacity: 0.05; display: none;" id="objDiv">
   <img style="margin:18px 0 0 3px" src="/static/images/exercise/daohang_pop.png">
</div>
<!-- title开始 -->
<div id="nav"><img id="menu_btn" align="absmiddle" style="cursor:pointer" src="/static/images/exercise/nav_button.png">
&gt;&gt;在线练习 &gt; <?php echo $course_name;?> &gt; <?php echo $chapter_name;?><span style="position:absolute;_top:5px;right:5px;"><a id="changeChapter" href="javascript:;"><img align="absmiddle" src="/static/images/exercise/change.png">章节切换</a>&nbsp;&nbsp;<a target="_blank" href="/help"><img align="absmiddle" src="/static/images/exercise/help.gif">帮助</a></span>
</div>
     <input id="course_id" type="hidden" value="<?php echo $question[0]['course_id'];?>">
	 <input id="part" type="hidden" value="<?php echo $question[0]['part'];?>">
	 <input id="chapter_id" type="hidden" value="<?php echo $question[0]['chapter_id'];?>">
	 <input id="section" type="hidden" value="<?php echo $question[0]['section'];?>">
	 <input id="target_id" type="hidden" value="<?php echo $target_id;?>">
	 <input id="exam_id" type="hidden" value="<?php echo $exam_id;?>">
    <!-- 第一题 -->
	<div id="1" style="background-color:rgb(250, 248, 177); overflow: auto; width: 50%; height: 90%; position: absolute; top: 34px; left: -50%; -moz-user-select: none; color: rgb(51, 51, 51);">
	<img src="/static/images/exercise/blank.png" class="check">
		 <div id="inner_1" style="margin: 8px 10px 10px; visibility: visible;">
		      <?php echo $question[1]['type'];?><br><p><?php echo $question[1]['title'];?><p></p><br>
		      <?php empty($question[1]['options']) && $question[1]['options'] = array(); foreach ($question[1]['options'] as $k => $v) {?>
		          <?php if($question[1]['type'] !== '多选' && $question[1]['type'] !== '不定项' && $question[1]['type'] !== 'X型') {?>
			      <span class="select"><?php echo substr($v,0,2);?> </span><a href="javascript:simple_select('<?php echo $k;?>')"><?php echo substr($v,2);?></a><br>
			      <?php } else {?>
			      <span class="select"><?php echo substr($v,0,2);?> </span><a href="javascript:multiple_select('<?php echo $k;?>')"><?php echo substr($v,2);?></a><br>
			   <?php }}?>
			   <h2><?php echo $question[0]['analysis'];?></h2>
			   <input type="hidden" name="user_answer">
			   <input type="hidden" value="<?php echo $question[1]['answer'];?>" name="answer">
			   <input type="hidden" value="<?php echo $question[1]['type'];?>" name="type">
			   <input type="hidden" value="<?php echo $question[1]['id'];?>" name="question_id">
		</div>
    </div>
    
    <!-- 第二题 -->
	<div id="2" style="background-color: rgb(250, 248, 177); overflow: auto; width: 50%; height: 90%; position: absolute; top: 34px; left: 0%; -moz-user-select: none; color: rgb(51, 51, 51);">
	<img src="/static/images/exercise/blank.png" class="wrong" style="visibility:hidden;">
		<div id="inner_2" style="margin: 8px 10px 10px; visibility: hidden;">
		      <?php echo $question[2]['type'];?><br><p><?php echo $question[2]['title'];?><p></p><br>
		      <?php empty($question[2]['options']) && $question[2]['options'] = array();foreach ($question[2]['options'] as $k =>$v) {?>
			      <?php if($question[2]['type'] !== '多选' && $question[2]['type'] !== '不定项' && $question[2]['type'] !== 'X型') {?>
			      <span class="select"><?php echo substr($v,0,2);?> </span><a href="javascript:simple_select('<?php echo $k;?>')"><?php echo substr($v,2);?></a><br>
			      <?php } else {?>
			      <span class="select"><?php echo substr($v,0,2);?> </span><a href="javascript:multiple_select('<?php echo $k;?>')"><?php echo substr($v,2);?></a><br>
			   <?php }}?>
			   <h2><?php echo $question[2]['analysis'];?></h2>
			   <input type="hidden" name="user_answer">
			   <input type="hidden" value="<?php echo $question[2]['answer'];?>" name="answer">
			   <input type="hidden" value="<?php echo $question[2]['type'];?>" name="type">
			   <input type="hidden" value="<?php echo $question[2]['id'];?>" name="question_id">
		</div>
    </div>
    
    <!-- 第三题 -->
	<div id="3" style="background-color: rgb(250, 248, 177); overflow: auto; width: 50%; height: 90%; position: absolute; top: 34px; left: 50%; -moz-user-select: none; color: rgb(51, 51, 51);">
	<img src="/static/images/exercise/blank.png" class="check" style="visibility:visible;">
	   <div id="inner_3" style="margin: 8px 10px 10px; visibility: visible;">
	          <?php echo $question[0]['type'];?><br><p><?php echo $question[0]['title'];?><p></p><br>
		      <?php foreach ($question[0]['options'] as $k => $v) {?>
			   	  <?php if($question[0]['type'] !== '多选' && $question[0]['type'] !== '不定项' && $question[0]['type'] !== 'X型') {?>
			      <span class="select"><?php echo substr($v,0,2);?></span><a href="javascript:simple_select('<?php echo $k;?>')"><?php echo substr($v,2);?></a><br>
			      <?php } else {?>
			      <span class="select"><?php echo substr($v,0,2);?></span><a href="javascript:multiple_select('<?php echo $k;?>')"><?php echo substr($v,2);?></a><br>
			   <?php }}?>
			   <h2><?php echo $question[0]['analysis'];?></h2>
			   <input type="hidden" value="" name="user_answer">
			   <input type="hidden" value="<?php echo $question[0]['answer'];?>" name="answer">
			   <input type="hidden" value="<?php echo $question[0]['type'];?>" name="type">
			   <input type="hidden" value="<?php echo $question[0]['id'];?>" name="question_id">
	   </div>
    </div>
	<div id="4" class="pre_question"></div>
	
	<div style="position:absolute;top:38px;left:70px;font-size:12px;">
	    <a style="color:blue;" href="javascript:add_note();"><img align="absmiddle" src="/static/images/exercise/tag_edit.gif"> 添加笔记 ↓</a>
	    <a style="color:blue;" href="javascript:add_wrong();"><img align="absmiddle" src="/static/images/exercise/tag_remove.gif"> 我要报错 ↓</a>
	    <a style="color:blue;" href="javascript:add_analysis();"><img align="absmiddle" src="/static/images/exercise/tag_add.gif"> 贡献解析 ↓</a>
    </div>
    
    <!--提醒--> 
	<div id="note">设定后过2道题目生效，[复习题]优先出现不参与此规则。</div>
	
	<!-- start 底部工具栏 -->
	<div style="position:absolute; bottom:0px;width:100%;left:0px;font-size:12px;">
		<span title="道：表示新做题数，不包括复习题；次：表示新做题数+复习题数" style="font-weight:bold;color:white;" id="review_count">&nbsp;</span>
		<div class="toolbar" id="remind">
			<span class="toolbar_font">
				&nbsp;&nbsp;题型选择：
			</span>
			<span class="toolbar_font">
				<input type="checkbox" style="vertical-align:middle;" id="category0" checked="checked" onchange="javascript:setCategory(this);" value="1"><label for="category0">单选</label><input type="checkbox" style="vertical-align:middle;" id="category1" checked="checked" value="2" onchange="javascript:setCategory(this);"><label for="category1">多选</label><input type="checkbox" style="vertical-align:middle;" id="category2" checked="checked" value="3" onchange="javascript:setCategory(this);"><label for="category2">判断</label></span>
			&nbsp;<img align="absmiddle" src="/static/images/exercise/split.png">&nbsp;
			<span class="toolbar_font">
				滑动：
			</span>
			<select class="t_select" id="motion" onChange="changeTween(this.value);">
				&#12288;<option value="1">普通</option>
				&#12288;<option value="2">缓释</option>
				&#12288;<option value="3">慢速</option>
				&#12288;<option value="4">快速</option>
			</select>
			&nbsp;&nbsp;<img align="absmiddle" src="/static/images/exercise/split.png">&nbsp;
			<span class="toolbar_font">
				字号：
			</span>
			<select class="t_select" id="size" onChange="changeFontSize(this.value);">
				<option value="12">#12</option>
				<option value="15">#15</option>
				<option selected="" value="18">#18</option>
				<option value="21">#21</option>
				<option value="24">#24</option>
			</select>
			&nbsp;&nbsp;<img align="absmiddle" src="/static/images/exercise/split.png">&nbsp;
			<span class="toolbar_font">
				颜色：
			</span>
			<select class="t_select" id="color" onChange="changeBgColor(this.value);">
				<option style="background-color:#FAF8B1" value="#FAF8B1">&nbsp;</option>
				<option style="background-color:#CCE8CF" value="#CCE8CF">&nbsp;</option>
				<option style="background-color:#DDDDDD" value="#DDDDDD">&nbsp;</option>
				<option style="background-color:#F7D8C4" value="#F7D8C4">&nbsp;</option>
				<option style="background-color:#FFFFFF" value="#FFFFFF">&nbsp;</option>
			</select>
	        <a href="javascript:;" id='turnoff'><img align="absbottom" src="/static/images/exercise/light.png"><b style="color:#FFFFFF;">开/关灯</b></a>
	        <span style="position:absolute; right:5px;font-weight:bold; color:#F00">※本系统IE6浏览器可能有些问题，请换用IE7以上版本，推荐使用<a target="_blank" href="http://www.firefox.com.cn/download/">火狐、360、chrome等浏览器</a></span>
		</div>
	</div>
	<!-- end 底部工具栏 -->
	
<div id="bottom_line">▼此题我已掌握，不需复习</div>
<div class="reshow_tip" style="display:none;">做错的题目会自动落入错题库，十分钟后会再次出现！</div>
<img src="/static/images/exercise/daan.gif" id="nextQuestion">
<!-- 菜单项 -->
<div align="center" id="nav_menu">
	<span><a target="_blank" href="/">&nbsp;&nbsp;<img src="/static/images/exercise/003_08.png">&nbsp;&nbsp;网站首页</a></span>
	<!--<span><a target="_blank" href="/mis">&nbsp;&nbsp;<img src="/static/images/exercise/003_13.png">&nbsp;&nbsp;我的课程</a></span>-->
	<span><a target="_blank" href="/course-chapter-list-<?php echo $course_id;?>.html">&nbsp;&nbsp;<img src="/static/images/exercise/003_19.png">&nbsp;&nbsp;章节目录</a></span>
	<span><a href="javascript:alert('抱歉，系统升级中..');">&nbsp;&nbsp;<img src="/static/images/exercise/003_24.png">&nbsp;&nbsp;模拟考试</a></span>
	<span><a target="_blank" href="/course-list-0-<?php echo $course_type_id;?>.html">&nbsp;&nbsp;<img src="/static/images/exercise/003_46.png">&nbsp;&nbsp;相关课程</a></span>
</div>
</body>
</html>