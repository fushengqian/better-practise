if (typeof(snda) == 'undefined') snda = {};
if (typeof(snda.component) == 'undefined') snda.component = {};

snda.component.university = {
	_universities : [],
	_opened : false,
	_callback : null,
	_last_filter : "",
	_last_prov_id : null,
	_exact_name : null,
	_exact_id : null,

	popup : function(univ_id, dep_id, allowEmpty) {
		snda.component.university.popupEx(function(id, name) {
			var comp = document.getElementById(univ_id);
			comp.value = name;
			if (dep_id) snda.component.university.getDeps(id, dep_id, allowEmpty);
		});
	},
	
	popupEx : function(callback) {
		snda.component.university._exact_name = null;
		snda.component.university._exact_id = null;
		snda.component.university._last_prov_id = null;
		snda.component.university._last_filter = "";
		if (snda.component.university._opened) {
			//snda.component.university.close();
		}
		snda.component.university._callback = callback;
		snda.component.university._opened = true;
		snda.component.university._display();
	},
	
	close : function() {
		snda.component.university._opened = false;
		snda.uclib.component.dialog.close();
	},

	_filter : function(str) {
		if (str == "") return;
		str = str.toLowerCase();
		if (str == snda.component.university._last_filter) return;

		if (snda.component.university._last_prov_id != null)  {
			var comp = document.getElementById("_uni_selector_prov_" + snda.component.university._last_prov_id);
			comp.className = "";
			snda.component.university._last_prov_id = null;
		}

		snda.component.university._last_filter = str;
		var html = "";
		var html = "<ul>";
		snda.component.university._exact_name = null;
		snda.component.university._exact_id = null;
		for (var i = 0; i < snda.component.university._universities.length; ++i) {
			for (var j = 0; j < snda.component.university._universities[i].univs.length; ++j) {
				var id = snda.component.university._universities[i].univs[j][0];
				var name = snda.component.university._universities[i].univs[j][1];
				var filter_str = "";
				if (snda.component.university._universities[i].univs[j].length >= 3) {
					filter_str = snda.component.university._universities[i].univs[j][2];
				}

				if (name == str) {
					snda.component.university._exact_name = name;
					snda.component.university._exact_id = id;
				}

				if (name.indexOf(str) >= 0 || filter_str.indexOf(str) >= 0) {
					html += "<li><a href='#' onclick='snda.component.university._onUnivChanged("+id+",\""+name+"\");return false;'>"+name+"</a></li>";
				}
			}
		}
		html += "</ul>";
		document.getElementById("_uni_selector_univs").innerHTML = html;
	},

	_onUnivChanged : function(id, name) {
		if (id == 0 && snda.component.university._exact_id) {
			id = snda.component.university._exact_id;
			name = snda.component.university._exact_name;
		}
		if (snda.component.university._callback) {
			snda.component.university._callback(id, name);
		}
		snda.component.university.close();
	},

	_onProvChanged : function(index) {
		snda.component.university._last_filter = "";
		snda.component.university._exact_name = null;
		snda.component.university._exact_id = null;
		document.getElementById("_uni_selector_filter").value = "";
		if (index < 0 || index >= snda.component.university._universities.length) return;

		if (snda.component.university._last_prov_id == index) return;
		if (snda.component.university._last_prov_id != null)  {
			var comp = document.getElementById("_uni_selector_prov_" + snda.component.university._last_prov_id);
			comp.className = "";
		}

		snda.component.university._last_prov_id = index;
		var comp = document.getElementById("_uni_selector_prov_" + index);
		comp.className = "cur";

		var univs = snda.component.university._universities[index].univs;
		var html = "<ul>";
		for (var i = 0; i < univs.length; ++i) {
			html += "<li><a href='#' onclick='snda.component.university._onUnivChanged("+univs[i][0]+",\""+univs[i][1]+"\");return false;'>"+univs[i][1]+"</a></li>";
		}
		html += "</ul>";
		document.getElementById("_uni_selector_univs").innerHTML = html;
	},

	_display : function() {
	
		var html = '<div style="width: 645px;top:430%;" class="popup"><div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div><div class="popupBoxL"><div class="popupBoxR">';
		html += '<div class="popupBox"><div class="popupTitle"><a class="r" href="javascript:void(0)" tag="close" onclick="snda.component.university.close();return false;"><span class="iconClose"></span></a>选择学校</div>';
		// 加载输入框
		html += '<div class="popupMain"><div class="popSearch">搜索：<input type="text" class="text" id=_uni_selector_filter onkeyup="snda.component.university._filter(this.value);" onchange="snda.component.university._filter(this.value);" /></div>';

		// 加载地区
		html += '<div class="popSearchCity">';
		for (var i = 0; i < snda.component.university._universities.length; ++i) {
			html += "<a id=_uni_selector_prov_"+i+" href='#' onclick='snda.component.university._onProvChanged("+i+");return false;'>"+snda.component.university._universities[i].name+"</a>\n";
		}
		html += "</div>";

		// 学校列表
		html += '<div class="popSchoolList" id=_uni_selector_univs></div>';
		html += '<div class="r">找不到我的学校,我要自己输入:&nbsp;<input type="text" class="text" id=_univ_selector_name style="width:150px;" />&nbsp;<span class="button"><span><button type="button" onclick="snda.component.university._onUnivChanged(0, document.getElementById(\'_univ_selector_name\').value);return false;">确认</button></span></span></div><div class="clear"></div></div></div></div></div>';
		html += '<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div></div>';
		snda.uclib.component.dialog.popupHtml(html);
		if (snda.component.university._universities.length > 0) {
			snda.component.university._onProvChanged(0);
		}
	},

	_insertOption : function (comp, txt, value) {
		try {
			comp.add(new Option(txt, value), null);
		} catch (e) {
			comp.add(new Option(txt, value));
		}
	},

	getDeps : function(id, ele_id, allowEmpty) {
		var comp = document.getElementById(ele_id);
		comp.options.length = 0;
		if (id > 0) {
			snda.component.university._insertOption(comp, "正在刷新...", "");
			snda.lib.data.request("/searchFriends/universityDept", {"id":id}, function(data) {
				comp.options.length = 0;
				if (data.length == 0) {
					snda.component.university._insertOption(comp, "没有院系信息", "");
				} else {
					if (allowEmpty)  snda.component.university._insertOption(comp, "不限", "");
					for (var i = 0; i < data.length; ++i) {
						snda.component.university._insertOption(comp, data[i], data[i]);
					}
				}
			});
		} else {
			snda.component.university._insertOption(comp, "没有院系信息", "");
		}
	},

	
	_setPYEnd : function(pinyins) {
		var index = 0;
		for (var i = 0; i < snda.component.university._universities.length; ++i) {
			for (var j = 0; j < snda.component.university._universities[i].univs.length; ++j) {
				snda.component.university._universities[i].univs[j][2] = pinyins[index].join("\n");
				++index;
			}
		}
	}
};

$(document).ready(function() {
	$.getScript($.bf.config.getStaticPath() + '/source/js/bf/app/searchfriends/university.lib.js',function(){	//加载大学
		snda.component.university._universities=_universities;
		var names = [];
		for (var i = 0; i < snda.component.university._universities.length; ++i) {
			for (var j = 0; j < snda.component.university._universities[i].univs.length; ++j) {
				names.push(snda.component.university._universities[i].univs[j][1]);
			}
		}
		snda.core.common.chineseToPY(names, snda.component.university._setPYEnd);
	});
});
