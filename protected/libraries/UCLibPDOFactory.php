<?php
/*
 * PDO Factory封装
 * $target: 本封装主要解决数据库的配置及同一连接的复用等
 * 全部函数原型
 * <prototype>
 *   static function getPDO($tagname, $hash_key=NULL, $hash_func=NULL) //根据数据库的标识(tag)返回相应的pdo对象
 * </prototype>
 * 示例代码:
 * <code>
 *  //数据库没有分布
 *  $pdo = PDOFactory::getPDO('profile'); //根据account获取用户库的pdo连接对象
 *  //数据库有分布，且分布函数名为默认的 function tagname2dbconfig
 *  $pdo = PDOFactory::getPDO('profile', 'myaccount'); //根据account获取用户库的pdo连接对象
 *  //数据库有分布，且分布函数为指定的 function mydb_hash_func
 *  $pdo = PDOFactory::getPDO('profile', 'myaccount', 'mydb_hash_func'); //根据account获取用户库的pdo连接对象
 *  $pdo->exec_with_prepare('INSERT INTO test.test (f1, f2) VALUES (?,?),(?,?)', array(1,2,3,4));
 * </code>
 * 配置示例:
 * <code>
 *   function  tagname2dbconfig($tagname, $key){
 *      return array(
 *        'driver' => 'mysql',
 *        'host' => '127.0.0.1',
 *        'port' => '3306',
 *        'username' => 'username',
 *        'password' => 'password',
 *        'database' => 'db_{substr(crc32($key),0,2)}',   //database支持散列，{}中为PHP语句,$key为散列依据的key
 *        'table' => 'table_{substr(crc32($key),0,4)}'    //table支持散列，{}中为PHP语句,$key为散列依据的key
 *      );
 *  }
 * </code>
 * 注: database和table为作用pdo对象的成员保存
 *      另，请不要使用tagname2dbconfig这个函数名！！！以防止重名
 */

//ini_set('mysql.connect_timeout', 3);


require_once(dirname(__FILE__).'/UCLibLogger.php');
class UCLibPDOFactory
{
    private static $_pdos = Array();
    private static $_error;

    static function init()
    {
        self::$_pdos = Array();
    }
    static function fini()
    {
        foreach(self::$_pdos as $pdo)
        {
            $pdo = NULL;    //connection close;
        }
    }
    static function getLastError()
    {
        return self::$_error;
    }

    private static function _parseReg($str, $key = NULL)
    {
        if( !$key )
            return $str;
        $is_found_eval = preg_match_all ("/{([^{}]+)}/", $str, $result);
        if( $is_found_eval && count($result[1]) == 1 )
        {

            $eval_str = $result[1][0];

            $eval_str = '$key='.$eval_str.';';
            eval($eval_str);
            $str = str_replace($result[0][0], $key, $str);
        }
        return $str;
    }

    private static function _convertTagname2Config($tagname, $hash_key=NULL, &$hash_func=NULL)
    {
        if( !$hash_func )
            $hash_func = 'tagname2dbconfig';
        if( !function_exists($hash_func) )
        {
            self::$_error = "function[$hash_func] NOT defined";
            return;
        }
        $cfg = $hash_func($tagname, $hash_key);
        if( ! is_array($cfg) )
        {
            return false;
        }
        $dsn = "{$cfg['driver']}:host={$cfg['host']};port={$cfg['port']};";

        $cfg['database'] = self::_parseReg($cfg['database'], $hash_key);
        $cfg['table'] = self::_parseReg($cfg['table'], $hash_key);

        return array_merge( array('dsn' => $dsn), $cfg);
    }

