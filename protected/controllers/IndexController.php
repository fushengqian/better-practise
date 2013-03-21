<?php
 /**
  *	@name IndexController
  *	@author fushengqian@qq.com
  *	@version 1.0
  *	@date 2011-10-07
  **/
class IndexController extends Controller {
	
	private $_question_model;
	
	private $_course_model;
	
	private $_user_course_model;
	
	private $_chapter_cache_model;
	
	private $_user_question_model;
	
	private $_chapter_model;

	private $_error_model;

	private $_complete_model;
	
	public function init($user_id = '') {
		Yii::import('mod.question.ModQuestion');
		Yii::import('mod.course.ModCourse');
		Yii::import('mod.user_course.ModUser_course');
		Yii::import('mod.chapter_cache.ModChapter_cache');
		Yii::import('mod.user_question.ModUser_question');
		Yii::import('mod.chapter.ModChapter');
		Yii::import('mod.error.ModError');
		Yii::import('mod.complete.ModComplete');
	    $this->_complete_model = new ModComplete();
	    $this->_error_model = new ModError();
	    $this->_question_model = new ModQuestion();
	    $this->_course_model = new ModCourse();
	    $this->_user_course_model = new ModUser_course();
	    $this->_chapter_cache_model = new ModChapter_cache();
	    $this->_user_question_model = new ModUser_question();
	    $this->_chapter_model = new ModChapter();
		parent::init();
	}
	
	//练习页面
	public function actionIndex() {		
		$this->setParams(false, false, false, false, false);
		$course_id = Yii::app()->request->getParam('course_id');
		$part = Yii::app()->request->getParam('part');
	    $chapter_id = Yii::app()->request->getParam('chapter_id');
	    $order = Yii::app()->request->getParam('order');
	    $section = Yii::app()->request->getParam('section');
	    $exam_id = Yii::app()->request->getParam('exam');

		//前三题无需登录
		if (intval($order) >= 3) {
		  	if (!Yii::app()->user->isLogined(true)) return;
		}
		if(empty($chapter_id)){ $chapter_id = 1;};
		$where = array('course_id' => $course_id, 'part'=>$part, 'chapter_id'=>(int)$chapter_id, 'section'=>$section, 'exam_id'=>$exam_id);
		empty($course_id) && $course_id = 1;
		if(empty($part)) {unset($where['part']);};
		if(empty($order)){ $order = 0;};
		if(empty($section)){ unset($where['section']);};
		if(empty($exam_id)){ unset($where['exam_id']);};
		
		$course_info = $this->_course_model->getDataList(array('id'=>$course_id));
		$title = !empty($course_info[0]['name'])?$course_info[0]['name']:'';
		$course_name = !empty($course_info[0]['name'])?$course_info[0]['name']:'';
		$course_type_id = !empty($course_info[0]['course_type_id'])?$course_info[0]['course_type_id']:'0';

		$chapter_arr = $this->_chapter_model->getDataList(array('course_id'=>$course_id, 'parent'=>$part.'_'.$chapter_id.'_'.$section), 'title,id');
		$chapter_name = !empty($chapter_arr[0]['title'])?$chapter_arr[0]['title']:'';
		
		//已经做对的题目不再出现
		$right_question = $this->_user_question_model->getDataList(array_merge($where, array('username' => !empty($_SESSION['51score_account'])?$_SESSION['51score_account']:'', 'right_wrong' => '1')), 'question_id', 0, 10000);
		$ids = '0';
		foreach ($right_question as $v) {
			$ids.=','.$v['question_id'];
		}				
		$where['id_not_in'] = ' AND id NOT IN('.$ids.')';
		
		$question = $this -> _question_model -> getQuestionList($where, $field = null, $offset = abs($order), $limit = 3);

		if (!empty($question)) {
			$this->assign('question', $question);
			$this->assign('course_id', $course_id);
			$this->assign('course_type_id', $course_type_id);
			$this->assign('part', $part);
			$this->assign('chapter_id', $chapter_id);
			$this->assign('section', $section);
			$this->assign('course_name', $course_name);
			$this->assign('chapter_name', $chapter_name);
			$this->assign('total_num', $question[0]['total_num']);
		} else {
		    exit('no question');
		}
		
		$target_id = !empty($chapter_arr[0]['id'])?$chapter_arr[0]['id']:'';
	
		$this->assign('target_id', $target_id);
		$this->assign('exam_id', $exam_id);
		$this->assign('keyword', $title.'，习题，考试题，复习题，模拟题');
		$this->assign('desc', '在线复习'.$title.'的题库网站,自动记录保存错题,智能化的在线复习系统！');
		$this->assign('title', $title.' 习题，考试题，复习题，模拟题，在线练习 - 智能学习系统 - 课程题库网');
		$this->display('index');
	}
	
