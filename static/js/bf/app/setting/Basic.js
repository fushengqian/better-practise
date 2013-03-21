$.registerNameSpace('bf.app.setting');


$(function(){
	if($("#basic_page").val())
	{
		setTimeout(function(){
			$.bf.utils.City.City.joinCity('basic_hometown_provinces','basic_hometown_cities','basic_hometown_towns'); // 家乡
			$.bf.utils.City.City.joinCity('basic_location_provinces','basic_location_cities','basic_location_towns'); // 居住地
		},200);
	}
	~function(){
		// init
		~function()
		{
			var basic_info = $.bf.app.setting.basic_info;
			if(basic_info)
			{
				$("[attr='basic_nickText']").text(basic_info.nick || ''); // 昵称
				$("[attr='basic_realname']").val(basic_info.realname || ''); // 真实姓名
				$("[attr='basic_gender']").val(basic_info.gender || ''); // 性别
				var birthday = basic_info.birthday.split("-");
				$("[attr='basic_year']").val(birthday[0] || ''); // 生日-年
				$("[attr='basic_month']").val((birthday[1] || '').replace(/^0/, '')); // 生日-月
				$("[attr='basic_date']").val((birthday[2] || '').replace(/^0/, '')); // 生日-日
				$("[attr='basic_blood']").val(basic_info.blood || ''); // 血型
			}
		}();
		// end init
		$.extend($.bf.app.setting, {
			basic : {
				/**
				* 改变成修改昵称UI
				* @param nick 昵称
				*/
				changeNickUI : function(nick)
				{
					nick = nick || $("[attr='basic_nickText']").text() || '';
					$("[attr='basic_nickContainer']").empty().append($.sprintf('\
						<span class="setTitle">昵称：</span>\
						<input attr="basic_nickInput" maxlength="14" type="text" class="mgr5 txt1 inputStyleShort" value="%s" />\
						<span class="t999 ml5">昵称唯一不能重复</span>\
					', nick));
				},
				/**
				* 重置回显示昵称UI
				*/
				resetChangeNickUI : function(nick)
				{
					nick = nick || $("[attr='basic_nickInput']").val() || '';
					$("[attr='basic_nickContainer']").empty().append($.sprintf('\
						<span class="setTitle">昵称：</span>&nbsp;\
						<span attr="basic_nickText">%s</span>\
						<a href="javascript:;" attr="basic_changeNickBtn" class="marginLt10">修改</a>\
					', nick));
				}
			}
		});
	}();

	//基本资料部分
	// 修改昵称
	$("[attr='basic_changeNickBtn']").live('click', function(event){
		event.preventDefault();
		event.stopPropagation();

		$.bf.app.setting.basic.changeNickUI();
	});

	// 保存个人基本资料
	$("[attr='basic_save']").click(function(event){
		event.preventDefault();
		event.stopPropagation();
		
		var tipc = $("[attr='basic_tips']"); // 消息提示容器
		// 是否需要修改昵称
		var nick, nickInput = $("[attr='basic_nickInput']");
		if(nickInput.size() > 0)
		{
			nick = nickInput.val(); // 昵称
		}
		else
		{
			nick = $("[attr='basic_nickText']").text();
		}
		var realname           = $.trim($("[attr='basic_realname']").val()); // 真实姓名
		var gender             = $.trim($("[attr='basic_gender']").val()); // 性别
		var year               = $.trim($("[attr='basic_year']").val()); // 生日－年
		var month              = $.trim($("[attr='basic_month']").val()); // 生日－月
		var day                = $.trim($("[attr='basic_date']").val()); // 生日－日
		var blood              = $.trim($("[attr='basic_blood']").val()); // 血型
		var intro              = $.trim($("[attr='basic_intro']").val()); // 个人简介
		// 家乡
		var hometown_provinces = $("[attr='basic_hometown_provinces']"); // 省
		var hometown_city      = $("[attr='basic_hometown_cities']"); // 居住地－市
		var hometown_towns     = $("[attr='basic_hometown_towns']"); // 乡镇
		var hometown_area_id   = 0; // 居住地代号
		if(hometown_towns.size() > 0 && hometown_towns.is(":visible") && $.trim(hometown_towns.val()) > 0)
		{
			hometown_area_id = $.trim(hometown_towns.val());
		}
		else if(hometown_city.size() > 0 && hometown_city.is(":visible") && $.trim(hometown_city.val()) > 0)
		{
			hometown_area_id = $.trim(hometown_city.val());
		}
		else if(hometown_provinces.size() > 0 && hometown_provinces.is(":visible") && $.trim(hometown_provinces.val()) > 0)
		{
			hometown_area_id = $.trim(hometown_provinces.val());
		}
		// 居住地
		var location_provinces = $("[attr='basic_location_provinces']"); // 省
		var location_city      = $("[attr='basic_location_cities']"); // 居住地－市
		var location_towns     = $("[attr='basic_location_towns']"); // 乡镇
		var location_area_id   = 0; // 居住地代号
		if(location_towns.size() > 0 && location_towns.is(":visible") && $.trim(location_towns.val()) > 0)
		{
			location_area_id = $.trim(location_towns.val());
		}
		else if(location_city.size() > 0 && location_city.is(":visible") && $.trim(location_city.val()) > 0)
		{
			location_area_id = $.trim(location_city.val());
		}
		else if(location_provinces.size() > 0 && location_provinces.is(":visible") && $.trim(location_provinces.val()) > 0)
		{
			location_area_id = $.trim(location_provinces.val());
		}

		// 数据验证
		if($.getByteLen(nick) < 4)
		{
			$.bf.module.TxtTips.show(tipc,'昵称最短为2个中文或4个字符');
			return false;
		}
		if($.getByteLen(intro) > 200)
		{
			$.bf.module.TxtTips.show(tipc,'简介最多不超过100个汉字');
			return false;
		}
		var ereg = /^[\u4e00-\u9fa5]/;
		if($.getByteLen(realname)>0 && !ereg.test(realname))
		{
			$.bf.module.TxtTips.show(tipc,'真实姓名必须以汉字开头');
			return false;
		}

		if($.getByteLen(realname)>14)
		{
			$.bf.module.TxtTips.show(tipc,'真实姓名最多14个字符');
			return false;
		}


		var data = {
			nick             : nick,
			realname         : realname,
			gender           : gender,
			year             : year,
			month            : month,
			day              : day,
			blood            : blood,
			location_area_id : location_area_id,
			hometown_area_id : hometown_area_id,
			intro            : intro,
			'flag'           : 'addbasic'
		};

		$.bf.ajax.request('/setting/basic', data, function(result){
			
			// 更新星座
			$("[attr='basic_star']").text(result.star);
			$.bf.common.setUserPanelNick(nick);
			$.bf.app.setting.basic.resetChangeNickUI(nick);

			//tipc.html("");
			$("[attr='show_nick']").html(nick);
			$.bf.module.TxtTips.show(tipc,'已成功保存');
		}, function(errno, error){
			if(errno == 500)
			{
				$.bf.module.TxtTips.show(tipc,'保存失败');
			}
			else
			{
				$.bf.module.TxtTips.show(tipc,'保存失败'+error);
			}
		}, 'POST');
	});
	//end
	// 联系方式部分
	$("[attr='contact_save']").click(function(event){
		event.preventDefault();
		event.stopPropagation();

		var tipc = $("[attr='contact_tips']"); // 消息容器

		var mobile     = $.trim($("[attr='contact_mobile']").val()); // 手机号码
		var phone      = $.trim($("[attr='contact_phone']").val()); // 电话号码
		var qq         = $.trim($("[attr='contact_qq']").val()); // qq号码
		var msn        = $.trim($("[attr='contact_msn']").val()); // msn
		var email      = $.trim($("[attr='contact_email']").val()); // email
		var mobile_opt = $.trim($("[attr='contact_mobile_opt']").val()); // 手机号码选项
		var phone_opt  = $.trim($("[attr='contact_phone_opt']").val()); // 电话号码选项
		var qq_opt     = $.trim($("[attr='contact_qq_opt']").val()); // qq号码选项
		var msn_opt    = $.trim($("[attr='contact_msn_opt']").val()); // msn选项
		var email_opt  = $.trim($("[attr='contact_email_opt']").val()); // email选项

		if(mobile != '' && !$.bf.common.mobileCheck(mobile))
		{
			$.bf.module.TxtTips.show(tipc,'手机格式不正确');
			return false;
		}

		if(phone != '' && !$.bf.common.telCheck(phone))
		{
			$.bf.module.TxtTips.show(tipc,'电话格式不正确');
			return false;
		}
		if(qq != '' && !$.bf.common.qqCheck(qq))
		{
			$.bf.module.TxtTips.show(tipc,'QQ号码只能是5-11位数字');
			return false;
		}
		if(msn != '' && !$.bf.common.emailCheck(msn))
		{
			$.bf.module.TxtTips.show(tipc,'msn格式不正确');
			return false;
		}
		if(msn.toString().length > 50)
		{
			$.bf.module.TxtTips.show(tipc,'msn字符过长');
			return false;
		}
		if(email != '' && !$.bf.common.emailCheck(email))
		{
			$.bf.module.TxtTips.show(tipc,'邮箱格式不正确');
			return false;
		}

		if(email.toString().length > 50)
		{
			$.bf.module.TxtTips.show(tipc,'邮箱字符过长');
			return false;
		}

		var data = {
			mobile     : mobile,
			mobile_opt : mobile_opt,
			phone      : phone,
			phone_opt  : phone_opt,
			qq         : qq,
			qq_opt     : qq_opt,
			msn        : msn,
			msn_opt    : msn_opt,
			email      : email,
			email_opt  : email_opt,
			'flag'     : 'addcontact'
		};

		$.bf.ajax.request('/setting/basic', data, function(result){

			//tipc.html("");
			$.bf.module.TxtTips.show(tipc,'已成功保存');
		}, function(errno, error){
			if(errno == 500)
			{
				$.bf.module.TxtTips.show(tipc,'保存失败');
			}
			else
			{
				$.bf.module.TxtTips.show(tipc,'保存失败，' + error);
			}
		}, 'POST');
	});
	//end
	

	

	
	//Tab切换
	var menus = $("[attr='menuCon']").find('a');
	menus.each(function(index, item){
		$(this).click(function(event){
			event.preventDefault();
			event.stopPropagation();

			var flag = $(this).attr('flag');
			menus.removeClass();
			$(this).addClass('cur');
			$("[attr='menuWrap']")
			.siblings()
			.hide()
			.eq(index)
			.show();
		});
	});

});




$(function(){
	
	$.extend($.bf.app.setting,{
		getDate : function(){
			var year = $("[attr='basic_year']").val();
			var month = $("[attr='basic_month']").val();
			return [year,month];
		},
		setMonthDay : function(){
			var ar_date = $.bf.app.setting.getDate(),
				day = $.bf.common.getMonthDay(ar_date[0],parseInt(ar_date[1])-1),
				obj_opt = $("[attr='basic_date']").find('option'),
				cur_day = obj_opt.length;
			if(cur_day > day)
			{
				for(var j=day;j<cur_day;j++)
				{
					obj_opt.eq(j).remove();
				}
			}
			else
			{
				for(var i=cur_day+1;i<=day;i++)
				{
					$("[attr='basic_date']").append("<option value='"+i+"'>"+i+"</option>");
				}
			}
		}
	});


	$("[attr='basic_year']").bind('change',function(){
		$.bf.app.setting.setMonthDay();
	});

	$("[attr='basic_month']").bind('change',function(){
		$.bf.app.setting.setMonthDay();
	});
});
