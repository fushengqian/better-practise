<?php
/**
 * @author    符圣前 <fushengqian@yeah.net>
 * @version   0.0.1  2012/02/10
 */
class LibLogger {
	
	static public function fileLog($str_log,$file_name,$is_date_suffix=false) {

	    $file_path = LOG_PATH.'/' . $file_name;
		

		if($is_date_suffix) {
			$file_path.=date("Y-m-d");
		}
		
		$file_path.=".log";
		$str_log = trim($str_log, "\n") . "\n";

		return error_log($str_log, 3, $file_path);
	}

	static public function webLog($cate, $str_log_info, $consumed_time) {
		if (defined('__LOG_WRITEABLE__') && __LOG_WRITEABLE__ === false) return false;
        #if (__BF_ENV != 'DEV') { return false; }
        if (__BF_ENV == 'DEV' || in_array($_COOKIE['__busa'], array(1186682271,1186531717,1352076670))) {//wzj,lsc,mayi,wanggensheng
        } else {
            return false;
        }
		
		if (Yii::app()->request->isAjaxRequest) return false; //todo: 目前不支持ajax请求

		$consumed_time = sprintf('%.4f', $consumed_time);
		$consumed_str = "<{$consumed_time}>";

		(strpos(Yii::app()->request->getPathInfo() , 'mis') === 0) or __e(sprintf("%s%s %s", str_pad(strtoupper($cate), 8), $consumed_str, $str_log_info));
	}

	/**
	* @name	添加日志供调试使用
	* @param	$str_log	日志字符串
	* @param	$file_name	文件名
	* @param	$is_date_suffix 日期后缀  默认false
	*@return true or false
	**/
	public static function debugLog($str_log,$file_name,$is_date_suffix=false)
	{
		if (defined('__LOG_WRITEABLE__') && __LOG_WRITEABLE__ === false) return false;

		if(__BF_ENV !== 'ONLINE')
		{
			return false;
		}

		if(empty($str_log) || empty($file_name))
		{
			return false;
		}

		$file_path = LOG_PATH.'/' . $file_name;
		

		if($is_date_suffix) {
			$file_path.="_".date("Y-m-d");
		}
		
		$file_path.=".log";
		$str_log = trim($str_log, "\n") . "\n";

		return error_log($str_log, 3, $file_path);
	}
}
