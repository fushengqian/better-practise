//时间联动
$.registerNameSpace('bf.utils.time');

$.bf.utils.time =  { 
  joinTime: function(yid,Interval,mid,did,atomId,defaultYear){
	$.bf.utils.time.getYearList(yid,Interval,defaultYear);
	$.bf.utils.time.getMonthList(mid);
	if(typeof(did)=='undefined')return;
	$.bf.utils.time.getDayList(did);
	atomVal=this.checkAtom($('#'+mid).val(),$('#'+did).val());
	//alert(atomVal);
	$('#'+atomId).html(atomVal);
	$('#'+yid).change(function(){
		$.bf.utils.time.getDay(yid,mid,did);
		atomVal=$.bf.utils.time.checkAtom(parseInt($('#'+mid).val()),parseInt($('#'+did).val()));
		if(typeof(atomId)!='undefined')$('#'+atomId).html(atomVal);
	});
	$('#'+mid).change(function(){
		$.bf.utils.time.getDay(yid,mid,did);
		atomVal=$.bf.utils.time.checkAtom(parseInt($('#'+mid).val()),parseInt($('#'+did).val()));
		if(typeof(atomId)!='undefined')$('#'+atomId).html(atomVal);
	});
	$('#'+did).change(function(){
		atomVal=$.bf.utils.time.checkAtom(parseInt($('#'+mid).val()),parseInt($('#'+did).val()));
		if(typeof(atomId)!='undefined')$('#'+atomId).html(atomVal);
	});
  },
  getYear:function(){
	  var time=$.bf.common.getCookie('__bustm');
	  var now;
	  if(!time){
		var d=new Date();
		now=parseInt(d.getFullYear());
	  }else{
		now=1970+parseInt(time/(3600*24*365));
	  }
	  return now;
  },
  getYearList : function(id,Interval,defaultYear){
		var now=this.getYear();
		yearSel='';
		if($('#'+id+" option").length>0)yearSel=$("#"+id)[0].options[0].value,$("#"+id)[0].options.length = 0;
		else if(defaultYear)yearSel=defaultYear,$("#"+id)[0].options.length = 0;
		for(i=now,index=0;i>=parseInt(now-Interval);i--,index++){
			$("#"+id)[0].options.add(new Option(i,i));
			if(i==yearSel)$("#"+id)[0].options[index].selected=true;
		}
  },
  getMonthList : function(id){
	    monthSel='';
		if($('#'+id+" option").length>0)monthSel=$("#"+id)[0].options[0].value,$("#"+id)[0].options.length = 0;
		for(i=1,index=0;i<=12;i++,index++){
			$("#"+id)[0].options.add(new Option(i,i)); 
			if(i==monthSel)$("#"+id)[0].options[index].selected=true;
		}
  },
  getDayList : function(id){
	daySel='';
	if($('#'+id+" option").length>0)daySel=$("#"+id)[0].options[0].value,$("#"+id)[0].options.length = 0;
	for(i=1,index=0;i<=31;i++,index++){
		$("#"+id)[0].options.add(new Option(i,i));
		if(i==daySel)$("#"+id)[0].options[index].selected=true;
	}
  },
  getDay : function(y,m,d){
	var MonthDayNo = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
	var year=$("#"+y)[0].options[$("#"+y)[0].selectedIndex].value;
	var month=$("#"+m)[0].options[$("#"+m)[0].selectedIndex].value;
	var day=$("#"+d)[0];
	if(month==2){
		MonthDayNo[1]=((year%400 == 0) || ((year%4==0) && (year%100 !=0)))? 29 : 28;
	}
	$(day).empty();
	if(jQuery.browser.msie){
		for(var i=1;i<=MonthDayNo[month-1];i++){
			var oOption = document.createElement("OPTION");
			day.options.add(oOption);
			oOption.innerText = i;
			oOption.value = i;
		}	
	}
	else {
		for(var i=1;i<=MonthDayNo[month-1];i++){
			var option=new Option(i,i);
			day.options.add(option);
		}
	}
  },
  checkAtom : function(month,day){
		var s="魔羯水瓶双鱼牡羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯";
		var arr=[20,19,21,21,21,22,23,23,23,23,22,22];
		return s.substr(month*2-(day<arr[month-1]?2:0),2)+'座';
  }
};