	//获取试题, Ajax调用
	public function actiongetQuestion() {
		$course_id = Yii::app()->request->getParam('course_id');
		$part = Yii::app()->request->getParam('part');
	    $chapter_id = Yii::app()->request->getParam('chapter_id');
	    $order = Yii::app()->request->getParam('order');
	    $section = Yii::app()->request->getParam('section');
	    $question_id = Yii::app()->request->getParam('question_id');
	    $result = Yii::app()->request->getParam('result');
	    $user_answer = Yii::app()->request->getParam('user_answer');
	    $type = Yii::app()->request->getParam('type');
		$exam_id = Yii::app()->request->getParam('exam');
	    
	    $type = $this->_getTypeText($type);
	    
		$where = array('course_id' => $course_id, 'part'=>$part, 'chapter_id'=>$chapter_id, 'section'=>$section, 'type'=>$type);
		
		//是否登录
		if(!Yii::app()->user->checkLogined(false) && intval($order) > 3) {
			LibAjaxResponse::convertError(202, '您必须先登录');
			exit();
		}
		
		empty($course_id) && die;
		if(empty($part)) {unset($where['part']);};
		if(empty($chapter_id)) {$where['chapter_id'] = 1;};
		if(empty($order)){ $order = 0;};
		if(empty($section)){ unset($where['section']);};
		if(empty($type)){ unset($where['type']);};
		
		//提取10分钟前做错的题
		$where['username'] = !empty($_SESSION['51score_account'])?$_SESSION['51score_account']:'';
		$where['update_time'] = 1;
		$where['right_wrong'] = '0';
		$arr = $this->_user_question_model->getDataList($where, null, 0, 1);
		if (!empty($arr[0])) {
			$question = $this -> _question_model -> getQuestionList(array('id' => $arr[0]['question_id']));
			$set_order = 2;
		}
		
		//没有错题
		if (empty($question)) {
			unset($where['username']);
			unset($where['update_time']);
			unset($where['right_wrong']);
			
			//已经做对的题目不再出现
			$right_question = $this->_user_question_model->getDataList(array_merge($where, array('username' => !empty($_SESSION['51score_account'])?$_SESSION['51score_account']:'', 'right_wrong' => '1')), 'question_id', 0, 10000);
			$ids = '0';
			foreach ($right_question as $v) {
			   $ids.=','.$v['question_id'];
			}
						
			$where['id_not_in'] = ' AND id NOT IN('.$ids.')';
			$question = $this -> _question_model -> getQuestionList($where, $field = null, $offset = abs($order), $limit = 1, $orderby = 'id', 'ASC');
			$set_order = 1;
		}
	    
		if (!empty($question[0])) {
			$content = $question[0]['type'].'<br><p>'.$question[0]['title'].'<p></p><br>';
			foreach ($question[0]['options'] as $k => $v) {
				if ($question[0]['type'] !== '[多选]' && $question[0]['type'] !== '[不定项]' && $question[0]['type'] !== '[X型]') {
					$content.= '<span class="select">'.substr($v,0,1).'. </span><a href="javascript:simple_select(\''.$k.'\')">'.substr($v,2).'</a><br>';
				} else {
					$content.= '<span class="select">'.substr($v,0,1).'. </span><a href="javascript:multiple_select(\''.$k.'\')">'.substr($v,2).'</a><br>';
				}
			}
			$content.= '<h2 class="font12">'.$question[0]['analysis'].'</h2>';
			$content.= '<input type="hidden" name="user_answer">';
			$content.= '<input type="hidden" value="'.$question[0]['answer'].'" name="answer">';
			$content.= '<input type="hidden" value="'.$question[0]['type'].'" name="type">';
			$content.= '<input type="hidden" value="'.$question[0]['id'].'" name="question_id">';
			LibAjaxResponse::convertData(array('question_id' => $question[0]['id'], 'add_order' => $set_order, 'content' => $content));
		} else {
			LibAjaxResponse::convertError(201, '没有题目了！');
		}
	}
	
