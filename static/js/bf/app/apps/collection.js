$.registerNameSpace("bf.app.apps.collection");

$.extend($.bf.app.apps.collection, {
	
	//删除收藏的数据
	delCollectionData : function(del_id)
	{
		var data = { "id" : del_id};
		$.bf.ajax.request("/apps/delete" , data , 
			function(result)
			{
				$.bf.shortcut.Tooltip.show("已删除成功", $.bf.ui.Tooltip.icons.OK);
				
				$("a[del_id='"+del_id+"']").parent("li").remove();
				
				//没有一个收藏的app
				if($("[attr='delete']").length<=0)
				{
					location.href='/apps/collectfion';
				}
			},
			function(errno,error)
			{
				$.bf.shortcut.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR);	
			}
		);
	},
	
	addCollectionData : function (id,callback)
	{
		var data ={ "id" : id };
		$.bf.ajax.request("/apps/add" , data ,
		function(result)
		{
			if(jQuery.isFunction(callback))
			{
				callback();
			}
		},
		function(errno,error)
		{
			//弹出提示,超过最大收藏数量
			if(parseInt(errno,10)==1)
			{
				$.bf.shortcut.Alert.show({'message' : error , 'title' : "提示" , 'icon' : $.bf.ui.Alert.icons.SIGH , "buttonText" : '关闭'});
			}
			else if(parseInt(errno,10) == $.bf.config.errors.E_NEED_LOGIN)
			{
				location.href = $.bf.config.SITE_URL + '/login?refer=' + encodeURIComponent(location.href);
			}
			else 
			{
				$.bf.shortcut.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR);
			}
		}
	  );
	}
	
	
	
	
});


$("[attr='delete']").live('click',
	function(){
		var del_id = $(this).attr("del_id");
		$.bf.shortcut.Confirm.show({'message' : "确定要删除这个收藏", 'title' : "提示", 'iconType' : $.bf.ui.Tooltip.icons.DOUBT ,'onEnter' : function(){$.bf.app.apps.collection.delCollectionData(del_id);}});
		}
);



$("[attr='add']").live('click',function(){
	$.bf.app.apps.collection.addCollectionData($(this).attr("add_id"),function(){$.bf.shortcut.Tooltip.show("已收藏成功", $.bf.ui.Tooltip.icons.OK);});
});


$("[attr='sports_app_add']").live('click',function(){
	$.bf.app.apps.collection.addCollectionData($(this).attr("add_id"),
		function(){
			$(this).replaceWith('<a class="r" href="javascript:void(0);" style="text-decoration:none;" ><span>已收藏</span></a>');
			$.bf.shortcut.Tooltip.show("已收藏成功", $.bf.ui.Tooltip.icons.OK);
		}.bind(this));
});