// 创建对应的Widget类
var widget = {};

var __hideIFrameMask = function(id){
	if(!id){
		id = "#framemask";
	}
	$(id).css("top","-10px");
	$(id).css("left","1px");
	$(id).css("height","0px");
	$(id).css("width","0px");
	$(id + "1").css("display","none");
};

/*
 * ToolBar_Game
 */
(function()
{
	

    widget.Widget_Toolbar_Game = function(data, parent)
    {
        this._mouseStyle = [];
        this._mouseEvent = [];
        this._nodeList = {};
        
        this._root = util.createModule(Widget_Toolbar_Game_Templete, data, parent, this._mouseStyle, this._mouseEvent, this._nodeList);
        util.addEventStyles(this._mouseStyle);
        util.addEventActions.call(this, this._mouseEvent);
    };
    
    var proto = widget.Widget_Toolbar_Game.prototype;
    
    proto.hide = function()
    {
        $(".p1").hide();
        $(".toolbar .widget .w1").removeClass("cur z");
		__hideIFrameMask();
        //$(".toolbar .widget .w1 .ico").removeClass("i101");
    };
    
    proto.setDataStore = function(datastores){
        this._dataStore = datastores;
    };
    
    proto.getMouseEvent = function(action, data)
    {
        var _adjust = function(){
            $(".toolbar .widget .w1").each(function(){
                var i = parseInt(this.className.toLowerCase().substring(5)),
                thispop = $(".p"+i),
                t = -(thispop.height()-1),
                l = $(this).offset().left-$(".toolbar").offset().left,
                l2 = $(".toolbar").width()-thispop.width(),
                over = thispop.width()-$(".toolbar").width()+l;
                if(thispop.css("display")!="none"){
	                //$(".popup>div").hide();
	                thispop.show().css("top",t);
	                if(over>0){thispop.css("left",l2)}else{thispop.css("left",l)};
                }
            });
        };
        var _this = this;
        switch(action){
        case "close":
            return function(){
                var j = 0;
                _this.hide();
            };
            break;
        case "switch1":
            return function(){
                if(_this._nodeList["module2"].style.display != "none"){
                    util.css(_this._nodeList["module2"], "display", "none");
				}
                if(_this._nodeList["module1"].style.display != "block"){
                    util.css(_this._nodeList["module1"], "display", "block");
				}
                _adjust();
            };
            break;
        case "switch2":
            return function(){
                if(_this._nodeList["module1"].style.display != "none"){
                    util.css(_this._nodeList["module1"], "display", "none");
				}
                if(_this._nodeList["module2"].style.display != "block"){
                    util.css(_this._nodeList["module2"], "display", "block");
				}
                _adjust();
            };
            break;
        case "selectPage":
            return function(){
                if($(this).hasClass("cur")){
                    return;
				}
                $(this).addClass("cur");
                if(!_this.currentSelect){
                    if(!_this._nodeList["page1"])
                        return;
                    _this.currentSelect = _this._nodeList["page1"];
                }
                $(_this.currentSelect).removeClass("cur");
                _this.currentSelect = this;
                var arr = _this._dataStore[0].getPageData(data.value[1]);
                for(var i=1;i<=9;++i){
                    if(!arr[i-1]){
                        $(_this._nodeList["node" + i]).css("display", "none");
                        continue;
                    }
                    $(_this._nodeList["node" + i]).css("display", "block");
                    if(_this._nodeList["name" + i]){
                        _this._nodeList["name" + i].nodeValue = arr[i-1][0];
                    }
                    if(_this._nodeList["img" + i]){
                        _this._nodeList["img" + i].src = arr[i-1][1];
                    }
                }
                _adjust();
            };
            break;
        };
    };
})();

/*
 * ToolBar_Mail
 */