	//保存做题结果
	public function actionsaveResult() {
		$course_id = Yii::app()->request->getParam('course_id');
		$question_id = Yii::app()->request->getParam('question_id');
		$part = Yii::app()->request->getParam('part');
	    $chapter_id = Yii::app()->request->getParam('chapter_id');
	    $section = Yii::app()->request->getParam('section');
	    $result = Yii::app()->request->getParam('result');
	    $user_answer = Yii::app()->request->getParam('user_answer');
		$target_id = Yii::app()->request->getParam('target_id');
		$exam_id = Yii::app()->request->getParam('exam_id');
		$username = Yii::app()->user->getUsername();
		if (empty($username)) {
			return;
		}
	    
		//保存上一题
		if (!empty($question_id) && !empty($user_answer)) {
		    //完成数量
		    $check_res = $this->_error_model->checkAndAdd(array('username' => $username,
			                                             'course_id' => $course_id,
		                                                 'part' => $part,
											             'chapter_id' => $chapter_id,
											             'section' => $section,
											             'right_wrong' => $result,
			                                             'answer' => $user_answer,
		                                                 'question_id' => $question_id));

			if ($check_res == 10) {
			       $type = 1;
			} else if ($check_res == 20){
			       $type = 2;
			} else if ($check_res == 30){
				   $type = 0;
			} else {
			       $type = 3;
			}
			
			if (empty($exam_id) && !empty($target_id)) {
				$data = array('username' => $username,
							  'target_id' => $target_id,
							  'course_id' => $course_id,
							  'start' => 0,
							  'part' => $part,
							  'chapter_id' => $chapter_id,
							  'section' => $section,
							  'right_wrong' => $result);
				 $ret = $this->_complete_model->set($data, $type);
			}
		    LibAjaxResponse::convertData(1);
		    exit();
		} else {
		   LibAjaxResponse::convertData(1);
		   exit();
		}
	}
	
	//添加课程
	public function actionAddCourse() {
		$course_id = Yii::app()->request->getParam('course_id');
	    $username = Yii::app()->request->getParam('username');
		//添加课程
		$ret = $this->_user_course_model->addCourse(array('username' => $username, 'course_id' => $course_id));
		if ($ret) {
		    $response = array ('code' => 0, 'msg'  => '', 'result'  => 1);
	        echo json_encode($response);
		} else {
			$response = array ('code' => 1, 'msg'  => 'error', 'result'  => 0);
	        echo json_encode($response);
		}
	}
	
	private function _getTypeText($id) {
	   $ret = '';
	   $r1 = strpos($id, '1');
	   $r2 = strpos($id, '2');
	   $r3 = strpos($id, '3');
	   if ($r1 === false) {
	   	  $ret.= ' AND type != \'单选\'';
	   }
	   if ($r2 === false) {
	   	  $ret.= ' AND type !=\'多选\'';
	   }
	   if ($r3 === false) {
	   	  $ret.= ' AND type !=\'判断\'';
	   }
	   return $ret;
	}
}