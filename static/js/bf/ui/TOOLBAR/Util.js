// This file related to JQuery

(function(base){
    // Create Util
    var util = null;
    if(base && typeof base == "object"){
        util = base.util;
    }else{
        window.util = {};
        util = window.util;
    }
    
    // Add all function here
    
    // Get the element by id
    util.id = function(id)
    {
        if(typeof id === "string"){
            return document.getElementById(id);
        }
        return id;
    };
    
    // Add CSS for one element
    util.css = function(el, styleName, styleValue)
    {
        if(typeof el === "string"){
            el = "#" + el;
        }
        $(el).css(styleName, styleValue);
    };
    
    // Bind event for the element
    util.bindEvent = function(el, event, callback)
    {
        if(typeof el === "string"){
            el = "#" + el;
        }
        switch(event)
        {
        case "blur":
            $(el).blur(callback);
            break;
        case "change":
            $(el).change(callback);
            break;
        case "click":
            $(el).click(callback);
            break;
        case "dblclick":
            $(el).dblclick(callback);
            break;
        case "error":
            $(el).error(callback);
            break;
        case "focus":
            $(el).focus(callback);
            break;
        case "keydown":
            $(el).keydown(callback);
            break;
        case "keypress":
            $(el).keypress(callback);
            break;
        case "keyup":
            $(el).keyup(callback);
            break;
        case "load":
            $(el).load(callback);
            break;
        case "mousedown":
            $(el).mousedown(callback);
            break;
        case "mousemove":
            $(el).mousemove(callback);
            break;
        case "mouseout":
            $(el).mouseout(callback);
            break;
        case "mouseover":
            $(el).mouseover(callback);
            break;
        case "mouseup":
            $(el).mouseup(callback);
            break;
        case "resize": // window, iframe, frame
            $(el).resize(callback);
            break;
        case "scroll": //window
            $(el).scroll(callback);
            break;
        case "select": // document, input, textarea
            $(el).select(callback);
            break;
        case "submit": // form
            $(el).submit(callback);
            break;
        case "unload": // window
            $(el).unload(callback);
            break;
        }
    };
    
    // Download Script 
    util.loadScript = function(url, callback)
    {
        $.getScript(url, callback);
    };
    
    // Use Ajax to request data
    util.getData = function(obj)
    {
        // url: url
        // dataType: 'json' / 'xml'
        // data: 'key=value1&....'
        // success: callback
        // type: 'post' / 'get'
        $.ajax(obj);
    };
    
    util.requestData = function(obj)
    {
        $.ajax(obj);
    };
    
    // Cut the string to right length, 
    // Each character equals two letter
    util.cutString = function(str, n)
    {
        if(typeof str != "string" || isNaN(n)){
            return str;
        }
        var isChatOrLetter = function(asc){
            if(asc >= 48 && asc <= 57
                || asc >= 65 && asc <= 90
                || asc >= 97 && asc <= 122 ){
                    return true;
            }
            return false;
        };
        var i = 0;
        while(i<str.length){
            if(isChatOrLetter(str.charCodeAt(i))){
                --n;
            }else{
                n = n-2;
            }
            if(n >= 0){
                ++i;
            }else{
                break;
            }
        }
        return str.substring(0, i);
    };
    
    // Create one elemnt according to the JSON data
    // type: means the tag name of the element
    // attr: the attibute of the elemement for example the classname , href
    // value: the value which will be used to fill into the element, we need read the value in value.value, it is a array
    // parent: the parent of the node
    util.createEl = function(type, attr, style, value, parent)
    {
        var getValue = function(arr, n){
            if(typeof n !="number" || !arr || !arr.value)
                return n;
            return arr.value[n];
        };
        var ret = null;
        if(!type && attr && (attr.text || !isNaN(attr.text))){
            ret = document.createTextNode(getValue(value, attr.text));
        }else{
            ret = document.createElement(type);
            for(var sLine in attr){
                ret[sLine] = getValue(value, attr[sLine]);
            }
            for(var sLine in style){
                util.css(ret, sLine, getValue(value, style[sLine]));
            }
        }
        parent && util.id(parent).appendChild(ret);
        return ret;
    };
    
    // Create a group of the Element
    // Json is used to define the format of the object
    // data is the data which will be filled into the object
    // parent is the parent of the object
    util.createModule = function(json, data, parent, mouseStyle, mouseEvent, nodeList)
    {
        if( !json ) // if JSON is not existed
            return null;
        if(json.key != null){ // if the node is too special
            var arr = json.key.split('.');
            var obj = data;
            if(!data)
                return;
            for(var i=0;i<arr.length;++i){
                if(!obj[arr[i]]){
                    obj = null;
                    break;
                }
                obj = obj[arr[i]];
            }
            if(!!obj && !!json.format){
                for(var i=0;i<obj.length;++i){
                    if(obj[i].check && json.format[obj[i].check])
                        util.createModule(json.format[obj[i].check], obj[i], parent, mouseStyle, mouseEvent, nodeList);
                    else
                        util.createModule(json.format.de, obj[i], parent, mouseStyle, mouseEvent, nodeList);
                }
            }
        }else{
            var ret = util.createEl(json.type, json.attr, json.style,data, parent);
            // add mouse style
            if(mouseStyle && json.mouseStyle){
                mouseStyle.push({
                    el:     ret,
                    style:  json.mouseStyle
                });
            }
            // add mouse event
            if(mouseEvent && json.mouseEvent){
                mouseEvent.push({
                    el:     ret,
                    event:  json.mouseEvent,
                    data:   data
                });
            }
            // see whether this node need to be collected
            if(nodeList){
                if(typeof json.inner == "string")
                    nodeList[json.inner] = ret;
                else if(typeof json.inner == "number")
                    nodeList[data.value[json.inner]] = ret;
            }
            if(json.children){
                for(var i=0;i<json.children.length;++i){
                    util.createModule(json.children[i], data, ret, mouseStyle, mouseEvent, nodeList);
                }
            }
        }
        return ret;
    };
    
    // add or remove the css according to the mouse action
    util.addEventStyle = function(el, mouseEvent, className)
    {
        if(typeof el === "string")
            el = "#" + el;
        if(mouseEvent === "hover"){
            $(el).hover(function(){
                    $(this).addClass(className);
                },
                function(){
                    $(this).removeClass(className);
                }
            );
        }
        // add more if we have time
    };
    
    // add the style for a bounch of element
    util.addEventStyles = function(arr)
    {
        for(var i=0;i<arr.length;++i){
            var obj = arr[i];
            for(var mEvent in obj.style){
                util.addEventStyle(obj.el, mEvent, obj.style[mEvent]);
            }
        }
    };
    
    // add mouse event for one element
    util.addEventAction = function(el, mouseEvent, action, data)
    {
        var callback = this.getMouseEvent(action, data);
        util.bindEvent(el, mouseEvent, callback);
    };
    
    // add event for a bounch of elements
    util.addEventActions = function(arr)
    {
        for(var i=0;i<arr.length;++i){
            var obj = arr[i];
            for(var mEvent in obj.event){
                util.addEventAction.call(this, obj.el, mEvent, obj.event[mEvent], obj.data);
            }
        }
    };
    
    // create widget
    util.createWidgitByJson = function(json, data, parent)
    {
        var mouseStyle = [], mouseEvent = [], nodeList = {};
        this.root = util.createModule(json, data, parent, mouseStyle, mouseEvent, nodeList);
        this.nodeList = nodeList;
        util.addEventStyles(mouseStyle);
        util.addEventActions.call(this, mouseEvent);
    };

})();