<?php
/**
 * BF统计的统一封装及相关配置
 * @author 符圣前
 * @date   2012-02-10
 * @memo   类的封装同UC中的UCLibStat
*/

Yii::import("lib.statistics.Statistic_inc", true);
Yii::import("conf.stat.BFConfStat",true);
Yii::import("lib.LibLogger",true);


class LibStat {
    /**
    * 动作统计
    * @uses $action_name defined in BFConfStat
    * @param string $action_name
    */
    public static function action($action_name) {
        StatActionName($action_name);
    }

   /**
    * 超级统计，可去重，可进行复杂运算
    * @param string $key 由监控部黄胜统一分配
    * @param string $value 需要UC提供，但规则需要跟监控部定好
    */
    public static function statex($key, $value) {
        StatUserinfo($key, $value);
    }
	
	/**
	* PV统计
	* @param string $controller_name  控制器名称
    * @param string $script_name 页面脚本标识
	**/
    public static function pv($controller_name,$script_name) {
		if(empty($controller_name)  || empty($script_name))
		{
			return false;
		}
		$key = BFConfStat::getStatKey($controller_name);		
		
		if(strpos($controller_name,'mis'))
		{
			return false;
		}

		if($key === false) {
			//记录日志
			if (defined('__LOG_WRITEABLE__') && __LOG_WRITEABLE__ === false) return false;
			$str_log = "控制器:".$controller_name."    脚本名称:".$script_name."没有统计到    时间:".date("Y-m-d H:i:s")."\n";
			$file_name = "stat_error";
			LibLogger::debugLog($str_log,$file_name,true);
			return false;
		}
		else {
			StatPageView($key,$script_name);
		}
		StatPageView(BFConfStat::STAT_SITE_PV,'/index');
    }
}



