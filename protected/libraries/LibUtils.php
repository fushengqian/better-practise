<?php

class LibUtils
{
	/**
	 * http协议请求封装
	 *
	 * @param string $url
	 * @param array $post_data
	 * @param int $timeout
	 * @return false/string(content)
	 */
	static function http_request($url, $post_data=null, $timeout=3)
	{
		if(!extension_loaded('curl'))
		{
			return false;
		}

		$ch = curl_init($url);

		$ar_url = parse_url($url);
		if($ar_url['scheme'] == 'https');
		{
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 1);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		}

		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

		if(!empty($post_data))
		{
			curl_setopt($ch, CURL_POST, TRUE);
			if(is_array($post_data))
			{
				$post_data = http_build_query($post_data);
			}
			curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
		}

		$data = curl_exec($ch);
		curl_close($ch);

		return $data;
	}

	/**
	 * @desc 用于URL的改进Base64编码，它不在末尾填充'='号，并将标准Base64中的「+」和「／」分别改成了「*」和「-」
	 */
	static function urltrim_base64_encode($str)
	{
		$std_based_str = base64_encode($str);
		return trim(str_replace(array('+', '/'), array('*', '-'), $std_based_str), '=');
	}

	/**
	 * @desc 用于URL的改进Base64编码，它不在末尾填充'='号，并将标准Base64中的「+」和「／」分别改成了「*」和「-」
	 */
	static function urltrim_base64_decode($based_str)
	{
		$padding_length = strlen($based_str)%4;
		$std_based_str = $based_str;
		for($i=0; $i<$padding_length; $i++)
		{
			$std_based_str .= '=';
		}
		$std_based_str = str_replace(array('*', '-'), array('+', '/'), $std_based_str);
		return base64_decode($std_based_str);
	}

	/*
	 *	@name:获取客户端ip
	 *	@return string 客户端ip字符串
	 */
	public static function getClientIP()
	{
		if (isset($_SERVER)) {
			if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
				return $_SERVER['HTTP_X_FORWARDED_FOR'];
			} elseif (isset($_SERVER['HTTP_CLIENT_IP'])) {
				return $_SERVER['HTTP_CLIENT_IP'];
			} else {
				return $_SERVER['REMOTE_ADDR'];
			}
		} else {
			if (getenv("HTTP_X_FORWARDED_FOR")) {
				return getenv( "HTTP_X_FORWARDED_FOR");
			} elseif (getenv("HTTP_CLIENT_IP")) {
				return getenv("HTTP_CLIENT_IP");
			} else {
				return getenv("REMOTE_ADDR");
			}
		}
		return "127.0.0.1";
	}

	/*
	 *	@purpose:去除html标签,取出指定长度的字符串..
	 *	@param $source_str string  原html字符串
	 * 	@param $cut_length	int	   需要截取多少位字符
	 *	@return string 处理后的字符串
	 */
	public static function cut_str($source_str,$cut_length) {
		$source_str=strip_tags($source_str); //去除所有html标签
		$source_str=str_replace("&nbsp;","",$source_str);
		$source_str= preg_replace('#\s+#', '', trim($source_str)); //去除所有空白字符
		$returnstr = '';
		$i = 0;
		$n = 0;
		$str_length = strlen($source_str);//字符串的字节数
		$mb_str_length = mb_strlen($source_str,'utf-8');

		while (($n < $cut_length) && ($i <= $str_length)) {
			$temp_str = substr($source_str,$i,1);
			$ascnum = ord($temp_str);//得到字符串中第$i位字符的ascii码
			if ($ascnum >= 224) { //如果ASCII位高与224，
				$returnstr = $returnstr.substr($source_str,$i,3); //根据UTF-8编码规范，将3个连续的字符计为单个字符
				$i = $i + 3; //实际Byte计为3
				$n++; //字串长度计1
			} elseif ($ascnum >= 192){ //如果ASCII位高与192，
				$returnstr = $returnstr.substr($source_str,$i,2); //根据UTF-8编码规范，将2个连续的字符计为单个字符
				$i = $i + 2; //实际Byte计为2
				$n++; //字串长度计1
			} elseif ($ascnum >= 65 && $ascnum <= 90) { //如果是大写字母，
				$returnstr = $returnstr.substr($source_str,$i,1);
				$i = $i + 1; //实际的Byte数仍计1个
				$n++; //但考虑整体美观，大写字母计成一个高位字符
			} else { //其他情况下，包括小写字母和半角标点符号，
				$returnstr = $returnstr.substr($source_str,$i,1);
				$i = $i + 1; //实际的Byte数计1个
				$n = $n + 0.5; //小写字母和半角标点等与半个高位字符宽...
			}
		}

		if ($mb_str_length > $cut_length){
			$returnstr = $returnstr . "...";//超过长度时在尾处加上省略号
		}

		return $returnstr;
	}

	/**
	 *
	 * 字符串过滤
	 * 转义 ' , " , \ , null 字符
	 * 转换 ' , " , & , < , > 字符
	 *
	 * @param string $str
	 * @return string
	 */
	public static function filterString($str) {

		if (empty($str)) {
			return;
		}

		$str = htmlspecialchars($str);
		$str = get_magic_quotes_gpc() ? $str : addslashes($str);

		return $str;
	}

	//
	function is_url($url = '')
	{
		$url = trim($url);
		if(strlen($url))
		{
			$r = parse_url($url);
			if(isset($r['scheme']) && isset($r['host']))
			{
				return TRUE;
			}

			return FALSE;
		}

		return FALSE;
	}

	/**
	 * 判断邮编是否合法
	 * @param string $zipcode
	 * @return boolean
	 */
	static function is_zipcode($zipcode)
	{
		$zipcode = trim($zipcode);
		if(strlen($zipcode) == 0)
		{
			return FALSE;
		}

		$r = eregi("^[0-9]{6}$", $zipcode);

		return $r ? TRUE : FALSE;
	}

	/**
	 * 判断Email是否合法
	 * @param string $emailAddress 需要判断的邮件地址
	 * @return boolean
	 */
	static function is_email($emailAddress)
	{
		$emailAddress = trim($emailAddress);
		if(strlen($emailAddress) == 0)
		{
			return FALSE;
		}

		$r = eregi("^[_.0-9a-z-]+@([0-9a-z][0-9a-z-]+.)+[a-z]{2,3}$", $emailAddress);

		return $r ? TRUE : FALSE;
	}

	/**
	 * 判断是否是合法的手机号码
	 */
	static function is_mobileNum($mobileNumer)
	{
		$mobileNumer = trim($mobileNumer);
		if(strlen($mobileNumer) != 11)
		{
			return FALSE;
		}

		$r = preg_match('/^((\+?86)|\(\+?86\))?0?1(3|5|8)(\d){9}$/', $mobileNumer);

		return $r ? TRUE : FALSE;
	}

	/**
	 * 判断是否是合法的固定电话号码
	 */
	static function is_phoneNum($phoneNum)
	{
		$phoneNum = trim($phoneNum);
		if(strlen($phoneNum) == 0)
		{
			return FALSE;
		}

		//$r = preg_match('/^((\+?86)|\(\+?86\))?\-?\d{3,4}\-?\d{7,8}\-?\d+$/', $phoneNum);
		$r = preg_match("/^(\d{5,11})|(\d{3,4}-?\d{7,8})$/", $phoneNum);

		return $r ? TRUE : FALSE;
	}

	/**
	 * 判断是否是合法的QQ号码
	 */
	static function is_qqNum($qqNum)
	{
		$qqNum = trim($qqNum);

		$r = preg_match('/^\d{5,}$/', $qqNum);

		return $r ? TRUE : FALSE;
	}

	/*@name 产生N位随机字符
	  @param $length 多少位随机字符
	  @return string
	 */
	static function get_rand_str($length)
	{
		//去除了o和0的字符
		$str='ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz123456789';
		$str_num=strlen($str)-1;
		for($i=0;$i<$length;$i++)
		{
			$num=mt_rand(0,$str_num);
			$return_str.=$str[$num];
		}
		return $return_str;

	}

	/******************************************************************
	 * PHP截取UTF-8字符串，解决半字符问题。
	 * 英文、数字（半角）为1字节（8位），中文（全角）为3字节
	 * @return 取出的字符串, 当$len小于等于0时, 会返回整个字符串
	 * @param $str 源字符串
	 * $len 左边的子串的长度
	 ****************************************************************/
	public static function utf_substr($str,$len,$add=true) {
		$mb_str_length = mb_strlen($str,'utf-8');
		for($i=0;$i<$len;$i++){
			$temp_str=substr($str,0,1);
			if(ord($temp_str) > 127){
				$i++;
				if($i<$len){
					$new_str[]=substr($str,0,3);
					$str=substr($str,3);
				}
			}else{
				$new_str[]=substr($str,0,1);
				$str=substr($str,1);
			}
		}
		$new_str = join($new_str);
		if($add == true && $mb_str_length > $len/2){
			$new_str = $new_str.'...';
		}
		return $new_str;
	}

	/**
	 * html转义增强版，支持string/array
	 *
	 * @param string/array 需要html转义的数据，其中array会将每个value都进行转义
	 * @param string $quote_style
	 * @param string $charset
	 * @return string/array
	 */
	public static function htmlentitiesEx($ar, $quote_style=ENT_QUOTES, $charset='UTF-8')
	{
		if( is_string($ar) ) {
			if( $charset == 'GB2312' )
				$ar = preg_replace("/&amp;([#0-9]{1,6});/is","&\\1;",$ar);
			$ar = htmlspecialchars($ar, $quote_style, $charset);
			$ar = preg_replace("/&lt;([0-9]{1,20})&gt;/is","<\\1>",$ar);
		}
		if( !is_array($ar) ) {
			return $ar;
		}
		foreach($ar as &$v) {
			if( is_array($v) ) {
				$v = self::htmlentitiesEx($v, $quote_style, $charset);
			}
			elseif( is_string($v) ) {
				$v = htmlspecialchars($v, $quote_style, $charset);
			}
		}
		return $ar;
	}

	/**
	 * 统一化时间格式
	 * 时间差小于60分钟: XX分钟前
	 * 时间差大于60分钟并在昨天0点以内: 今天/昨天 H:i
	 * 时间差在昨天0点以前: Y月m日 H:i
	 * @params string $datetime 任意strtotime()函数可以解析的时间格式
	 * @return string
	 */
	static function time_formater($datetime = '')
	{
		$datetime = trim($datetime);
		if(strlen($datetime) == 0)
		{
			return '';
		}

		if(strlen($datetime) <= 10 && is_numeric($datetime))
		{
			$timestamp = $datetime;
		}
		else if(strlen($datetime) == 13 && is_numeric($datetime))
		{
			$timestamp = intval($datetime / 1000);
		}
		else
		{
			$timestamp = strtotime($datetime);
			if($timestamp === FALSE || $timestamp == -1)
			{
				return '';
			}
		}

		$now = time();
		if(date('Y', $timestamp) == date('Y', $now))
		{
			$delta = $now - $timestamp;
			$yesterday_midnight = strtotime(date('Y-m-d', $now - 86400) . '00:00:00');

			if($delta <= 0)
			{
				//如果是当前这一分钟
				$formater = '1分钟前';
			}elseif($delta <= 60 * 60 && $delta > 0)
			{
				//如果是60分钟以内
				$formater = ceil($delta/60) . '分钟前';
			}
			elseif($delta > 60 * 60 && $timestamp >= $yesterday_midnight)
			{
				//说明是在60分钟以前并在昨天0点以内
				$today_midnight = strtotime(date('Y-m-d', $now) . '00:00:00');

				if($timestamp > $today_midnight)
				{
					$day = '今天';
				}
				else
				{
					$day = '昨天';
				}

				$formater = $day . date('H:i', $timestamp);
			}
			else
			{
				//超过昨天0点以前的时间
				$formater = date('m月d日 H:i', $timestamp);
			}
		}
		else
		{
			$formater = date('Y年m月d日 H:i', $timestamp);
		}

		return $formater;
	}

	/**
	 * 字符串截取
	 *
	 * @author gesion<v.wangensheng@snda.com>
	 * @param string $str 原始字符串
	 * @param int	 $len 截取长度（中文/全角符号默认为2个单位，英文/数字为1。例如：长度12表示6个中文或全角字符或12个英文或数字）
	 * @param bool	 $dot 是否加点（若字符串超过$len长度，则后面加“...”）
	 * @return string
	 */
	public static function g_substr($str, $len = 12, $dot = true) {
		$i = 0;
		$l = 0;
		$c = 0;
		$a = array();
		while ($l < $len) {
			$t = substr($str, $i, 1);
			if (ord($t) >= 224) {
				$c = 3;
				$t = substr($str, $i, $c);
				$l += 2;
			} elseif (ord($t) >= 192) {
				$c = 2;
				$t = substr($str, $i, $c);
				$l += 2;
			} else {
				$c = 1;
				$l++;
			}
			// $t = substr($str, $i, $c);
			$i += $c;
			if ($l > $len) break;
			$a[] = $t;
		}
		$re = implode('', $a);
		if (substr($str, $i, 1) !== false) {
			array_pop($a);
			($c == 1) and array_pop($a);
			$re = implode('', $a);
			$dot and $re .= '...';
		}
		return $re;
	}

	/*
		@name 获取memcache的key返回信息
		@param $mc_data		缓存数据
		@param $module_name memcache 名称
		@param $ar_key		获取key的数组
		@return array or false;
	 */
	public static function getMcValue($mc_data , $module_name , $ar_key)
	{
		if(!is_array($mc_data) || strlen($module_name)<=0 || !is_array($ar_key))
		{
			return false;
		}
		foreach($ar_key as $key => $value)
		{
			$mc_key = "EF#".$module_name."#".$value;
			if(array_key_exists($mc_key , $mc_data))
			{
				$return_data[$value] = $mc_data[$mc_key];
			}
			else
			{
				$return_data[$value] = false;
			}
		}

		return $return_data;

	}
}