(function()
{
    widget.Widget_Toolbar_Mail = function(data, parent, userid)
    {
        this._mouseStyle = [];
        this._mouseEvent = [];
        this._nodeList = [];
        this._dataStore = null;
        this._configEl = null;
        this._userid = userid;
        
        this._root = util.createModule(Widget_Toolbar_Mail_Templete, data, parent, this._mouseStyle, this._mouseEvent, this._nodeList);
        util.addEventStyles(this._mouseStyle);
        util.addEventActions.call(this, this._mouseEvent);
    };
    
    var proto = widget.Widget_Toolbar_Mail.prototype;
    
    proto.setDataStore = function(dataStore){
        this._dataStore = dataStore;
    };
    
    proto.hide = function()
    {
        $(".p4").hide();
        $(".toolbar .widget .w4").removeClass("cur z");
		__hideIFrameMask("#framemailmask");
    };
    
    proto.show = function(obj)
    {
        if(obj.letter){
            $(this._nodeList["letterContainer"]).css("display","block");
            this._nodeList["letter"].nodeValue = obj.letter;
        }else{
            $(this._nodeList["letterContainer"]).css("display","none");
        }
        if(obj.fri_request){
            $(this._nodeList["fri_requestContainer"]).css("display","block");
            this._nodeList["fri_request"].nodeValue = obj.fri_request;
        }else{
            $(this._nodeList["fri_requestContainer"]).css("display","none");
        }
        if(obj.notice){
            $(this._nodeList["noticeContainer"]).css("display","block");
            this._nodeList["notice"].nodeValue = obj.notice;
        }else{
            $(this._nodeList["noticeContainer"]).css("display","none");
        }
        if(obj.fans){
            $(this._nodeList["fansContainer"]).css("display","block");
            this._nodeList["fans"].nodeValue = obj.fans;
        }else{
            $(this._nodeList["fansContainer"]).css("display","none");
        }
        if(obj.leave_msg){
            $(this._nodeList["leave_msgContainer"]).css("display","block");
            this._nodeList["leave_msg"].nodeValue = obj.leave_msg;
        }else{
            $(this._nodeList["leave_msgContainer"]).css("display","none");
        }
        if(obj.comment){
            $(this._nodeList["commentContainer"]).css("display","block");
            this._nodeList["comment"].nodeValue = obj.comment;
        }else{
            $(this._nodeList["commentContainer"]).css("display","none");
        }
        if(obj.broadcast){
            $(this._nodeList["broadcastContainer"]).css("display","block");
            this._nodeList["broadcast"].nodeValue = obj.broadcast;
        }else{
            $(this._nodeList["broadcastContainer"]).css("display","none");
        }
        
        this._nodeList["leave_msg_link"].href = "/home/comment/uid/" + this._userid;
		
		if(obj._game_req_details && obj._game_req_details.length){
            $(this._nodeList["gameContainer"]).css("display","block");
            this._nodeList["count"].nodeValue = obj.game_request;
            this._nodeList["user"].nodeValue = obj._game_req_details[0].nick;
            this._nodeList["game"].nodeValue = obj._game_req_details[0].game_name;
            this._nodeList["userlink"].href = $.bf.common.getUserHomeUrl(obj._game_req_details[0].sdid);
            this._nodeList["gamelink"].href = obj._game_req_details[0].game_url;
			this._nodeList["acceptLink"].href = obj._game_req_details[0].game_url;
			$(this._nodeList["invite1"]).css("display", "inline-block");
			$(this._nodeList["invite2"]).css("display", "inline-block");
        }else if(obj.game_request){
			$(this._nodeList["gameContainer"]).css("display","block");
			this._nodeList["count"].nodeValue = obj.game_request;
			$(this._nodeList["invite1"]).css("display", "none");
			$(this._nodeList["invite2"]).css("display", "none");
			
		}else{
            $(this._nodeList["gameContainer"]).css("display","none");
        }
        
        // Show the dialog
        _adjust.call(this);
        
        
    };
    
    var _adjust = function(forseClose){
        $(".toolbar .widget a").each(function(){
            var i = parseInt(this.className.toLowerCase().substring(5)),
            thispop = $(".p"+i);
            if(4==i){
                thispop.css("display","block");
            }else{
                //thispop.css("display","none");
                return;
            }
            var t = -(thispop.height()-1),
            l = $(this).offset().left-$(".toolbar").offset().left,
            l2 = $(".toolbar").width()-thispop.width(),
            over = thispop.width()-$(".toolbar").width()+l;
            //$(".popup>div").hide();   #framemailmask
			var tt1 = t + 14;
			var ll1 = l - 60;
			$("#framemailmask").css("top",tt1);
			$("#framemailmask").css("left",ll1);
			$("#framemailmask").css("height",-tt1);
			$("#framemailmask").css("width",thispop.width());
			$("#framemailmask1").css("display","block");
            thispop.show().css("top",t);
            if(over>0){thispop.css("left",l2)}else{thispop.css("left",l)};
        });
        // 最后判断是不是要隐藏
        if(forseClose)
            this.hide();
        else {
            if($(this._nodeList["gameContainer"]).css("display") == "none"
                && $(this._nodeList["letterContainer"]).css("display") == "none"
                && $(this._nodeList["fri_requestContainer"]).css("display") == "none"
                && $(this._nodeList["noticeContainer"]).css("display") == "none"
                && $(this._nodeList["fansContainer"]).css("display") == "none"
                && $(this._nodeList["leave_msgContainer"]).css("display") == "none"
                && $(this._nodeList["commentContainer"]).css("display") == "none"){
                    this.hide();
            }
        }
    };

    
    proto.getMouseEvent = function(action, data)
    {
        var _this = this;
        var _sendRequest = function(msg_type){
            util.requestData({
                url:"/reminder/cleanup",
                data:"msg_type=" + msg_type,
                dataType:"json",
                type:"post",
                success:function(obj){
                    if(!obj.errno){
                        $(_this._nodeList[msg_type + "Container"]).css("display", "none");
    	                _adjust.call(_this);
                    }else{
                        $.bf.shortcut.Tooltip.show("操作失败", $.bf.ui.Tooltip.icons.ERROR);	
                    }
                }
            });
        };
        var _ignoreOne = function(){
            util.requestData({
                url:"/reminder/deleteOneGameRequest",
                dataType:"json",
                type:"post",
                success:function(obj){
                    if(!obj.errno){
                        var ret = _this._dataStore[0].getData();
                        if(ret.change){
                            _this._nodeList["user"].nodeValue = ret.change.nick;
                            _this._nodeList["game"].nodeValue = ret.change.game_name;
							_this._nodeList["acceptLink"].href = ret.change.game_url;
                        }else{
                            $(_this._nodeList["invite1"]).css("display", "none");
                            $(_this._nodeList["invite2"]).css("display", "none");
                        }
						if(ret.num){
							_this._nodeList["count"].nodeValue = ret.num;
						}else{
							$(_this._nodeList["gameContainer"]).css("display","none");
						}
						_adjust.call(_this);
                    }else{
                        alert(obj.msg);
                    }
                }
            });
        };
        switch(action){
        case "close":
            return function(){
                util.requestData({
                        url:"/reminder/cleanupall",
                        dataType:"json",
                        type:"post",
                        success:function(obj){
                            if(!obj.errno){
                                _this.hide();
            	                _adjust.call(_this,true);
                            }else{
                                alert(obj.msg);
                            }
                        }
                    });
            };
            break;
        case "closeFri":
            return function(){
                _sendRequest("fri_request");
            };
            break;
        case "closeMsg":
            return function(){
                _sendRequest("leave_msg");
            };
            break;
        case "closeComment":
            return function(){
                _sendRequest("comment");
            };
            break;
        case "closeFans":
            return function(){
                _sendRequest("fans");
            };
            break;
        case "closeNotice":
            return function(){
                _sendRequest("notice");
            };
            break;
        case "closeLetter":
            return function(){
                _sendRequest("letter");
            };
            break;
        case "closeInvite":
            return function(){
                $(_this._nodeList["gameContainer"]).css("display","none");
                _adjust.call(_this);
            };
            break;
        case "receive":
            return function(){
                _ignoreOne();
            };
            break;
        case "ignore":
            return function(){
                _ignoreOne();
            };
            break;
        case "setConfig":
            return function(){
                util.requestData({
                    url:"/reminder/getSetting",
                    dataType:"json",
                    type:"post",
                    success:function(obj){
                        if(!obj.errno){
                            if(!_this._configEl){
                                _this._configEl = new widget.Popup2();
                            }
                            _this._configEl.show(obj.data);
                        }else{
                            alert(obj.msg);
                        }
                    }
                });
            }
        };
    };
})();

