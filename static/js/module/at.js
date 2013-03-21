/**
 * 微博@功能扩展
 * @author tanyiming@snda.com
 */
$.registerNameSpace('bf.module.At');

$.bf.module.At = $.Class.create();
$.Class.extend($.bf.module.At, $.bf.ui.Dialog, {
	/**
	* 构造方法
	* @param textarea 发布框
	* @param btn      发布按钮
	* @param count    剩余字数统计
	* @param options  发布时附带的参数
	*/
	__init__ : function(textarea,btn,count,options){
		//atOffset - textarea中偏移量
		this.options      = options || {allowFollow : true, container : null, atOffset:{top:20,left:0}};
		
		this._textarea    = $(textarea);
		this._atBtn       = $(btn);
		this._defaultWordsCount = 256;
		this.superclass.build.call(this);
		this._remainCount = $(count);

		//this._remainCount                = this.getDialog().find("[attr='twitter_remain_count']"); // 剩余字数容器
		this._initAtPop(textarea);
		this._initAtFriend();
		this._initEvent();
		this._hideEvent();
		this.init();
		this._handleAt();
	},
	/**
	 * 弹出层功能
	 */
	_initAtPop:function(textarea){
		this._popup  = $('<div class="popup" style="display:none;z-index:36000; position: absolute; left: 0; top: 0">\
                                        <div class="Atwho">\
                                            <div class="title">想用@提到谁？</div>\
                                            <ul attr="at_list">\
                                            <li class="cur">浩方电竞平台 </li>\
                                            <li>智慧小猪没尾巴 </li>\
                                            </ul>\
                                        </div>\
                                    </div>').insertBefore($(textarea));
		this._atTest = $('<tt attr="uc_at_test_stand" style="visibility:hidden;color:#888;white-space:pre-wrap;font-family:inherit;word-break:break-all;line-height:20px;font-size:14px;word-wrap:break-word;position:absolute;overflow:auto;height:85px;width:510px;padding:0;margin:0;border:1px solid red"><span attr="pos">this will be replaced</span></tt>').insertBefore($(textarea)).css({"font-family":$(textarea).css("font-family"),"line-height":$(textarea).css("line-height"),"font-size":$(textarea).css("font-size"),"width":$(textarea).width(),"height":$(textarea).height()});
	},
	/**
	 * @朋友功能
	 */
	_initAtFriend:function(){
		this._atMenu = this._getAtMenu();
		this._atCloseBtn = this._atMenu.find("[attr='at_close_btn']");
		this._atBtn.attr("attr","twitter_at_btn");
	},
	_hideEvent : function () {
		var dialogs = [
			this._atMenu
		];
		
		var len = dialogs.length;
		
		var attrs = ['twitter_at_btn'];
		
		$(document.body || document.documentElement).click(function (event) {
			for (var i = 0; i < len; i++) {
				var el = dialogs[i];
				if (el.is(':visible')) {
					//滚动后
					var offY = $(document).scrollTop();
					var offX = $(document).scrollLeft();
					var off = 5; // Border Offset
					var pos = el.position();
					var e_x = pos.left - off;
					var e_y = pos.top - off;
					var e_w = el.width() + (off * 2);
					var e_h = el.height() + (off * 2);
					var c_x = event.clientX+offX;
					var c_y = event.clientY+offY;
					var e_t = $(event.target);
					var c_a = 1; // Check Attributes
					for (var j = 0; j < 3; j++) {
						if (e_t.is('a,i') && $.inArray(e_t.attr('attr'), attrs) != -1) {
							c_a = 0;
							break;
						}
						e_t = e_t.parent();
					}
					c_a && (c_x < e_x || c_x > e_x + e_w || c_y < e_y || c_y > e_y + e_h) && el.toggle(100);
					break;
				}
			}
		});
	},
	getTextarea:function(){
		return this._textarea;
	},
	
	/**
	* 加载好友列表
	*/
	init : function(callback, url){
		$.bf.ajax.request(url || "/friends/getAtFriendList", null, function(result){
			this.setFriend(result);
			this._haveFriend = true;
			callback && callback();
		}.bind(this),function(errno, error){
		}, 'POST');
	},
	/**
	* 获取@菜单
	*/
	_getAtMenu : function()
	{
		if(!this._atMenu){
			this._atMenu = $($.sprintf('\
			<div style="z-index: 36001; width: 260px; top:0; display:none; left: 0;" class="popup">\
				<div class="shadow"></div>\
				<span class="popArrow"></span>\
				<div class="popupTL"><div class="popupTR"><div class="popupT"></div></div></div>\
				<div class="popupBoxL"><div class="popupBoxR">\
				<div class="popupBox AtMain">\
					<div class="popGreenClose"><a class="r iconClose" href="javascript:;" onclick="this.blur();return false" attr="at_close_btn"></a></div>\
					<div class="popupMain">\
						<div class="AtCon">\
							<div class="AtSearch">\
								<div class="iptSelect">\
									<span class="ipt"><span><input attr="at_friend_input" maxlength="20" type="text" value=""></span>\
									<span class="atbtn" attr="at_search"><i class="ico iSearch"></i></span><a title="清空" attr="at_input_clear" class="ico idel" style="display:none" href="javascript:;" onclick="this.blur();return false"></a></span>\
								</div>\
							</div>\
							<div class="AtList">\
								<ul attr="at_friend_list">\
								<li class="cur">加载中</li>\
								</ul>\
							</div>\
							<div class="Atnote">\
								<span class="t999">@朋友账号，他就能在【提到我的】页收到</span>\
							</div>\
						</div>\
					 </div>\
				   </div>\
				</div></div>\
				<div class="popupBL"><div class="popupBR"><div class="popupB"></div></div></div>\
			</div>\
			', this._instance_index)).appendTo(document.body);
		}

		return this._atMenu;
	},
	_initEvent : function(){
		var _this = this;
		//@朋友滚动
		this._atMenu.find("[attr='at_friend_list']").parent().scroll(function(){
			var offset = 220+5;
			//底部
			if($(this).scrollTop()+offset>$(this).find("[attr='at_friend_list']").height()){
				var data = _this.getFriend();
				var input = _this._atMenu.find("[attr='at_friend_input']");
				var keyword = input.val()||"";
				if(input.val()!=_this._at_search_value){
					_this._at_data_change = true;
					_this._at_search_value = input.val();
				}
				_this.renderAtList(keyword,data,$(this).find("li").length,100,true);
			}
		});
		$(document.body).click(function(event){
			if(event.target!=_this._popup.get(0)&&(event.target!=_this._textarea.get(0))){
				_this._popup.hide();
				_this._input_focus=false;
			}else{
				return false;
			}
		});
		//@朋友框
		this._atMenu.find("[attr='at_friend_input']").keydown(function(event){
			//esc
			if(event.keyCode==27){$(this).val('');$(this).parents(".popup").hide();return false;}
		});
		this._textarea.focus(function(){this._input_focus=true;}.bind(this));
		this._textarea.click(function(){this._input_focus=true;}.bind(this));
		this._textarea.keydown(function(event){if(event.keyCode==27){/*esc*/this._input_focus=false;this._popup.hide();return false}else{this._input_focus=true;}}.bind(this));
		this._textarea.keydown(function(event){
			var atShow = _this._popup.css("display")!="none";
			var list = _this._popup;
			if(event.keyCode==13||event.keyCode==10){//回车
				if(atShow){
					list.find("li.cur").mouseup();
					return false;
				}
			}else if(event.keyCode==38){//上
				if(atShow){
					var index = list.find("li.cur").index();
					var count = list.find("li").length;
					list.find("li.cur").removeClass("cur");
					list.find("li").eq(index==0?count-1:--index).addClass("cur");
					return false;
				}
				//alert(event.keyCode);
			}else if(event.keyCode==40){//下
				if(atShow){
					var index = list.find("li.cur").index();
					var count = list.find("li").length;
					list.find("li.cur").removeClass("cur");
					list.find("li").eq(index<count-1?++index:0).addClass("cur");
					return false;
				}
				//
			}
		}.bind(this));
		this._textarea.blur(function(){if(this._popup.is(":visible")){this._input_focus=false;}}.bind(this));
		
		//关闭@朋友
		this._atCloseBtn.click(function(event){
			this._atMenu.hide();
		}.bind(this));

		//@朋友按钮
		this._atBtn.click(function(event){
			this._initPosition(this._atBtn, this._atMenu).toggle();
			if(this._atMenu.is(":visible")){
				//alert("show!");
			}
			try{
				this._atMenu.find("[attr='at_friend_input']").focus().val("");
				this._atMenu.find(".AtList").scrollTop(0);
			}catch(e){}
		}.bind(this));
		
		//监听@
		this._handleAt();

		// 允许弹出的对话框跟随滚动条以及窗口缩放时自适应位置
		if(this.options.allowFollow)
		{
			this.bindResize(function(){
				this.setPosition();
			}.bind(this));

			if(this.options.container)
			{
				$(this.options.container).scroll(function(){
					this.setPosition();
				}.bind(this));
			}
		}
		//清空
		this._atMenu.find("[attr='at_input_clear']").click(function(){
			this._atMenu.find("[attr='at_friend_input']").val("").focus();
		}.bind(this));

	},
	/**
	 * @朋友列表数据存取
	 */
	getFriend:function(){
		return this._atData||[];
	},
	setFriend:function(data){
		this._at_data_change = true;
		var _data = [];
		/*for(var i=0,len=data.length;i++){
			_data[i] = 
		}*/
		$.bf.utils.pinyin.chineseToPY(data,function(rs){
    		this._atDataPY = rs;
		}.bind(this));
		this._atData = data;
	},
	appendFriend:function(key,val){
		this._at_data_change = true;
		this._atData = this._atData||[];
		this._atData[key] = val;
	},
	_at_data_change:true,
	_haveFriend:false,
	searchFriend:function(key,data,start,count){
		var out = "";
		key = key||"";
		key = key.toString().toLowerCase();
		data = data||this.getFriend();
		var data_py = this._atDataPY||[];
		start = start||0;
		count = count||5;
		for(var i=start,j=0,len=data.length;i<len;i++){
			j++;
			if(data[i]&&data[i].toString().toLowerCase().indexOf(key)!=-1){
				out += ["<li>",data[i].toString().replace(new RegExp(key,"i"),function(a,b){return "<b>"+a+"</b>"}),"</li>"].join("");
			}else if(data_py[i]&&data_py[i].toString().toLowerCase().indexOf(key)!=-1){
				out += ["<li>",data[i],"</li>"].join("");
			}else{
				j--;
			}
			if(j>=count){
				break;
			}
		}
		if(out==""){
			return "<li attr='noselect' style='cursor:default'>"+(this._haveFriend?"搜索结果为空":"加载中")+"</li>";
		}
		return out;
	},
	renderAtList:function(keyword,data,start,count,append){
		var _this = this;
		var list = this.searchFriend(keyword,data,start,count);
		var lists = this._atMenu.find("[attr='at_friend_list']");
		if(append){
			lists = list.indexOf("noselect")!=-1?lists:lists.append(list);
		}else{
			lists = lists.html(list);
		}
		lists.find("li[attr!='noselect']").first().addClass("cur").end().unbind().hover(
			function(){$(this).parent().find("li.cur").removeClass("cur");$(this).addClass("cur")},
			function(){if($(this).parent().find("li.cur").length==1){return}}
		).mouseup(
				function(event){
					_this._textarea.focus().get(0).value += "@"+$(this).parent().find("li.cur").text()+" ";
					_this._atMenu.hide();
				}
			);
		this._at_data_change = false;
	},
	/**
	 * 监听文本框@功能
	 */
	_handleAt:function(){
		var $this = this;
		clearInterval(this.__at_handler);
		//用interval来避免客户端发布框闪烁
		this.__at_handler = setInterval(function(){
			//存在计数器且不可见时 停止监听
			if($this._remainCount.length>0&&!$this._remainCount.is(":visible")){
				clearInterval($this.__at_handler);
			}
			if($this._atMenu.find("[attr='at_friend_list']").is(":visible")){
				if($this._atMenu.find("[attr='at_friend_input']").val().length==0){
					$this._atMenu.find("[attr='at_search']").show();
					$this._atMenu.find("[attr='at_input_clear']").hide();
				}else{
					$this._atMenu.find("[attr='at_search']").hide();
					$this._atMenu.find("[attr='at_input_clear']").show();
				}
				var data = $this.getFriend();
				var keyword = $this._atMenu.find("[attr='at_friend_input']").val()||"";
				if($this._atMenu.find("[attr='at_friend_input']").val()!=$this._at_search_value){
					$this._at_data_change = true;
					$this._at_search_value = $this._atMenu.find("[attr='at_friend_input']").val();
				}
				if($this._at_data_change){
					//var list = $this.searchFriend(keyword,data,0,100);
					$this.renderAtList(keyword,data,0,100);
					//滚动顶部
					$this._atMenu.find("[attr='at_friend_list']").parent().scrollTop(0);
				}
			}
			if(!$this._input_focus){
				return;
			}
			//显示剩余字数
			var len = $this._textarea.val().length;
			var val = $this._defaultWordsCount - len;
			var pos = $this._txtgetPos($this._textarea.get(0),$this._input_focus?true:false);
			if(len>$this._defaultWordsCount){
				$this._textarea.val($this._textarea.val().substr(0,$this._defaultWordsCount));
				$this._setPos($this._textarea.get(0),pos);
			}
			//alert(len);
			if($this._remainCount.length>0&&$this._remainCount.text() != val){
				$this._remainCount.text(val);
			}
			//剩余字数end
			
			//获取文本框光标位置
			var pos = $this._txtgetPos($this._textarea.get(0),$this._input_focus?true:false);
			var at = pos;
			var prevTxt = $this._textarea.val().substr(0,pos-$this._textarea.get(0).value.substr(0,pos).split("\r").length+1);
			pos = prevTxt.lastIndexOf("@");
			//光标前文本
			prevTxt = prevTxt.substr(pos==-1?prevTxt.length:pos);
			
			//匹配@内容
			if(/@([^@\s\n\r]{1,20})$/.test(prevTxt)){
				prevTxt = RegExp.$1;
			}else{
				prevTxt = "";
			}
			if((prevTxt==""&&pos<1)||($this._textarea.val()=="")||($this._textarea.val().indexOf("@")=="-1")){
				$this._popup.hide();
			}
			if(prevTxt==""&&at>0){
				$this._popup.hide();
			}
			$this.__atWho = prevTxt;
			var testTxt = pos==-1?$this._textarea.val():$this._textarea.val().substr(0,pos);
			//格式化文本
			var endTxt = pos!=-1?$this._textarea.val().substr(pos+1):"";
			var tagName = document.attachEvent?"pre":"span";
			var space = '<'+tagName+' style="display:inline;white-space:pre-wrap;font-size:inherit;font-family:inherit;"> </'+tagName+'>';
			endTxt = endTxt.replace(/\n/g,"<br/>").replace(/\r/g,"<br/>").replace(/([ ]+) /g,function(a,b){
				return space+b.replace(/[ ]/g,space);
			});
			endTxt = $("<p>").text(endTxt).html();
			testTxt = $("<p>").text(testTxt.replace(/\n/g,"<br/>").replace(/\r/g,"<br/>").replace(/([ ]+) /g,function(a,b){
				return space+b.replace(/[ ]/g,space);
			})).html()+"<span attr='uc_at_pos' style='background-color:#000;color:#fff'>@</span>"+endTxt;
			if($this._old_text!=testTxt+prevTxt){
				$this._input_focus=true;
				$this._atTest.html(testTxt);
			}
			$this._atTest.scrollTop($this._textarea.scrollTop()+5);
			if(prevTxt.length>0&&$this._input_focus){
				var list = $this._popup;
				if($this._old_text!=testTxt+prevTxt){
					var html = $this.searchFriend(prevTxt,data,0,5);
					if(html.indexOf("noselect")!=-1){//空
						html = "<li class='cur'>"+prevTxt+"</li>";
					}
					//220
					//AtList
					
					list.click(function(){
						$this._textarea.focus();
						return false;
					}).find("[attr='at_list']").html(html).find("li").first().addClass("cur").end().unbind().hover(
						function(){$(this).parent().find("li.cur").removeClass("cur");$(this).addClass("cur")},
						function(){if($(this).parent().find("li.cur").length==1){return};$(this).removeClass("cur")}
					).mouseup(
						function(event){
							var t = $this;
							var pos = t._txtgetPos(t._textarea.get(0));
							var text = t._textarea.get(0).value.split("");
							var atPos = t._textarea.get(0).value.substr(0,pos).lastIndexOf("@")+1;
							var txt = $(this).parent().find("li.cur").text();
							var count = t._defaultWordsCount - atPos + 1;
							if(count<=$(this).parent().find("li.cur").text()){
								txt = txt.substr(0,count-txt.length);
								t._input_focus = false;
							}
							text.splice(atPos,pos-atPos,txt+" ");
							t._textarea.val(text.join(""));
							t._old_text = text.join("");
							//alert(pos+" "+atPos+" "+(atPos+txt.length-t._textarea.get(0).value.split("\r").length+2));
							t._setPos(t._textarea.get(0),Math.min(atPos+txt.length-t._textarea.get(0).value.substr(0,pos).split("\r").length+2+(window.opera?t._textarea.get(0).value.split("\r").length-1:0),t._textarea.get(0).value.length));
							$this._popup.hide();
						}
					);
				}
				if(list.css("display")=="none"||($this._old_text!=testTxt+prevTxt)){
					if(list.css("display")=="none"){
						list.fadeIn(200);
					}
					var at_pos = $this._atTest.find("[attr='uc_at_pos']").offset();
					list.offset(at_pos).offset({top:at_pos.top+$this.options.atOffset.top,left:at_pos.left+$this.options.atOffset.left});// = .x
				}
			}else{
				if(!$this._input_focus){
					$this._popup.hide();
				}else if(prevTxt.length==0){
					if(pos==-1){
					}
				}
			}
			$this._old_text = testTxt+prevTxt;
			//调试用
			//document.title = prevTxt;
		}, 600);
	},
	/**
	 * 获取textarea选区以及文字
	 */
	_txtgetPos:function(o,noFocus){
		var CaretPos = 0;
		if(document.selection){
			if(!noFocus){
				o.focus();
			}
			var Sel = document.selection.createRange();
			Sel.moveStart('character', -o.innerText.length);
			var text = Sel.text;                
			for (var i = 0; i < o.innerText.length; i++){
				if(o.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)){
					CaretPos = i + 1;                          
				}
			}
		}else if(o.selectionStart || o.selectionStart == '0'){
			CaretPos = o.selectionStart;
		}
		return CaretPos;
	},
	_setPos:function(element,location){
		if(element.setSelectionRange){
			element.focus();
			element.setSelectionRange(location,location);
		}else if(document.body.createTextRange){
			var range = document.body.createTextRange();
			range.moveToElementText(element);
			range.collapse(true);        
			range.move('character', location);
			range.select();
		}
	},
	setRemainLen : function(len)
	{
		if(len!=this._remainCount.text().length){
			if(len<0){
				this._remainCount.addClass("tRed");
			}else{
				this._remainCount.removeClass("tRed");
			}
			this._remainCount.text(len);
		}
	},
	/**
	* 初始化位置
	* @param target 对齐的目标
	* @param me 要对齐的对象
	* @param offset 偏移对象
	*/
	_initPosition : function(target, me, offset)
	{
		offset = offset || {top : 10, left : 0};
		offset.top = offset.top || 0, offset.left = offset.left || 0;
		var targetHeight = target.height(), targetOffset = target.offset();
		try{
			return me.css({
				top  : targetOffset.top + targetHeight + offset.top,
				left : targetOffset.left + offset.left
			});
		}catch(e){}
	},
	setPosition : function()
	{
		var btns    = [this._atBtn],
		dialogs = [
					[this._atMenu]
				  ];
		var _this = this;
		try{
			$.each(btns, function(index, _btn){
				$.each(dialogs[index], function(_index, _dialog){
						_this._initPosition(_btn, $(this));
				});
			});
		}catch(e){}
	}
});
