var userAgent = navigator.userAgent.toLowerCase();
var is_opera = userAgent.indexOf("opera") != -1 && opera.version();
var is_moz = (navigator.product == "Gecko") && userAgent.substr(userAgent.indexOf("firefox") + 8, 3);
var is_ie = (userAgent.indexOf("msie") != -1 && !is_opera) && userAgent.substr(userAgent.indexOf("msie") + 5, 3);
var $ = function(a) {
    return document.getElementById(a)
};
function trim(a) {
    return a.replace(/(^\s*)|(\s*)$/g, "")
}
document.oncontextmenu = function(a) {
    return false
};
document.onselectstart = function(a) {
    return false
};
document.onkeydown = function(a) {
    if (window.event) {
        a = window.event
    }
    if (a.altKey && a.keyCode == 37) {
        a.returnValue = false
    }
    if ((a.keyCode == 116) || (a.ctrlKey && a.keyCode == 82) || (a.ctrlKey && a.keyCode == 65) || (a.ctrlKey && a.keyCode == 67) || (a.ctrlKey && a.keyCode == 115)) {
        a.keyCode = 0;
        a.returnValue = false
    }
    if ((a.altKey) && (a.keyCode == 115)) {
        window.showModelessDialog("about:blank", "", "dialogWidth:1px;dialogheight:1px");
        return false
    }
    if ((a.ctrlKey) && (a.keyCode == 78)) {
        a.keyCode = 0;
        a.returnValue = false
    }
};
function getEvent() {
    if (document.all) {
        return window.event
    }
    func = getEvent.caller;
    while (func != null) {
        var a = func.arguments[0];
        if (a) {
            if ((a.constructor == Event || a.constructor == MouseEvent) || (typeof(a) == "object" && a.preventDefault && a.stopPropagation)) {
                return a
            }
        }
        func = func.caller
    }
    return null
}
function highlight(b) {
    if (b) {
        var a = "display:block;background:#50a3e5;color:white;cursor:pointer;";
        if (parseInt(is_ie) == 6) {
            a += "height:10px"
        }
        b.style.cssText = a
    }
}
function cancelHighLight(b) {
    if (b) {
        var a = "background:none;color:#333;";
        if (parseInt(is_ie) == 6) {
            a += "height:10px"
        }
        b.style.cssText = a
    }
}
function chooseSingleAnswer(b, a) {
    $(b).checked = true;
    $("markspan" + a).style.display = "none";
    $("optdiv" + a).style.backgroundColor = "#FFFFFF"
}
function chooseMultiAnswer(c, b) {
    var a = $(c);
    a.checked = !a.checked;
    $("markspan" + b).style.display = "none";
    $("optdiv" + b).style.backgroundColor = "#FFFFFF"
}
function markUnconfirm(a) {
    $("optdiv" + a).style.backgroundColor = "#CCFFCC"
}
function markUnReply(a) {
    $("optdiv" + a).style.backgroundColor = "#FFDECE"
}
function prev() {
    var a = $("cp").innerHTML - 0;
    if (a > 1) {
        a = a - 1;
        go(a)
    }
}
function next() {
    var a = $("cp").innerHTML - 0;
    var b = $("tp").innerHTML - 0;
    if (a < b) {
        a = a + 1;
        go(a)
    }
}
function go(idx) {
	window.scrollTo(0,0);
    var tp = $("tp").innerHTML;
    for (var i = 1; i <= tp; i++) {
        if (idx == i) {
            $("p" + i.toString()).style.display = "block";
            $("pagelink" + i.toString()).className = "current"
        } else {
            $("p" + i.toString()).style.display = "none";
            $("pagelink" + i.toString()).className = ""
        }
    }
    var nextId = $("nextPageId");
    var prevId = $("previousPageId");
    if (idx == 1) {
        with(prevId.style) {
            color = "gray";
            textDecoration = "none"
        }
        prevId.onclick = function() {
            return false
        }
    } else {
        with(prevId.style) {
            color = "#3669ba";
            textDecoration = "none"
        }
        prevId.onclick = prev
    }
    if (idx == parseInt(tp)) {
        with(nextId.style) {
            color = "gray";
            textDecoration = "none"
        }
        nextId.onclick = function() {
            return false
        }
    } else {
        with(nextId.style) {
            color = "#3669ba";
            textDecoration = "none"
        }
        nextId.onclick = next
    }
    $("cp").innerHTML = idx
}
function winOpen(e, b, a) {
    var d = "200";
    var c = (document.documentElement.clientWidth - b) / 2;
    window.open(e, "\u8865\u5145\u89e3\u6790", "width=" + b + ", height=" + a + " ,scrollbars=yes, left=" + c + ", top=" + d + ",toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no")
}
function showTime(c) {
    var a = (c / 3600) < 1 ? "00": (c / 3600) < 10 ? "0" + (c / 3600).toString().split(".")[0] : (c / 3600).toString().split(".")[0];
    var e = ((c % 3600) / 60) < 1 ? "00": ((c % 3600) / 60) < 10 ? "0" + ((c % 3600) / 60).toString().split(".")[0] : ((c % 3600) / 60).toString().split(".")[0];
    var b = (c % 3600) % 60 < 10 ? "0" + (c % 3600) % 60: (c % 3600) % 60;
    var d = a + ":" + e + ":" + b;
    $("timeshow").innerHTML = d;
    if (c > 0) {
        setTimeout("showTime(" + --c + ");", 1000)
    } else {
        if ($("autoSubmitId")) {
            $("autoSubmitId").value = "true"
        }
        document.forms[0].submit()
    }
}
var csdnScrollTop = function() {
    return document.documentElement.scrollTop ? document.documentElement.scrollTop: document.body.scrollTop
};
function pageY(a) {
    return a.offsetParent ? a.offsetTop + pageY(a.offsetParent) : a.offsetTop
}
function move() {
    $("time").style.top = csdnScrollTop() + 150 + "px";
    $("time").style.right = 3 + "px";
    setTimeout("move();", 50)
}
function initTimeLayer(exam_time, qtCount) {
    $("qtcountId").innerHTML = "<input  type='button' class='button_w_90' value='\u4ea4\u5377'  onclick='submitExamPaper();' style='cursor:pointer;'/> <br/>\u5171" + qtCount + "\u9053\u9898";
    showTime((typeof(exam_time) == "string" ? eval(exam_time) : exam_time))
}
function getPageScroll() {
    var a = 0;
    if (document.documentElement && document.documentElement.scrollTop) {
        a = document.documentElement.scrollTop
    } else {
        if (document.body) {
            a = document.body.scrollTop
        }
    }
    return a
}
function showScrollInfo(a) {
    $(a).style.top = (150 + getPageScroll()) + "px"
}
function jump(a, c) {
    if (pageCount > 1) {
        go(a)
    }
    for (var b = 0; b < qtTypeNagivationLinks.length; b++) {
        if (qtTypeNagivationLinks[b] == c) {
            qtTypeNagivationLinks[b].className = "current"
        } else {
            qtTypeNagivationLinks[b].className = ""
        }
    }
}
function closePaper() {
    if (!window.XMLHttpRequest) {
        window.close()
    } else {
        if (confirm("\u60a8\u786e\u8ba4\u5173\u95ed\u8be5\u8bd5\u5377\u5417?")) {
            window.close()
        }
    }
}
//交卷
function submitExamPaper() {
	//显示判断正误显示解析
	question = document.getElementsByName('question');
	for (var i = 0; i < question.length; i++){
		check(question[i]);
	}
	
	if (isTimeLimit) {
		//var course_id = $("course_id").value;
        //send_request(function(a) {},contextPath + "/exam/submitExam?course_id="+course_id, true);
    }
}

