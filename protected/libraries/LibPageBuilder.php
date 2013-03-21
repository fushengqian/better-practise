<?php
/**
 *
 * BFLibPageBuilder
 * 用于页面渲染
 * @author  符圣前<fushengqian@yeah.net>
 * @version 1.0 2012.02.10
 */
class LibPageBuilder {
	
	private $_includecss      = array();
	private $_includejs       = array();
	private $_css_cleaned     = false;
	private $_js_cleaned      = false;

	private $_title           = '后台管理';
	private $_keywords        = '后台管理';
	private $_description     = '后台管理';
	private $_charset         = 'utf-8';

	private $_controller      = '';
	private $_action          = '';

	private $_tpl_vars        = array();//模板变量数组

	private $_showHeader      = true; // 是否显示头部
	private $_showFooter      = true; // 是否显示尾部
	private $_showTop         = true; // 是否显示头部上的top
	private $_showBottom      = true; // 是否显示尾部上的bottom
	private $_showBgBlue      = false;

	public function init() {
		$domain = preg_replace("!\/$!", "", STATIC_DOMAIN);
		$this->_jsSourcePath  = sprintf('%s/%s', $domain, preg_replace("!^\/+!", "", JS_SOURCE_VERSION_PATH));
		$this->_cssSourcePath = sprintf('%s/%s', $domain, preg_replace("!^\/+!", "", CSS_SOURCE_VERSION_PATH));
		$this->_jsCleanPath   = sprintf('%s/%s', $domain, preg_replace("!^\/+!", "", JS_CLEAN_VERSION_PATH));
		$this->_cssCleanPath  = sprintf('%s/%s', $domain, preg_replace("!^\/+!", "", CSS_CLEAN_VERSION_PATH));
		$this->assign(array(
			'charset'     => $this->_charset,
			'keywords'    => $this->_keywords,
			'description' => $this->_description,
			'title'       => $this->_title,
		));
	}

	public function __construct() {
		$this->init();
	}

   /**
	* 获取display方法被哪个控制器的动作调用
	*/
	private function _getParams() {
		$backtrace = debug_backtrace();
		if(is_array($backtrace))
		{
			foreach($backtrace as $key => &$value)
			{
				$class    = $value['class'];
				$function = $value['function'];

				if(isset($class) && isset($function))
				{
					if(preg_match("!Controller$!", $class) && strpos($function, 'action') === 0)
					{
						$this->_controller = strtolower(preg_replace("!Controller$!", "", $class));
						$this->_action     = strtolower(preg_replace("!^action!", "", $function));
						break;
					}
				}
			}
		}
	}

	public function getControllerAndAction() {
		if(!$this->_controller || !$this->_action) {
			$this->_getParams();
		}
		return array('controller'=>$this->_controller, 'action'=>$this->_action);
	}

   /**
	* 设置页面keywords
	*/
	public function setKeywords($keywords='') {
		$this->assign('keywords', $keywords);
	}

	/**
	* 设置页面title
	*/
	public function setTitle($title='') {
		$this->assign('title', $title);
	}

	/**
	* 设置页面描述信息
	* @param $description 页面描述信息
	*/
	public function setDescription($description='') {
		$this->assign('description', $description);
	}

	/**
	* 设置页面编码
	* @param $charset 页面编码
	*/
	public function setCharset($charset='utf-8') {
		$this->assign('charset', $charset);
	}

	/**
	* 添加script
	*/
	public function addScript() {
		$num  = func_num_args();
		if($num)
		{
			$args = func_get_args();
			foreach($args as $arg)
			{
				if(in_array($arg, $this->_includejs))
				{
					continue;
				}

				if (!$this->_js_cleaned && USE_CLEAN_JS && in_array($arg, Yii::app()->params['js_most_often']))
				{
					continue;
				}

				$this->_includejs[$arg] = $this->_jsSourcePath . str_replace(".", "/", $arg) . '.js?' . JS_VERSION;
			}
		}
	}

