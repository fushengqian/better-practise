// JavaScript Document
;(function(){
	$.registerNameSpace("bf.app.apps.sort");
	
	
	$.extend($.bf.app.apps.sort,{
		
		
		_data	   :  0,//默认数据
		
		_appWrapId : "ul_app_wrap", //外框的id
		
		//初始化操作
		init : function ()
		{
			//初始化 拖拽
			$.bf.app.apps.drag.app_drag(this._appWrapId,this.sortCallback);
			
			//保存按钮的操作
			$("#btn_save").bind('click',function(){
				$.bf.app.apps.sort.getData();
			});
			
			
			//取消按钮的操作
			$("#btn_cancl").bind('click',function(){
				$("#" + $.bf.app.apps.sort._appWrapId).html($.bf.app.apps.sort._data);
				$.bf.app.apps.drag.app_drag($.bf.app.apps.sort._appWrapId,$.bf.app.apps.sort.sortCallback);
				$("#sort_tips").hide();
				$("#save_tips").hide();
				$("#default_tips").show();
			});
			
			//初始化数据
			$.bf.app.apps.sort._data = $("#" + $.bf.app.apps.sort._appWrapId).html();
			
		},
		
		
		//拖动后的回调
		sortCallback : function ()
		{
			$("#default_tips").hide();
			$('#sort_tips').show();
		},
		
		//获取排序的数据
		getData  :  function()
		{
			var s = '';
			$('#'+$.bf.app.apps.sort._appWrapId+' li').each(function(){
				s += '|' + ($(this).attr('app_id'));
			});
			$.bf.app.apps.sort.ajaxSubmit(s.substr(1));
		},
		
		//ajax 提交
		ajaxSubmit : function(str)
		{
			var data = {"app_list" : str};
			$.bf.ajax.request("/apps/updateSort" , data , 
				function (result)
				{
					$("#save_tips").css("display","block");
					$("#sort_tips").hide();
					setTimeout(function(){$("#save_tips").css("display","none");$("#default_tips").show();},1000);
				},
				function (errno,error)
				{
					$.bf.shortcut.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR)
				}
			);
		}
	
	});
	
	//初始化拖拽
	$(function (){
		$.bf.app.apps.sort.init();
	});
	
	
})();

