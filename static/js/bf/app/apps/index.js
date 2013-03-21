// JavaScript Document
$.registerNameSpace("bf.app.apps.index");


$.extend($.bf.app.apps.index, {
	
	//热门app 每页数量
	hot_app_page_size :	4,
	collection_succ_html : "<span class='t999'>已收藏</span>",

	/*
	 @name	得到热门的app  
	 @param	page  页数
	 return	null
	 */
	getHotAppListByPage : function(page)
	{
		page=parseInt(page,10);
		var data=jQuery.data(document.body,"hot_app_list");
		var page_size = parseInt($.bf.app.apps.index.hot_app_page_size,10);
		var total_page=	parseInt(Math.ceil(data.length/page_size),10);
		if(page<1 || page>total_page )
		{
			page=1;
		}
		
		$("[attr='skip_page']").css("visibility","visible");
		//根据页数,设置显示的左右图片
		if(page==1)
		{
			$("#app_pre").css("visibility","hidden");
			$("#app_next").attr("page",page+1);
		}
		else if(page==total_page)
		{	
			$("#app_next").css("visibility","hidden");
			$("#app_pre").attr("page",total_page-1);
		}
		else
		{
			$("#app_pre").attr("page",page-1);
			$("#app_next").attr("page",page+1);
		}
		
		//返回数据渲染模板s
		data=data.slice((page-1) * page_size, page * page_size);
		$("#div_hot_app_list").setTemplateElement("tmp_hot_app_list");
		$("#div_hot_app_list").processTemplate(data);
	},
	
	initAppTypeList : function()
	{
		var data = jQuery.data(document.body, "all_type_app_list");
		
		//加载左侧导航的模板数据
		this.initAppTypeTab(data);
		//加载 整个分类的模板数据
		this.initAppTypeData(data);
		
		//把第一页数据渲染
		$("#div_type_app_list > div").each(
			function (){
				$.bf.app.apps.index.getAppTypeListByPage($(this).attr("attr"),1,"default");
				$.bf.app.apps.index.getAppTypeListByPage($(this).attr("attr"),1,"order");
			}
		);
		
	},
	
	initAppTypeData : function(data)
	{
		//加载 整个分类的模板数据
		$("#div_type_app_list").setTemplateElement("tmp_type_app_list");
		$("#div_type_app_list").processTemplate(data);	
	},
	
	initAppTypeTab : function (data)
	{
		//加载左侧导航的模板数据
		$("#ul_tab_type_name").setTemplateElement("tmp_tab_type_name");
		$("#ul_tab_type_name").processTemplate(data);
		
	},
	
	getAppTypeListByPage : function(type_id,page,tab_str)
	{
		  var page_size = $("#type_page_size").val();
		  var total_page = $("#hid_type_total_page_" + type_id).val();
		  page=parseInt(page,10);
		  if(page<=0 || page>total_page)
		  {
			  page = 1;
		  }
		  //显示第X页的数据 
		  $("#div_type_data_" + type_id).find("[tab_type='" +tab_str+ "']").find("li").css("display","none");
		  $("#div_type_data_" + type_id).find("[tab_type='" +tab_str+ "']").find("li").slice((page-1) * page_size , page_size * page).css("display","block");
		  $("#div_type_data_" + type_id).find("[tab_type='" +tab_str+ "']").find("a[attr='page']").removeClass();
		  $("#div_type_data_" + type_id).find("[tab_type='" +tab_str+ "']").find("a[attr='page']").each(
		  	function()
			{
				if($(this).attr("page") == page)
				{
					$(this).addClass("cur");
				}
			}
		  );
	},
	
	//根据分类id 切换至不同的数据 all->表示全部数据 其他数字id 对应分类id
	changeAppTypelist : function(type_id)
	{
		if(type_id=='all')
		{
			$("#div_type_app_list").hide();		//隐藏分类的最外框
			$("#div_type_app_list > div").hide();	//隐藏所有分类框的数据
			$("#div_all_app_list").show();		//显示全国的框的数据
			$("#div_type_top_image").attr("class","hdT"); //显示头部红色的小图片
		}
		else
		{
			$("#div_all_app_list").hide();	//隐藏全部的框的数据
			$("#div_type_app_list > div").hide();	//隐藏所有分类框的数据
			$("#div_type_wrap_" + type_id).show();	//显示某个分类框的数据
			$("#div_type_app_list").show();			//显示分类的最外框
			$("#div_type_top_image").attr("class","hd"); //显示头部黄色的小图片
			
		}
		$("#nav_type_" + type_id).parents("ul").find("li").removeClass("cur");
		$("#nav_type_" + type_id).parent("li").addClass("cur");
		if($("#nav_type_" + type_id).parents("ul").find("li").last().attr("class") != 'bb0')
		{
			$("#left_tab_default_bottom").hide();
			$("#left_tab_last_bottom").show();
		}
		else
		{
			$("#left_tab_last_bottom").hide();
			$("#left_tab_default_bottom").show();
		}
	},

	addCollectionCallBack : function(app_id)
	{
		if(!app_id)
		{
			$.bf.shortcut.Tooltip.show('系统错误,调试ing.',$.bf.ui.Tooltip.icons.ERROR);
			return;
		}
		else
		{
			$.bf.shortcut.Tooltip.show('添加收藏成功',$.bf.ui.Tooltip.icons.OK);
			$("[add_id='"+app_id+"']").replaceWith(this.collection_succ_html);
		}
	}
	
	
});



//人气榜单点击分页
$("[attr='skip_page']").live('click',function(){
	$.bf.app.apps.index.getHotAppListByPage($(this).attr("page"));
});

//分类数据点击分页
$("a[attr='page']").live('click',function(){
	$.bf.app.apps.index.getAppTypeListByPage($(this).parent().attr("page_type"),$(this).attr("page"),$(this).attr("tab"));
});


//切换全部数据 or 分类的某个数据
$("a[attr='show_type']").live('click',function(){
	$.bf.app.apps.index.changeAppTypelist($(this).attr("type_id"));
});


//切换最多人玩 or 最新上架 tab
$("a[attr='type_tab']").live('click',function(){
	
	$(this).siblings("a").removeClass();
	$(this).addClass("cur");
	$("#div_type_data_" + $(this).attr("type_id") +" > div").hide();
	$("#div_type_data_" + $(this).attr("type_id")).find("[tab_type='"+$(this).attr("show_tab")+"']").show();
	
});

//添加收藏的操作
$("[attr='add_collection']").live('click',function(){
	$.bf.app.apps.collection.addCollectionData($(this).attr("add_id"),
		function(){
			$.bf.app.apps.index.addCollectionCallBack($(this).attr("add_id"));
		}.bind(this)
	);
});


//我的收藏分页的操作
$("[attr='collection_page']").live('click' , function(){
	var c_page_size = $('#c_page_size').val(),
		c_page = $(this).html();
	$(this).siblings('a').removeClass();
	$(this).addClass('cur');
	$('#ul_collection_data li').hide();
	$('#ul_collection_data li').slice((c_page-1) * c_page_size , c_page_size * c_page).show();
});