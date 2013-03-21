<?php

// uncomment the following to define a path alias
// Yii::setPathOfAlias('local','path/to/local-folder');

define('BF_BASE', dirname(__FILE__).DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR);
Yii::setPathOfAlias('mod', dirname(__FILE__).DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'models');
Yii::setPathOfAlias('conf', dirname(__FILE__).DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'config');
Yii::setPathOfAlias('lib', dirname(__FILE__).DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'libraries');

define("SITE_NAME","51score");
define("MD5","fsq%#!910$@?008");

//日志存放目录
define("LOG_PATH" , realpath(dirname(__FILE__)).'/../../logs');

define('__BF_ENV', 'ONLINE');

define('BF_VERSION', 'v1'); 			// 版本,用于静态资源

define('JS_CLEAN_VERSION_PATH', sprintf('/static/js/', BF_VERSION));
define('JS_SOURCE_VERSION_PATH', sprintf('/static/js/', BF_VERSION));
define('CSS_CLEAN_VERSION_PATH', sprintf('/static/css/', BF_VERSION));
define('CSS_SOURCE_VERSION_PATH', sprintf('/static/css/', BF_VERSION));

define('USE_CLEAN_JS',  true);  // 是否使用压缩的JS
define('USE_CLEAN_CSS', false); // 是否使用压缩的CSS

define('BF_DOMAIN',     'http://localhost');
define("UPLOAD_DOMAIN", '');
define('STATIC_DOMAIN', sprintf('http://localhost', BF_VERSION));
define('FACE_DOMAIN',   '');
define('SHORT_DOMAIN',  'http://isdo.cn');
define('JS_VERSION',    '110804');
define('CSS_VERSION',   '110804');

define('BASE_CSS_NAME','base');//默认加载基类css名称

define('NOT_PIC_DOMAIN' , '');

define('COOKIE_DOMAIN' , '.51score.com');

define('BF_CUSTOM_REG_URL', '');
define('BF_DEFAULT_REG_URL', BF_CUSTOM_REG_URL.rawurlencode(BF_DOMAIN.'/needlogin'));

//memcache的配置
function _bf_memcache_config() {
	$ret = array();
	$ret['class'] = 'LibMemcache';
	return $ret;
}

//登录事件注册函数
function bf_webuser_onlogin($uid) {
	if($uid)
	{
		//统计登录等
		$userinfo_o = new ModUserInfo($uid);
		$userinfo_o->statOnLogin(LibUtils::getClientIp());
		if($userinfo_o->getLastErrno()) {}
	}
}

if(isset($_COOKIE['__debug_uc']) && $_COOKIE['__debug_uc'] == 1) {
	header('__p: 952133'.ip2long($_SERVER['SERVER_ADDR']));
}

// This is the main Web application configuration. Any writable
// CWebApplication properties can be configured here.
return array(
	'basePath'=>dirname(__FILE__).DIRECTORY_SEPARATOR.'..',
	'name'=>'kapa',

	// preloading 'log' component
	'preload'=>array('log'),

	// autoloading model and component classes
	'import'=>array(
		'mod.user.ModUserInfo',
		'application.components.*',
		'lib.LibMemcache',
		'lib.LibAjaxResponse',
		'lib.LibPageBuilder',
		'lib.LibUtils',
		'lib.LibLogger',
		'lib.LibStat',
		'application.config.ClientConf'
	),
	
	'defaultController'=>'index',

	// application components
	'components'=>array(
		'user'=>array(
			'class' => 'WebUser',
		),
		'urlManager'=>array(
			'urlFormat'=>'path',
			'urlSuffix'=>'.html',
			'rules'=>array(
				'home'=>'index',
			),
			'showScriptName'=> false,
		),
		'memcache' => _bf_memcache_config(),

		'errorHandler'=>array(
			'errorAction'=>'site/error',
		)
	),

	'params'=>array(
		'js_most_often' => array(
				'jquery',
			),
		'js_min_type' => array(
				"default" => "jquery",
				"client"  => ""
		 )
	),
);
