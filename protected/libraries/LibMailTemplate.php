<?php
class LibMailTemplate {

    
    //用户注册
    public static function signup($userName, $url) {
        $today = date('Y年m月d日');
        $html = '
<html>        
<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<title>邮件外发</title>

</head>
<body>

<table border="0" cellpadding="0" cellspacing="0" style="font: 12px/1.75 Tahoma, simsun; margin: 0; padding: 0; outline: 0;border:1px solid #ccc;color:#000;width:650px;border-bottom:2px solid #0164CA;">

  <tr>

    <td bgcolor="#0164CA" style="padding:5px 15px;font-size:16px;font-weight:bold;color:#FFFFFF;">'.$userName.'，这是来自课程题库网的注册确认信</td>

  </tr>

  <tr>

    <td style="padding-left:15px;padding-top:10px;line-height:22px;">

		<strong style="font-size:14px">欢迎您来到课程题库网！</strong><br />

		<p style="padding-top:5px; margin:0;">

        	感谢您注册成为课程题库网个人会员，请点击下面的链接进入学习。<br />

			<a href="'.$url.'" style="color:#0066CC; text-decoration:none">'.$url.'</a><br />

			（如果链接无法点击，请将上面的地址复制到浏览器的地址栏中，打开页面即可）

		</p>

</td>

  </tr>

  <tr>

    <td style="padding-top:30px;padding-left:15px; padding-bottom:20px;line-height:22px;">

	<strong>

		课程题库网，一个在线做题网站，提供各类课程题库，在线做题、模拟测试，自动收集错题记录！</br>
		您做错的题目，会反复出现在界面上，约10分钟出现一次，直到您做对为止！</br>
		这样，您只需关注您的错题记录，节省了复习时间也提高了学习效率！</br>
		这是一封系统邮件，请勿直接回复，谢谢！<br />

	</strong>

    <br />

		<a href="http://www.51score.com" style="color:#0066CC;">课程题库网</a><br />


		客服信箱：<a  style="color:#000; text-decoration:none">w.51score.com@gmail.com</a><br />



	</td>

  </tr>



</table>

</body>
</html>';
        return $html;
    }
    
    //用户找回密码
     function findpwd($userName,$url) {
     	$html='<html>
<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<title>邮件外发</title>

</head>



<body>

<table border="0" cellpadding="0" cellspacing="0" style="font: 12px/1.75 Tahoma, simsun; margin: 0; padding: 0; outline: 0;border:1px solid #ccc;color:#000;width:650px;border-bottom:2px solid #FF6600;">

  <tr>

    <td bgcolor="#FF6600" style="padding:5px 15px;font-size:16px;font-weight:bold;color:#FFFFFF;">'.$userName.'的'.SITE_NAME.'密码重置确认信</td>

  </tr>

  <tr>

    <td style="padding-left:15px;padding-top:10px;line-height:22px;">

		<strong style="font-size:14px">'.$userName.'，您好！</strong><br />

		<p style="padding-top:5px; margin:0;">

        	您刚才在'.SITE_NAME.'上申请了重新设置登录密码，请在60分钟内点击下面的链接来重置密码。<br />
			<a href="'.$url.'" style="color:#0066CC; text-decoration:none">'.$url.'</a><br />
			（如果链接无法点击，请将上面的地址复制到浏览器的地址栏中，打开页面即可）

		</p>

</td>

  </tr>

  <tr>

    <td style="padding-top:30px;padding-left:15px; padding-bottom:20px;line-height:22px;">

	<strong>

		这是一封系统邮件，请勿回复<br />

		'.SITE_NAME.'——为顺利通过考试保驾护航

	</strong>

    <br />

		<a href="'.DOMAIN.'" style="color:#0066CC;">'.DOMAIN.'</a><br />

		客服电话：'.CONTACT_PHONE.'<br />

		客服信箱：<a  style="color:#000; text-decoration:none">'.CONTACT_EMAIL.'</a><br />



	</td>

  </tr>



</table>

</body></html>';
    	return $html;
    }

}