//检查对错
function check(question) {
	var input_nodes = question.getElementsByTagName("input");
	var type = input_nodes['type'].value;
	var answer = input_nodes['answer'].value;
	var question_id = input_nodes['question_id'].value;
	var user_answer = '';
	
	//单选题判断
	if (type == '[单选]') {
		var option_div = $('optdiv'+question_id);
		var option = option_div.getElementsByTagName("input");
		for(var i=0;i<option.length;i++) {
			if (option[i].checked) {
				user_answer = option[i].value;
			}
		}
		
		if (user_answer == answer) {
			$("optdiv"+question_id).style.background = '#CCFFCC';
			$("right_tip_"+question_id).style.visibility = 'visible';
		} else {
			$("optdiv"+question_id).style.background = '#FFDECE';
			$("wrong_tip_"+question_id).style.visibility = 'visible';
		}
	}
	
	//显示解析
	$("analysis_"+question_id).style.display='block';
}

function viewExamPaperSolution() {
    if (!logedInSolutionPage) {
        guestLoginUI()
    } else {
        send_request(function(a) {
            if (a == "1") {
                alert("\u60a8\u7684\u64cd\u4f5c\u6709\u8bef,\u5bfc\u81f4\u60a8\u8fd9\u4efd\u8003\u5377\u5df2\u8fc7\u671f,\u4f8b\u5982:\u540c\u65f6\u62bd\u53d6\u4e86\u591a\u4efd\u8003\u5377\u3002\u7cfb\u7edf\u5373\u5c06\u5173\u95ed\u8be5\u8003\u5377\uff01");
                parent.close()
            } else {
                location.href = solutionURI
            }
        },
        contextPath + "/examPaperExpired.do?examPaperId=" + examPaperId, true)
    }
}
function showLessCentRealTime() {
    send_request(function(b) {
        if (b != "") {
            var a = b.split("#");
            if (a.length >= 3) {
                $("goldNumId").innerHTML = a[0];
                $("silverNumId").innerHTML = a[1];
                $("copperNumId").innerHTML = a[2]
            }
        }
    },
    "showCentRealTime.do", true)
}
function collectQuestion(a) {
    if (map.containsKey(a)) {
        centPromptMsg("\u60a8\u5df2\u6536\u85cf\u6b64\u9898!", csdnScrollTop() + 360)
    } else {
        send_request(function(c) {
            if (c == "-3") {
                guestLoginUI()
            } else {
                if (c == "-2") {
                    centPromptMsg("\u60a8\u8d26\u6237\u5269\u4f59\u79ef\u5206\u4e0d\u8db3,\u6536\u85cf\u8003\u9898\u9700\u8981 <em>" + collectQtNeedCentNum + "</em> \u679a" + collectQtCentType)
                } else {
                    if (c == "-1") {
                        centPromptMsg("\u8be5\u8003\u9898\u4e0d\u5b58\u5728!", csdnScrollTop() + 360)
                    } else {
                        if (c == "1") {
                            map.put(a, true);
                            var b = "\u6536\u85cf\u6210\u529f";
                            if (collectQtNeedCentNum > 0) {
                                b = b + " <em class='desc'>" + collectQtCentType + "</em> <em>-" + collectQtNeedCentNum + "</em>"
                            }
                            centPromptMsg(b, csdnScrollTop() + 360);
                            if (showLessCent && collectQtNeedCentNum > 0) {
                                showLessCentRealTime()
                            }
                        } else {
                            centPromptMsg(c)
                        }
                    }
                }
            }
        },
        contextPath + "/collectQuestion.do?questionId=" + a + "&majorId=" + majorId, true)
    }
}
function centPromptMsg(d, c) {
    var a = $("promptId");
    a.style.display = "";
    a.style.left = "400px";
    var b = 0;
    if (typeof c == "undefined" || isNaN(c) || !c) {
        b = (csdnScrollTop() + document.documentElement.clientHeight / 2)
    } else {
        b = c
    }
    a.style.top = b + "px";
    $("msgContentId").innerHTML = d;
    setTimeout("$('promptId').style.display='none'", 2000)
}
function removeCollectQt(a) {
    pop = new Popup({
        contentType: 3,
        isReloadOnClose: false,
        width: 340,
        height: 120
    });
    pop.setContent("title", "\u536b\u8003\u63d0\u793a");
    pop.setContent("confirmCon", '\u60a8\u786e\u8ba4"\u53d6\u6d88\u6536\u85cf\u6b64\u9898"\uff1f <br/> \u5982\u679c\u60a8\u5df2\u4f1a\u505a\u6b64\u9898,\u5efa\u8bae\u53d6\u6d88\u6536\u85cf\u3002');
    pop.setContent("callBack", 
    function(c) {
        var b = c.popref;
        send_request(function(d) {
            if (d == "true") {
                b.config.isReloadOnClose = true;
                b.reset();
                divMessageBox("\u536b\u8003\u63d0\u793a", "\u53d6\u6d88\u6536\u85cf\u6210\u529f!", 340, 100)
            } else {
                b.close();
                divMessageBox("\u536b\u8003\u63d0\u793a", "\u53d6\u6d88\u6536\u85cf\u5931\u8d25!", 340, 100)
            }
        },
        contextPath + "/removeUserCollectQt.do?questionId=" + a, true)
    });
    pop.setContent("parameter", {
        popref: pop
    });
    pop.build();
    pop.show()
}
function viewAnswer(a) {
    var b = $("answer" + a);
    if (viewAnswerNeedCentNum < 1) {
        pop = new Popup({
            contentType: 2,
            isReloadOnClose: false,
            width: 600,
            height: 300
        });
        pop.setContent("contentHtml", b.innerHTML);
        pop.setContent("title", "\u67e5\u770b\u8003\u9898\u89e3\u6790");
        pop.build();
        pop.show()
    } else {
        if (b.title == "1") {
            pop = new Popup({
                contentType: 2,
                isReloadOnClose: false,
                width: 600,
                height: 300
            });
            pop.setContent("contentHtml", b.innerHTML);
            pop.setContent("title", "\u67e5\u770b\u8003\u9898\u89e3\u6790");
            pop.build();
            pop.show()
        } else {
            send_request(function(c) {
                if (c == "0") {
                    guestLoginUI()
                } else {
                    if (c == "3") {
                        centPromptMsg("\u60a8\u8d26\u6237\u5269\u4f59\u79ef\u5206\u4e0d\u8db3,\u67e5\u770b\u89e3\u6790\u9700\u8981 <em>" + viewAnswerNeedCentNum + "</em> \u679a" + viewAnswerCentType + "\u3002")
                    } else {
                        if (c == "1" || c == "2") {
                            b.title = "1";
                            pop = new Popup({
                                contentType: 2,
                                isReloadOnClose: false,
                                width: 600,
                                height: 300
                            });
                            pop.setContent("contentHtml", b.innerHTML);
                            pop.setContent("title", "\u67e5\u770b\u8003\u9898\u89e3\u6790");
                            pop.build();
                            pop.show();
                            if (viewAnswerNeedCentNum > 0) {
                                var d = csdnScrollTop() + document.documentElement.clientHeight / 2 + 120;
                                centPromptMsg("<em class='desc'>" + viewAnswerCentType + "</em> <em>-" + viewAnswerNeedCentNum + "</em>", d);
                                showLessCentRealTime()
                            }
                        } else {
                            centPromptMsg(c)
                        }
                    }
                }
            },
            contextPath + "/viewSingleSolution.do?questionId=" + a + "&majorId=" + majorId, true)
        }
    }
}
function SupplySolution(a) {
    if (pop) {
        pop.close()
    }
    pop = new Popup({
        contentType: 1,
        scrollType: "yes",
        isReloadOnClose: false,
        width: 687,
        height: 400
    });
    pop.setContent("contentUrl", contextPath + "/supplySolutionUI.do?questionId=" + a);
    pop.setContent("title", username + "-\u8865\u5145\u8003\u9898\u89e3\u6790");
    pop.build();
    pop.show()
}
function viewSupplySolution(a) {
    if (pop) {
        pop.close()
    }
    pop = new Popup({
        contentType: 1,
        isReloadOnClose: false,
        scrollType: "yes",
        width: 670,
        height: 500
    });
    pop.setContent("contentUrl", contextPath + "/viewSupplySolutions.do?questionId=" + a);
    pop.setContent("title", "\u67e5\u770b\u8003\u9898\u8865\u5145\u89e3\u6790");
    pop.build();
    pop.show()
}
function savePaper(a) {
    if (typeof logedInSolutionPage != "undefined" && !logedInSolutionPage) {
        guestLoginUI();
        return
    }
    if (savedFlag) {
        centPromptMsg("\u60a8\u5df2\u7ecf\u4fdd\u5b58\u4e86\u8be5\u5957\u8bd5\u5377")
    } else {
        send_request(function(b) {
            if (b == "-1") {
                centPromptMsg("\u56e0\u6d4f\u89c8\u5668\u4f1a\u8bdd\u5931\u6548\u800c\u5bfc\u81f4\u60a8\u8981\u4fdd\u5b58\u7684\u8003\u5377\u5df2\u8fc7\u671f,\u4e3a\u65b9\u4fbf\u60a8\u7684\u5b66\u4e60\uff0c\u8bf7\u53ca\u65f6\u4fdd\u5b58\u8003\u5377\u3002")
            } else {
                if (b == "0") {
                    guestLoginUI()
                } else {
                    if (b == "1") {
                        alert("\u60a8\u7684\u64cd\u4f5c\u6709\u8bef,\u5bfc\u81f4\u60a8\u8fd9\u4efd\u8003\u5377\u5df2\u8fc7\u671f\u3002\u4f8b\u5982:\u60a8\u540c\u65f6\u62bd\u53d6\u4e86\u591a\u4efd\u8bd5\u5377\uff0c\u5bfc\u81f4\u8be5\u8003\u5377\u8fc7\u671f\u3002\u7cfb\u7edf\u5373\u5c06\u5173\u95ed\u8be5\u8003\u5377!");
                        parent.close()
                    } else {
                        if (b == "3") {
                            if (a == 1) {
                                confirmSavePaper(contextPath + "/saveExerciseExamPaper.do?majorId=" + majorId)
                            } else {
                                confirmSavePaper(contextPath + "/saveExecPaper.do?majorId=" + majorId)
                            }
                        } else {
                            centPromptMsg(b)
                        }
                    }
                }
            }
        },
        contextPath + "/ensureExamPaperExists.do?examPaperId=" + examPaperId, true)
    }
}
function confirmSavePaper(a) {
    send_request(function(b) {
        var c = b.split("#");
        if (c[1] == "false") {
            centPromptMsg(c[0])
        } else {
            pop = new Popup({
                contentType: 3,
                isReloadOnClose: false,
                width: 380,
                height: 120
            });
            pop.setContent("title", "\u536b\u8003\u63d0\u793a");
            pop.setContent("confirmCon", c[0]);
            pop.setContent("callBack", 
            function(d) {
                send_request(function(f) {
                    d.parentWin.close();
                    if (f == "1") {
                        savedFlag = true;
                        var e = "\u8bd5\u5377\u4fdd\u5b58\u6210\u529f";
                        var g = c[2];
                        if (g > 0) {
                            e = e + ' <em class="desc">' + savePaperNeedCentType + "</em><em>-" + g + "</em>"
                        }
                        centPromptMsg(e);
                        if (showLessCent && g > 0) {
                            showLessCentRealTime()
                        }
                    } else {
                        centPromptMsg(f)
                    }
                },
                a, true)
            });
            pop.setContent("parameter", {
                parentWin: pop
            });
            pop.build();
            pop.show()
        }
    },
    contextPath + "/saveExamPaperPrompt.do?majorId=" + majorId, true)
}
function viewExamOrder() {
    if (!savedFlag) {
        centPromptMsg("\u5e93\u4e2d\u8fd8\u6ca1\u6709\u60a8\u8fd9\u6b21\u8003\u8bd5\u7684\u6392\u540d,\u8bf7\u5148\u4fdd\u5b58\u8bd5\u5377\u518d\u67e5\u770b\u6392\u540d\u3002")
    } else {
        send_request(function(b) {
            if (b == "-1") {
                guestLoginUI()
            } else {
                if (b == "0") {
                    centPromptMsg("\u56e0\u6d4f\u89c8\u5668\u4f1a\u8bdd\u5931\u6548\u800c\u5bfc\u81f4\u60a8\u8981\u67e5\u770b\u7684\u8003\u5377\u5df2\u7ecf\u4e0d\u5b58\u5728,\u8bf7\u60a8\u57283\u4e2a\u5c0f\u65f6\u5185\u67e5\u770b\u3002")
                } else {
                    if (b == "1") {
                        var a = (screen.width) * 0.85;
                        pop = new Popup({
                            contentType: 1,
                            scrollType: true,
                            isReloadOnClose: false,
                            width: a,
                            height: 520
                        });
                        pop.setContent("contentUrl", contextPath + "/viewExamOrder.do");
                        pop.setContent("title", "\u67e5\u770b\u8003\u8bd5\u6392\u540d");
                        pop.build();
                        pop.show()
                    } else {
                        divMessageBox("\u536b\u8003\u63d0\u793a", b, 300, 100)
                    }
                }
            }
        },
        contextPath + "/judgeExamPaperExist.do", true)
    }
}
function discuzzQuestion(a) {
    send_request(function(b) {
        if (b == "-2") {
            guestLoginUI()
        } else {
            if (b == "-1") {
                centPromptMsg("\u60a8\u8d26\u6237\u5269\u4f59\u79ef\u5206\u4e0d\u8db3,\u53d1\u8d77\u8ba8\u8bba\u9700\u8981 <em>" + talkQtNeedCentnum + "</em> \u679a" + talkQtNeedCentType)
            } else {
                if (b == "0") {
                    pop = new Popup({
                        contentType: 3,
                        isReloadOnClose: false,
                        width: 390,
                        height: 100
                    });
                    pop.setContent("title", "\u536b\u8003\u5728\u7ebf\u63d0\u793a");
                    var c = "\u672c\u64cd\u4f5c\u514d\u8d39\u3002";
                    if (talkQtNeedCentnum > 0) {
                        c = "\u672c\u64cd\u4f5c\u9700\u6263\u9664" + talkQtNeedCentnum + "\u679a" + talkQtNeedCentType + "\u3002"
                    }
                    pop.setContent("confirmCon", "\u60a8\u786e\u8ba4\u5c06\u6b64\u9898\u53d1\u5230\u8bba\u575b\u8ba8\u8bba\u5417? " + c);
                    pop.setContent("callBack", 
                    function(d) {
                        d.parentWin.close();
                        pop = new Popup({
                            contentType: 1,
                            isReloadOnClose: false,
                            width: 640,
                            height: 415
                        });
                        pop.setContent("contentUrl", contextPath + "/bbs/sendQtToDiscuzUI.do?questionId=" + a + "&majorId=" + majorId);
                        pop.setContent("title", "\u53d1\u8d77\u8ba8\u8bba");
                        pop.build();
                        pop.show()
                    });
                    pop.setContent("parameter", {
                        parentWin: pop
                    });
                    pop.build();
                    pop.show()
                } else {
                    pop = new Popup({
                        contentType: 3,
                        isReloadOnClose: false,
                        width: 420,
                        height: 100
                    });
                    pop.setContent("title", "\u536b\u8003\u5728\u7ebf\u63d0\u793a");
                    pop.setContent("confirmCon", "\u672c\u9898\u5df2\u6709\u7f51\u53cb\u53d1\u8d77\u8ba8\u8bba,\u60a8\u662f\u5426\u8df3\u8f6c\u5230\u8ba8\u8bba\u9875\u9762?\u672c\u64cd\u4f5c\u514d\u8d39\u3002");
                    pop.setContent("callBack", 
                    function(e) {
                        e.parentWin.close();
                        var d = $("topicLinkId");
                        d.href = contextPath + "/bbs/viewthread.do?tid=" + b;
                        d.click()
                    });
                    pop.setContent("parameter", {
                        parentWin: pop
                    });
                    pop.build();
                    pop.show()
                }
            }
        }
    },
    contextPath + "/bbs/isQuestionSentToDiscuzz.do?questionId=" + a + "&majorId=" + majorId, true)
}
function confirmTestAgain(a, c, d) {
    if (doTestNeedCentNum < 1) {
        pop = new Popup({
            contentType: 3,
            isReloadOnClose: false,
            width: 340,
            height: 100
        });
        pop.setContent("title", "\u536b\u8003\u63d0\u793a");
        var b = a == "subject" ? "\u79d1\u76ee": "\u5355\u5143";
        pop.setContent("confirmCon", "\u60a8\u786e\u8ba4\u8981\u91cd\u65b0\u6d4b\u8bd5\u8be5" + b + "\u7684\u8003\u5377\u5417?");
        pop.setContent("callBack", 
        function(e) {
            e.popref.close();
            if (a == "subject") {
                parent.location.href = contextPath + "/exam/subjectPaper.do?abilitySubj=true&subjectId=" + c + "&majorId=" + d
            } else {
                if (a == "subjectunit") {
                    parent.location.href = contextPath + "/exam/unitExercisePaper.do?abilitySubjUnit=true&subjectId=" + c + "&subjectUnitId=" + d + "&majorId=" + majorId
                }
            }
        });
        pop.setContent("parameter", {
            popref: pop
        });
        pop.build();
        pop.show()
    } else {
        send_request(function(e) {
            var f = e.split("#");
            if (f[1] == "true") {
                pop = new Popup({
                    contentType: 3,
                    isReloadOnClose: false,
                    width: 340,
                    height: 100
                });
                pop.setContent("title", "\u536b\u8003\u63d0\u793a");
                pop.setContent("confirmCon", f[0]);
                pop.setContent("callBack", 
                function(g) {
                    g.popref.close();
                    if (a == "subject") {
                        parent.location.href = contextPath + "/exam/subjectPaper.do?abilitySubj=true&subjectId=" + c + "&majorId=" + d
                    } else {
                        if (a == "subjectunit") {
                            parent.location.href = contextPath + "/exam/unitExercisePaper.do?abilitySubjUnit=true&subjectId=" + c + "&subjectUnitId=" + d + "&majorId=" + majorId
                        }
                    }
                });
                pop.setContent("parameter", {
                    popref: pop
                });
                pop.build();
                pop.show()
            } else {
                centPromptMsg(f[0])
            }
        },
        contextPath + "/exam/onlinetestAgainconfirm.do?majorId=" + majorId + "&type=" + a, true)
    }
}
function guestLoginUI() {
    pop = new Popup({
        contentType: 1,
        isReloadOnClose: false,
        width: 340,
        height: 200
    });
    pop.setContent("contentUrl", contextPath + "/accountcenter/guest-login.jsp");
    pop.setContent("title", "\u4f1a\u5458\u767b\u5f55");
    pop.build();
    pop.show()
};