	/**
	 * 添加压缩后的脚本
	 */
	public function addCleanScript() {
		$num  = func_num_args();
		if($num)
		{
			$args = func_get_args();
			foreach($args as $arg)
			{
				if(in_array($arg, $this->_includejs))
				{
					continue;
				}
				$this->_includejs[$arg] = $this->_jsCleanPath . str_replace(".", "/", $arg) . '.js?' . JS_VERSION;
			}
		}
	}

	/**
	* 反加载脚本
	* @param $script
	*/
	public function removeScript($script='') {
		if(is_array($this->_includejs))
		{
			if(array_key_exists($script, $this->_includejs))
			{
				unset($this->_includejs[$script]);

				return true;
			}
		}

		return false;
	}

	/**
	* 添加css
	*/
	public function addCss() {
		$num  = func_num_args();
		if($num)
		{
			$args = func_get_args();
			foreach($args as $arg)
			{
				if(in_array($arg, $this->_includecss))
				{
					continue;
				}
				$this->_includecss[$arg] = $this->_cssSourcePath . str_replace(".", "/", $arg) . '.css?' . CSS_VERSION;
			}
		}
	}

	/**
	 * 添加压缩后的CSS
	 */
	public function addCleanCss()
	{
		$num  = func_num_args();
		if($num)
		{
			$args = func_get_args();
			foreach($args as $arg)
			{
				if(in_array($arg, $this->_includecss))
				{
					continue;
				}
				$this->_includecss[$arg] = $this->_cssCleanPath . str_replace(".", "/", $arg) . '.css?' . CSS_VERSION;
			}
		}
	}

	/**
	* 反加载css
	* @param $css
	*/
	public function removecss($css='')
	{
		if(is_array($this->_includecss))
		{
			if(array_key_exists($css, $this->_includecss))
			{
				unset($this->_includecss[$css]);
				return true;
			}
		}

		return false;
	}

	/**
	 * 清除所有已加载的CSS
	 */
	public function clearCss()
	{
		$this->_css_cleaned = true;
		$this->_includecss  = array();
	}

	/**
	 * 清除所有已加载的脚本
	 */
	public function clearScript()
	{
		$this->_js_cleaned = true;
		$this->_includejs  = array();
	}

	/**
	* 合并模板变量
	* @param $tpl_var 变量key
	* @param $data 变量值
	*/
	public function assign($tpl_var, $data=null)
	{
		if(is_array($tpl_var))
		{
			foreach($tpl_var as $key => $val)
			{
				if($key != '')
				{
					$this->_tpl_vars[$key] = $val;
				}
			}
		}
		else
		{
			if($tpl_var != '')
			{
				$this->_tpl_vars[$tpl_var] = $data;
			}
		}
	}

	/**
	* 设置页面显示的参数
	* @param $show_header 是否显示头部
	* @param $show_footer 是否显示尾部
	* @param $show_top 是否显示头部上的top
	* @param $show_bottom 是否显示尾部上的bottom
	* @param $show_bgblue 是否显示背景蓝色
	*/
	public function setParams($show_header=true, $show_footer=true, $show_top=true, $show_bottom=true, $show_bgblue=false)
	{
		$this->_showHeader  = $show_header;
		$this->_showFooter  = $show_footer;
		$this->_showTop     = $show_top;
		$this->_showBottom  = $show_bottom;
		$this->_showBgBlue  = $show_bgblue;
	}

	/**
	* 设置为渲染所有
	*/
	public function setShowAll()
	{
		$this->setParams($show_header=true, $show_footer=true, $show_top=true, $show_bottom=true, $show_app=true, $show_toolbar=true);
	}

	/**
	* 设置仅仅显示页面body部分
	*/
	public function setOnlyBody()
	{
		$this->setParams($show_header=false, $show_footer=false, $show_top=false, $show_bottom=false, $show_app=false, $show_toolbar=false);
	}

	/**
	* 设置显示除了APP之外的
	*/
	public function setButApp()
	{
		$this->setParams($show_header=true, $show_footer=true, $show_top=true, $show_bottom=true, $show_app=false, $show_toolbar=true);
	}

