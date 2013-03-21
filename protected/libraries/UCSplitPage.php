<?php
/**
 * 本文件用于维护全站统一的公用分页函数
 *
 * <code>
echo '<link href="http://ipic.staticsdo.com/v1/css/base.css" rel="stylesheet" type="text/css">';
echo getNormalSplitPage(300, 6, 20, 'javascript:alert(\'跳到{page}页，共{total_page}页,共{total_num}张\');');
echo "<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
echo getSimpleSplitPage(200, 5, 20, 'javascript:alert(\'跳到{page}页，共{total_page}页,共{total_num}张\');');
 * </code>
 *
 * @author    terry <liwenkui@snda.com>
 * @version   0.0.1		2010/03/29
 * @note	1、	url可以完全自定义，只需要在传入的URL中带上相应的标识即可
			2、	封装了跳转相关的JS函数
			3、	如果有其他样式的需求(比如需要多显示”总页数”，可以很方便地调用底层的fo_get_core_split_page进行样式的封装，参照
				a)	fo_get_normal_split_page
				b)	fo_get_simple_split_page
			4、	可以动态调整当前页前后显示的连续页数量。
			5、	需求中增加了一项，当省略号只省略了一页时，该处需正常显示
 */

/**
 * 获取正常的分页，带...，带页面直接跳转
 *
 * @param integer $total_num
 * @param integer $cur_page
 * @param integer $num_per_page
 * @param string $url
 * @param string $total_str 共{total_num}条记录
 * 样例格式:http://i.sdo.com/comment/sender/page/{page}/total_num/{total_num}/total_page/{total_page}
 * 自动会把{page}、{total_num}、{total_page}转换成相应的值
 * @param integer $mid_area_num 由当前页向前或者向后数连续几页
 * @return string 需要显示的分页HTML代码
 * @note  样式文件 http://ipic.staticsdo.com/v1/css/base.css 中
 */
