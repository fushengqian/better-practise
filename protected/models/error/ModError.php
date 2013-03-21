<?php
/**
 * ModComplete 错题模块
 * @author 符圣前<fushengqian@qq.com>
 * @date   2012-10-27
 * @version 1.0.0
 */
class ModError extends Model {
	
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
    public function getDataList($where = array(), $field = null, $offset = 0, $limit = 1, $orderby = null, $order = 'ASC') {
        if (false === $o_pdo = $this->_getPDO('user_question')) {
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

	//检查是否存在
	public function checkAndAdd($arr) {
		if (empty($arr['username']) || empty($arr['question_id'])) {
		    return;
		}
        
	    if (false === $o_pdo = $this->_getPDO('user_question')) {
            return false;
        }
		
        $sql = "SELECT * FROM ".$o_pdo->database.".".$o_pdo->table." WHERE username = '".$arr['username']."' AND question_id = '".$arr['question_id']."' AND is_delete = 0 limit 1";
        $data = $o_pdo->query_with_prepare($sql);

		//如果已经存在，更新次数
		if (!empty($data)) {
		   if ((int)$data[0]['right_wrong'] == 0 && intval($arr['right_wrong']) == 1) {
		   	  //原来做错了，现在做对了
		      $o_pdo->update(array('right_wrong'=>1, 'error_num'=>$data[0]['error_num']-1, 'update_time'=> time()), array('username'=>$arr['username'], 'question_id'=> $arr['question_id']));
		      return 10;
		   } else if((int)$data[0]['right_wrong'] == 1 && intval($arr['right_wrong']) == 0) {
		   	  //原来最对的，现在做错了
		      $o_pdo->update(array('right_wrong'=>0, 'error_num'=>$data[0]['error_num']+1, 'update_time'=> time()), array('username'=>$arr['username'], 'question_id'=> $arr['question_id']));
		      return 20;
		   } else {
		   	  //已经做过，并且原来是对的，现在也做对了（或原来做错了，现在也做错了）
		      return 30;
		   }
		}
		
		if (intval($arr['right_wrong']) !== 1) {
		   $error_num = 1;
		} else {
		   $error_num = 0;
		}
		
		$arr_data = array('username' =>$arr['username'], 'question_id'=>$arr['question_id'], 'course_id'=>$arr['course_id'],
						  'part'=>$arr['part'], 'chapter_id'=>$arr['chapter_id'],'section'=>$arr['section'],'right_wrong'=>$arr['right_wrong'],
						  'answer'=>$arr['answer'],'error_num'=>$error_num,'is_delete'=>0,'create_time'=>(int)MICRO_TIME, 'update_time'=> (int)MICRO_TIME);
		$ret = $o_pdo->insert($arr_data);
		return $ret;
	}
	
	//获取错题
	public function getDataDetail($course_id, $part, $chapter_id, $section, $username, $order) {
	   if (!empty($section)) {
	   	   $data = $this->_pdo->find('course_id = "'.$course_id.'" and part = "'.$part.'" and chapter_id = "'.$chapter_id.'" and section = "'.$section.'" and username = "'.$username.'" and right_wrong = 0', 'id', 1, abs($order));
	   } else {
	       $data = $this->_pdo->find('course_id = "'.$course_id.'" and part = "'.$part.'" and chapter_id = "'.$chapter_id.'" and username = "'.$username.'" and right_wrong = 0', 'id', 1, abs($order));
	   }
	   $ret = array();
	   if (!empty($data[0]->question_id)) {
	       $ret = $this->_question_service ->getQuestionDetail($data[0]->question_id, $order);
	       $ret['uAnswer'] = $data[0]->answer;
	   }
       return $ret;
	}
	
	private function _getPDO($tagname) {
		if(empty($tagname)) {
			$this->_errno = 1003;
			return false;
		}
		$o_pdo = UCLibPDOFactory::getPDO($tagname, null, "getErrorDbConf");
		return $o_pdo;
	}
}
