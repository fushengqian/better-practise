<?php
/**
 * ModComplete 用户完成模块
 * @author 符圣前<fushengqian@qq.com>
 * @date   2012-10-27
 * @version 1.0.0
 */
class ModComplete extends Model {
	
	function __construct() {
		Yii::import('lib.UCLibPDOFactory', true);
		Yii::import("conf.confDB",true);
		return $this;
	}
	
   /**
     * @desc   获取数据列表
     * @parsms array $where   key=>value形式
     *         string $field
     *         integer $offset
     *         integer $limit
     *         string $orderby
     *         string $order
     * @return array|boolean
     */
    public function getDataList($where = array(), $field = null, $offset = 0, $limit = 100, $orderby = null, $order = 'ASC') {
        if (false === $o_pdo = $this->_getPDO('complete')) {
            return false;
        }
        $field = (is_null($field)) ? '*' : $field;

        $_where = $_and = '';
        foreach ($where as $k => $v) {
	         $_where .= $_and . ($k . '=\'' . $v . '\'');
	         $_and = ' AND ';
        }

        $_limit = is_null($offset) ? '' : ' LIMIT '.$offset.', '.$limit.'';
        $_orderby = is_null($orderby) ? '' : ' ORDER BY '.$orderby.' '.$order.'';
        
        if (empty($_where)) {
        	$_where = '1=1';
        }

        $sql = "SELECT $field FROM ".$o_pdo->database.".".$o_pdo->table." WHERE $_where $_orderby $_limit";
        
        $ret = $o_pdo->query_with_prepare($sql);
       
        return $ret;
    }
	
/**
	 * @desc    设置
	 * @params  $arr
	 *          $type  1:错题数量-1   对题数量+1
	 * @return  成功 true |失败 array
	 * */
	public function set($data, $type=1) {
	    if(empty($data['username']) || empty($data['course_id']) || empty($type)) {
			return;
		}
	    if (false === $o_pdo = $this->_getPDO('complete')) {
            return false;
        }
		
		$arr = $this->getDataList(array('target_id'=>$data['target_id'], 'username'=>$data['username'], 'is_delete'=>0));
		if (empty($arr)) {
		    //章节的
		    if (intval($data['right_wrong']) == 1) {
		       $right_num = 1;
		       $wrong_num = 0;
		    } else {
		       $right_num = 0;
		       $wrong_num = 1;
		    }
		    //插入记录
		    $arr_data = array('username' =>$data['username'], 'course_id'=>$data['course_id'],'target_id'=>$data['target_id'],
						  'part'=>$data['part'], 'chapter_id'=>$data['chapter_id'],'section'=>$data['section'],'complete_num'=>1,
						  'type'=>1,'is_delete'=>0,'right_num'=>$right_num,'wrong_num'=>$wrong_num,'create_time'=>(int)MICRO_TIME, 'update_time'=> (int)MICRO_TIME);
		    $ret = $o_pdo->insert($arr_data);
		    //课程的
		    $arr_course = $this->getDataList(array('course_id'=>$data['course_id'], 'username'=>$data['username'], 'type' => 2,'is_delete'=>0));
		    if (empty($arr_course)) {
			   if (intval($data['right_wrong']) == 1) {
			       $right_num = 1;
			       $wrong_num = 0;
		       } else {
			       $right_num = 0;
			       $wrong_num = 1;
		       }
		    
		       $arr_data = array('username' =>$data['username'], 'course_id'=>$data['course_id'], 'target_id'=>0,
						  'part'=>$data['part'], 'chapter_id'=>$data['chapter_id'],'section'=>$data['section'],'complete_num'=>1,
						  'type'=>2,'is_delete'=>0,'right_num'=>$right_num,'wrong_num'=>$wrong_num,'create_time'=>(int)MICRO_TIME, 'update_time'=> (int)MICRO_TIME);
		       $ret = $o_pdo->insert($arr_data);
		   } else {
		       if (intval($data['right_wrong']) == 1) {
		          $right_num = $arr_course[0]['right_num'] + 1;
		       } else {
		          $wrong_num = $arr_course[0]['wrong_num'] + 1;
		       }
		       $complete_num = $arr_course[0]['complete_num'] + 1;
		       $o_pdo->update(array('right_num'=>$right_num, 'wrong_num'=>$wrong_num, 'update_time'=> time()), array('course_id'=>$data['course_id'], 'username'=>$data['username'], 'type' => 2,'is_delete'=>0));
		   }
		} else {
		    //章节的
           if($type == 1){
			      $right_num = $arr[0]['right_num'] + 1;
			      $wrong_num = $arr[0]['wrong_num'] - 1;
           		  $o_pdo->update(array('right_num'=>$right_num, 'wrong_num'=>$wrong_num, 'update_time'=> time()), array('target_id'=>$data['target_id'],'username'=>$data['username'], 'is_delete'=>0));
		   } else if ($type == 2) {
		          $right_num = $arr[0]['right_num'] - 1;
			      $wrong_num = $arr[0]['wrong_num'] + 1;
           		  $o_pdo->update(array('right_num'=>$right_num, 'wrong_num'=>$wrong_num, 'update_time'=> time()), array('target_id'=>$data['target_id'], 'username'=>$data['username'], 'is_delete'=>0));
		   } else {
		          $complete_num = $arr[0]['complete_num'] + 1;
			      if (intval($data['right_wrong']) == 1) {
			         $right_num = $arr[0]['right_num'] + 1;
					 $wrong_num = $arr[0]['wrong_num'];
			      } else {
			         $wrong_num = $arr[0]['wrong_num'] + 1;
					 $right_num = $arr[0]['right_num'];
			      }
           		  $o_pdo->update(array('right_num'=>$right_num, 'complete_num'=>$complete_num,'wrong_num'=>$wrong_num, 'update_time'=> time()), array('target_id'=>$data['target_id'], 'username'=>$data['username'], 'is_delete'=>0));
		    }
		    
		    //课程的
		    $arr_course = $this->getDataList(array('course_id'=>$data['course_id'], 'username'=>$data['username'], 'type' => 2,'is_delete'=>0));
		    if (!empty($arr_course)) {
		        if($type == 1) {
		           //原先做错了，现在做对了
		           $right_num = $arr_course[0]['right_num'] + 1;
			       $wrong_num = $arr_course[0]['wrong_num'] - 1;
			       $o_pdo->update(array('right_num'=>$right_num,'wrong_num'=>$wrong_num, 'update_time'=> time()), array('course_id'=>$data['course_id'], 'username'=>$data['username'], 'type' => 2,'is_delete'=>0));
		        } else if ($type == 2) {
		           //原先做对了，现在做错了
		           $right_num = $arr_course[0]['right_num'] - 1;
			       $wrong_num = $arr_course[0]['wrong_num'] + 1;
			       $o_pdo->update(array('right_num'=>$right_num,'wrong_num'=>$wrong_num, 'update_time'=> time()), array('course_id'=>$data['course_id'], 'username'=>$data['username'], 'type' => 2,'is_delete'=>0));
		        } else {
		           //新做的
		           $complete_num = $arr_course[0]['complete_num'] + 1;
			       if (intval($data['right_wrong']) == 1) {
			          $right_num = $arr_course[0]['right_num'] + 1;
			       } else {
			          $wrong_num = $arr_course[0]['wrong_num'] + 1;
			       }
			       $o_pdo->update(array('right_num'=>$right_num, 'complete_num'=>$complete_num,'wrong_num'=>$wrong_num, 'update_time'=> time()), array('course_id'=>$data['course_id'], 'username'=>$data['username'], 'type' => 2,'is_delete'=>0));
		        }
		   }
	    }
	    return 1;
	}
    
