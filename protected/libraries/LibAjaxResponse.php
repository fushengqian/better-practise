<?php
if(!defined('BF_RESPONSE_SUCCESS'))
{
	define('BF_RESPONSE_SUCCESS',    0); // 响应成功
}

if(!defined('BF_RESPONSE_ERROR'))
{
	define('BF_RESPONSE_ERROR',      1); // 响应失败
}

if(!defined('BF_RESPONSE_NEED_LOGIN'))
{
	define('BF_RESPONSE_NEED_LOGIN', -50000); // 需要登录
}

if(!defined('BF_RESPONSE_CANCEL_POLL'))
{
	define('BF_RESPONSE_CANCEL_POLL', -60000); // 取消轮询
}


/**
 * BFLibAjaxResponse is an ajax response converter
 */
class LibAjaxResponse {
	
	/**
	 * 将Ajax请求的返回值进行统一编码
	 * @param errno: 错误代码，0表示没有错误
	 * @param message: 错误描述
	 * @param data: ajax返回的数据
	 * @param output: 输出还是返回，默认为输出
	 * @param json_encode: 是否转换为JSON格式再输出，true 是，false 否
	 */
	public static function convert($errno = 0, $message = "", $data = null, $output = true, $json_encode = true)
	{
		$response = array (
			'code' => $errno,
			'msg'   => $message,
			'result'  => $data
		);

		$json_encode && $response = json_encode($response);
		if(isset($_REQUEST["_jsonp"]))
		{
			$response = "$.bf.ajax.jsonpCallback(" . $_REQUEST["_jsonp"] . "," . $response . ");";
		}
		if($output)
		{
			echo $response;
			return true;
		}
		else
		{
			return $response;
		}
	}

	/**
	 * 等同于convert(BF_RESPONSE_SUCCESS, null, $data);
	 */
	public static function convertData($data, $json_encode = true)
	{
		self::convert(BF_RESPONSE_SUCCESS, null, $data, true, $json_encode);
	}

	/**
	 *  等同于convertError($errno, $message, null);
	 */
	public static function convertError($errno, $message)
	{
		self::convert($errno, $message, null, true, true);
	}

	/**
	 *  判断是否是ajax请求
	 */
	public static function isAjaxRequest()
	{
		if (isset($_REQUEST["_jsonp"])) return true;
		return isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest' : false;
	}
}
