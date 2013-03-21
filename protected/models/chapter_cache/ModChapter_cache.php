<?php
/**
 * ModUser 章节模块
 * @author 符圣前<fushengqian@qq.com>
 * @date   2012-10-27
 * @version 1.0.0
 */
class ModChapter_cache extends Model {
	
	function __construct() {
		Yii::import('lib.UCLibPDOFactory', true);
		Yii::import("conf.confDB",true);
		return $this;
	}
	
	public function addData($arr_data) {
		$ret = false;
		if (!empty($arr_data['course_id']) && !empty($arr_data['data'])) {
		    $arr_data['create_time'] = MICRO_TIME;
		    $arr_data['update_time'] = MICRO_TIME;
			$o_pdo = $this->_getPDO('chapter_cache');
			$ret = $o_pdo->insert($arr_data);
		}
		if($ret === false) {
			return false;
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
    public function getDataList($where = array(), $field = null, $offset = 0, $limit = 1, $orderby = null, $order = 'ASC') {
        if (false === $o_pdo = $this->_getPDO('chapter_cache')) {
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