	//获取完成数量
	public function getCompleteNum($username, $course_id, $target_id) {
		$course = array('complete_num'=> 0, 'right_num' => 0);
		$chapter = array('complete_num'=> 0, 'right_num' => 0);
	    $ret = $this->getDataList(array('username' =>$username, 'course_id'=>$course_id,'is_delete'=>0));
	    !is_array($ret) && $ret = array();
	    foreach ($ret as $v) {
	       //课程的
	       if ((int)$v['type'] == 2) {
	       	  $course = array('complete_num'=> $v['complete_num'], 'right_num' => $v['right_num']);
	       }
	       
	       //章节的
	       if ((int)$v['target_id'] == (int)$target_id) {
	          $chapter = array('complete_num'=> $v['complete_num'], 'right_num' => $v['right_num']);
	       }
	    }
	    return array('course' => $course, 'chapter' => $chapter);
	}
	
	//移除错题后处理
	public function afterRemove($data,$num = 1) {
		if (empty($data['target_id']) || empty($data['username'])) {
		   return;
		}
		$o_pdo = $this->_getPDO('complete');
	   	$sql = "UPDATE ".$o_pdo->database.".".$o_pdo->table." SET update_time='".time()."',right_num=right_num+'".$num."',wrong_num=wrong_num-'".$num."' WHERE username='".$data['username']."' AND target_id='".$data['target_id']."' AND course_id='".$data['course_id']."' AND is_delete = 0";
        $ret = $o_pdo->exec_with_prepare($sql);
	    return true;
	}
	
	private function _getPDO($tagname) {
		if(empty($tagname)) {
			$this->_errno = 1003;
			return false;
		}
		$o_pdo = UCLibPDOFactory::getPDO($tagname, null, "getDbConf");
		return $o_pdo;
	}
}
