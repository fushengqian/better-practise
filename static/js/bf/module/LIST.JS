/**
 * 好友列表自动完成
 * @author tanyiming@snda.com
 */
$.registerNameSpace('bf.module.List');

$.bf.module.List = $.Class.create();
$.Class.extend($.bf.module.List, $.bf.ui.Dialog, {
	/**
	* 构造方法
	* @param input 发布框
	* @param max   查询最大数量
	* @param options  发布时附带的参数
	*/
	__init__ : function(input,max,options){
		//atOffset - textarea中偏移量
		this.options      = options || {allowFollow : true, container : null, offset:{top:5,left:0}};
		this._max         = max||5;
		
		this._input    = $(input);
		this.superclass.build.call(this);

		this._initAtPop(input);
		this._initEvent();
		this._hideEvent();
		this.init();
		this._handleAt();
	},
	/**
	 * 弹出层功能
	 */
	_initAtPop:function(input){
		this._popup  = $('<div class="popup" style="display:none;z-index:36000; position: absolute; left: 0; top: 20">\
                                        <div class="Atwho">\
                                            <div style="display:none" class="title">想用@提到谁？</div>\
                                            <ul attr="at_list">\
                                            <li class="cur">浩方电竞平台 </li>\
                                            <li>智慧小猪没尾巴 </li>\
                                            </ul>\
                                        </div>\
                                    </div>').appendTo(document.body).css("width",this._input.width());
		this.setPosition();
		//this._atTest = $('<tt attr="uc_at_test_stand" style="visibility:hidden;color:#888;white-space:pre-wrap;font-family:inherit;word-break:break-all;line-height:20px;font-size:14px;word-wrap:break-word;position:absolute;overflow:auto;height:85px;width:510px;padding:0;margin:0;border:1px solid red"><span attr="pos">this will be replaced</span></tt>').insertBefore($(textarea)).css({"font-family":$(textarea).css("font-family"),"line-height":$(textarea).css("line-height"),"font-size":$(textarea).css("font-size"),"width":$(textarea).width(),"height":$(textarea).height()});
	},
	_hideEvent : function () {
		var dialogs = [
			//this._atMenu
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
		return this._input;
	},
	
	/**
	* 加载好友列表
	*/
	init : function(callback, url){
		$.bf.ajax.request(url || "/friends/getAtFriendList", null, function(result){
			this.setFriend(result);
			callback && callback();
		}.bind(this),function(errno, error){
		}, 'POST');
	},
	_initEvent : function(){
		var _this = this;
		$(document.body).click(function(event){
			if(event.target!=_this._popup.get(0)&&(event.target!=_this._input.get(0))){
				_this._popup.hide();
				_this._input_focus=false;
			}else{
				return false;
			}
		});
		this._input.focus(function(){this._input_focus=true;}.bind(this));
		this._input.click(function(){this._input_focus=true;}.bind(this));
		this._input.keydown(function(event){if(event.keyCode==27){/*esc*/this._input_focus=false;this._popup.hide();return false}else{this._input_focus=true;}}.bind(this));
		this._input.keydown(function(event){
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
		this._input.blur(function(){if(this._popup.is(":visible")){this._input_focus=false;}}.bind(this));
		
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

	},
	/**
	 * 列表数据存取
	 */
	getFriend:function(){
		return this._atData||[];
	},
	setFriend:function(data){
		this._at_data_change = true;
		var _data = [];
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
			return "<li attr='noselect' style='cursor:default'>搜索结果为空</li>";
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
					_this._input.focus().get(0).value = $(this).parent().find("li.cur").text();
					_this._input.value += "";
					_this._atMenu.hide();
				}
			);
		this._at_data_change = false;
	},
	/**
	 * 监听文本框功能
	 */
	_handleAt:function(){
		var $this = this;
		clearInterval(this.__at_handler);
		//用interval来避免客户端发布框闪烁
		__at_handler = setInterval(function(){
			var data = $this.getFriend();
			if(!$this._input_focus){
				return;
			}
			//剩余字数end
			if($this._input.length>0&&!$this._input.is(":visible")){
				clearInterval($this.__at_handler);
			}
			
			//获取文本框光标位置
			var pos = $this._txtgetPos($this._input.get(0),$this._input_focus?true:false);
			var at = pos;
			var prevTxt = $this._input.val();
			//匹配内容
			if(/^([^\s\n\r]{1,20})$/.test(prevTxt)){
				prevTxt = RegExp.$1;
			}else{
				prevTxt = "";
			}
			if((prevTxt==""&&pos<1)||($this._input.val()=="")){
				$this._popup.hide();
			}
			if(prevTxt==""&&at>0){
				$this._popup.hide();
			}
			$this.__atWho = prevTxt;
			if($this._old_text!=prevTxt){
				$this._input_focus=true;
			}
			if(prevTxt.length>0&&$this._input_focus){
				var list = $this._popup;
				if($this._old_text!=prevTxt){
					var html = $this.searchFriend(prevTxt,data,0,$this._max);
					if(html.indexOf("noselect")!=-1){//空
						html = "<li class='cur'>"+prevTxt+"</li>";
					}
					//220
					//AtList
					
					list.click(function(){
						$this._input.focus();
						return false;
					}).find("[attr='at_list']").html(html).find("li").first().addClass("cur").end().unbind().hover(
						function(){$(this).parent().find("li.cur").removeClass("cur");$(this).addClass("cur")},
						function(){if($(this).parent().find("li.cur").length==1){return};alert("remove");$(this).removeClass("cur")}
					).mouseup(
						function(event){
							var t = $this;
							var pos = t._txtgetPos(t._input.get(0));
							var text = t._input.get(0).value.split("");
							var atPos = t._input.get(0).value.substr(0,pos).lastIndexOf("@")+1;
							var txt = $(this).parent().find("li.cur").text();
							var count = t._defaultWordsCount - atPos + 1;
							if(count<=$(this).parent().find("li.cur").text()){
								txt = txt.substr(0,count-txt.length);
								t._input_focus = false;
							}
							//text.splice(atPos,pos-atPos,txt+" ");
							t._input.val(txt+" ");
							t._old_text = text.join("");
							//alert(pos+" "+atPos+" "+(atPos+txt.length-t._input.get(0).value.split("\r").length+2));
							//t._setPos(t._input.get(0),Math.min(atPos+txt.length-t._input.get(0).value.substr(0,pos).split("\r").length+2+(window.opera?t._input.get(0).value.split("\r").length-1:0),t._input.get(0).value.length));
							$this._popup.hide();
						}
					);
				}
				if(list.css("display")=="none"||($this._old_text!=prevTxt)){
					if(list.css("display")=="none"){
						list.fadeIn(200);
					}
				}
			}else{
				if(!$this._input_focus){
					$this._popup.hide();
				}else if(prevTxt.length==0){
					if(pos==-1){
					}
				}
			}
			$this._old_text = prevTxt;
			//调试用
			//document.title = prevTxt;
		}, 400);
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
	/**
	* 初始化位置
	* @param target 对齐的目标
	* @param me 要对齐的对象
	* @param offset 偏移对象
	*/
	_initPosition : function(target, me, offset)
	{
		offset = offset || this.options.offset;
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
		var btns    = [this._input],
		dialogs = [
					[this._popup]
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