/*
 * ToolBar_Online
 */
(function()
{
    widget.Widget_Toolbar_Online = function(data, parent)
    {
        this._mouseStyle = [];
        this._mouseEvent = [];
        this._friendControl = $.bf.common.friends;
        this._dataStore = null;
        this._nodeList = {};
        
        this._root = util.createModule(Widget_Toolbar_Online_Templete, data, parent, this._mouseStyle, this._mouseEvent, this._nodeList);
        util.addEventStyles(this._mouseStyle);
        util.addEventActions.call(this, this._mouseEvent);
    };
    
    var proto = widget.Widget_Toolbar_Online.prototype;
    
    proto.setDataStore = function(dataStore){
        this._dataStore = dataStore;
    };
    
    proto.hide = function()
    {
        $(".p6").hide();
        $(".toolbar .widget .w6").removeClass("cur z");
		__hideIFrameMask();
    };
    
    proto.getMouseEvent = function(action, data)
    {
        var _adjust = function(){
            $(".toolbar .widget .w6").each(function(){
                var i = parseInt(this.className.toLowerCase().substring(5)),
                thispop = $(".p"+i),
                t = -(thispop.height()-1),
                l = $(this).offset().left-$(".toolbar").offset().left,
                l2 = $(".toolbar").width()-thispop.width(),
                over = thispop.width()-$(".toolbar").width()+l;
                if(thispop.css("display")!="none"){
	                //$(".popup>div").hide();
	                thispop.show().css("top",t);
	                if(over>0){thispop.css("left",l2)}else{thispop.css("left",l)};
                }
            });
        };
        var _this = this;
        switch(action){
        case "close":
            return function(){
                _this.hide();
            };
            break;
        case "addFriend":
            return function(){
                _this._friendControl.addFriend(_this._dataStore[0].getUserId(data.value[6]), data.value[0], function(result, msg){
                    if(result == 0){
                        $.bf.shortcut.Tooltip.show("添加好友成功",$.bf.ui.Tooltip.icons.OK);
                        $(_this._nodeList[data.value[6]]).css("display","none");
                        $(_this._nodeList[data.value[7]]).css("display","");
                        $(_this._nodeList[data.value[8]]).css("display","");
                    }else{
                        $.bf.shortcut.Tooltip.show("添加好友失败",$.bf.ui.Tooltip.icons.ERROR);
                    }
                });
            };
            break;
        case "addAllFriend":
            return function(){
                var friends = _this._dataStore[0].getFriends();
                _this._friendControl.addFriendBatch(friends, function(result, msg){
                    if(result == 0){
                        $.bf.shortcut.Tooltip.show("添加好友成功",$.bf.ui.Tooltip.icons.OK);
                        var i=1;
                        while(true){
                            if(!_this._nodeList["li1_" + i])
                                break;
                            $(_this._nodeList["li1_" + i]).css("display","none");
                            $(_this._nodeList["li2_" + i]).css("display","");
                            $(_this._nodeList["li3_" + i]).css("display","");
                            ++i;
                        }
                    }else{
                        $.bf.shortcut.Tooltip.show("添加好友失败",$.bf.ui.Tooltip.icons.ERROR);
                    }
                });
            };
            break;
        case "change":
            return function(){
                _this._dataStore[0].request(function(d){
                    var i=1, j=0;
                    while(true){
                        if(!_this._nodeList["li6_" + i])
                            break;
                        if(d.data[j]){
                            $(_this._nodeList[d.data[j].value[6]]).css("display",d.data[j].value[5]);
                            $(_this._nodeList[d.data[j].value[7]]).css("display",d.data[j].value[4]);
                            $(_this._nodeList[d.data[j].value[8]]).css("display",d.data[j].value[4]);
                            _this._nodeList[d.data[j].value[9]].src = d.data[j].value[2];
                            _this._nodeList[d.data[j].value[10]].nodeValue = d.data[j].value[0];
                            _this._nodeList[d.data[j].value[13]].href = d.data[j].value[12];
                            _this._nodeList[d.data[j].value[14]].href = d.data[j].value[12];
                            $(_this._nodeList[d.data[j].value[11]]).css("display","block");
                        }else{
                            $(_this._nodeList["li6_" + i]).css("display", "none");
                        }
                        ++i;
                        ++j;
                    }
                    _adjust();
                }, null)
            };
            break;
        };
    };
})();

