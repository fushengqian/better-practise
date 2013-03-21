$.registerNameSpace('bf.app.stroll');

$.bf.app.stroll = {
	cur_tab: 'allTab',
	cur_tab_sub: 'allSubTab',
	cur_page: 1,
	loading_html: '<br><div style="text-align:center;"><img src="'+$.bf.config.getStaticPath()+'/img/loading.gif"></div><br>',
	
	getStroll: function(page) {
		page = parseInt(page);
		this.cur_page = page;
		
		$('#strollTabList a').removeClass('cur');
		$('#'+this.cur_tab).addClass('cur');
		$('#strollSubTabList a').removeClass('cur');
		$('#'+this.cur_tab_sub).addClass('cur');
		
		$('html,body').animate({scrollTop:0}, 200); //分页时定位到顶部
		
		$('#strollPageMenu').html('');
		$('#strollList').html(this.loading_html);
	
		var platform = this.cur_tab.replace('Tab', '');
		var type = this.cur_tab_sub.replace('SubTab', '');
		$.bf.ajax.request(
				'/stroll/getStroll',
				{pid:platform, type:type, page:page},
				function(data) {
					if (data.stroll_html) {
						$('#strollList').html(data.stroll_html);
						$('#strollPageMenu').html(data.page_menu);
					}else {
						$('#strollList').html('未找到相关信息.');
					}
				}, 
				function(errno, msg) {
					$.bf.module.Tooltip.show(errno + ': ' + msg, $.bf.ui.Tooltip.icons.ERROR);
				}
		);
	},
	
	listenInit: function() {
		$('#allTab').click(function() {
			if ($.bf.app.stroll.cur_tab == 'allTab') {
				return false;
			}
			$.bf.app.stroll.cur_tab = 'allTab';
			$.bf.app.stroll.cur_tab_sub = 'allSubTab';
			$.bf.app.stroll.getStroll(1);
		});
		
		$('#hfTab').click(function() {
			if ($.bf.app.stroll.cur_tab == 'hfTab') {
				return false;
			}
			$.bf.app.stroll.cur_tab = 'hfTab';
			$.bf.app.stroll.cur_tab_sub = 'allSubTab';
			$.bf.app.stroll.getStroll(1);
		});
		
		$('#bfTab').click(function() {
			if ($.bf.app.stroll.cur_tab == 'bfTab') {
				return false;
			}
			$.bf.app.stroll.cur_tab = 'bfTab';
			$.bf.app.stroll.cur_tab_sub = 'allSubTab';
			$.bf.app.stroll.getStroll(1);
		});
		
		$('#cyTab').click(function() {
			if ($.bf.app.stroll.cur_tab == 'cyTab') {
				return false;
			}
			$.bf.app.stroll.cur_tab = 'cyTab';
			$.bf.app.stroll.cur_tab_sub = 'allSubTab';
			$.bf.app.stroll.getStroll(1);
		});
		
		$('#allSubTab').click(function() {
			if ($.bf.app.stroll.cur_tab_sub == 'allSubTab') {
				return false;
			}
			$.bf.app.stroll.cur_tab_sub = 'allSubTab';
			$.bf.app.stroll.getStroll(1);
		});
		
		$('#videoSubTab').click(function() {
			if ($.bf.app.stroll.cur_tab_sub == 'videoSubTab') {
				return false;
			}
			$.bf.app.stroll.cur_tab_sub = 'videoSubTab';
			$.bf.app.stroll.getStroll(1);
		});
		
		$('#imgSubTab').click(function() {
			if ($.bf.app.stroll.cur_tab_sub == 'imgSubTab') {
				return false;
			}
			$.bf.app.stroll.cur_tab_sub = 'imgSubTab';
			$.bf.app.stroll.getStroll(1);
		});
		
		$('#originalSubTab').click(function() {
			if ($.bf.app.stroll.cur_tab_sub == 'originalSubTab') {
				return false;
			}
			$.bf.app.stroll.cur_tab_sub = 'originalSubTab';
			$.bf.app.stroll.getStroll(1);
		});
	}
};


$(document).ready(function() {
	$.bf.app.stroll.listenInit();
});