    /**
    * 根据数据库的标识(tag)返回相应的pdo对象
    *
    * @param string $tagname 数据库的标识(tag)
    * @param string $hash_key 数据库分布的hash key(如果有)
    * @param string $hash_func 数据库分布的hash函数名(如果有)
    * @return PDOFactory/false
    */
    static function &getPDO($tagname, $hash_key=NULL, $hash_func=NULL, $charset='utf8')
    {
        $dbconfig = self::_convertTagname2Config($tagname, $hash_key, $hash_func);
        if( !is_array($dbconfig) )
        {
            throw new Exception("config[$tagname] NOT FOUND IN $hash_func");
            return;
        }
        $fingerprint = "{$dbconfig['driver']}:host={$dbconfig['host']};port={$dbconfig['port']};".
            "username={$dbconfig['username']};password={$dbconfig['password']}";

        if( !array_key_exists($fingerprint, self::$_pdos) )
        {
            try{
                $pdo = new UCLibPDOEx($dbconfig['dsn'], $dbconfig['username'], $dbconfig['password'],
                    array(PDO::ATTR_TIMEOUT=>2,PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES '$charset'"));
                //$pdo->setAttribute(PDO::ATTR_TIMEOUT, 2);
                self::$_pdos[$fingerprint] = $pdo;
            } catch(PDOException $e) {
                self::$_error = $e->getMessage();
				$s = UCLibLogger::getDB($dbconfig['database'],$dbconfig['table'],'Connect Error');
                UCLibLogger::rpc($s.' Error #('.self::$_error.')', 5, $dbconfig['host'], $dbconfig['port'], UCLIB_LOG_RPC_TYPE_MYSQL);
                return new FakePDO($dbconfig['dsn'], $dbconfig['username'], $dbconfig['password']);
            }
        }
        if( is_a(self::$_pdos[$fingerprint], 'PDO') ) {
            self::$_pdos[$fingerprint]->database = $dbconfig['database'];
            self::$_pdos[$fingerprint]->table = $dbconfig['table'];
            self::$_pdos[$fingerprint]->host = $dbconfig['host'];
            self::$_pdos[$fingerprint]->port = $dbconfig['port'];
        }
        return self::$_pdos[$fingerprint];
    }
}

class FakePDO
{
    public function __construct($tagname, $dsn)
    {
        $this->_tagname = $tagname;
        $this->_dsn = $dsn;
    }
    private $_errorInfo;
    function errorInfo(){
        return "{$this->_tagname} - {$this->_dsn} Connect Error";
    }
    function exec_with_prepare($sql, $params=array()) { return false; }
    function query_with_prepare($sql, $params=array(), $fetch_style = PDO::FETCH_ASSOC) { return false; }
    function query_one_row_with_prepare($sql, $params=array(), $fetch_style = PDO::FETCH_ASSOC) { return false; }
    function query_one_with_prepare($sql, $params=array()) { return false; }
    function gen_uuid() { return false; }
    function insert(&$params, $guid_column_name = null) { return false; }
    function update($params, $conditions) { return false; }
    function count($condition_str, $condition_values) { return false; }
    function fetch($condition_str, $condition_values, $orderby, $page, $page_size, $total = -1, $columns = null) { return false; }
}

class UCLibPDOEx extends PDO
{
    private $_errorInfo;

    function errorInfo()
    {
        if( $this->errorCode() == '00000' && isset($this->_errorInfo) )
            return $this->_errorInfo;
        return parent::errorInfo();
    }
    /**
    * prepare & execute
    *
    * @param string $sql SQL中不变的部分
    * @param array $params SQL中可变的参数
    * @return false / affected rows
    */
    function exec_with_prepare($sql, $params=array())
    {
		$_time_start = microtime(true);
        if( !is_array($params) )
        {

            $this->_errorInfo = 'params Not A Array';
            return false;
        }

        if( !$stmt = $this->prepare($sql) )
        {
			$this->_errorInfo = $this->errorInfo();
            //UCLibLogger::rpc($s.' Error #(errno:{'.$this->_errorInfo[1].'}, error:{'.$this->_errorInfo[2].'}) '.$sql.' #'.json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return false;
        }

		$s = UCLibLogger::getDB($this->database,$this->table,$sql);
        if( !$stmt->execute($params) )
        {
            $this->_errorInfo = $this->errorInfo();
            UCLibLogger::rpc($s.' Error #(errno:{'.$this->_errorInfo[1].'}, error:{'.$this->_errorInfo[2].'}) '.$sql.' #'.json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return false;
        }

		UCLibLogger::rpc($s.' Ok #('.$sql.')', microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
        return $stmt->rowCount();
    }

    /**
    * prepare & query
    *
    * @param string $sql SQL中不变的部分
    * @param array $params SQL中可变的参数
    * @param int $fetch_style 返回数据的格式 documented in PDOStatement::fetch().
    * @return false / array
    */
    function query_with_prepare($sql, $params=array(), $fetch_style = PDO::FETCH_ASSOC)
    {
		$_time_start = microtime(true);
        if( !is_array($params) )
        {
            $this->_errorInfo = 'params Not A Array';
            return false;
        }

        if( !$stmt = $this->prepare($sql) )
		{
			$this->_errorInfo = $this->errorInfo();
            //UCLibLogger::rpc($s.' Error #(errno:{'.$this->_errorInfo[1].'}, error:{'.$this->_errorInfo[2].'}) '.$sql.' #'.json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return false;
		}

		$s = UCLibLogger::getDB($this->database,$this->table,$sql);
        if( !$stmt->execute($params) )
        {
            $this->_errorInfo = $this->errorInfo();
            UCLibLogger::rpc($s.' Error #(errno:{'.$this->_errorInfo[1].'}, error:{'.$this->_errorInfo[2].'}) '.$sql.' #'.json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return false;
        }
        $ret = $stmt->fetchAll($fetch_style);

		UCLibLogger::rpc($s.' Ok #('.$sql.')', microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
		return $ret;
    }

    /**
    * prepare & query on row
    *
    * @param string $sql SQL中不变的部分
    * @param array $params SQL中可变的参数
    * @param int $fetch_style 返回数据的格式 documented in PDOStatement::fetch().
    * @return false / array
    */
    function query_one_row_with_prepare($sql, $params=array(), $fetch_style = PDO::FETCH_ASSOC)
    {
		$_time_start = microtime(true);
        if( !is_array($params) )
        {
            $this->_errorInfo = 'params Not A Array';
            return false;
        }

        if( !$stmt = $this->prepare($sql) )
		{
			$this->_errorInfo = $this->errorInfo();
            //UCLibLogger::rpc($s.' Error #(errno:{'.$this->_errorInfo[1].'}, error:{'.$this->_errorInfo[2].'}) '.$sql.' #'.json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return false;
		}

        $s = UCLibLogger::getDB($this->database,$this->table,$sql);
        if( !$stmt->execute($params) )
        {
            $this->_errorInfo = $this->errorInfo();
            UCLibLogger::rpc($s.' Error #(errno:{'.$this->_errorInfo[1].'}, error:{'.$this->_errorInfo[2].'}) '.$sql.' #'.json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return false;
        }

        $row = $stmt->fetch($fetch_style);
        if( $row === false )
        {
            $this->_errorInfo = $this->errorInfo();
            //UCLibLogger::rpc("Fetch Error (errno:{$this->_errorInfo[1]}, error:{$this->_errorInfo[2]}) $sql #".json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return null;
        }
		UCLibLogger::rpc($s.' Ok #('.$sql.')', microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
        return $row;
    }

    /**
    * prepare & query on field on one row
    *
    * @param string $sql SQL中不变的部分
    * @param array $params SQL中可变的参数
    * @return false / mix
    */
    function query_one_with_prepare($sql, $params=array())
    {
		$_time_start = microtime(true);
        if( !is_array($params) )
        {
            $this->_errorInfo = 'params Not A Array';
            return false;
        }

        if( !$stmt = $this->prepare($sql) )
		{
			$this->_errorInfo = $this->errorInfo();
            //UCLibLogger::rpc($s.' Error #(errno:{'.$this->_errorInfo[1].'}, error:{'.$this->_errorInfo[2].'}) '.$sql.' #'.json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return false;
		}

        $s = UCLibLogger::getDB($this->database,$this->table,$sql);
        if( !$stmt->execute($params) )
        {
            $this->_errorInfo = $this->errorInfo();
            UCLibLogger::rpc($s.' Error #(errno:{'.$this->_errorInfo[1].'}, error:{'.$this->_errorInfo[2].'}) '.$sql.' #'.json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return false;
        }

        $row = $stmt->fetch(PDO::FETCH_NUM);
        if( $row === false )
        {
            $this->_errorInfo = $this->errorInfo();
            //UCLibLogger::rpc("Fetch Error (error:".json_encode($this->_errorInfo).") $sql #".json_encode($params), microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
            return null;
        }
		UCLibLogger::rpc($s.' Ok #('.$sql.')', microtime(true) - $_time_start, $this->host, $this->port, UCLIB_LOG_RPC_TYPE_MYSQL);
        return $row[0];
    }

    /**
     * 生成统一的全局标示符
     */
    function gen_uuid()
    {
		 return $this->query_one_with_prepare("SELECT REPLACE(UUID(), '-', '')");
    }

	/**
	 * 插入一条数据
     *
     * @param array $params 表数据，array, 按照 列名=>值 的结构
     * @param array $guid_column_name 需要设置为guid的列名
	 * @param array $update_array 允许重复主键时更新某个字段值
     * @return
	 *      false: 错误
	 *      affected rows: 没有设置guid_column_name的情况下
	 *      guid: 设置guid_column_name的情况下
     */
    function insert(&$params, $guid_column_name = null,$update_array= array()) {
		$sql = "INSERT INTO $this->database.$this->table (";
		$fields = "";
		$guid = null;
		$started = false;
		$values = array();
		foreach ($params as $key => $value) {
			if ($started) {
				$sql .= ",";
				$fields .= ",";
			}
			else $started = true;
			$sql .= $key;
			$fields .= "?";
			if ($guid_column_name == $key) {
				$guid = $this->gen_uuid();
				$values []= $guid;
			} else {
				$values []= $value;
			}
		}
		if ($guid_column_name) {
			if (!$guid) {
				if ($started) {
					$sql .= ",";
					$fields .= ",";
				} else $started = true;
				$sql .= $guid_column_name;
				$fields .= "?";
				$guid = $this->gen_uuid();
				$values []= $guid;
			}
		}
        if(empty($update_array)){
			$sql = $sql. ") values (" . $fields . ")";
			$ret  = $this->exec_with_prepare($sql, $values);
		}else{
			$update_key = '';
			foreach ($update_array as $key => $value) {
				$update_key .= ',' . $key . '=?';
				$values[] = $value;
			}
			$update_key =  substr($update_key, 1);
			$sql = $sql. ") values (" . $fields . ") on duplicate key update ".$update_key;
			$ret  = $this->exec_with_prepare($sql, $values);
		}
		if(!$ret){
			return false;
		} else {
			if ($guid_column_name) return $guid;
			else return $ret;
		}
    }


	/**
	 * 更新数据
     *
     * @param array $params 需要更新的数据，array, 按照 列名=>值 的结构
     * @param array $conditions 更新的条件，array, 按照 列名=>值 的结构，最终按照key=value的形式做AND搜索
     * @return
	 *      false: 错误
 	 *      affected rows
     */
    function update($params, $conditions) {
		$sql = "update $this->database.$this->table set ";
		$values = array();
		$started = false;
		foreach ($params as $key => $value) {
			if ($started) $sql .= ",";
			else $started = true;
			$sql .= $key. "=?";
			$values []= $value;
		}
		$sql = $sql. " where ";
		$started = false;
		foreach ($conditions as $key => $value) {
			if ($started) $sql .= " AND ";
			else $started = true;
			$sql .= $key. "=?";
			$values []= $value;
		}
		return $this->exec_with_prepare($sql, $values);
    }

	/**
	 * 获取满足某个条件的纪录数
     *
     * @param string $condition_str 获取的条件，比如" a=? and b>?"
	 * @param array $condition_values,  按照condition_str中的参数设置的值
     * @return
	 *      false: 错误
	 *      总数: 正常
     */
    function count($condition_str, $condition_values) {
		$sql = "select count(1) from $this->database.$this->table where $condition_str";
		$ret = $this->query_one_with_prepare($sql, $condition_values);
		if (false === $ret) return false;
		return $ret;
    }

	/**
	 * 获取分页数据
     *
     * @param string $condition_str 获取的条件，比如" a=? and b>?"
	 * @param array $condition_values,  按照condition_str中的参数设置的值
     * @param orderby 排序字段，默认按照asc排序，如果需要按照desc排序，请设置为"列名 desc"的方式
	 * @param page 页数,从1开始
	 * @param page_size 页长
	 * @param total 总数（可选）
	 * @param columns 需要获取的列名，如果获取所有，这个可以不设置
     * @return
	 *      false: 错误
	 *      array(
	 *         "total" => 1000, // 总共长度
	 *         "pages" => 100, // 总共页数
	 *         "data" => array(.......) // 获取的数据
	 *         "time" => 0.123, // 耗时
	 *      )
     */
    function fetch($condition_str, $condition_values, $orderby, $page, $page_size, $total = -1, $columns = null) {
		$_time_start = microtime(true);
		if ($total === -1) {
			$total = $this->count($condition_str, $condition_values);
			if ($total === false) return false;
		}

		$total = intval($total);

		if ($total == 0) {
			return array("total" => $total, "pages" => 0, "data" => array(), "time" => microtime(true) - $_time_start);
		}

		$total_pages = intval (($total - 1) / $page_size) + 1;
		$start = ($page - 1) * $page_size;
		if ($start >= $total) {
			return array("total" => $total, "pages" => $total_pages, "data" => array(), "time" => microtime(true) - $_time_start);
		}

		if ($columns) {
			$sql = "select ";
			$started = false;
			foreach ($columns as $col) {
				if ($started) $sql .= ",";
				else $started = true;
				$sql .= $col;
			}
			$sql .= " from $this->database.$this->table where $condition_str ";
		} else {
			$sql = "select * from $this->database.$this->table where $condition_str ";
		}
		if ($orderby && $total > 100 && $start > $total / 2) { // 倒过来做查询
			if (" desc" == strtolower(substr($orderby, -5))) {
				$orderby = substr($orderby, 0, -5)." asc";
			} else {
				$orderby .= " desc";
			}
			$page_size = min($page_size, $total - $start);
			$start = $total + 1 - $start - $page_size;
			if ($start < 0) $start = 0;

			$sql .= " order by ".$orderby;
			$sql .= " limit ?, ?";
			$condition_values []= $start;
			$condition_values []= $page_size;
			$ret = $this->query_with_prepare($sql, $condition_values);

			if(false === $ret){
				return false;
			}
			return array("total" => $total, "pages" => $total_pages, "data" => array_reverse($ret), "time" => microtime(true) - $_time_start);
		} else {
			if ($orderby) $sql .= " order by ".$orderby;
			$sql .= " limit ?, ?";
			$condition_values []= $start;
			$condition_values []= $page_size;

			$ret = $this->query_with_prepare($sql, $condition_values);
			if(false === $ret){
				return false;
			}
			return array("total" => $total, "pages" => $total_pages, "data" => $ret, "time" => microtime(true) - $_time_start);
		}
    }
}
/*
include('../config/dbconfig.php');
$pdo = UCLibPDOFactory::getPDO('a');
$ret = $pdo->query_one_with_prepare('select count(*) as num from test.test1');
 var_dump($ret);
 */
?>