function getNormalSplitPage($total_num, $cur_page=1, $num_per_page=20, $url='javascript:alert({page});', $total_str='共{total_num}条记录', $mid_area_num = 2)
{
	//判断参数
	if($total_num <= 0)
	{
		return '';
	}

	$total_page = ceil($total_num / $num_per_page);

	//当只有一页时不显示本页的页码
	if( $total_page > 1 )
		$cur_href = '<a class="currentpage">{page}</a>';
	else
		$cur_href = '';

	$base_html = fo_get_core_split_page($total_num,
							$cur_page,
							$num_per_page,
							'<span>'.$total_str.'</span>',
							'<a href="'.$url.'">{page}</a>',
							$cur_href,
							'<a href="'.$url.'">前一页</a>',
							'<a href="'.$url.'">后一页</a>',
							'<span>...</span>',
							$mid_area_num
							);

	//防止一个页面出现多个分页时冲突
	list($random_id, $sec) = explode(" ", microtime());
	$random_id = substr($random_id, 3);

	if( $total_page > 1)
	{
		$gopage_html = '
					<div style="float:left;position: relative;">跳到第</div>
						<form style="margin:0;" action="javascript:fo_gopage'.$random_id.'()">
							<input onpaste="return false" id="fo_go_'.$random_id.'" type="text" class="inputpage" />
						</form>
					<span>页</span>
					<input type="button" onclick="javascript:fo_gopage'.$random_id.'()" class="pagebtn" value="GO">';


		$script = '
		<script>
		function fo_gopage'.$random_id.'()
		{
			var num = document.getElementById(\'fo_go_'.$random_id.'\').value;
			if(!num)
				return;
			num = parseInt(num);
			if (isNaN(num)){
				alert("输入的页数无效");
				return ;
			}
			if( num < 1 )
				num = 1;
			if( num > '.$total_page.' )
				num = '.$total_page.';
			location.href= ("'. fo_split_page_tpl_replace($url, '{go_page}', $total_num, $total_page). '").replace("{go_page}", num);
		}
		</script>
		';
	}
	else	//如果只有1页则不显示跳转
	{
		$gopage_html = '';
		$script = '';
	}

	return "<div class=\"g_page clear\">$base_html $gopage_html $script </div>";
}

/**
 * 获取简易的分页，带...，不带页面直接跳转
 *
 * @param integer $total_num
 * @param integer $cur_page
 * @param integer $num_per_page
 * @param string $url
 * 样例格式:http://i.sdo.com/comment/sender/page/{page}/total_num/{total_num}/total_page/{total_page}
 * 自动会把{page}、{total_num}、{total_page}转换成相应的值
 * @param integer $mid_area_num 由当前页向前或者向后数连续几页
 * @return string 需要显示的分页HTML代码
  * @note  样式文件 http://ipic.staticsdo.com/v1/css/base.css 中
 */
function getSimpleSplitPage($total_num, $cur_page=1, $num_per_page=20, $url='javascript:alert({page});', $total_str = '', $mid_area_num=2)
{
	$url = urldecode($url);
	$total_page = ceil($total_num / $num_per_page);

	//当只有一页时不显示本页的页码
	if( $total_page > 1 )
		$cur_href = '<a class="cur">{page}</a>';
	else
		$cur_href = '';

	return '<div class="clear"></div><div class="page">'.getCoreSplitPage($total_num,
							$cur_page,
							$num_per_page,
							$total_str,
							'<a href="'.$url.'">{page}</a>',
							$cur_href,
							'<a href="'.$url.'" class="next">上一页</a>',
							'<a href="'.$url.'" class="next">下一页</a>',
							'...',
							$mid_area_num
							).'</div>';
}

function splitPageTplReplace($str, $page, $total_num, $total_page)
{
	$tags = array('{page}', '{total_num}', '{total_page}');
	$replaced_tag = array($page, $total_num, $total_page);
	return str_ireplace($tags, $replaced_tag, $str);
}

function getCoreSplitPage($total_num,
								$cur_page = 1,
								$num_per_page = 20,
								$total_str = '共{total_num}张图片',
								$page_str = '<a href="javascript:alert(\'跳到第{page}\')">[{page}]</a>',
								$cur_page_str = '<b>{page}</b>',
								$pre_page_str = '<a href="javascript:alert(\'跳到第{page}\')">前一页</a>',
								$next_page_str = '<a href="javascript:alert(\'跳到第{page}\')">后一页</a>',
								$ellipsis_str = '...',
								$mid_area_num = 2)
{
	$total_num = intval($total_num);
	$cur_page = intval($cur_page);
	$num_per_page = intval($num_per_page);

	//参数校验
	if( $total_num <= 0 )
	{
		return false;
	}
	$total_page = ceil($total_num / $num_per_page);
	if( $cur_page <= 0 )
		$cur_page = 1;
	if( $cur_page > $total_page )
		$cur_page = $total_page;

	$total_str = splitPageTplReplace($total_str, 0, $total_num, $total_page);

	//第一页，不需要"前一页"
	if( $cur_page == 1 )
	{
		$pre_page_str = '';
		$first_page_str = '';
	}
	else
	{
		$first_page_str = splitPageTplReplace($page_str, 1, $total_num, $total_page);
		$pre_page = $cur_page - 1;
		$pre_page_str = splitPageTplReplace($pre_page_str, $pre_page, $total_num, $total_page);
	}

	//最后一页，不需要"后一页"
	if( $cur_page == $total_page )
	{
		$next_page_str = '';
		$last_page_str = '';
	}
	else
	{
		$next_page = $cur_page + 1;
		$next_page_str = splitPageTplReplace($next_page_str, $next_page, $total_num, $total_page);
		$last_page_str = splitPageTplReplace($page_str, $total_page, $total_num, $total_page);
	}

	$pre_str = '';
	//特殊需求，当省略号部分只有1个页码时，不显示... 直接显示页码
	if( $cur_page - 1 == $mid_area_num + 2 )
		$pre_str .= splitPageTplReplace($page_str, 2, $total_num, $total_page);
	else if ($cur_page - 1 > $mid_area_num + 2 )
		$pre_str .= $ellipsis_str;

	for( $i = max($cur_page-$mid_area_num, 2); $i < $cur_page; $i++ )
	{
		$pre_str .= splitPageTplReplace($page_str, $i, $total_num, $total_page);
	}

	$next_str = '';
	for( $i = $cur_page+1; $i < min($cur_page+$mid_area_num+1, $total_page); $i++ )
	{
		$next_str .= splitPageTplReplace($page_str, $i, $total_num, $total_page);
	}
	//特殊需求，当省略号部分只有1个页码时，不显示... 直接显示页码
	if( $total_page - $cur_page == $mid_area_num + 2 )
		$next_str .= splitPageTplReplace($page_str, $total_page-1, $total_num, $total_page);
	else if ( $total_page - $cur_page > $mid_area_num + 2 )
		$next_str .= $ellipsis_str;

	$cur_page_str = splitPageTplReplace($cur_page_str, $cur_page, $total_num, $total_page);
	return "$total_str $pre_page_str $first_page_str $pre_str $cur_page_str $next_str $last_page_str $next_page_str";
}


function getSimpleSplitPageForMsg($total_num, $cur_page=1, $num_per_page=20, $url='javascript:alert({page});', $total_str = '', $mid_area_num=2)
{
	$url = urldecode($url);
	$total_page = ceil($total_num / $num_per_page);

	//当只有一页时不显示本页的页码
	if( $total_page > 1 )
		$cur_href = '<a class="cur">{page}</a>';
	else
		$cur_href = '';

	return '<div class="msgB"><div class="msgPage">'.getCoreSplitPage($total_num,
							$cur_page,
							$num_per_page,
							$total_str,
							'<a href="'.$url.'">{page}</a>',
							$cur_href,
							'<a href="'.$url.'" class="pre">&lt;</a>',
							'<a href="'.$url.'" class="next">&gt;</a>',
							'...',
							$mid_area_num
							).'</div></div>';
}

function getSimpleSplitPageForMsgStyle2($total_num, $cur_page=1, $num_per_page=20, $url='javascript:alert({page});', $total_str = '', $mid_area_num=2)
{
	$url = urldecode($url);
	$total_page = ceil($total_num / $num_per_page);

	//当只有一页时不显示本页的页码
	if( $total_page > 1 )
		$cur_href = '<a class="cur">{page}</a>';
	else
		$cur_href = '';

	return '<div class="popMsgB"><div class="msgPage">'.getCoreSplitPage($total_num,
							$cur_page,
							$num_per_page,
							$total_str,
							'<a href="'.$url.'">{page}</a>',
							$cur_href,
							'<a href="'.$url.'" class="pre">&lt;</a>',
							'<a href="'.$url.'" class="next">&gt;</a>',
							'...',
							$mid_area_num
							).'</div></div>';
}

/**
 * Created By Gusg at 2010-8-9 18:53
 */
function getAppStoreSplitPage($total_num, $cur_page=1, $num_per_page=20, $url='javascript:alert({page});', $total_str = '', $mid_area_num=2)
{
	$url = urldecode($url);
	$total_page = ceil($total_num / $num_per_page);

	//当只有一页时不显示本页的页码
	if( $total_page > 1 )
		$cur_href = '<span></span>';
	else
		$cur_href = '';

	return getCoreSplitPage($total_num,
							$cur_page,
							$num_per_page,
							$total_str,
							'<a href="'.$url.'"></a>',
							$cur_href,
							'<a href="'.$url.'" class="pre"></a>',
							'<a href="'.$url.'" class="next"></a>',
							'...',
							$mid_area_num
							);
}

function getCandyBoxSplitPage($total_num, $cur_page=1, $num_per_page=20, $url='javascript:alert({page});', $total_str = '', $mid_area_num=2)
{
	$url = urldecode($url);
	$total_page = ceil($total_num / $num_per_page);

	//当只有一页时不显示本页的页码
	if( $total_page > 1 )
		$cur_href = '<a href="'.$url.'" class="cur">{page}</a>';
	else
		$cur_href = '';

	return getCoreSplitPage($total_num,
							$cur_page,
							$num_per_page,
							$total_str,
							'<a href="'.$url.'">{page}</a>',
							$cur_href,
							'<a href="'.$url.'" class="pre">上一页</a>',
							'<a href="'.$url.'" class="next">下一页</a>',
							'...',
							$mid_area_num
							);
}

function getTuitaCommentListPageMenu($total_num, $cur_page=1, $page_size=20, $url) {
	
	$url = urldecode($url);
	$total_page = ceil($total_num / $page_size);

	//当只有一页时不显示本页的页码
	if( $total_page > 1 )
		$cur_href = '<a class="cur">{page}</a>';
	else
		$cur_href = '';
		
	$page_link = '<a href="javascript:;" onclick="'.$url.'">{page}</a>';
	$pre_page_link = '<a class="previewBtn" href="javascript:;" onclick="'.$url.'">上一页</a>';
	$next_page_link = '<a class="nextBtn" href="javascript:;" onclick="'.$url.'">下一页</a>';
	
	$mid_area_num = 2;
	$total_str = '';
	
	$page_menu_str = getCoreSplitPage(
							$total_num,
							$cur_page,
							$page_size,
							$total_str,
							$page_link,
							$cur_href,
							$pre_page_link,
							$next_page_link,
							'...',
							$mid_area_num
							);
	
	return '<p class="r">' . $page_menu_str . '</p>';
}
