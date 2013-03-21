$.registerNameSpace("bf.app.setting.tag");


$.bf.app.setting.tag = {
	MIN_TAG_LEN : 1,
	MAX_TAG_LEN : 16,
	HOT_DOG_WIDTH : '366',
	setUserTagHover : function()
	{
		$("[attr='li_user_tag']").hover(
			function()
			{
				$(this).attr('class','hover');
			},
			function()
			{
				$(this).removeClass();
			}
		);
	},
	setHotDogStyle : function(type,tag_name)
	{
		type = type || 0;
		tag_name = tag_name || '';
		
		if(!type || !tag_name)
		{
			return false;
		}

		$("[attr='hot_tag']").each(function(){
			if($(this).html() == tag_name)
			{
				if(type == 1)
				{
					$(this).attr('class','disabled');
				}
				else if(type == 2)
				{
					$(this).removeClass();
				}
			}
		});
	},
	addUserTag : function(tag_name)
	{
		tag_name = tag_name || '';
		if(!tag_name)
		{
			return false;
		}
		var data = {'tag_name' : tag_name , 'type' : 1};
			$.bf.ajax.request('/setting/posttag' , data , 
					function(result){
						//$.bf.module.Tooltip.show('提交成功');
						var tmp_data = {'tag_id' : result.tag_id , 'tag_name' : tag_name};
						$("<li></li>").appendTo($("[attr='ul_user_tag']")).end().show().setTemplateElement("tmp_user_tag").processTemplate(tmp_data).show();
						$("[attr='ul_user_tag']").children('li').last().attr('attr','li_user_tag');
						this.setUserTagHover();
						$("#tag_name").val('');
						this.setHotDogStyle(1,tag_name);
						if($('#tag_none').css('display') != "none")
						{
							$('#tag_none').remove();
						}
					}.bind($.bf.app.setting.tag),
					function(errno,error){
						$.bf.module.TxtTips.show($("[attr='btn_post_tag']"), error);
						if(errno == 1006 || errno == 1005)
						{
							$("#tag_name").val('');
						}
						return false;
					}
			);
	},
	getHotDogLiSize : function()
	{
		return $("[attr='ul_hot_dog'] li").size();
	},
	auto:function(time){
		var _time = time||1000;
		this._autoHandler = setInterval(function(){
			$("[attr='tag_next']").click();
		},_time);
	},
	pause:function(){
		clearInterval(this._autoHandler);
	}
};


$(function(){


	var obj_this = $.bf.app.setting.tag;
	//提交tag
	$("[attr='btn_post_tag']").click(
		function(){
			var tag_name = $("#tag_name").val() || '';
			if($.getByteLen(tag_name) < this.MIN_TAG_LEN || $.getByteLen(tag_name) > this.MAX_TAG_LEN)
			{
				var error = '请填写'+this.MAX_TAG_LEN/2+'个汉字或'+this.MAX_TAG_LEN+'个字符';
				$.bf.module.TxtTips.show($("[attr='btn_post_tag']"), error);
				return false;
			}
			this.addUserTag(tag_name);
		}.bind($.bf.app.setting.tag)
	);

	//删除tag
	$("[attr='del_user_tag']").live('click',
		function(){
			var tag_id = $(this).attr('tag_id') || 0 ,
				tag_name = $(this).attr('tag_name') || '';
				obj = $(this);
			if(!tag_id)
			{
				return false;
			}
			var data = {'tag_id' : tag_id ,'type' : 2};
			$.bf.ajax.request('/setting/posttag', data , 
				function(result)
				{
					//$.bf.module.Tooltip.show('操作成功');
					obj.parents("[attr='li_user_tag']").remove();
					this.setHotDogStyle(2,tag_name);
					var user_tag_size =  $("[attr='ul_user_tag'] li").size();
					if(user_tag_size<=0)
					{
						$("[attr='div_user_tag']").append('<span id="tag_none">还未设置标签，可以选择热门标签或则贴上自己的标签</span>');
					}
				}.bind($.bf.app.setting.tag),
				function(errno , error)
				{
					$.bf.module.Tooltip.show( error , $.bf.ui.Tooltip.icons.ERROR);
					return false;
				}
			);
	});


	obj_this.setUserTagHover();
	

	

	$("[attr='hot_tag']").live('click' , function(){
		if($(this).attr('class') == 'disabled' )
		{
			return false;
		}
		obj_this.addUserTag($(this).html());
	});

	$("[attr='tag_next']").live('click',function(){
		var li_size = parseInt(obj_this.getHotDogLiSize()),
			obj_ul = $("[attr='ul_hot_dog']"),
			page = parseInt(obj_ul.attr('page'));
			if(page >= li_size)
			{
				return false;
			}
			obj_ul.animate({marginLeft: "-=366px"}, 'slow');
			obj_ul.attr('page',++page);
	});


	$("[attr='tag_prev']").live('click',function(){
		var obj_ul = $("[attr='ul_hot_dog']");
			page = parseInt(obj_ul.attr('page'));
			if(page <= 1)
			{
				return false;
			}
			obj_ul.animate({marginLeft: "+=366px"}, 'slow');
			obj_ul.attr('page',--page);
	});
	$(".tagsList").mouseover(function(){$.bf.app.setting.tag.pause();});
	$("[attr='tag_next']").hover(function(){$.bf.app.setting.tag.pause();$(this).removeClass("starNextGray")},function(){$(this).addClass("starNextGray")});
	$("[attr='tag_prev']").hover(function(){$.bf.app.setting.tag.pause();$(this).removeClass("starPreGray")},function(){$(this).addClass("starPreGray")});
	
	$.bf.app.setting.tag.auto(4000);
});
