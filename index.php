<?php
$yii = dirname(__FILE__).'/framework/yii.php';
$config = dirname(__FILE__).'/protected/config/main.php';
define('MICRO_TIME', time());
//remove the following line when in production mode
defined('YII_DEBUG') or define('YII_DEBUG',true);

require_once($yii);

Yii::createWebApplication($config)->run();