/*
 * ToolBar_Playing
 */
(function()
{
    widget.Widget_Toolbar_Playing = function(data, parent)
    {
        this._mouseStyle = [];
        this._mouseEvent = [];
        this._nodeList = {};
        this._dataStore = null;
        this._popup = null;
        
        this._root = util.createModule(Widget_Toolbar_Playing_Templete, data, parent, this._mouseStyle, this._mouseEvent, this._nodeList);
        util.addEventStyles(this._mouseStyle);
        util.addEventActions.call(this, this._mouseEvent);
		//util.id("framemask").style.cssText = "width:200px;height:292px;top:-292px;left:726px;";
    };
    
    var proto = widget.Widget_Toolbar_Playing.prototype;
    
    proto.setDataStore = function(dataStore){
        this._dataStore = dataStore;
        var appid = dataStore[0].getAppid();
        if(appid){
            $(this._nodeList["inviteContainer"]).css("display","block");
        }
    };
    
    proto.hide = function()
    {
        $(".p5").hide();
        $(".toolbar .widget .w5").removeClass("cur z");
		__hideIFrameMask();
    };
    
    proto.getMouseEvent = function(action)
    {
        var _this = this;
        switch(action){
        case "close":
            return function(){
                _this.hide();
            };
            break;
        case "search":
            return function(){
                var all = _this._dataStore[0].getSearchList();
                var options = {
                    "urlOrData": all,
                    "filterKey": "nickname"
                }; 
                var atc = $.bf.ui.AutoComplete.create(options);
                var ret = atc.search(_this._nodeList["searchKey"].value);
                if(ret.length == 0){
                    $(_this._nodeList["notFound"]).css("display", "block");
                }else{
                    $(_this._nodeList["notFound"]).css("display", "none");
                }
                for(var i=0;i<all.length;++i){
                    if(_search(all[i].id, ret)){
                        $(_this._nodeList[all[i].id]).css("display","block");
                    }else{
                        $(_this._nodeList[all[i].id]).css("display", "none");
                    }
                }
            };
            break;
        case "invite":
            return function(){
                if(!_this._popup){
                    _this._popup = new widget.Popup1(_this._dataStore[0].getUserData(), document.body);
                    _this._popup.setDataStore([_this._dataStore[0]]);
					_this._popup.show();
                    _this.hide();
                }else{
                    _this._popup.show();
                    _this.hide();
                }
            };
            break;
        };
    };
    
    var _search = function(key, arr){
        for(var i=0;i<arr.length;++i){
            if(key == arr[i].id)
                return true;
        }
        return false;
    };
})();

