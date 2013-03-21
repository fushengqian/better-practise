DataStore = {};

// DataCenter
// Game Data
(function(){
    DataStore.GameData = function()
    {
        this._data = {};
        this._index = 0;
        this._appid = null;
    };
    
    var proto = DataStore.GameData.prototype;
    
    proto.setAppid = function(appid)
    {
        this._appid = appid;
    };
    
    proto.request = function(callback, data)
    {
        ++this._index;
        util.requestData({
            url:"/bar/playSameGameUsers",
            dataType:"json",
            data:"page=" + this._index + "&aid=" + this._appid,
            type:"post",
            success:_callback.call(this, callback)
        });
    };
    
    proto.getFriends = function()
    {
        var obj = this._data.data;
        var arr = [];
        for(var sId in obj){
            arr.push(sId);
        }
        return arr.join(",");
    };
    
    proto.getUserId = function(s){
        return this._userList[s];
    };
    
    var _callback = function(callback){
        var _this = this;
        return function(obj){
            /*
             {data:[
             {check:notfrand,value[nikename, id, pic]}
             ]}
             */
             if(obj == null){
                return;
             }
             if($.bf.config.errors.E_NEED_LOGIN == obj.errno){
                window.location.href = "/login?refer=" + encodeURIComponent(window.location.href);
                return;
             }
             if(obj.errno){
                return;
             }
            _this._data = obj;
            var d = {};
            _this._userList = {};
            d.data = [];
            obj = obj.data;
            var i = 1;
            for(var sId in obj){
                if(1 != obj[sId].relation && 3 != obj[sId].relation){
                    // not Friend
                    d.data.push({value:[util.cutString(obj[sId].nick,8),sId, obj[sId].avatar_30,obj[sId].nick, "none", ""
                    , "li1_"+i, "li2_"+i, "li3_"+i, "li4_"+i, "li5_"+i, "li6_"+i,$.bf.common.getUserHomeUrl(sId), "li7_"+i, "li8_"+i]});
                }else{
                    d.data.push({value:[util.cutString(obj[sId].nick,8),sId, obj[sId].avatar_30,obj[sId].nick, "", "none"
                    , "li1_"+i, "li2_"+i, "li3_"+i, "li4_"+i, "li5_"+i, "li6_"+i,$.bf.common.getUserHomeUrl(sId), "li7_"+i, "li8_"+i]});
                }
                _this._userList["li1_"+i] = sId;
                ++i;
            }
            callback(d);
        }
    };

})();


// OnLine Data
(function(){
    DataStore.OnLineData = function()
    {
        this._data = {};
        this._onLine = {};
        this._appid = null;
        this._appname = null;
    };
    
    var proto = DataStore.OnLineData.prototype;
    
    proto.setAppid = function(appid, appname)
    {
        this._appid = appid;
        this._appname = appname;
    };
    
    proto.getAppid = function()
    {
        return this._appid;
    };
    
    proto.getAppname = function()
    {
        return this._appname;
    };
    
    proto.request = function(callback)
    {
        util.requestData({
            url:"/bar/getonlinefriends",
			async : false,
            dataType:"json",
            success:_callback.call(this, callback)
        });
    };
    
    proto.getUserData = function(){
        /*
        {
             online:[
             {value:[pic, name, o_1]}
             ],
        */
        
        var obj = this._data.data.rows;
        var d = {};
        d.online = [];
        for(var i = 0;i<obj.length;++i){
            d.online.push({value:[obj[i].avatar_45, util.cutString(obj[i].nickname,8), "o_" + i]});
            this._onLine["o_" + i] = obj[i].user_id;
        }
        return d;
    };
    
    proto.getOneLineUser = function(s){
        return this._onLine[s];
    };
    
    proto.getSearchList = function(){
        var ret = [];
        var obj = this._data.data;
        for(var i=0;i<obj.rows.length;++i){
            ret.push({
                id:obj.rows[i].user_id,
                nickname:obj.rows[i].nickname
            });
        }
        return ret;
    };
    
    var _callback = function(callback){
        var _this = this;
        return function(obj){
            /*
             {totle:[
             {value[totlenum]}
             ],
             list:[
             {value[name, pic, id]
             ]}
             */
             if(obj == null){
                return;
             }
             if($.bf.config.errors.E_NEED_LOGIN == obj.errno){
                window.location.href = "/login?refer=" + encodeURIComponent(window.location.href);
                return;
             }
             if(obj.errno){
                return;
             }
            _this._data = obj;
            obj = obj.data;
            var d = {};
            d.total = [];
            d.total.push({value:[obj.total]});
            d.list = [];
            obj = obj.rows;
            for(var i = 0;i<obj.length;++i){
                d.list.push({value:[util.cutString(obj[i].nickname,8),obj[i].avatar_45, obj[i].user_id, $.bf.common.getUserHomeUrl(obj[i].user_id)]});
            }
            callback(d);
        }
    };

})();



