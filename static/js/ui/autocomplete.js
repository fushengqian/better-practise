/**
* autocomplete UI component
* @author Jefurry <jefurry.chen@gmail.com>
*/

/**
* data 格式：[{id : 'id', img : 'img', nick : 'nick'}, {id : 'id', img : 'img', nick : 'nick'}]
*/

$.registerNameSpace('bf.ui');
~function($){
	$.bf.ui.AutoComplete = $.Class.create();
	$.bf.ui.AutoComplete.implement({
		__init__ : function(options)
		{
			options = options || {};
			// 惯例配置
			var convertion = {
				urlOrData     : options.urlOrData || null,
				input         : options.input || null,
				eList         : ['click', 'keyup'], // 绑定的事件列表
				loading       : false,
				params        : {},//如向远程请求数据，此为请求携带过去的参数
				method        : 'POST',
				filterKey     : '', // 对哪个key进行过滤
				mode          : '' //是否支持模糊查找,为fuzzy支持
			};
			options = $.extend(convertion, options);
			if(!options.urlOrData)
			{
				return false;
			}
			var isUrl = 'string' === typeof options.urlOrData && true || false;
			options.url = isUrl && options.urlOrData || null;
			options.data = !isUrl && options.urlOrData || null;
			options.filterKey = (options.filterKey || '').toLowerCase();
			delete options.urlOrData;
			this.options = options;
			this.caches  = {};//缓存对象
			this._pyKey  = '__py__';
			this._pyFlag = false;//用于标识是否已经转到了拼音
			this.keys    = {
				UP        : 38, // 上箭头
				DOWN      : 40, // 下箭头
				DEL       : 46, // DEL键
				TAB       : 9, // TAB键
				RETURN    : 13, // 回车键
				ESC       : 27, // ESC键
				COMMA     : 188,
				PAGEUP    : 33, // PAGEUP键
				PAGEDOWN  : 34, // PAGEDOWN键
				BACKSPACE : 8 // 删除键
			};
		},
		/**
		 * 原样返回所有元数据
		 */
		_getAllMetaData : function()
		{
			var returnData = [];
			$.each(this.options.data, function(index, dict){
				var tmpObj = $.extend({}, dict);
				delete tmpObj[this._pyKey];
				returnData.push(tmpObj);
			}.bind(this));

			return returnData;
		},
		
		/**
		* 将元数据追加拼音
		* @return Array
		*/
		_getMetaData : function()
		{
			var metaData  = this.options.data || [];//元数据
			var filterKey = this.options.filterKey;//过滤key
			if(!metaData || !metaData.length || !filterKey)
			{
				//直接返回元数据
				return metaData;
			}

			if(!this._pyFlag)
			{
				var filterData = this._getFilterData(filterKey, metaData);//获取待搜索关键字列表
				$.bf.utils.pinyin.chineseToPY(filterData, this._setPYEnd.bind(this));//将关键字列表转成拼音并追加到元数据
				this._pyFlag = true;
			}

			return this.options.data;
		},
		/**
		* 获取需过滤的数据
		* @param filterKey 过滤的字段
		* @return Array
		*/
		_getFilterData : function(filterKey, metaData)
		{
			var filterData = [];
			$.each(metaData, function(index, dict){
				for(var item in dict)
				{
					if(item.toLowerCase() === filterKey)
					{
						filterData.push(dict[item]);
					}
				}
			});
			return filterData;
		},
		/**
		* 在结果集中搜索
		* @param keywords 需搜索的关键字
		*/
		search : function(keywords)
		{
			keywords     = (keywords || '').toLowerCase();
			if(!keywords)
			{
				return this._getAllMetaData();
			}
			var metaData = this._getMetaData();
			filterKey    = this.options.filterKey;
			var returnData = [];
			$.each(this.options.data, function(index, dict){
				var metaStr = dict[filterKey];//原始字符串
				var pys     = dict[this._pyKey];//拼音数组，最后一个元素保存了原始字符串
				if(this._find(keywords, pys, metaStr))
				{
					var tmpObj = $.extend({}, dict);
					delete tmpObj[this._pyKey];
					returnData.push(tmpObj);
				}
			}.bind(this));

			return returnData;
		},
		/**
		 * 进行安装，绑定到特定的文本域
		 * @param beforeCallback 执行前的回调，用于处理一些细节，比如数据验证，返回false会阻止执行，应显示的返回true或false
		 * @param afterCallback 执行后的回调，用于执行后的数据清理
		 */
		install : function(beforeCallback, afterCallback)
		{
			if(!this.options || !this.options.input)
			{
				return false;
			}
			this.options.input = $(this.options.input);
			// 一个实例只能绑定一个文本域
			if(this.options.input.size() != 1)
			{
				return false;
			}
			var emptyFn = function(){return true;};
			beforeCallback = (beforeCallback || emptyFn).bind(this);
			afterCallback  = (afterCallback || emptyFn).bind(this);

			if(!beforeCallback())
			{
				return false;
			}
			for(var i = 0; i < this.options.eList.length; i++)
			{
				var eType = this.options.eList[i];
				this.options.input.bind(eType, function(event){
					afterCallback(this.search(this.options.input.val()));
				}.bind(this));
			}
			return this;
		},
		/**
		* 查找
		* @param keywords 需要查找的关键字
		* @param pys 拼音数组
		* @param metaStr 原始字符串
		* @return Boolean
		*/
		_find : function(keywords, pys, metaStr)
		{
			if($.isArray(pys))
			{
				var py = $.bf.common.toSingleArray(pys);
				if(!$.isArray(py))
				{
					py = [py];
				}

				var keywordsLen = keywords.length;
				metaStr = metaStr.toLowerCase();
				if(this._hasChinese(keywords))
				{
					if(keywordsLen <= metaStr.length)					{
						
						if(keywords.substr(0, keywordsLen) != metaStr.substr(0, keywordsLen))
						{
							if (this.options.mode == 'fuzzy') {
								if (metaStr.indexOf(keywords) != -1) {
									return true;
								}
							}
							
							return false;
						}
						return true;
					}
					
					return false;
				}
				else
				{
					for(var i = 0; i < py.length; i++)
					{
						var p = py[i].toLowerCase();
						if(keywordsLen <= p.length)
						{
							if(keywords.substr(0, keywordsLen) == p.substr(0, keywordsLen))
							{
								return true;
							}else {
								if (this.options.mode == 'fuzzy') {
									if (metaStr.indexOf(keywords) != -1) {
										return true;
									}
								}
							}
						}
					}
					return false;
				}
			}

			return false;
		},

		// 是否包括了中文
		_hasChinese : function(s)
		{
			for(var i = 0; i < s.length; i++)
			{
				if(s.charCodeAt(i) >= 10000)
				{
					return true;
				}
			}
			return false; 
		},
		
		_setPYEnd : function(pinyins)
		{
			var metaData = this.options.data;
			$.each(metaData, function(index, dict){
				dict[this._pyKey] = pinyins[index];
			}.bind(this));
		}
	});
}(jQuery);
/*
$(function(){
	var testData = [
		{id : '123456', img : 'img1', nick : '陈sg耀强'},
		{id : '856210', img : 'img2', nick : '杨俊杰'},
		{id : '458210', img : 'img3', nick : '杨小杰'},
		{id : '456789', img : 'img4', nick : '马毅'},
		{id : '158956', img : 'img5', nick : '龙世昌'},
		{id : '458952', img : 'img6', nick : '赵祥虎'},
		{id : '986532', img : 'img7', nick : '吴志坚'},
		{id : '150264', img : 'img8', nick : '姜杰'},
		{id : '451263', img : 'img9', nick : '袁洋'}
	];

	var options = {
		'input'     : "[attr='basic_realname']",
		'urlOrData' : testData,
		'filterKey' : 'nick'
	};
	var atc = $.bf.ui.AutoComplete.create(options);
	console.log(atc.search('jj'));
	atc.install(null, function(data){
		console.clear();
		console.log(data);
	});
	
	$(window).keyup(function(event){
		console.log(event.keyCode);
	});
	console.log(atc.search('y'));
});
*/