/*
 * ToolBar_Twitter
 */
(function()
{
    widget.Widget_Toolbar_Twitter = function(data, parent)
    {
        this._mouseStyle = [];
        this._mouseEvent = [];
		this.nodeList = {};
        
		
        this._root = util.createModule(Widget_Toolbar_Twitter_Templete, data, parent, this._mouseStyle, this._mouseEvent, this.nodeList);
        util.addEventStyles(this._mouseStyle);
        util.addEventActions.call(this, this._mouseEvent);
    };
    
    var proto = widget.Widget_Toolbar_Twitter.prototype;
    
	var currentTime = 0;
	var _this = null;
	
	var getCurrentTime = function(str){
		var i = str.indexOf("time=\"");
		if(i==-1)
			return;
		i += "time=\"".length;
		while(str.indexOf("time=\"", i) != -1){
			i = str.indexOf("time=\"", i) + "time=\"".length;
		}
		try{
			currentTime = parseInt(str.substring(i));
		}catch(e){}
	};
	
    proto.hide = function()
    {
		for(var instance in $.bf.ui.Twitter){
			instance.toggleAllDialog && instance.toggleAllDialog();
		}
        $(".p2").hide();
        $(".toolbar .widget .w2").removeClass("cur z");
		__hideIFrameMask();
    };
	
	proto.update = function(gid, title, str){
		_this = this;
		var obj;
		try{
			obj = eval("(" + str + ")");
		}catch(e){
			return;
		}
		if(obj.errno !== 0){
			return;
		}
		str = obj.data;
		this._gid = gid; 
		this.nodeList["msgload"].innerHTML = '<a id="more_activate" class="moreActive" href="javascript:void(0);"><span class="bg"><span class="iconArrow"></span>查看更多</span></a>';
		this.nodeList["msgloading"].innerHTML = '<a id="more_activate" class="moreActive" href="javascript:void(0);"><span class="bg"><span class="iconloadding"></span></span></a>';
		this.nodeList["msgcontaner"].innerHTML = str;
		this.nodeList["title"].nodeValue = title;
		try{
			var _uri = $.parseUrl()["path"].split("/")[1];
			switch(_uri){
				case "apps":
				case "store":
				case "sgs":
				case "sports":
					_uri = "twitterG";
					break;
				default:
					_uri = "twitterM";
			}
		}catch(e){
			var _uri = "twitterM";
		}
		//var tuita = $.bf.common.tuita.create(null, 256, 'twitterM');
		var tuita = $.bf.common.tuita.create(null, 256, _uri, {allowFollow : true, container : null});
		tuita.addParam('app', gid);
		tuita.show('#tuitainput', _callback(this));
		getCurrentTime(str);
		this.updateMsg();
	};
	
	var _callback = function(me){
		return function(t1, t2, t3, t4){
			if(t1 === 0){
				me.nodeList["msgcontaner"].innerHTML = t2.html + me.nodeList["msgcontaner"].innerHTML;
			}
		}
	};
	
	proto.updateMsg = function(){
		// __update.push(setInterval(_callback, 30000));
	};
	
	var _update = function(str){
		var obj;
		try{
			obj = eval("(" + str + ")");
		}catch(e){
			return;
		}
		if(obj.errno !== 0){
			return;
		}
		str = obj.data;
		_this.nodeList["msgcontaner"].innerHTML =  str;
		getCurrentTime(str);
		if(!$(".toolbar .widget .w2").hasClass("cur")){
			for(var i=0;i<__update.length;++i){
				clearInterval(__update[i]);
			}
			__update = [];
		}
	};
	
	var __update = [];
    
    proto.getMouseEvent = function(action)
    {
        var _this = this;
		var addMoreMsg = function(str){
			var obj;
			try{
				obj = eval("(" + str + ")");
			}catch(e){
				_this.nodeList["msgload"].style.display = "none";
				_this.nodeList["msgloading"].style.display = "none";
				return;
			}
			if(obj.errno !== 0){
				_this.nodeList["msgload"].style.display = "none";
				_this.nodeList["msgloading"].style.display = "none";
				return;
			}
			str = obj.data;
			getCurrentTime(str);
			if(str && str.length >0){
				_this.nodeList["msgcontaner"].innerHTML +=  str;
				_this.nodeList["msgload"].style.display = "block";
				_this.nodeList["msgloading"].style.display = "none";
			}else{
				_this.nodeList["msgload"].style.display = "none";
				_this.nodeList["msgloading"].style.display = "none";
			}
		};
        switch(action){
        case "close":
            return function(){
                var j = 0;
                _this.hide();
            };
            break;
		case "getMore":
			return function(){
				$.ajax({
					type: "GET",
					url:  "/bar/getTuitaFeeds",
					data: {"gid": _this._gid,"more":1, "time":currentTime},
					success: addMoreMsg
				});
				_this.nodeList["msgload"].style.display = "none";
				_this.nodeList["msgloading"].style.display = "block";
			};
			break;
        };
    };
})();



