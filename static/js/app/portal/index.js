
$(function() {
	//左菜单点击
	$(".chapter_list dl").click(function () {
        $(this).attr("class", "act").siblings().removeClass("act");
    })
});