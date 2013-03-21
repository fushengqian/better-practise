<?php
/**
 * 基于CMemcache的封装,本封装主要解决不同模块memcache的配置问题
 *
 * 接口:
 * - function set($module, $key, $value, $expire=0)
 * - function get($module, $key)
 * - function delete($module, $key)
 *
 * 使用方式
 * <code>
 *    Yii::app()->memcache->set('module1', 'key1','value1');
 *    Yii::app()->memcache->get('module1', 'key1');
 * </code>
 * 配置示例:
 * <code>
 * 'default' => array(
 *       array( 'host' => '10.241.12.114', 'port' => 11556, 'weight'=>60 )
 *   )
 * </code>
 *
 *
 * @author    符圣前 <fushengqian@yeah.net>
 * @version   0.0.1        2012/02/10
 */

/**
 * CMemCache的factory类
 */
class LibMemcache extends CComponent
{
    private $_ar_mc = Array();
    private $_error;
    private $_errno;

    function __set($name, $value)
    {
        $this->$name = $value;
    }

    function __construct($ar_config=null)
    {
        $this->_ar_mc = Array();
    }

    public function init()
    {
        $this->_getServer('default');
    }

    private function _getServer($module)
    {
        //配置未定义
        if(!isset($this->$module) || !is_array($this->$module)) {
            throw new CException(Yii::t('yii',"module[$module] config not found Or not valid"));
        }

        //server未初始化
        if(!isset($this->_ar_mc[$module])) {
            $mc = new CMemCache();
            $mc->setServers($this->$module);
            $mc->init();
            $this->_ar_mc[$module] = $mc;
        }
        return $this->_ar_mc[$module];
    }

    public function setConfig($ar_config) {}

    function __destruct()
    {
        foreach($this->_ar_mc as $mc)
        {
            $mc = NULL;    //connection close;
        }
        $this->_ar_mc = null;
    }

    public function getLastError()
    {
        return $this->_error;
    }

    /**
     * Retrieves a value from cache with a specified key.
     * @param string a module tag for distribution
     * @param string a key identifying the cached value
     * @return mixed the value stored in cache, false if the value is not in the cache, expired or the dependency has changed.
     */
    public function get($module, $key)
    {
		$start_time = microtime(1);
		$key = "BF#".$module."#".$key;
        $mc = $this->_getServer($module);
        if( $mc === false ) {
            return false;
        }
		$ret = $mc->get($key);

		$consumed_time = microtime(1)-$start_time;
		BFLibLogger::fileLog("mcache", sprintf("GET, module[%s], key[%s]", $module, $key), $consumed_time);
		BFLibLogger::webLog("mcache", "GET, module[$module], key[$key]", $consumed_time);

        return $ret;
    }

	/**
	 * get的批量版
	 */
    public function mget($module, $keys)
    {
		!is_array($keys) && $keys = array(0=>$keys);
		foreach($keys as &$_key) {
			$_key = "BF#" . $module . "#" . $_key;
		}
		$start_time = microtime(1);
        $mc = $this->_getServer($module);
        if( $mc === false ) {
            return false;
        }
		$ret = $mc->mget($keys);

		$consumed_time = microtime(1)-$start_time;
		BFLibLogger::fileLog("mcache", sprintf("MGET, module[%s], keys[%s]", $module, implode(",", $keys)), $consumed_time);
		BFLibLogger::webLog("mcache", "MGET, module[$module], keys[".implode(",", $keys)."]", $consumed_time);

        return $ret;
    }

    /**
     * Stores a value identified by a key into cache.
     * If the cache already contains such a key, the existing value and
     * expiration time will be replaced with the new ones.
     *
     * @param string a module tag for distribution
     * @param string the key identifying the value to be cached
     * @param mixed the value to be cached
     * @param integer the number of seconds in which the cached value will expire. 0 means never expire.
     * @param ICacheDependency dependency of the cached item. If the dependency changes, the item is labeled invalid.
     * @return boolean true if the value is successfully stored into cache, false otherwise
     */

    public function set($module, $key, $value, $expire=0)
    {
		$start_time = microtime(1);

		$key = "BF#".$module."#".$key;
        $mc = $this->_getServer($module);
        if( $mc === false ) {
            return false;
        }
		$ret = $mc->set($key, $value, $expire);

		$consumed_time = microtime(1)-$start_time;
		BFLibLogger::fileLog("mcache", sprintf("SET, module[%s], key[%s]", $module, $key), $consumed_time);
		BFLibLogger::webLog("mcache", "SET, module[$module], key[$key]", $consumed_time);

        return $ret;
    }

    /**
     * Deletes a value with the specified key from cache
     * @param string a module tag for distribution
     * @param string the key of the value to be deleted
     * @return boolean if no error happens during deletion
     */

    public function delete($module, $key)
    {
		$start_time = microtime(1);

        $mc = $this->_getServer($module);
        if( $mc === false ) {
            return false;
        }
		$ret = $mc->delete($key);

		$consumed_time = microtime(1)-$start_time;
		BFLibLogger::fileLog("mcache", sprintf("DEL, module[%s], key[%s]", $module, $key), $consumed_time);
		BFLibLogger::webLog("mcache", "DEL, module[$module], key[$key]", $consumed_time);


        return $ret;
    }
}