/*
 * Popup1 for online user
 */
(function()
{
    widget.Popup1 = function(data, parent)
    {
        this._mouseStyle = [];
        this._mouseEvent = [];
        this._nodeList = {};
        this._dataStore = null;
        
        this._root = util.createModule(popup1, data, document.getElementById("toolbar_contianer"), this._mouseStyle, this._mouseEvent, this._nodeList);
        util.addEventStyles(this._mouseStyle);
        util.addEventActions.call(this, this._mouseEvent);
    };
    
    var proto = widget.Popup1.prototype;
    
    proto.setDataStore = function(dataStore){
        this._dataStore = dataStore;
        var game = dataStore[0].getAppname();
        this._nodeList["disTitle1"].nodeValue = "邀请你的好友一起玩" + game;
        this._nodeList["disTitle2"].nodeValue = "邀请你的好友一起玩" + game;
    };
    
    proto.hide = function()
    {
        $(this._root).css("display","none");
		__hideIFrameMask("#frameaddmask");
    };
    
    proto.show = function()
    {
        $(this._root).css("display", "block");
		$("#frameaddmask").css("top", "-400px");
		$("#frameaddmask").css("left", "300px");
		$("#frameaddmask").css("width", this._nodeList["inner"].offsetWidth);
		$("#frameaddmask").css("height", this._nodeList["inner"].offsetHeight);
		$("#frameaddmask1").css("display", "block");
    };
    
    proto.getMouseEvent = function(action)
    {
        var _this = this;
        switch(action){
        case "close":
            return function(){
                _this.hide();
            };
            break;
        case "check1":
            return function(){
                var i=0;
                while(true){
                    if(_this._nodeList["o_" + i]){
                        _this._nodeList["o_" + i].checked = this.checked;
                    }else{
                        break;
                    }
                    ++i;
                }
            };
            break;
        case "submit1":
            return function(){
                var i=0;
                var arr = [];
                while(true){
                    if(_this._nodeList["o_" + i]){
                        if(_this._nodeList["o_" + i].checked)
                            arr.push(_this._dataStore[0].getOneLineUser("o_" + i));
                    }else{
                        break;
                    }
                    ++i;
                }
                if(arr.length == 0){
                    $(_this._nodeList["noselect"]).css("display","inline");
                }else{
                    $(_this._nodeList["noselect"]).css("display","none");
                    $.bf.ajax.request("/bar/SendAppInvite" , {
                            "app_id":_this._dataStore[0].getAppid(),
                            "user_ids":arr.join(",")
                        }, 
			            function(result)
			            {
				            $.bf.shortcut.Tooltip.show("发送成功", $.bf.ui.Tooltip.icons.OK);
				            _this.hide();
			            },
			            function(errno,error)
			            {
				            $.bf.shortcut.Tooltip.show(error, $.bf.ui.Tooltip.icons.ERROR);	
			            }
		            );
                }
				return false;
            };
            break;
        };
    };
})();



