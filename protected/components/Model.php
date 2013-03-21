<?php
/**
 * model基类
 * @author    符圣前 <fushengqian@yeah.net>
 * @version   0.0.1  2012.02.10
 */
class Model {
    public function getLastError() {
        return $this->_error;
    }

    public function getLastErrno() {
        return $this->_errno;
    }

    protected function setError($errno, $error) {
        $this->_errno = $errno;
        $this->_error = $error;
    }
    
    protected function clearError() {
    	$this->_errno = 0;
    	$this->_error = '';
    }
}