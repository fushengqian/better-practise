if (typeof(snda) == 'undefined') snda = {};
if (typeof(snda.component) == 'undefined') snda.component = {};

var SCHOLL_TYPE_HIGHSCHOOL = 1;
var SCHOLL_TYPE_COLLEGESCHOOL = 2;
var SCHOLL_TYPE_JUNIORCHOOL = 3;

snda.component.school = {
	_school_location : [],
	_schools : null,
	_opened : false,
	_callback : null,
	_last_prov_id : null,
	_last_city_id : null,
	_last_district_id : null,
	_school_type : SCHOLL_TYPE_HIGHSCHOOL,
	_cached : {},

	popup : function(comp_id, type) {
		snda.component.school.popupEx(type, function(name) {
			var comp = document.getElementById(comp_id);
			comp.value = name;
		});
	},
	
	popupEx : function(type, callback) {
		if (snda.component.school._opened) {
			//snda.component.school.close();
		}
		snda.component.school._school_type = type ? type : SCHOLL_TYPE_HIGHSCHOOL;
		snda.component.school._last_prov_id = null;
		snda.component.school._last_city_id = null;
		snda.component.school._last_district_id = null;
		snda.component.school._schools = null;
		snda.component.school._callback = callback;
		snda.component.school._opened = true;
		snda.component.school._display();
	},
	
	close : function() {
		snda.component.school._opened = false;
		snda.uclib.component.dialog.close();
	},

	_onSchoolChanged : function(name) {
		if (snda.component.school._callback) {
			snda.component.school._callback(name);
		}
		snda.component.school.close();
	},

	_onCityChanged : function(index, id) {
		if (snda.component.school._last_city_id == index) return;
		if (snda.component.school._last_city_id != null)  {
			var comp = document.getElementById("_school_selector_city_" + snda.component.school._last_city_id);
			if (comp) comp.className = "";
		}

		snda.component.school._last_city_id = index;
		var comp = document.getElementById("_school_selector_city_" + index);
		if (comp) comp.className = "cur";

		snda.component.school._last_district_id = null;
		document.getElementById("_school_selector_districts").innerHTML = "";
		document.getElementById("_school_selector_districts").style.display = "none";
		document.getElementById("_school_selector_schools").innerHTML = "";

		var url = snda.lib.constant.__STATIC_URL+'/js/uclib/data/schools/' + snda.component.school._school_type + '/' + id + '.js';
		if (snda.component.school._cached[url]) {
			var schools = snda.component.school._cached[url];
			snda.component.school._schools = schools;
			snda.component.school._loadSchools(schools);
		} else {
			$.getScript(url, function() {
				snda.component.school._cached[url] = _schools;
				if (_schools.id == id) {
					snda.component.school._schools = _schools;
					snda.component.school._loadSchools(_schools);
				}
			});
		}
	},

	_loadSchools : function(schools) {
		if (schools.data.length > 1) {
			var html = "";
			for (var i = 0; i < schools.data.length; ++i) {
				html += "<a href='#'  id=_school_selector_district_"+i+" onclick='snda.component.school._onDistrictChanged("+i+");return false;'>"+schools.data[i][0]+"</a>\n";
			}
			document.getElementById("_school_selector_districts").innerHTML = html;
			document.getElementById("_school_selector_districts").style.display = "";
		} else {
			document.getElementById("_school_selector_districts").innerHTML = "";
			document.getElementById("_school_selector_districts").style.display = "none";
		}
		if (snda.component.school._school_location[snda.component.school._last_prov_id].length > 3) {// 直辖市
			document.getElementById("_school_selector_cities").style.display = "none";
		}
		if (schools.data.length > 0) {
			snda.component.school._onDistrictChanged(0);
		} else {
			document.getElementById("_school_selector_schools").innerHTML = "对不起，没有这个地区的学校信息";
		}
	},
		
	_onDistrictChanged : function(index) {
		
		if (snda.component.school._last_district_id == index) return;
		if (snda.component.school._last_district_id != null)  {
			var comp = document.getElementById("_school_selector_district_" + snda.component.school._last_district_id);
			if (comp) comp.className = "";
		}

		snda.component.school._last_district_id = index;
		var comp = document.getElementById("_school_selector_district_" + index);
		if (comp) comp.className = "cur";

		var html = "<ul>";
		for (var i = 0; i < snda.component.school._schools.data[index][1].length; ++i) {
			html += "<li><a href='#' onclick='snda.component.school._onSchoolChanged(\""+snda.component.school._schools.data[index][1][i]+"\");return false;'>"+snda.component.school._schools.data[index][1][i]+"</a></li>";
		}
		html += "</ul>";
		document.getElementById("_school_selector_schools").innerHTML = html;
	},

	_onProvChanged : function(index) {
		if (index < 0 || index >= snda.component.school._school_location.length) return;

		if (snda.component.school._last_prov_id == index) return;
		if (snda.component.school._last_prov_id != null)  {
			var comp = document.getElementById("_school_selector_prov_" + snda.component.school._last_prov_id);
			comp.className = "";
		}

		snda.component.school._last_city_id = null;
		snda.component.school._last_district_id = null;

		snda.component.school._last_prov_id = index;
		var comp = document.getElementById("_school_selector_prov_" + index);
		comp.className = "cur";

		var super_city = snda.component.school._school_location[index].length > 3;

		var cities = snda.component.school._school_location[index][2];
		var html = "";
		for (var i = 0; i < cities.length; ++i) {
			if (super_city)
				html += "<a href='#'  id=_school_selector_city_"+i+" onclick='return false;'>"+cities[i][1]+"</a>\n";
			else
				html += "<a href='#'  id=_school_selector_city_"+i+" onclick='snda.component.school._onCityChanged("+i+", "+cities[i][0]+");return false;'>"+cities[i][1]+"</a>\n";
		}
		document.getElementById("_school_selector_cities").innerHTML = html;
		document.getElementById("_school_selector_districts").innerHTML = "";
		document.getElementById("_school_selector_districts").style.display = "none";
		document.getElementById("_school_selector_cities").style.display = "";

		if (super_city) {
			snda.component.school._onCityChanged(0, snda.component.school._school_location[index][0]);
		} else {
			if (cities.length > 0)
				snda.component.school._onCityChanged(0, cities[0][0]);
		}
	},

	_display : function() {
		var html = '<div style="width: 645px;top:430%;" class="popup"><div class="shadow"></div><div class="popupBox"><div class="popupTitle"><a class="r" href="javascript:void(0)" tag="close" onclick="snda.component.school.close();return false;"><span class="iconClose"></span></a>选择学校</div>';
		html += '<div class="popupMain">';

		// 加载省
		html += '<div class="popSearchCity">';
		for (var i = 0; i < snda.component.school._school_location.length; ++i) {
			html += "<a id=_school_selector_prov_"+i+" href='#' onclick='snda.component.school._onProvChanged("+i+");return false;'>"+snda.component.school._school_location[i][1]+"</a>\n";
		}
		html += "</div>";

		// 加载市
		html += '<div class="popSearchCity" id=_school_selector_cities style="margin-top:10px;"></div>';

		// 区列表
		html += '<div class="popSearchCity" id=_school_selector_districts style="margin-top:10px;display:none"></div>';

		// 学校列表
		html += '<div class="popSchoolList" id=_school_selector_schools></div>';
		
		// 加载输入框
		html += '<div class="r">找不到我的学校,我要自己输入:&nbsp;<input type="text" class="text" id=_school_selector_name style="width: 150px;" />&nbsp;<span class="button"><span><button type="button" onclick="snda.component.school._onSchoolChanged(document.getElementById(\'_school_selector_name\').value);return false;">确认</button></span></span></div><div class="clear"></div></div></div></div>';
		snda.uclib.component.dialog.popupHtml(html);
		if (snda.component.school._school_location.length > 0) {
			snda.component.school._onProvChanged(0);
		}
	},

	
	_setPYEnd : function(pinyins) {
		var index = 0;
		for (var i = 0; i < snda.component.school._school_location.length; ++i) {
			for (var j = 0; j < snda.component.school._school_location[i].univs.length; ++j) {
				snda.component.school._school_location[i].univs[j][2] = pinyins[index].join("\n");
				++index;
			}
		}
	}
};


$(document).ready(function() {
	$.getScript($.bf.config.getStaticPath() + '/source/js/bf/app/searchfriends/school_location.lib.js',function(){	//加载大学	
		snda.component.school._school_location=_school_location;
	});
});
