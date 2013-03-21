function createRequest() {
    var req;
    if (window.ActiveXObject) {
        try {
            req = new ActiveXObject("Microsoft.XMLHTTP");

        } catch(e) {
            req = new ActiveXObject("MSXML2.XMLHTTP");

        }

    }
    else if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
        if (req.overrideMimeType)
        req.overrideMimeType("text/xml");

    }
    if (!req) {
        alert("xmlHttpRequest对象创建失败!");
        return;

    }
    return req;

}
function send_request(callback, urladdress, isReturnData, requestMethod, params) {
    var xmlhttp = createRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            try {
                if (xmlhttp.status == 200) {
                    if (isReturnData && isReturnData == true) {
                        callback(xmlhttp.responseText);

                    }

                } else {
                    callback("抱歉，没找到此页面:" + urladdress + "");

                }

            } catch(e) {
                callback("抱歉，发送请求失败，请重试 " + e);

            }

        }

    }
    if (requestMethod == "post") {
        xmlhttp.open("post", urladdress, true);
        xmlhttp.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(params);

    } else {
        xmlhttp.open("get", urladdress, true);
        xmlhttp.send(null);

    }

}