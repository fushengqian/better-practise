/**
 * jquery 拖动插件
 * 
 * 
 * 示例：
 * $.drag.init('#header','#box');
 * $('#box').get(0).onDragStart = function () { alert('onDragStart') };
 * $('#box').get(0).onDrag      = function (event, x, y) { alert('onDrag') };
 * $('#box').get(0).onDragEnd   = function () { alert('onDragEnd') };
 */

$.drag = {
	obj : null,
	//obj_header : 拖拽对象， obj : 跟随对象
	init : function(obj_header, obj)
	{
		obj = obj || obj_header, this.obj = $(obj), obj_header = $(obj_header);

		if(obj_header.size() < 1)
		{
			return false;
		}

		if(this.obj.size() < 1)
		{
			this.obj = obj_header;
		}

		//将移动主体保存在 header 的 DOM 中，已实现多实例移动
		obj_header.get(0).obj = this.obj;
		obj_header.mousedown(this.start);

		// 初始化绝对的坐标，因为不是 position = absolute 所以不会起什么作用，但是防止后面 onDrag 的时候 parse 出错了
		if(isNaN(parseInt(this.obj.css('left')))) 
		{
			this.obj.css('left', "0px");
		}
		
		if(isNaN(parseInt(this.obj.css('top')))) 
		{
			this.obj.css('top', "0px");
		}

		// 挂上空 function，初始化这几个成员，在 drag.init 被调用后才绑定到实际的函数
		this.obj.get(0).onDragStart = new Function();
		this.obj.get(0).onDragEnd = new Function();
		this.obj.get(0).onDrag = new Function();
	},
	start : function (event)
	{
		var element = $.drag.obj = this.obj;
		
		event = $.drag.fix(event);
		// 看看是不是左键点击
		if(event.which != 1){
			// 除了左键都不起作用
			return true ;
		}
		
		// 参照这个函数的解释，挂上开始拖拽的函数钩子
		element.get(0).onDragStart();
		
		// 记录鼠标坐标
		element.attr('lastMouseX', event.clientX);
		element.attr('lastMouseY', event.clientY);

		// 绑定事件
		$(document).mouseup($.drag.end);
		$(document).mousemove($.drag.drag);
		
		return false;
	},
	// Element正在被拖动的函数
	drag : function(event) 
	{
		event = $.drag.fix(event);
		
		if(event.which == 0 ) {
		 	return $.drag.end();
		}
		// 正在被拖动的Element
		var element = $.drag.obj;
		// 鼠标坐标
		var _clientX = event.clientY;
		var _clientY = event.clientX;
		// 如果鼠标没动就什么都不作
		if(element.attr('lastMouseX') == _clientY && element.attr('lastMouseyY') == _clientX) {
			return	false ;
		}
		// 刚才 Element 的坐标
		var _lastX = parseInt(element.css('top'));
		var _lastY = parseInt(element.css('left'));
		// 新的坐标
		var newX, newY;
		// 计算新的坐标：原先的坐标+鼠标移动的值差
		newX = _lastY + _clientY - element.attr('lastMouseX');
		newY = _lastX + _clientX - element.attr('lastMouseY');
		// 修改 element 的显示坐标
		element.css('left', newX + "px");
		element.css('top', newY + "px");
		// 记录 element 现在的坐标供下一次移动使用
		element.attr('lastMouseX', _clientY);
		element.attr('lastMouseY', _clientX);
		
		// 参照这个函数的解释，挂接上 Drag 时的钩子
		element.get(0).onDrag(event, newX, newY);
		
		return false;
	},
	// Element 正在被释放的函数，停止拖拽
	end : function(event)
	{
		event = $.drag.fix(event);
		// 解除事件绑定
		$(document).unbind('mousemove');
		$(document).unbind('mouseup');
		
		// 先记录下 onDragEnd 的钩子，好移除 obj
		var ondragend_function = $.drag.obj.get(0).onDragEnd();
		
		// 拖拽完毕，obj 清空
		$.drag.obj = null ;
		
		return ondragend_function;
	},
	// 解决不同浏览器的 event 模型不同的问题
	fix : function(event)
	{
		if( typeof event == "undefined" )
		{
			event = window.event;
		}
		if( typeof event.layerX == "undefined" )
		{
			event.layerX = event.x;
		}
		if( typeof event.layerY == "undefined" )
		{
			event.layerY = event.y;
		}
		if( typeof event.which == "undefined" )
		{
			event.which = event.button;
		}
		return event;
	}
};