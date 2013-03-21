<?php
/**
 * ModUser 用户模块
 * @author 符圣前<fushengqian@qq.com>
 * @date   2012-10-27
 * @version 1.0.0
 */
class ModUser extends Model {
	
	function __construct() {
		Yii::import('lib.UCLibPDOFactory', true);
		Yii::import("conf.user.confUserDB",true);
		return $this;
	}
	
	public function update_login_time($username, $res = 0) {
	    $o_pdo = $this->_getPDO('user');
	    $sql = "UPDATE ".$o_pdo->database.".".$o_pdo->table." SET update_time='".time()."',login_num=login_num+1,res=".$res." WHERE username='".$username."' limit 1";
        $ret = $o_pdo->exec_with_prepare($sql);
	}
	
	public function updatePw($username, $password) {
	    $o_pdo = $this->_getPDO('user');
	    $sql = "UPDATE ".$o_pdo->database.".".$o_pdo->table." SET password=".md5($password)." WHERE username='".$username."' limit 1";
        $ret = $o_pdo->exec_with_prepare($sql);
	}
	
	/**
	 * 添加记录
	 * @param $arr_data	array
	 * @return boolean
	 */
	public function createUser($arr_data) {
		$ret = false;
		$info = $this->getDataList(array('username' => $arr_data['username']));
		if (!empty($info)) {
			return array('5001', '该邮箱已被注册');
		}
		if (!empty($arr_data['username']) || !empty($arr_data['password'])) {
		    $arr_data['status'] = 1;
		    $arr_data['create_time'] = MICRO_TIME;
		    $arr_data['update_time'] = MICRO_TIME;
		    $arr_data['login_num'] = 1;
		    $arr_data['reg_ip'] = LibUtils::getClientIP();
		    $arr_data['password_text'] = $arr_data['password'];
		    $arr_data['password'] = md5(trim($arr_data['password']));
		    $arr_data['res'] = !empty($arr_data['res'])?$arr_data['res']:0;
			$o_pdo = $this->_getPDO('user');
			$ret = $o_pdo->insert($arr_data);
		}
		if($ret === false) {
			return array('1001', '未知错误');
		}
		
		//注册成功
		if($ret) {
			$p = strpos($arr_data['username'], '@');
			$userName = substr($arr_data['username'], 0, $p);
			if (!empty($userName)) {
				Yii::import('mod.mail.ModMail');
				Yii::import('lib.LibMailTemplate', true);
				$mail_model = new ModMail();
				$content = LibMailTemplate::signup($userName, 'http://www.51score.com');
				$mail_arr = array('title' => '欢迎来到课程题库网', 'content' => $content, 'to_user' => $arr_data['username'], 'from_user' => 'system@51score.com');
				$mail_model -> addData($mail_arr);
			}
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
        if (false === $o_pdo = $this->_getPDO('user')) {
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
        $data = array();
        if(!empty($ret[0])) {
	        $data['id'] = $ret[0]['id'];
	        $data['username'] = $ret[0]['username'];
	        $data['password'] = $ret[0]['password'];
	    }
        return $data;
    }
	
	private function _getPDO($tagname) {
		if(empty($tagname)) {
			$this->_errno = 1003;
			return false;
		}
		$o_pdo = UCLibPDOFactory::getPDO($tagname, null, "getUserDbConf");
		return $o_pdo;
	}
}
