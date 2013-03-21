// JavaScript Document
/*
$.registerNameSpace("bf.app.bar.myapp");



$.extend($.bf.app.bar.myapp,
	{
		skip_page  : function(page)
		{
			if(page<=0 || page>$("#total_page").val())
			{
				page=1;
			}
			
			var collection_app_list=jQuery.data(document.body , 'collection_app_list');
			var page_size = $("#page_size").val();
			var data = collection_app_list.slice( parseInt((page-1) * page_size,10),
												  page * page_size );
			$("#collection_app_list_wrap").setTemplateElement("tmp_collection_app_list");
			$("#collection_app_list_wrap").processTemplate(data);
			
			//把当前页高亮
			$("a[name='skip_page']").removeClass();
			$("a[name='skip_page']").each(
					function(){
						if($(this).attr("page")==page)
						{
							$(this).addClass("cur");
						}
					}
			);
		}
	}
);

$(function(){

	$("#tab_wrap a").hover(
		function(){
			$("#tab_wrap > a").each(
				function(){
					$(this).removeClass();
				}
			);
			$(this).addClass("cur");
			
			$("#data_wrap > div").each(
				function(){
					$(this).css("display","none");
				}
			)
			
			$("#" + $(this).attr("tab")).css("display","block");
			
		}
	);
	
	
	$("a[name='skip_page']").click(function(){
		$.bf.app.bar.myapp.skip_page($(this).attr("page"));
	});
	
})*/