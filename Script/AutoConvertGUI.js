var acu;
var acg = {
    current: {
        select: -1,
        exec: -1
    },
    process: null,
    list: [],
    avs: [],
    preset: [],
    disTime: true,
    delSuc: true,
    timer: new Date(),
    
    makeProcess: function(path) {
        var process = new AutoConvertUtilProcess(path, acLib.clone(acu.settings), acu.service, acu.program, acu.other);
        if (!process.analysis()) return false;
        if (!process.check()) return false;
        if (acg.current.select == -1) {
            acg.list.push(process);
        } else {
            acg.list.splice(acg.current.select, 1, acg.list[acg.current.select], process);
            if (acg.current.select < acg.current.exec) acg.current.exec++;
        }
        acg.updateList();
        acg.updateForm(acg.current.select + 1);
        return true;
    },
    killProcess: function(process) {
        acg.list.splice(process, 1);
        if (process < acg.current.exec) acg.current.exec--;
        acg.updateList();
        acg.updateForm(process - (process == acg.list.length ? 1 : 0));
        return true;
    },
    updateList: function() {
        var list = $("list");
        for (var i = list.childNodes.length - 1; i > -1; i--) {
            list.removeChild(list.childNodes[i]);
        }
        for (var i = 0; i < acg.list.length; i++) {
            var option = document.createElement("option");
            option.setAttribute("value", i);
            option.appendChild(document.createTextNode(acg.list[i].info.input));
            if (acg.current.exec != -1) {
                if (i == acg.current.exec) {
                    option.style.color = "red";
                } else if (i > acg.current.exec) {
                    option.style.color = "green";
                }
            }
            list.appendChild(option);
        }
        return true;
    },
    updateForm: function(index) {
        index = (typeof index === "undefined") ? acg.current.select : index;
        acg.current.select = index;
        var reset = (index == -1) ? true : false;
        $("info", "input").value = (reset) ? "" : acg.list[index].info.input;
        $("info", "output").value = (reset) ? "" : acg.list[index].info.output;
        $("info", "dir").value = (reset) ? "" : acg.list[index].info.dir;
        $("info", "name").value = (reset) ? "" : acg.list[index].info.name;
        $("param", "avs").selectedIndex = (reset) ? -1 : acHta.getOption(acHta.inArray(acg.list[index].param.avs, acg.avs), $("param", "avs"));
        $("param", "preset").selectedIndex = (reset) ? -1 : acHta.getOption(acHta.inArray(acg.list[index].param.preset, acg.preset), $("param", "preset"));
        $("detected", "service").selectedIndex = (reset) ? 0 : acHta.getOption(acg.list[index].detected.service, $("detected", "service"));
        $("detected", "program").selectedIndex = (reset) ? 0 : acHta.getOption(acg.list[index].detected.program, $("detected", "program"));
        $("detected", "other").selectedIndex = (reset) ? 0 : acHta.getOption(acg.list[index].detected.other[0] + "," + acg.list[index].detected.other[1], $("detected", "other"));
        $("detected", "service", "apply").disabled = (index == acg.current.exec) ? true : false;
        $("detected", "program", "apply").disabled = (index == acg.current.exec) ? true : false;
        $("detected", "other", "apply").disabled = (index == acg.current.exec) ? true : false;
        for (var key in acLib.param) {
            if (key == "avs" || key == "preset") continue;
            $("param", key).checked = (reset) ? false : acg.list[index].param[key];
        }
        $("list", "delete").disabled = (index == acg.current.exec) ? true : false;
        $("list", "up").disabled = (index < 1) ? true : false;
        $("list", "down").disabled = (index == acg.list.length - 1) ? true : false;
        $("list").selectedIndex = index;
        $("display_time").checked = acg.disTime;
        $("delete_success").checked = acg.delSuc;
        return true;
    },
    changeForm: function() {
        var args = Array.prototype.slice.apply(arguments);
        var value = args[0];
        if (acg.current.select == -1) return false;
        if (acg.current.select == acg.current.exec) return false;
        var process = acg.list[acg.current.select];
        switch (args[1]) {
            case "info":
                process[args[1]][args[2]] = value;
                break;
            case "param":
                if (args[2] == "avs" || args[2] == "preset") {
                    process[args[1]][args[2]] = acg[args[2]][value];
                } else if (acLib.param[args[2]]) {
                    for (var i = 0; i < acLib.param[args[2]].length; i++) {
                        process.param[acLib.param[args[2]][i]] = false;
                    }
                    process[args[1]][args[2]] = value;
                }
                break;
            case "detected":
                value = args[2] == "other" ? [parseInt(value.split(",")[0]), parseInt(value.split(",")[1])] : parseInt(value);
                process[args[1]][args[2]] = value;
                if (args[2] != "other") process.info[args[2]] = value == -1 ? "" : acu[args[2]][value][args[2]];
                break;
        }
        process.check();
        return true;
    },
    detectApply: function(detect) {
        if (acg.current.select == -1) return false;
        if (acg.current.select == acg.current.exec) return false;
        var process = acg.list[acg.current.select];
        if (detect == "other") {
            if (process.detected[detect][1] == -1) return false;
            process.detect(process[detect][process.detected[detect][0]].target[process.detected[detect][1]], true);
        } else {
            if (process.detected[detect] == -1) return false;
            process.detect(process[detect][process.detected[detect]], true);
        }
        return true;
    },
    enableButtons: function() {
        $("start").disabled = false;
        $("abort").disabled = true;
        $("close").disabled = false;
    },
    disableButtons: function() {
        $("start").disabled = true;
        $("abort").disabled = false;
        $("close").disabled = true;
    },
    exec: function() {
        if (acg.current.exec == -1) acg.current.exec++;
        if (acg.current.exec > acg.list.length - 1) {
            acg.current.exec = -1;
            acg.updateList();
            acg.updateForm(acg.current.exec);
            acg.process = null;
            acLib.log("終了しました", 0);
            acg.enableButtons();
            return false;
        }
        acg.disableButtons();
        acg.updateList();
        acg.updateForm(acg.current.exec);
        var process = acg.list[acg.current.exec];
        if(process.check()) {
            process.prepare();
            var args = process.before(true);
            acg.timer = new Date();
            acg.process = process.run(args);
            setTimeout("acg.waitExec()", 1000);
        } else {
            acLib.log("設定が無効なためスキップします", 0);
            acg.current.exec++;
            setTimeout("acg.exec()", 1000);
            return false;
        }
        return true;
    },
    waitExec: function() {
        if (acg.current.exec == -1) return false;
        var timer = new Date(1970, 1, 1);
        timer.setTime(timer.getTime() + (new Date()).getTime() - acg.timer.getTime());
        timer = "[" + ("0" + timer.getHours()).slice(-2) + ":" + ("0" + timer.getMinutes()).slice(-2) + ":" + ("0" + timer.getSeconds()).slice(-2) + "]";
        if (acg.process.Status == 0) {
            //acLib.log(acg.process.StdOut.ReadAll(), 0);
            if (acg.disTime) {
                acLib.log("経過時間 : " + timer, -1);
            }
            setTimeout("acg.waitExec()", 1000);
        } else {
            var process = acg.list[acg.current.exec];
            var err = process.after(acg.process.ExitCode);
            var logfile = acLib.acPath() + "AutoConvert.log";
            if (acLib.fso.FileExists(logfile)) var log = acLib.readFile(logfile, "Shift-JIS");
            log = log ? log + "\r\n" : "";
            acLib.writeFile(logfile, "Shift-JIS", log + ((acg.process.ExitCode == 0) ? "successful " : "error      ") + timer + " \"" + acg.list[acg.current.exec].info.input + "\"" + ((acg.process.ExitCode == 0) ? "" : ("[" + acg.process.ExitCode + "]")));
            if (err == 0) {
                if (acg.delSuc) {
                    acg.killProcess(acg.current.exec);
                } else {
                    acg.current.exec++;
                }
                acg.exec();
            } else if (err == 1) {
                acg.current.exec = -1;
                acg.updateList();
                acg.updateForm(acg.current.exec);
                acLib.log("中断されました", 0);
                acg.enableButtons();
                return false;
            } else if (err == 2) {
                acg.current.exec++;
                acg.exec();
            } else {
                acg.exec();
            }
        }
        return true;
    },
    terminateExec: function() {
        if (acg.process.Status == 0) {
            //acg.process.Terminate();
            var objService = new ActiveXObject("WbemScripting.SWbemLocator").ConnectServer();
            var objEnum = new Enumerator(objService.ExecQuery("Select * from Win32_Process Where ProcessID = " + acg.process.ProcessId));
            while (!objEnum.atEnd()) {
                objEnum.item().Terminate();
                objEnum.moveNext();
            }
            objService = null;
            acg.current.exec = -1;
            acg.updateList();
            acg.updateForm(acg.current.exec);
            acg.process = null;
            acLib.log("中止しました", 0);
            acg.enableButtons();
        }
        return true;
    },
    addTextEvent: function() {
        var args = Array.prototype.slice.apply(arguments);
        $.apply(this, args).attachEvent("onchange", (function(args){
            return function(e) {
                var eargs = args.slice(0);
                eargs.unshift(e.srcElement.value);
                acg.changeForm.apply(this, eargs);
                acg.updateForm();
            };
        })(args));
        return true;
    },
    addCheckBoxEvent: function() {
        var args = Array.prototype.slice.apply(arguments);
        $.apply(this, args).attachEvent("onclick", (function(args){
            return function(e) {
                var eargs = args.slice(0);
                eargs.unshift(e.srcElement.checked);
                acg.changeForm.apply(this, eargs);
                acg.updateForm();
            };
        })(args));
        return true;
    },
    addSelectEvent: function() {
        var args = Array.prototype.slice.apply(arguments);
        $.apply(this, args).attachEvent("onchange", (function(args){
            return function(e) {
                var eargs = args.slice(0);
                eargs.unshift(e.srcElement.options[e.srcElement.selectedIndex].value);
                acg.changeForm.apply(this, eargs);
                acg.updateForm();
            };
        })(args));
        return true;
    }
};