	/**
	* 模板渲染
	* @param $tpl 模板文件，如果为空，则为调用的方法名
	* @param $return 控制直接返回或输出
	* @param $sub_view_dir 是否指定视图目录下的子目录，为空则使用默认目录，非空则使用指定目录
	* @return
	*/
	public function display($tpl=null, $return=false, $sub_view_dir=null)
	{
		$this->_getParams();
		if(!$this->_controller || !$this->_action)
		{
			trigger_error("_controller and _action must is not empty.", E_USER_ERROR);
			return false;
		}

		if (! empty($sub_view_dir)) {
			$default_controller = $this->_controller;
			$this->_controller = $sub_view_dir;
		}

		$this->assign(array(
			'includejs'  => $this->_includejs,
			'includecss' => $this->_includecss,
		));

		if(is_array($this->_tpl_vars))
		{
			extract($this->_tpl_vars);
		}

		if(!$tpl)
		{
			$tpl = $this->_action;
		}

		if(strpos(".", $tpl) === false)
		{
			$tpl .= ".php";
		}

		ob_start();

		if($this->_showHeader)
		{
			$userinfo = $this->getUserInfo();
			require_once Yii::app()->basePath . "/views/common/header.php";
		}

		require_once Yii::app()->basePath . "/views/" . $this->_controller . "/" . $tpl;

		if($this->_showFooter)
		{
			require_once Yii::app()->basePath . "/views/common/footer.php";
		}

		if($return)
		{
			return ob_get_clean();
		}

		if (! empty($sub_view_dir)) {
			$this->_controller = $default_controller;
		}

		ob_get_contents();
	}

	public function getUserInfo()
	{
		//echo "----" . Yii::app()->user->getId() . "----<br />";
		if(!Yii::app()->user)
		{
			return array();
		}
		return array(
		);
	}

	/**
	* 获取APP信息，在视图中调用
	*/
	public function getAppJSONInfoById()
	{
		$app_id       = $this->_getAppId();
		$error_return = array(
			"app_id"   => 0,
			"app_name" => '',
			"app_desc" => '',
		);
		if(!$app_id)
		{
			$return = $error_return;
		}
		else
		{
			Yii::import("application.models.apps.BFModApps");
			$app_o    = new BFModApps();
			$app_info = $app_o->getAppInfoById($app_id);
			if($app_o->getLastErrno())
			{
				$return = $error_return;
			}
			else
			{
				$app_id   = $app_info["app_id"];
				$app_name = $app_info["app_name"];
				$app_desc = $app_info["app_desc"];
				if(!$app_id)
				{
					$app_id = 0;
				}
				if(!$app_name)
				{
					$app_name = '';
				}
				if(!$app_desc)
				{
					$app_desc = '';
				}

				$return = array(
					"app_id"   => $app_id,
					"app_name" => $app_name,
					"app_desc" => $app_desc,
				);
			}
		}

		return json_encode($return);
	}

	/**
	* 获取APP的ID和Name
	*/
	private function _getAppId()
	{
		$request_uri = $_SERVER['REQUEST_URI'];
		$path_info   = @parse_url($request_uri);
		$app_id      = 0;

		if(!$path_info)
		{
			return $app_id;
		}
		$path = strtolower($path_info['path']);
		if(!$path)
		{
			return $app_id;
		}

		$arr = explode("/", preg_replace("!^/+|/+$!", "", $path));
		if(!is_array($arr) || sizeof($arr) < 1)
		{
			return $app_id;
		}

		$app_type = $arr[0];
		if(strnatcasecmp($app_type, 'sgs') === 0)
		{
			$app_id = BFConfApps::SGS_APP_ID;
		}
		else if(strnatcasecmp($app_type, "sports") === 0)
		{
			$app_id = BFConfApps::SPORTS_APP_ID;
		}
		else if(strnatcasecmp($app_type, "apps") === 0 || strnatcasecmp($app_type, "store") === 0)
		{
			// 常规APP
			if(sizeof($arr) < 4)
			{
				return $app_id;
			}

			if(strnatcasecmp($arr[1], "app") !== 0 && strnatcasecmp($arr[1], "play") !==0)
			{
				return $app_id;
			}

			if(strnatcasecmp($arr[2], "id") !== 0)
			{
				return $app_id;
			}

			$app_id = $arr[3];
		}

		return $app_id;
	}

	public function debug()
	{
		var_dump($this->_includejs);
	}
}
