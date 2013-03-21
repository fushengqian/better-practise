<?php
/**
 * @author    符圣前 <fushengqian@yeah.net>
 * @version   0.0.1  2012.02.10
 */
class Controller extends CController {
	
	private   $_pb       = null;	//页面渲染工具
	protected $_userinfo = null;	//用户信息
	protected $_applist  = null;	//APP列表
	protected $_hasLogin = false;	//是否登录

	const DEFAULT_CSS = 'css';

	public function __construct($id = null, $module = null) {
		parent::__construct($id, $module);
		if (Yii::app()->user->checkLogined(false)) {
			$this->_hasLogin = true;
		}
	}

	public function init($jsType = 'default') {
		parent::init();
		Yii::import('conf.apps.confApps');
		Yii::import('application.config.conf');
		Yii::import('mod.mis.BFModMis');
		
		$this->_getPageBuilder();

		$this->assign('hasLogin', $this->_hasLogin);
		$username = !empty($_SESSION['51score_account'])?$_SESSION['51score_account']:'';
		$this->assign('username', $username);

		// 添加脚本
		if (USE_CLEAN_JS) {
			$this->addCleanScript(Yii::app()->params['js_min_type'][$jsType]);
		} else {
			foreach (Yii::app()->params['js_most_often'] as $js) $this->addScript($js);
		}

		if (USE_CLEAN_CSS) {
			// TODO: CLEAN CSS
		} else {
			$this->addCss(self::DEFAULT_CSS);
		}

		$arr_req_uri = explode('/', Yii::app()->request->getPathInfo());
		$req_uri = $arr_req_uri[0];
	}

	public function getControllerAndAction() {
		return $this->_pb->getControllerAndAction();
	}
	
	//加载js
	public function addScript() {
		$args = func_get_args();
		call_user_func_array(array($this->_pb, 'addScript'), $args);
		return $this;
	}

	public function addCleanScript() {
		$args = func_get_args();
		call_user_func_array(array($this->_pb, 'addCleanScript'), $args);
		return $this;
	}

	/**
	* 反加载脚本
	* @param $script
	*/
	public function removeScript($script='') {
		$this->_pb->removeScript($script);

		return $this;
	}

	public function addCss() {
		$args = func_get_args();
		call_user_func_array(array($this->_pb, 'addCss'), $args);

		return $this;
	}

	public function addCleanCss() {
		$args = func_get_args();
		call_user_func_array(array($this->_pb, 'addCleanCss'), $args);
		return $this;
	}

	public function removeCss($css='') {
		$this->_pb->removeCss($css);
		return $this;
	}

	public function clearCss() {
		$this->_pb->clearCss();
		return $this;
	}

	public function clearScript() {
		$this->_pb->clearScript();
		return $this;
	}

   /**
	* 设置页面title
	*/
	public function setTitle($title='') {
		$this->_pb->setTitle($title);
		return $this;
	}

   /**
	* 设置页面keywords
	*/
	public function setKeywords($keywords='') {
		$this->_pb->setKeywords($keywords);
		return $this;
	}

   /**
	* 设置页面描述信息
	*/
	public function setDescription($description='') {
		$this->_pb->setDescription($description);
		return $this;
	}

   /**
	* 设置页面编码
	*/
	public function setCharset($charset='utf-8') {
		$this->_pb->setCharset($charset);
		return $this;
	}

   /**
	* 设置页面显示的参数
	* @param $show_header 是否显示头部
	* @param $show_footer 是否显示尾部
	* @param $show_top 是否显示头部上的top
	* @param $show_bottom 是否显示尾部上的bottom
	* @param $show_app 是否显示APP
	*/
	public function setParams($show_header=true, $show_footer=true, $show_top=true, $show_bottom=true, $show_bgblue=false) {
		$this->_pb->setParams($show_header, $show_footer, $show_top, $show_bottom, $show_bgblue);
		return $this;
	}

   /**
	* 设置为渲染所有
	*/
	public function setShowAll() {
		$this->setParams($show_header=true, $show_footer=true, $show_top=true, $show_bottom=true, $show_bgblue=false);
		return $this;
	}

   /**
	* 设置仅仅显示页面body部分
	*/
	public function setOnlyBody() {
		$this->setParams($show_header=false, $show_footer=false, $show_top=false, $show_bottom=false, $show_bgblue=false);
		return $this;
	}

	public function assign($tpl_var=null, $data=null) {
		$this->_pb->assign($tpl_var, $data);
		return $this;
	}

	public function display($tpl=null, $sub_view_dir=null) {
		//统计
		$ret = $this->getControllerAndAction();
		$controller_name = $ret['controller'];
		$action_name = $ret['action'];
		$script_name = "/" . $controller_name . "/".$action_name;
		$this->_pb->display($tpl, false, $sub_view_dir);
		return $this;
	}

	public function fetch($tpl=null, $sub_view_dir=null) {
		return $this->_pb->display($tpl, true, $sub_view_dir);
	}

   /**
	* 获取用户信息
	*/
	protected function _getUserInfo() {
		return $this->_pb->getUserInfo();
	}

	private function _getPageBuilder() {
		if(isset($this->_pb)) {
			return $this->_pb;
		} else {
			$this->_pb = new LibPageBuilder();
			return $this->_pb;
		}
	}

   /**
	* 获取用户APP列表
	*/
	protected function _getAppList() {
		//empty
	}

	protected function beforeAction($action) {
		if (defined('__DISABLE_CSRF_ATTACK') && __DISABLE_CSRF_ATTACK === true) return true;
		return self::_isCsrfAttack() ? false : true;
	}

	/**
	 * prevent CSRF attack, POST + referrer
	 */
	private static function _isCsrfAttack() {
		if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
			return false;
		}

		$bf_domain = rtrim(BF_DOMAIN, "/") . "/";
		if (!empty($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], $bf_domain) !== 0) {
			return true;
		}
		return false;
	}
}