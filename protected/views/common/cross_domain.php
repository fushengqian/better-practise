<script type="text/javascript">
var $ = {};
$.parseUrl=function(url){
	url = !url && self.location.href || url;
	var ret = {};
	var m = /(https?):\/\/([^\?]+)(?:\?(.+))?/i.exec(url);
	if(m){
		ret['protocol'] = m[1];
		var m2 = m[2], fullhost = m2.replace(/\/.*/i, '');
		var index = fullhost.indexOf(":"), host, port;
		if(index < 0){
			host = fullhost;
			port = 80;
		}else{
			port = fullhost.substr(index + 1);
			host = fullhost.substr(0, index);
		}
		ret['host'] = host, ret['port'] = port;
		var path = m2.replace(/.+?\//i, '');
		if(!path){
			path = "/";
		}else{
			path = "/" + path;
		}
		ret['path'] = path;
			
		var params = {};
		if(m[3]){
			for(var i=0,tmp=m[3].split("&"),len=tmp.length;i<len;i++){
				var dict = tmp[i].split("=");
				params[dict[0]] = dict[1];
			}
		}

		ret['params'] = params;
		return ret;
	}
}
var urlData = $.parseUrl(location.href), data = null;
if(urlData)
{
	var params = urlData.params;
	if(params)
	{
		data = params.data;
	}

	if(data)
	{
		data = decodeURIComponent(data);
	}
}
top.$.bf.common.TwitterCrossManager.dispatch(data);
</script>
