<?php
function getDbConf($tagname)
{
	  return array(
		  'driver' => 'mysql',
		  'host' => '172.16.26.13',
		  'port' => '3306',
		  'username' => 'root',
		  'password' => '',
		  'database' => '51score',
		  'table' => 'fsq_' .$tagname
	  );
}