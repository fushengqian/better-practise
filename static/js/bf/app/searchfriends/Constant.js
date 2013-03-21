
function initNameSpace(router)
{
	if(!router||router==''){
		return;
	}
	var p=window,arrNS=router.split('.');
	for(var i=0,len=arrNS.length;i<len;i++){
		if(!p[arrNS[i]]){
			p[arrNS[i]]={};
		}
		p=p[arrNS[i]];
	}
}

initNameSpace('snda.lib');
snda.lib.constant = {
		__SITE_URL:$.bf.config.SITE_URL,
		__STATIC_URL:'http://ipic.staticsdo.com/v1',
		__FACE_URL:'http://f.staticsdo.com',
		__SITE_DOMAIN:$.bf.config.SITE_DOMAIN,
		__PAGE_WIDTH:950,
		__POLL_INTERVAL:30000,
		__TUITA_INDEX_INTERVAL:30000,
		__TUITA_APP_INTERVAL:30000,
		__MSG_CHK_INTERVAL:30000,
		__MSG_LETTER_INTERVAL:5000		
};