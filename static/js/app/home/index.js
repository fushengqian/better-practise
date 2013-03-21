$(function(){
	//empty
});

var showTab = function(showTabId, hiddenTabId) {
	var array = hiddenTabId.split("_");
	var nums = [ ];
	for (var i=0 ; i< array.length ; i++) {
	    $("[attr="+array[i]+"]").css('display' , 'none');
	    $("[attr=tab_"+array[i]+"]").removeClass('a');
	}
	$("[attr="+showTabId+"]").css('display' , 'block');
	$("[attr=tab_"+showTabId+"]").addClass('a');
};