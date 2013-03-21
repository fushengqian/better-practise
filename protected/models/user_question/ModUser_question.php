<?php
/**
 * ModUser 用户题目模块
 * @author 符圣前<fushengqian@qq.com>
 * @date   2012-10-29
 * @version 1.0.0
 */
class ModUser_question extends Model {
	
	public function __construct() {
		Yii::import('lib.UCLibPDOFactory', true);
		Yii::import("conf.confDB",true);
		Yii::import('mod.question.ModQuestion');
		return $this;
	}
	
	//移除错题
	public function remove($question_id, $username) {
	   $arr = explode(',', $question_id);
	   empty($arr) && $arr = array();
	   foreach ($arr as $v) {
	   	    $o_pdo = $this->_getPDO('user_question');
	   	    $o_pdo->update(array('right_wrong' => 0), array('question_id'=>$v, 'username'=>$username));
	   }
	   return 1;
	}
	
	/**
	 * 添加记录
	 * @param $arr_data	array
	 * @return boolean
	 */
	public function add($arr_data) {
		$ret = false;
		if (!empty($arr_data['username']) && !empty($arr_data['question_id'])) {
		    //是否存在
		    $data = $this->getDataList(array('username'=>$arr_data['username'], 'question_id'=>$arr_data['question_id']));
		
			if (empty($data)) {
			    $arr_data['course_id'] = $arr_data['course_id'];
			    $arr_data['chapter_id'] = $arr_data['chapter_id'];
			    $arr_data['section'] = $arr_data['section'];
			    $arr_data['question_id'] = $arr_data['question_id'];
			    $arr_data['answer'] = $arr_data['answer'];
			    $arr_data['right_wrong'] = $arr_data['right_wrong'];
			    $arr_data['error_num'] = ($arr_data['right_wrong']==1)?0:1;
			    $arr_data['create_time'] = MICRO_TIME;
			    $arr_data['update_time'] = MICRO_TIME;
			    $arr_data['is_delete'] = 0;
				$o_pdo = $this->_getPDO('user_question');
				$ret = $o_pdo->insert($arr_data);
			} else {
			    if ((int)$arr_data['right_wrong'] !== 1) {
			    	//做错了
			    	$o_pdo = $this->_getPDO('user_question');
			    	$sql = "UPDATE ".$o_pdo->database.".".$o_pdo->table." SET update_time='".time()."',error_num=error_num+1,right_wrong=0 WHERE username='".$arr_data['username']."' AND question_id = '".$arr_data['question_id']."' limit 10";
			    	$ret = $o_pdo->exec_with_prepare($sql);
			    } else {
			    	//做对了
			    	$o_pdo = $this->_getPDO('user_question');
			    	$sql = "UPDATE ".$o_pdo->database.".".$o_pdo->table." SET update_time='".time()."',right_wrong=1 WHERE username='".$arr_data['username']."' AND question_id = '".$arr_data['question_id']."' limit 10";
			    	$ret = $o_pdo->exec_with_prepare($sql);
			    }
			}
		}
		if($ret === false) {
			return false;
		}
		return $ret;
	}
	
	
	//获取错题
	public function getDataDetail($course_id, $part, $chapter_id, $section, $username, $order) {
	   if (!empty($section)) {
	   	   $data = $this->getDataList(array('course_id'=>$course_id,'part'=>$part,'chapter_id'=>$chapter_id,'section'=>$section,'username'=>$username,'right_wrong'=>0),null,abs($order),1,'id');
	   } else {
	       $data = $this->getDataList(array('course_id'=>$course_id,'part'=>$part,'chapter_id'=>$chapter_id,'username'=>$username,'right_wrong'=>0),null,abs($order),1,'id');
	   }
	   $ret = array();
	   if (!empty($data[0]['question_id'])) {
	   	   $question_model = new ModQuestion;
	       $ret = $question_model ->getQuestionDetail(array('id'=>$data[0]['question_id'],'course_id'=>$course_id), $field = null, 0, $limit = 1, $orderby = 'id', 'ASC',abs($order));
	       $ret['next'] = $order+1;
	       $ret['prev'] = $order-1;
	       $ret['order'] = $order;
	   	   if(intval($ret['prev']) < 0) {
	        	$ret['prev'] = '#';
	       }
	       $ret['uAnswer'] = $data[0]['answer'];
	   }
       return $ret;
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
        if (false === $o_pdo = $this->_getPDO('user_question')) {
            return false;
        }
        $field = (is_null($field)) ? '*' : $field;

        $_where = $_and = '';
        $update_time = !empty($where['update_time'])?$where['update_time']:'';
        unset($where['update_time']);
        foreach ($where as $k => $v) {
	         $_where .= $_and . ($k . '=\'' . $v . '\'');
	         $_and = ' AND ';
        }

        $_limit = is_null($offset) ? '' : ' LIMIT '.$offset.', '.$limit.'';
        $_orderby = is_null($orderby) ? '' : ' ORDER BY '.$orderby.' '.$order.'';
        
        if (empty($_where)) {
        	$_where = '1=1';
        }
		
        //10分钟前的错题
        if (!empty($update_time)) {
        	$_where.= ' AND update_time <= '.intval(time()-600);
        }
        
        $sql = "SELECT $field FROM ".$o_pdo->database.".".$o_pdo->table." WHERE $_where $_orderby $_limit";
        //echo $sql;die;
        $ret = $o_pdo->query_with_prepare($sql);
      
        return $ret;
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
