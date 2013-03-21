$.registerNameSpace("bf.app.skin.index");

$.bf.app.skin.index = {
	CONTAINER_ID : 'customize_theme_pop',

	changePage : function(page)
	{
		var page_count = $("[attr='skin_page']").size() || 0,
			page_size = $("#skin_page_size").val() || 0;
		

		if(!page || page>page_count)
		{
			return false;
		}

		
		
		$("[attr='li_skin']").hide();

		$("[attr='li_skin']").slice((page-1)*page_size,page*page_size).show();

		$("[attr='skin_page']").removeClass();
		$("[attr='skin_page']").eq(page-1).addClass('cur')
		
	},

	getPage : function()
	{
		var page = 0;
		$("[attr='skin_page']").each(function(){
			if($(this).attr('class') == 'cur')
			{
				page = $(this).html();
			}
		});
		return page;
	}
};



$(function(){

	var obj_this = $.bf.app.skin.index;

	$("[attr='change_skin']").click(function(){
		$("#"+obj_this.CONTAINER_ID).show();
		$(".container").prepend($("#"+obj_this.CONTAINER_ID));
	});


	$("[attr='skin_close']").click(function(){
		$("#"+obj_this.CONTAINER_ID).hide();
	});

	$("[attr='skin_page_next']").click(function(){
		var page = parseInt(obj_this.getPage());
		obj_this.changePage(++page);
	});


	$("[attr='skin_page_prev']").click(function(){
		var page = parseInt(obj_this.getPage());
		obj_this.changePage(--page);
	});

	$("[attr='skin_page']").click(function(){
		obj_this.changePage($(this).html());
	});


	$("[attr='li_skin']").click(function(){
		var type = $(this).attr('skin_type');
		$("[attr='li_skin']").removeClass();
		$(this).addClass('over');
		$("[attr='save_skin']").attr('skin_type',type);
		var skin_css = $.bf.config.STATIC_URL+'/source/css/'+$(this).attr('skin_css');
		$('[attr="include_skin_css"]').attr('href', skin_css);
	});

	$("[attr='save_skin']").click(function(){
		var type = $(this).attr('skin_type') || 0,
			data = {'type' : type};
		if(!type || type<=0)
		{
			$.bf.module.Tooltip.show('请先选择后再保存' , $.bf.ui.Tooltip.icons.ERROR);
			return false;
		}
		$.bf.ajax.request('/skin/changeskin',data , 
			function(result){
				//$.bf.module.Tooltip.show('修改成功');
				$("#"+obj_this.CONTAINER_ID).hide();
			},
			function(errno , error){
				$.bf.module.Tooltip.show(error , $.bf.ui.Tooltip.icons.ERROR);
			}
		);
	})

});