function $() {
    var id = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        id += "_" + arguments[i];
    }
    return document.getElementById(id);
}

function objOLEDragDrop::OLEDragOver(data, effect, button, shift, x, y, state){
    if (state == 1) {
        $("objOLEDragDrop").style.display = "none";
        $("list").style.display = "inline";
    }
}

function objOLEDragDrop::OLEDragDrop(data, effect, button, shift, x, y){
    $("objOLEDragDrop").style.display = "none";
    $("list").style.display = "inline";
    var objEnum = new Enumerator(data.Files);
    while (!objEnum.atEnd()) {
        acg.makeProcess(objEnum.item());
        objEnum.moveNext();
    }
}

window.onload = function(){
    var wsize = [700, 700];
    var zoom = 1;
    window.resizeTo(Math.floor(wsize[0] * zoom), Math.floor(wsize[1] * zoom));
    document.body.style.zoom = zoom;
    acLib.acPath = function() {
        return acLib.fso.GetParentFolderName(acHta.args(0).split(acLib.fso.GetFileName(acHta.args(0))).join("")) + "\\";
    };
    acLib.stdin = function(question) {
        return prompt(question, "");
    };
    acLib.confirm = function(question) {
        return (confirm(question)) ? true : false;
    };
    acLib.log = function(msg, level) {
        if (!acLib.checkArgs([msg, level])) return false;
        switch (level) {
            case -1:
                var output = $("stdout");
                var value = output.value.split("\r\n");
                value.pop();
                output.value = value.join("\r\n");
            case 0:
                var output = $("stdout");
                output.value += (output.value ? "\r\n" : "") + msg;
                var textRange = output.createTextRange();
                textRange.move("character", output.value.length);
                textRange.select();
                break;
            case 1:
                alert("エラー : " + msg);
                break;
            case 2:
                alert("デバッグ : " + msg);
                break;
        }
        return true;
    };
    acLib.ado = GetObject("script:" + acLib.acPath() + "Script\\activexHelper.wsc")._ActiveXObject("ADODB.Stream");
    
    AutoConvertUtilProcess.prototype.run = function(args) {
        //return acLib.log("cscript \"" + acLib.acPath() + "Script\\AutoConvert.wsf\" " + args, 0);
        return acLib.shell.Exec("wscript \"" + acLib.acPath() + "Script\\AutoConvert.wsf\" " + args);
        //return acLib.shell.Exec("cmd /c \"start /wait /min \"AutoConvert\" cscript //nologo \"" + acLib.acPath() + "Script\\AutoConvert.wsf\" " + args + "&exit /b ^%ERRORLEVEL^%\"");
    };
    
    acu = new AutoConvertUtil();
    if (!acu.loadSettings()) window.close();
    if (!acu.checkSettings()) {
        acLib.log("AutoConvertSettingsを起動します", 1);
        acLib.shell.Run("mshta \"" + acLib.acPath() + "Script\\AutoConvertSettings.hta\"");
        window.close();
        return false;
    }
    
    acg.avs = acHta.checkPreset("avs");
    if (acg.avs.length == 0) {
        acLib.log("avsファイルが存在しません", 1);
        window.close();
    }
    acg.preset = acHta.checkPreset("txt");
    if (acg.preset.length == 0) {
        acLib.log("プリセットファイルが存在しません", 1);
        window.close();
    }
    for (var i = 0; i < acg.avs.length; i++) {
        acHta.addOption(i, acg.avs[i], $("param", "avs"));
    }
    for (var i = 0; i < acg.preset.length; i++) {
        acHta.addOption(i, acg.preset[i], $("param", "preset"));
    }
    for (var i = 0; i < acu.service.length; i++) {
        acHta.addOption(i, acu.service[i].name, $("detected", "service"));
    }
    for (var i = 0; i < acu.program.length; i++) {
        acHta.addOption(i, acu.program[i].name, $("detected", "program"));
    }
    for (var i = 0; i < acu.other.length; i++) {
        acHta.addOption(i + ",-1", acu.other[i].search, $("detected", "other"));
        for (var j = 0; j < acu.other[i].target.length; j++) {
            acHta.addOption(i + "," + j, "  " + acu.other[i].target[j].name, $("detected", "other"));
        }
    }
    
    $("stdout").value = "";
    acg.updateForm(-1);
    
    window.attachEvent("onbeforeunload", function(e){
        if (acg.list.length > 0) e.returnValue = "現在のAutoConvertの情報は破棄されます。";
    });
    
    acg.addTextEvent("info", "output");
    acg.addTextEvent("info", "dir");
    acg.addTextEvent("info", "name");
    acg.addSelectEvent("param", "avs");
    acg.addSelectEvent("param", "preset");
    acg.addSelectEvent("detected", "service");
    acg.addSelectEvent("detected", "program");
    acg.addSelectEvent("detected", "other");
    
    for (var key in acLib.param) {
        if (key == "avs" || key == "preset") continue;
        acg.addCheckBoxEvent("param", key);
    }
    
    $("list").attachEvent("ondragenter", function() {
        $("list").style.display = "none";
        $("objOLEDragDrop").style.display = "inline";
    });
    
    $("list").attachEvent("onchange", function(e) {
        acg.updateForm(parseInt(e.srcElement.options[e.srcElement.selectedIndex].value));
    });
    
    $("display_time").attachEvent("onclick", function(e) {
        acg.disTime = e.srcElement.checked;
    });
    
    $("delete_success").attachEvent("onclick", function(e) {
        acg.delSuc = e.srcElement.checked;
    });
    
    $("detected", "program", "apply").attachEvent("onclick", function() {
        acg.detectApply("program");
        acg.updateForm();
    });
    
    $("detected", "service", "apply").attachEvent("onclick", function() {
        acg.detectApply("service");
        acg.updateForm();
    });
    
    $("detected", "other", "apply").attachEvent("onclick", function() {
        acg.detectApply("other");
        acg.updateForm();
    });
    
    $("list", "add").attachEvent("onclick", function() {
        var path = acHta.browse(1, "", "MPEG2 TS(*.ts)|*.ts|すべてのファイル(*.*)|*.*");
        if (!path) return false;
        path = path.split("\t");
        for (var i = 0; i < path.length; i++) {
            acg.makeProcess(path[i]);
        }
        return true;
    });
    
    $("list", "delete").attachEvent("onclick", function() {
        if (acg.current.select == -1) return false;
        acg.killProcess(acg.current.select);
        return true;
    });
    
    $("list", "up").attachEvent("onclick", function() {
        if (acg.current.select == -1 || acg.current.select == 0) return false;
        acg.list.splice(acg.current.select - 1, 2, acg.list[acg.current.select], acg.list[acg.current.select - 1]);
        if (acg.current.select == acg.current.exec) {
            acg.current.exec--;
        } else if (acg.current.select == acg.current.exec + 1) {
            acg.current.exec++;
        }
        acg.updateList();
        acg.updateForm(acg.current.select - 1);
        return true;
    });
    
    $("list", "down").attachEvent("onclick", function() {
        if (acg.current.select == -1 || acg.current.select == acg.list.length - 1) return false;
        acg.list.splice(acg.current.select, 2, acg.list[acg.current.select + 1], acg.list[acg.current.select]);
        if (acg.current.select == acg.current.exec) {
            acg.current.exec++;
        } else if (acg.current.select == acg.current.exec - 1) {
            acg.current.exec--;
        }
        acg.updateList();
        acg.updateForm(acg.current.select + 1);
        return true;
    });
    
    $("start").attachEvent("onclick", function(){
        acg.exec();
    });
    
    $("abort").attachEvent("onclick", function(){
        acg.terminateExec();
    });
    
    $("close").attachEvent("onclick", function(){
        window.close();
    });
    
    var input = acHta.args();
    for (var i = 1; i < input.length; i++) {
        acg.makeProcess(input[i]);
    }
}