/*
 * configuration for mail pop
 */
(function()
{
    widget.Popup2 = function(data, parent)
    {
        this._mouseStyle = [];
        this._mouseEvent = [];
        this._nodeList = {};
        this._root = util.createModule(popup2, null, util.id("toolbar_t3"), this._mouseStyle, this._mouseEvent, this._nodeList);
        //util.id("toolbar_t3")
        
        //this._root = util.createModule(Widget_Toolbar_Twitter_Templete, data, parent, this._mouseStyle, this._mouseEvent);
        util.addEventStyles(this._mouseStyle);
        util.addEventActions.call(this, this._mouseEvent);
    };
    
    var proto = widget.Popup2.prototype;
    
    proto.hide = function()
    {
        $(".p3").hide();
        $(".toolbar .widget .w3").removeClass("cur z");
    };
    
    proto.show = function(obj)
    {
		thispop = $(".p3");
		thispop.css("display", "block");
		thispop.css("top", "-310px");
		thispop.css("left", "590px");
		for(var s in obj){
		    if(obj[s]){
		        this._nodeList[s].checked = true;
		    }else{
		        this._nodeList[s].checked = false;
		    }
		}
    };
    
    proto.getMouseEvent = function(action)
    {
        var _this = this;
        switch(action){
        case "close":
            return function(){
                var j = 0;
                _this.hide();
            };
            break;
        case "submit":
            return function(){
                var param = "broadcast=" + (_this._nodeList["broadcast"].checked?1:0)
                    + "&comment=" + (_this._nodeList["comment"].checked?1:0)
                    + "&fans=" + (_this._nodeList["fans"].checked?1:0)
                    + "&fri_request=" + (_this._nodeList["fri_request"].checked?1:0)
                    + "&game_request=" + (_this._nodeList["game_request"].checked?1:0)
                    + "&leave_msg=" + (_this._nodeList["leave_msg"].checked?1:0)
                    + "&letter=" + (_this._nodeList["letter"].checked?1:0)
                    + "&notice=" + (_this._nodeList["notice"].checked?1:0);
                util.requestData({
                    url:"/reminder/saveSetting",
                    data:param,
                    dataType:"json",
                    type:"post",
                    success:function(obj){
                        if(!obj.errno){
                            _this.hide();
							$.bf.shortcut.Tooltip.show("保存设置成功",$.bf.ui.Tooltip.icons.OK);
                        }else{
                            $.bf.shortcut.Tooltip.show("操作失败", $.bf.ui.Tooltip.icons.ERROR);	
                        }
                    }
                });
            };
            break;
        };
    };
})();
