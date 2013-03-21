<?php
/**
 * ModUser 用户课程模块
 * @author 符圣前<fushengqian@qq.com>
 * @date   2012-10-27
 * @version 1.0.0
 */
class ModUser_course extends Model {
	
	function __construct() {
		Yii::import('lib.UCLibPDOFactory', true);
		Yii::import("conf.confDB",true);
		return $this;
	}
	
	/**
	 * 添加记录
	 * @param $arr_data	array
	 * @return boolean
	 */
	public function addCourse($arr_data) {
		$ret = false;
		
	    //是否已经添加
		$data = $this->getDataList(array('username' => $arr_data['username'], 'course_id'=> $arr_data['course_id'], 'is_add' => 1));
		if (!empty($data)) {
		   return 1;
		}
		
		//添加总数是否已经达到上限
		if (count($data) > 12) {
		   	$response = array ('code' => 1, 'msg'  => '课程数量已达12门上限', 'result'  => 0);
	        echo json_encode($response);die;
		}
        
		//是否重新添加
		$re_add = $this->getDataList(array('username' => $arr_data['username'], 'course_id'=> $arr_data['course_id'], 'is_add' => 0));
		if (!empty($re_add)) {
		    $o_pdo = $this->_getPDO('user_course');
			$ret = $o_pdo->update(array('is_add'=>1, 'create_time'=>time()), array('username' => $arr_data['username'], 'course_id'=> $arr_data['course_id']));
			return (int)$ret;
		}
		
		if (!empty($arr_data['username']) && !empty($arr_data['course_id'])) {
		    $arr_data['create_time'] = MICRO_TIME;
		    $arr_data['is_add'] = 1;
		    $arr_data['is_open'] = 2;
		    $arr_data['is_delete'] = 0;
			$o_pdo = $this->_getPDO('user_course');
			$ret = $o_pdo->insert($arr_data);
		}

		if($ret === false) {
			return false;
		}
		return $ret;
	}
	
	/**
	 * @desc    删除课程
	 * @params  $user_id
	 *          $course_id
	 * @return  boolean
	 * */
	public function deleteCourse($username, $course_id) {
		if (empty($username) || empty($course_id)) {
		   return false;
		}

		$o_pdo = $this->_getPDO('user_course');
		$ret = $o_pdo->update(array('is_add'=>0),array('username'=>$username,'course_id'=>$course_id));
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
    public function getDataList($where = array(), $field = null, $offset = 0, $limit = 12, $orderby = null, $order = 'ASC') {
        if (false === $o_pdo = $this->_getPDO('user_course')) {
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
	
	private function _getPDO($tagname) {
		if(empty($tagname)) {
			$this->_errno = 1003;
			return false;
		}
		$o_pdo = UCLibPDOFactory::getPDO($tagname, null, "getDbConf");
		return $o_pdo;
	}
}
