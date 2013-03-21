<?php
/**
 * ModQuestion 试题
 * @author 符圣前<fushengqian@yeah.net>
 * @date   2012-02-18
 * @version 1.0.0
 */
class ModQuestion extends Model {
	
	function __construct() {
		Yii::import('lib.UCLibPDOFactory', true);
		Yii::import("conf.confDB",true);
		return $this;
	}
	
	public function addData($arr_data) {
		$ret = false;
		if (!empty($arr_data['course_id']) || !empty($arr_data['title'])) {
		    $arr_data['status'] = 1;
		    $arr_data['create_time'] = MICRO_TIME;
		    $arr_data['update_time'] = MICRO_TIME;
			$o_pdo = $this->_getPDO('question');
			
			$ret = $o_pdo->insert($arr_data);
		}
		if($ret === false) {
			return false;
		}
		return $ret;
	}
	
	/**
     * @desc   获取试题列表
     * @parsms array $where   key=>value形式
     *         string $field
     *         integer $offset
     *         integer $limit
     *         string $orderby
     *         string $order
     * @return array|boolean
     */
    public function getDataList($where = array(), $field = null, $offset = 0, $limit = 1, $orderby = 'id', $order = 'ASC') {
        if (false === $o_pdo = $this->_getPDO('question')) {
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

        $sql = "SELECT $field FROM ".$o_pdo->database.".".$o_pdo->table." WHERE $_where $_limit";
        //echo $sql;die;
        $ret = $o_pdo->query_with_prepare($sql);
        
        $total_num = $this->getDataCounts($where);
        
        $data = array();
        if(!empty($ret[0])) {
        	foreach ($ret as $k=>$v) {
        		$data[$k]['id'] = $ret[$k]['id'];
		        $data[$k]['course_id'] = $ret[$k]['course_id'];
		        $data[$k]['part'] = $ret[$k]['part'];
		        $data[$k]['chapter_id'] = $ret[$k]['chapter_id'];
		        $data[$k]['section'] = $ret[$k]['section'];
		        $data[$k]['chapter_id'] = $ret[$k]['chapter_id'];
		        $data[$k]['type'] = '['.$ret[$k]['type'].']';
		        $data[$k]['title'] = str_replace("  ", "", $ret[$k]['title']);
		        $data[$k]['options'] = unserialize($ret[$k]['options']);
		        $data[$k]['answer'] = $ret[$k]['answer'];
		        $data[$k]['analysis'] = !empty($ret[$k]['analysis'])?$ret[$k]['analysis']:'抱歉，暂无解析。';
		        $data[$k]['order'] = $offset;
		        $data[$k]['total_num'] = (int)$total_num;
        	}
	    }
        return $data;
    }

    /**
     * @desc   获取试题列表
     * @parsms array $where   key=>value形式
     *         string $field
     *         integer $offset
     *         integer $limit
     *         string $orderby
     *         string $order
     * @return array|boolean
     */
    public function getQuestionList($where = array(), $field = null, $offset = 0, $limit = 1, $orderby = 'id', $order = 'ASC') {
        if (false === $o_pdo = $this->_getPDO('question')) {
            return false;
        }
        $field = (is_null($field)) ? '*' : $field;
        $type = !empty($where['type'])?$where['type']:'';
        $id_not_in = !empty($where['id_not_in'])?$where['id_not_in']:'';
		unset($where['type']);
		unset($where['id_not_in']);
        $_where = $_and = '';
        foreach ($where as $k => $v) {
	         $_where .= $_and . ($k . '=\'' . $v . '\'');
	         $_and = ' AND ';
        }

        $_limit = is_null($offset) ? '' : ' LIMIT '.$offset.', '.$limit.'';
        $_orderby = is_null($orderby) ? '' : ' ORDER BY '.$orderby.' '.$order.'';
		     
        $sql = "SELECT $field FROM ".$o_pdo->database.".".$o_pdo->table." WHERE $_where $id_not_in $type $_limit";
        //echo $sql;die;
        $ret = $o_pdo->query_with_prepare($sql);
        
        $total_num = $this->getDataCounts($where);
        
        $data = array();
        if(!empty($ret[0])) {
        	foreach ($ret as $k=>$v) {
        		$data[$k]['id'] = $ret[$k]['id'];
		        $data[$k]['course_id'] = $ret[$k]['course_id'];
		        $data[$k]['part'] = $ret[$k]['part'];
		        $data[$k]['chapter_id'] = $ret[$k]['chapter_id'];
		        $data[$k]['section'] = $ret[$k]['section'];
		        $data[$k]['chapter_id'] = $ret[$k]['chapter_id'];
		        $data[$k]['type'] = '['.$ret[$k]['type'].']';
		        $data[$k]['title'] = str_replace("  ", "", $ret[$k]['title']);
		        //正则匹配
		        $data[$k]['title'] = preg_replace('/（.*?）/', '（</p><h1>'.$ret[$k]['answer'].'</h1>）', $data[$k]['title'], 1);
		        $data[$k]['title'] = str_replace('（）', '（</p><h1>'.$ret[$k]['answer'].'</h1>）', $data[$k]['title']);
		        $data[$k]['options'] = unserialize($ret[$k]['options']);
		        $data[$k]['answer'] = $ret[$k]['answer'];
		        $data[$k]['analysis'] = !empty($ret[$k]['analysis'])?$ret[$k]['analysis']:'抱歉，暂无解析。';
		        $data[$k]['order'] = $offset;
		        $data[$k]['total_num'] = (int)$total_num;
        	}
	    }
        return $data;
    }
    
    public function getOneQuestion($where = array(), $field = null, $offset = 0, $limit = 1, $orderby = 'id', $order = 'ASC') {
		if (empty($where['course_id'])) {
		    return array();
		}
		
		if (false === $o_pdo = $this->_getPDO('question')) {
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

        $sql = "SELECT $field FROM ".$o_pdo->database.".".$o_pdo->table." WHERE $_where $_limit";
        //echo $sql;die;
        $ret = $o_pdo->query_with_prepare($sql);
		$data = array();
        if(!empty($ret[0])) {
	        $data['id'] = $ret[0]['id'];
	        $data['course_id'] = $ret[0]['course_id'];
	        $data['part'] = $ret[0]['part'];
	        $data['chapter_id'] = $ret[0]['chapter_id'];
	        $data['section'] = $ret[0]['section'];
	        $data['chapter_id'] = $ret[0]['chapter_id'];
	        $data['type'] = '['.$ret[0]['type'].']';
	        $data['title'] = str_replace("  ", "",strip_tags(($offset+1).'.'.$ret[0]['title']));
	        $data['options'] = unserialize($ret[0]['options']);
	        $data['answer'] = $ret[0]['answer'];
	        $data['analysis'] = !empty($ret[0]['analysis'])?$ret[0]['analysis']:'0';
            $data['next'] = $offset+1;
	        $data['prev'] = $offset-1;
	        if(intval($data['prev']) < 0) {
	        	$data['prev'] = '#';
	        }
	    }
        return $data;
	}
	
   public function getQuestionDetail($where = array(), $field = null, $offset = 0, $limit = 1, $orderby = 'id', $order = 'ASC', $qid=0) {
		if (empty($where['course_id'])) {
		    return array();
		}
		
		if (false === $o_pdo = $this->_getPDO('question')) {
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

        $sql = "SELECT $field FROM ".$o_pdo->database.".".$o_pdo->table." WHERE $_where $_orderby $_limit";
        //echo $sql;die;
        $ret = $o_pdo->query_with_prepare($sql);
		$data = array();
        if(!empty($ret[0])) {
	        $data['id'] = $ret[0]['id'];
	        $data['course_id'] = $ret[0]['course_id'];
	        $data['part'] = $ret[0]['part'];
	        $data['chapter_id'] = $ret[0]['chapter_id'];
	        $data['section'] = $ret[0]['section'];
	        $data['chapter_id'] = $ret[0]['chapter_id'];
	        $data['type'] = '['.$ret[0]['type'].']';
	        $data['title'] = str_replace("  ", "",strip_tags(($qid+1).'.'.$ret[0]['title']));
	        $data['options'] = unserialize($ret[0]['options']);
	        $data['answer'] = $ret[0]['answer'];
	        $data['analysis'] = !empty($ret[0]['analysis'])?$ret[0]['analysis']:'0';
            $data['next'] = $offset+1;
	        $data['prev'] = $offset-1;
	        if(intval($data['prev']) < 0) {
	        	$data['prev'] = '#';
	        }
	    }
        return $data;
	}
    
	/**
     * @desc   总数
     * @param  $where  array
     * @return int
     * */
    public function getDataCounts($where = array()) {
    	if (false === $o_pdo = $this->_getPDO('question')) {
            return false;
        }
        $_where = $_and = '';
        foreach ($where as $k => $v) {
            $_where .= $_and . $k . '=' . $v;
            $_and = ' AND ';
        }
        
        if (empty($_where)) {
        	$_where = '1=1';
        }
        
        $sql = "SELECT COUNT(id) AS cnt FROM ".$o_pdo->database.".".$o_pdo->table." WHERE $_where";
        $ret = $o_pdo->query_with_prepare($sql);

        if (false === $ret){ 
        	$this->_errno = 1001;	
        }
        return $ret[0]['cnt'];
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
