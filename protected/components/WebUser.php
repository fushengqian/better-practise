<?php
/**
 * @author    符圣前 <fushengqian@yeah.net>
 * @version   0.0.1  2012/02/10
 */
class WebUser extends CWebUser implements IWebUser {
	private $_usession;
	private $_info;
	private $_username;
	private $_error;

	const USER_SESSION_TOKEN = '51score_token';
	const USER_SESSION_ACCOUNT = '51score_account';
	const USER_SESSION_TIMESTAMP = '51score_time_stamp';
	const USER_SESSION_KEY = 'ELKD9878hdssds398ER';
	const USER_SESSION_TIMEOUT = 28800;
	const USER_AUTOLOGIN_SESSION_TIMEOUT = 2592000;
	
	/**
	 * @desc	验证用户登录
	 * @params	string	$username	
	 * 			string	$password
	 * 			string	$captcha
	 * 			string	$errmsg
	 * 			boolean $auto_login
	 * */
	public function validateLogin($username, $password, $captcha, &$errmsg, $auto_login=false) {
		//empty
	}
	
	public function checkLogined($auto_redirect = true) {
		if( !empty($_SESSION[self::USER_SESSION_ACCOUNT])) {
			return true;
		}
		if( $auto_redirect) {
			header('Location: /');
			exit();
		}
		return false;
	}
	
	public function getUsername() {
		if( !empty($_SESSION[self::USER_SESSION_ACCOUNT])) {
			return $_SESSION[self::USER_SESSION_ACCOUNT];
		}
		return '';
	}

	/**
	 * @target 用户登出
	 * @param boolean $auto_redirect
	 * @return void
	 */
	public function logout($auto_redirect = false) {
		$this->_finiLoginedUserInfo();
		$this->_unsetLogin();
		return true;
	}

	public function getLastError() {
		return $this->_error;
	}

	private function _unsetLogin() {
		
		if (!empty($_SESSION)) {
			unset($_SESSION[self::USER_SESSION_ACCOUNT]);
			unset($_SESSION[self::USER_SESSION_TIMESTAMP]);
		}
		$_SESSION = array();

		setcookie(self::USER_SESSION_TOKEN, '', time() - 86400, '/', COOKIE_DOMAIN);
		setcookie(self::USER_SESSION_ACCOUNT, '', time() - 86400, '/', COOKIE_DOMAIN);
		setcookie(self::USER_SESSION_TIMESTAMP, '', time() - 86400, '/', COOKIE_DOMAIN);
	}

	public function setLogin($username, $password, $auto_login= false) {
		$this->logout();
		
		Yii::import('mod.user.ModUser');
	    $user_model = new ModUser();
	    $uinfo = $user_model->getDataList(array('username'=>$username, 'password'=>md5($password)));
	    if (!empty($uinfo)) {
		    $this->_info = $uinfo;
		    $this->_username = $uinfo['username'];
	    } else {
	        return false;
	    }
		
		if ( !$auto_login ) {
			$cookie_life = 0;
			$expire_tm = time()+self::USER_SESSION_TIMEOUT;
		} else {
			$expire_tm = time()+self::USER_AUTOLOGIN_SESSION_TIMEOUT;
			$cookie_life = $expire_tm;
		}
        
		$token = md5('4FFseEDSfghh64DFG');
		
		$_SESSION[self::USER_SESSION_TOKEN] = LibUtils::urltrim_base64_encode($token);

		$_SESSION[self::USER_SESSION_ACCOUNT] = $this->_username;
		$_SESSION[self::USER_SESSION_TIMESTAMP] = $expire_tm;

		setcookie(self::USER_SESSION_TOKEN, LibUtils::urltrim_base64_encode($token), $cookie_life, '/', COOKIE_DOMAIN);

		setcookie(self::USER_SESSION_ACCOUNT, $this->_username, $cookie_life, '/', COOKIE_DOMAIN);
		setcookie(self::USER_SESSION_TIMESTAMP, $expire_tm, $cookie_life, '/', COOKIE_DOMAIN);

		//登录成功
		if (strlen($username) >1 ) {
	    	$user_model->update_login_time($username, 1);
	    }
		return true;
	}

	private function _finiLoginedUserInfo() {
		$this->_info = null;
		unset(Yii::app()->session['__uinfo']);
	}

	public function __set($nm, $val)
	{
		$this->_finiLoginedUserInfo();
	}

	/**
	 * @target 清除session cache
	 * @return void
	 */
	public function resetInfo()
	{
		$this->_finiLoginedUserInfo();
	}

	/**
	 * @target: 判断用户是否登录
	 * @return void
	 */
	function isLogined($auto_redirect = false) {
		//empty
	}
}
