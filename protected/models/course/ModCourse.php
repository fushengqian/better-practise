<?php
/**
 * ModQuestion 课程
 * @author 符圣前<fushengqian@yeah.net>
 * @date   2012-10-25
 * @version 1.0.0
 */
class ModCourse extends Model {
	
	function __construct() {
		Yii::import('lib.UCLibPDOFactory', true);
		Yii::import("conf.confDB",true);
		Yii::import('mod.course_type.ModCourse_type');
		return $this;
	}
	
	/**
	 * @desc  搜索课程
	 * @param $keyword
	 * */
	public function searchCourse($keyword) {
	    if (false === $o_pdo = $this->_getPDO('course')) {
            return false;
        }
		
        $sql = "SELECT * FROM ".$o_pdo->database.".".$o_pdo->table." WHERE name like '%$keyword%' limit 20";
        $ret = $o_pdo->query_with_prepare($sql);
        !is_array($ret) && $ret = array();
        foreach ($ret as &$v) {
           $v['course_id'] = $v['id'];
           $v['update_time'] = date("Y-m-d", $v['update_time']);
           $v['price'] = 35;
        }
        
        //通过分类查找
        if (empty($ret)) {
        	$model = new ModCourse_type();
        	$ret = $model ->getRefererCourseType($keyword);
			if (!empty($ret)) {
				$ret = $this->getDataList(array('course_type_id'=> $ret[0]['id']), null, 0, 20, null, 'DESC');
			}
        }
        return $ret;
	}
	
	//获取相关课程
	public function getRefererCourse($keyword) {
	    if (false === $o_pdo = $this->_getPDO('course')) {
            return false;
        }
		$sql = "SELECT * FROM ".$o_pdo->database.".".$o_pdo->table." WHERE name like '%$keyword%' limit 20";
        $ret = $o_pdo->query_with_prepare($sql);
        !is_array($ret) && $ret = array();
        foreach ($ret as &$v) {
          $v['course_id'] = $v['id'];
          $v['update_time'] = date("Y-m-d", $v['update_time']);
          $v['price'] = 35;
        }
        return $ret;
	}
	
    /**
     * @desc   获取课程列表
     * @parsms array $where   key=>value形式
     *         string $field
     *         integer $offset
     *         integer $limit
     *         string $orderby
     *         string $order
     * @return array|boolean
     */
    public function getDataList($where = array(), $field = null, $offset = 0, $limit = 100, $orderby = null, $order = 'DESC') {
        if (false === $o_pdo = $this->_getPDO('course')) {
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
        //echo $sql;die;
        $ret = $o_pdo->query_with_prepare($sql);
        !is_array($ret) && $ret = array();
        foreach ($ret as &$v) {
          $v['course_id'] = $v['id'];
          $v['update_time'] = date("Y-m-d", $v['update_time']);
          $v['price'] = 35;
        }
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