// Mail Data
(function(){
    DataStore.MailData = function(userid)
    {
        this._data = {};
        var _this = this;
        this._mail = null;
        this._userid = userid;
        if(userid && userid > 0){
            this.request();
            setInterval(function(){
                _this.request();
            }, 30000);//没30秒触发一次
        }
    };
    
    var proto = DataStore.MailData.prototype;
    
    proto.request = function()
    {
        util.requestData({
            url:"/reminder",
            dataType:"json",
            success:_callback.call(this)
        });
    };
    
    proto.getData = function()
    {
        var ret = {};
        // send
        ret.send = this._data.data._game_req_details.shift();
        // change
        if(this._data.data._game_req_details.length != 0){
            ret.change = this._data.data._game_req_details[0];
        }
		--this._data.data.game_request;
        ret.num = this._data.data.game_request;
        return ret;
    };
    
    var _callback = function(callback){
        var _this = this;
        return function(obj){
            /*
             {invite:[
             {value[invite, game, num, id]}
             ],
             category:[
             {value[number, discription, id]},
             {value[number, discription, id]}
             ]}
             */
             if(obj == null){
                return;
             }
             if($.bf.config.errors.E_NEED_LOGIN == obj.errno){
                window.location.href = "/login?refer=" + encodeURIComponent(window.location.href);
                return;
             }
             if(obj.errno){
                return;
             }
            _this._data = obj;
            obj = obj.data;
            if(obj.letter 
                || obj.fri_request
                //|| obj.game_request   // Game Request最好还是看数组
                || obj.notice
                || obj.fans
                || obj.leave_msg
                || obj.comment
				|| obj.broadcast
                || obj.game_request){
                
                if(!_this._mail){
                    _this._mail = new widget.Widget_Toolbar_Mail(null, util.id("toolbar_t4"), _this._userid); 
                    _this._mail.setDataStore([_this]);
                }
                _this._mail.show(obj);
            }
        }
    };

})();


// Game Data
(function(){
    DataStore.GameData1 = function()
    {
        this._data = {};
    };
    
    var proto = DataStore.GameData1.prototype;
    
    proto.request = function(callback)
    {
        util.requestData({
            url:"/bar/myapp",
            dataType:"json",
            success:_callback.call(this, callback)
        });
    };
    
    proto.getPageData = function(page){
        
        if(page<1) 
            return null;
        var pageSize = 9;
        page = (page-1) * pageSize;
        var ret = [];
        for(var s in this._data.data.collection_app_list){
            if(page>0)
                --page;
            else{
                ret.push([this._data.data.collection_app_list[s].app_short_name,this._data.data.collection_app_list[s].app_icon]);
            }
        }
        return ret;
    };
    
    var _callback = function(callback){
        var _this = this;
        return function(obj){
            /*
             {
             recentlymsg:[
             {value:[msg]}
             ],
             recently:[
             {value[name, pic, id]}
             ],
             collectmsg:[
             {value:[msg]}
             ],
             collect:[
             {value[name, pic, id]}
             ],
             page:[
             {check:select,value[i]}
             ]}
             */
             if(obj == null){
                return;
             }
             if($.bf.config.errors.E_NEED_LOGIN == obj.errno){
                window.location.href = "/login?refer=" + encodeURIComponent(window.location.href);
                return;
             }
             if(obj.errno){
                return;
             }
            _this._data = obj;
            var d = {};
            if(obj.data && !obj.data.is_user_play_data){
                d.recentlymsg = [{value:["您还没玩过游戏，大家最近在玩"]}];
            }
            if(obj.data && obj.data.play_app_list){
                d.recently = [];
                for(var i=0;i<obj.data.play_app_list.length;++i){
                    d.recently.push({value:[obj.data.play_app_list[i].app_short_name,obj.data.play_app_list[i].app_icon,obj.data.play_app_list[i].app_id,obj.data.play_app_list[i].app_link]});
                }
            }
            if(obj.data && !obj.data.is_user_collection_data){
                d.collectmsg = [{value:["您还没有收藏任何游戏"]}];
            }
            if(obj.data && obj.data.collection_app_list){
                d.collect = [];
                var i=6, pageSize=6, j=0;
                if(obj.data.is_user_collection_data){
                    pageSize = i = 9;
                    for(var s in obj.data.collection_app_list){
                        ++j;
                        d.collect.push({value:[obj.data.collection_app_list[s].app_short_name,obj.data.collection_app_list[s].app_icon,s, "name"+j, "img"+j, "node" + j,obj.data.collection_app_list[s].app_link]});
                        if(--i == 0)
                            break;
                    }
                }else{
                    for(var s in obj.data.collection_app_list){
                        ++j;
                        d.collect.push({value:[obj.data.collection_app_list[s].app_short_name,obj.data.collection_app_list[s].app_icon,s, "name"+j, "img"+j, "node" + j,obj.data.collection_app_list[s].app_link]});
                        if(--i == 0)
                            break;
                    }
                }
                if(obj.data.collection_app_count>pageSize){
                    d.page = [];
                    var i = obj.data.collection_app_count;
                    var j=0;
                    do{
                        d.page.push({value:[j==0?"cur":"", ++j, "page" + j]});
                        i -= pageSize;
                    }while(i>0)
                }
            }
            d.collectTitle = [{value:["我的收藏(" + obj.data.collection_app_count + ")"]}];
            callback(d);
        }
    };

})();





// Game Data
(function(){
    DataStore.tuita = function(gid, gname)
    {
        this._data = {};
		this._gid = 0;
		this._title = "好友动态";
		if(gid){
			this._gid = gid;
			this._title = gname + "游戏动态";
		}
    };
    
    var proto = DataStore.tuita.prototype;
    
    proto.request = function(callback)
    {
		var _this = this;
		var _callback = function(str){
			_this.m = new widget.Widget_Toolbar_Twitter(null, util.id("toolbar_t2"));
			_this.m.update(_this._gid, _this._title, str);
			callback(true);
		};
		$.ajax({
			type: "GET",
			url:  "/bar/getTuitaFeeds",
			data: {"gid": this._gid,"more":0},
			success: _callback
		});
    };
	
	proto.getObj = function(){
		return this.m;
	};
    


})();