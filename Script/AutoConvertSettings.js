var acs = {
    current: {
        tab: 0,
        sub: 0,
        list: {
            replace: -1,
            ep: -1,
            detect: -1,
            search: -1
        }
    },
    list: {
        avs: [],
        preset: []
    },
    settings: {
        ac: null,
        acu: null,
        detect: {
            service: null,
            program: null,
            other: null
        },
        preset: null
    },
    changed: {
        ac: false,
        acu: false,
        detect: {
            service: false,
            program: false,
            other: false
        },
        preset: false
    },
    
    updatePreset: function() {
        acHta.resetOption($("tab", "preset", "select"));
        acHta.resetOption($("acu", "param", "avs"));
        acHta.resetOption($("acu", "param", "preset"));
        acHta.resetOption($("detect", "param", "avs"));
        acHta.resetOption($("detect", "param", "preset"));
        for (var i = 0; i < acs.list.avs.length; i++) {
            acHta.addOption(i, acs.list.avs[i], $("acu", "param", "avs"));
            acHta.addOption(i, acs.list.avs[i], $("detect", "param", "avs"));
        }
        for (var i = 0; i < acs.list.preset.length; i++) {
            acHta.addOption(i, acs.list.preset[i], $("tab", "preset", "select"));
            acHta.addOption(i, acs.list.preset[i], $("acu", "param", "preset"));
            acHta.addOption(i, acs.list.preset[i], $("detect", "param", "preset"));
        }
        return true;
    },
    loadPreset: function(index) {
        var preset = acLib.loadSetting(acLib.acPath() + "Preset\\" + acs.list.preset[index] + ".txt");
        if (!preset) window.close();
        acs.settings.preset = preset;
        return true;
    },
    updateList: function(sub) {
        acHta.resetOption($("detect", "detect", "list"));
        acHta.resetOption($("detect", "search", "list"));
        var type = ["service", "program", "other"][sub];
        if (sub == 2) {
            if (acs.current.list.search > -1) {
                var detect = acs.settings.detect[type][acs.current.list.search].target;
                for (var i = 0; i < detect.length; i++) {
                    acHta.addOption(i, detect[i].name, $("detect", "detect", "list"));
                }
            }
            var search = acs.settings.detect[type];
            for (var i = 0; i < search.length; i++) {
                acHta.addOption(i, search[i].search, $("detect", "search", "list"));
            }
        } else {
            var detect = acs.settings.detect[type];
            for (var i = 0; i < detect.length; i++) {
                acHta.addOption(i, detect[i].name, $("detect", "detect", "list"));
            }
        }
        return true;
    },
    updateForm: function(tab, sub) {
        tab = typeof tab === "undefined" ? acs.current.tab : tab;
        sub = typeof sub === "undefined" ? acs.current.sub : sub;
        acs.current.tab = tab;
        acs.current.sub = sub;
        switch (tab) {
            case 0:
                var ac = acs.settings.ac;
                for (var key in acModel.ac.path) {
                    switch (acModel.ac.path[key]) {
                        case "string":
                            $("ac", "path", key).value = ac.path[key];
                            break;
                    }
                }
                
                for (var key in acModel.ac.settings) {
                    switch (acModel.ac.settings[key]) {
                        case "string":
                        case "number":
                            $("ac", "settings", key).value = ac.settings[key];
                            break;
                        case "boolean":
                            $("ac", "settings", key).checked = ac.settings[key];
                            break;
                    }
                }
                $("save").disabled = $("reset").disabled = !acs.changed.ac;
                break;
            case 1:
                var acu = acs.settings.acu;
                for (var key in acModel.acu.path) {
                    switch (acModel.acu.path[key]) {
                        case "string":
                            $("acu", "path", key).value = acu.path[key];
                            break;
                    }
                }
                
                for (var key in acModel.acu.settings) {
                    switch (acModel.acu.settings[key]) {
                        case "string":
                        case "number":
                            $("acu", "settings", key).value = acu.settings[key];
                            break;
                        case "boolean":
                            $("acu", "settings", key).checked = acu.settings[key];
                            break;
                    }
                }
                
                if (acs.current.list.replace == -2) {
                    $("acu", "settings", "replace", "before").value = "";
                    $("acu", "settings", "replace", "after").value = "";
                    acs.current.list.replace++;
                } else if (acs.current.list.replace != -1) {
                    $("acu", "settings", "replace", "before").value = acu.settings.replace[acs.current.list.replace][0];
                    $("acu", "settings", "replace", "after").value = acu.settings.replace[acs.current.list.replace][1];
                }
                acHta.resetOption($("acu", "settings", "replace"));
                for (var i = 0; i < acu.settings.replace.length; i++) {
                    acHta.addOption(i, acu.settings.replace[i][0] + " -> " + acu.settings.replace[i][1], $("acu", "settings", "replace"));
                }
                $("acu", "settings", "replace").selectedIndex = acHta.getOption(acs.current.list.replace, $("acu", "settings", "replace"));
                
                if (acs.current.list.ep == -2) {
                    $("acu", "settings", "ep", "before").value = "";
                    $("acu", "settings", "ep", "after").value = "";
                    acs.current.list.ep++;
                } else if (acs.current.list.ep != -1) {
                    $("acu", "settings", "ep", "before").value = acu.settings.ep[acs.current.list.ep][0];
                    $("acu", "settings", "ep", "after").value = acu.settings.ep[acs.current.list.ep][1];
                }
                acHta.resetOption($("acu", "settings", "ep"));
                for (var i = 0; i < acu.settings.ep.length; i++) {
                    acHta.addOption(i, acu.settings.ep[i][0] + " * " + acu.settings.ep[i][1], $("acu", "settings", "ep"));
                }
                $("acu", "settings", "ep").selectedIndex = acHta.getOption(acs.current.list.ep, $("acu", "settings", "ep"));
                
                for (var key in acModel.acu.param) {
                    switch (acModel.acu.param[key]) {
                        case "string":
                            $("acu", "param", key).selectedIndex = acHta.getOption(acHta.inArray(acu.param[key], acs.list[key]), $("acu", "param", key));
                            break;
                        case "boolean":
                            $("acu", "param", key).checked = acu.param[key];
                            break;
                    }
                }
                
                for (var key in acModel.acu.name.file) {
                    switch (acModel.acu.name.file[key]) {
                        case "string":
                            $("acu", "name", "file", key).value = acu.name.file[key];
                            break;
                    }
                }
                
                for (var key in acModel.acu.name.dir) {
                    switch (acModel.acu.name.dir[key]) {
                        case "string":
                            $("acu", "name", "dir", key).value = acu.name.dir[key];
                            break;
                    }
                }
                $("save").disabled = $("reset").disabled = !acs.changed.acu;
                break;
            case 2:
                var reset = (acs.current.list.detect < 0) ? true : false;
                var reset2 = (acs.current.list.search < 0) ? true : false;
                var type = ["service", "program", "other"][sub];
                var detect = reset ? null : (sub == 2 ? acs.settings.detect[type][acs.current.list.search].target[acs.current.list.detect] : acs.settings.detect[type][acs.current.list.detect]);
                var search = reset2 ? null : acs.settings.detect[type][acs.current.list.search];
                acs.updateList(sub);
                for (var key in acModel.detect.param) {
                    switch (acModel.detect.param[key]) {
                        case "string":
                            $("detect", "param", key).selectedIndex = (reset || !detect.param || typeof detect.param[key] === "undefined") ? -1 : acHta.getOption(acHta.inArray(detect.param[key], acs.list[key]), $("detect", "param", key));
                            break;
                        case "boolean":
                            $("detect", "param", key).checked = (reset || !detect.param || typeof detect.param[key] === "undefined") ? false : detect.param[key];
                            break;
                    }
                }
                
                for (var key in acModel.detect.level) {
                    switch (acModel.detect.level[key]) {
                        case "number":
                            if (reset || !detect.level || typeof detect.level[key] === "undefined") {
                                $("detect", "level", key).selectedIndex = 0;
                                $("detect", "param", key).disabled = true;
                            } else {
                                $("detect", "level", key).selectedIndex = acHta.getOption(detect.level[key], $("detect", "level", key));
                                $("detect", "param", key).disabled = false;
                            }
                            break;
                    }
                }
                $("detect", "detect", "list").selectedIndex = reset ? 0 : acHta.getOption(acs.current.list.detect, $("detect", "detect", "list"));
                $("detect", "search", "list").selectedIndex = reset2 ? 0 : acHta.getOption(acs.current.list.search, $("detect", "search", "list"));
                
                $("detect", "detect", "list", "delete").disabled = reset ? true : false;
                $("detect", "detect", "list", "up").disabled = (reset || acs.current.list.detect == 0) ? true : false;
                $("detect", "detect", "list", "down").disabled = (reset || acs.current.list.detect == (sub == 2 ? acs.settings.detect[type][acs.current.list.search].target : acs.settings.detect[type]).length - 1) ? true : false;
                
                $("detect", "search", "list", "delete").disabled = reset2 ? true : false;
                $("detect", "search", "list", "up").disabled = (reset2 || acs.current.list.search == 0) ? true : false;
                $("detect", "search", "list", "down").disabled = (reset2 || acs.current.list.search == acs.settings.detect[type].length - 1) ? true : false;
                
                if (!reset) {
                    $("detect", "name").value = detect.name;
                    $("detect", "detect").value = (sub == 2 || !detect[type]) ? "" : detect[type];
                    $("detect", "file").value = !detect.file ? "" : detect.file;
                    $("detect", "dir").value = !detect.dir ? "" : detect.dir;
                } else if ((acs.current.list.detect == -1 && acs.current.list.search == -1 && sub == 2) || acs.current.list.detect == -2) {
                    $("detect", "name").value = "";
                    $("detect", "detect").value = "";
                    $("detect", "file").value = "";
                    $("detect", "dir").value = "";
                }
                
                if (!reset2) {
                    $("detect", "search").value = search.search;
                } else if (acs.current.list.search == -1 && sub != 2 || acs.current.list.detect == -2) {
                    $("detect", "search").value = "";
                }
                
                if (acs.current.list.detect == -2) acs.current.list.detect++;
                $("save").disabled = $("reset").disabled = !acs.changed.detect[type];
                break;
            case 3:
                var preset = acs.settings.preset;
                $("preset", "type").selectedIndex = acHta.getOption(preset.type, $("preset", "type"));
                $("preset", "ext").value = preset.ext;
                $("preset", "enc").value = preset.enc;
                $("preset", "opt").value = preset.opt;
                $("save").disabled = $("reset").disabled = !acs.changed.preset;
                break;
        }
        return true;
    },
    changeForm: function() {
        var args = Array.prototype.slice.apply(arguments);
        var value = args[0];
        var tab = acHta.inArray(args[1], ["ac", "acu", "detect", "preset"]);
        switch (tab) {
            case 0:
                var ac = acs.settings.ac;
                switch (acModel.ac[args[2]][args[3]]) {
                    case "string":
                    case "boolean":
                        ac[args[2]][args[3]] = value;
                        break;
                    case "number":
                        if (!isNaN(parseInt(value))) ac[args[2]][args[3]] = parseInt(value);
                        break;
                }
                acs.changed.ac = true;
                break;
            case 1:
                var acu = acs.settings.acu;
                if (args[2] == "settings" && (args[3] == "replace" || args[3] == "ep")) {
                    if (args[4] == "before" || args[4] == "after") {
                        if (acs.current.list[args[3]] != -1) {
                            acu[args[2]][args[3]][acs.current.list[args[3]]][acHta.inArray(args[4], ["before", "after"])] = value;
                        }
                    } else {
                        acs.current.list[args[3]] = value == -1 ? -2 : value;
                    }
                } else if (args[2] == "param") {
                    if (args[3] == "avs" || args[3] == "preset") {
                        acu[args[2]][args[3]] = acs.list[args[3]][value];
                    } else {
                        for (var i = 0; i < acLib.param[args[3]].length; i++) {
                            acu[args[2]][acLib.param[args[3]][i]] = false;
                        }
                        acu[args[2]][args[3]] = value;
                    }
                } else if (args[2] == "name") {
                    acu[args[2]][args[3]][args[4]] = value;
                } else {
                    switch (acModel.acu[args[2]][args[3]]) {
                        case "string":
                        case "boolean":
                            acu[args[2]][args[3]] = value;
                            break;
                        case "number":
                            if (!isNaN(parseInt(value))) acu[args[2]][args[3]] = parseInt(value);
                            break;
                    }
                }
                acs.changed.acu = true;
                break;
            case 2:
                if (args[3] == "list") {
                    if (args[2] == "detect") {
                        acs.current.list.detect = value == -1 ? -2 : value;
                    } else {
                        acs.current.list.detect = -2;
                        acs.current.list.search = value;
                    }
                } else {
                    var sub = acs.current.sub;
                    var type = ["service", "program", "other"][sub];
                    if (acs.current.list.detect != -1) {
                        var detect = sub == 2 ? acs.settings.detect[type][acs.current.list.search].target[acs.current.list.detect] : acs.settings.detect[type][acs.current.list.detect];
                        switch (args[2]) {
                            case "param":
                                if (args[3] == "avs" || args[3] == "preset") {
                                    detect[args[2]][args[3]] = acs.list[args[3]][value];
                                } else {
                                    for (var i = 0; i < acLib.param[args[3]].length; i++) {
                                        if (detect[args[2]][acLib.param[args[3]][i]]) detect[args[2]][acLib.param[args[3]][i]] = false;
                                    }
                                    detect[args[2]][args[3]] = value;
                                }
                                break;
                            case "level":
                                if (value == -1) {
                                    delete detect.param[args[3]];
                                    delete detect.level[args[3]];
                                    for (var key in detect.param);
                                    if (typeof key === "undefined") delete detect.param;
                                    for (var key in detect.level);
                                    if (typeof key === "undefined") delete detect.level;
                                } else {
                                    if (!detect.param) detect.param = {};
                                    if (!detect.level) detect.level = {};
                                    if (args[3] == "avs" || args[3] == "preset") {
                                        detect.param[args[3]] = acs.list[args[3]][0];
                                        detect.level[args[3]] = value;
                                    } else {
                                        if (typeof detect.param[args[3]] == "undefined") detect.param[args[3]] = false;
                                        detect.level[args[3]] = value;
                                    }
                                }
                                break;
                            case "name":
                                detect[args[2]] = value;
                                break;
                            case "detect":
                                if (sub != 2) {
                                    if (value) {
                                        detect[type] = value;
                                    } else {
                                        delete detect[type];
                                    }
                                }
                            case "file":
                            case "dir":
                                if (value) {
                                    detect[args[2]] = value;
                                } else {
                                    delete detect[args[2]];
                                }
                                break;
                        }
                    }
                    if (acs.current.list.search != -1) {
                        var search = sub != 2 ? null : acs.settings.detect[type][acs.current.list.search];
                        if (args[2] == "search") {
                            search[args[2]] = value;
                        }
                    }
                }
                acs.changed.detect[type] = true;
                break;
            case 3:
                var preset = acs.settings.preset;
                if (args[2] == "opt") {
                    preset[args[2]] = value.split("\r\n").join(" ");
                } else {
                    preset[args[2]] = value;
                }
                acs.changed.preset = true;
                break;
        }
        return true;
    },
    changeTab: function(tab, sub) {
        if (tab == acs.current.tab && typeof sub === "undefined" || sub == -1) return false;
        var settings = ["ac", "acu", "detect", "preset"];
        
        if (acs.current.tab == 3 && acs.changed.preset && !acLib.confirm("プリセットが保存されていません。変更を破棄しますか？")) {
            $("tab", "detect", "select").selectedIndex = acs.current.tab != 2 ? 0 : acHta.getOption(acs.current.sub, $("tab", "detect", "select"));
            $("tab", "preset", "select").selectedIndex = acs.current.tab != 3 ? 0 : acHta.getOption(acs.current.sub, $("tab", "preset", "select"));
            return false;
        } else {
            acs.changed.preset = false;
        }
        
        $(settings[acs.current.tab]).style.display = "none";
        $("tab", settings[acs.current.tab]).className = "tab";
        
        $(settings[tab]).style.display = "inline";
        $("tab", settings[tab]).className = "tab tab_select";
        
        $("tab", "detect", "select").selectedIndex = tab != 2 ? 0 : acHta.getOption(sub, $("tab", "detect", "select"));
        $("tab", "preset", "select").selectedIndex = tab != 3 ? 0 : acHta.getOption(sub, $("tab", "preset", "select"));
        
        $("delete").style.visibility = tab != 3 ? "hidden" : "visible";
        $("save_as").style.visibility = tab != 3 ? "hidden" : "visible";
        
        switch (tab) {
            case 0:
                $("ac").style.display = "inline";
                $("tab_ac").className = "tab tab_select";
                break;
            case 1:
                acs.current.list.replace = -2;
                acs.current.list.ep = -2;
                break;
            case 2:
                acs.current.list.detect = -2;
                acs.current.list.search = -1;
                switch (sub) {
                    case 0:
                        $("detect", "name", "desc").innerHTML = "$ServiceName$に含まれる文字列";
                        $("detect", "detect", "desc").innerHTML = "サービス名に設定する文字列";
                        $("detect", "detect", "parent").style.visibility = "visible";
                        $("detect", "search", "parent").style.visibility = "hidden";
                        break;
                    case 1:
                        $("detect", "name", "desc").innerHTML = "$Title$に含まれる文字列";
                        $("detect", "detect", "desc").innerHTML = "番組名に設定する文字列";
                        $("detect", "detect", "parent").style.visibility = "visible";
                        $("detect", "search", "parent").style.visibility = "hidden";
                        break;
                    case 2:
                        $("detect", "name", "desc").innerHTML = "マクロに含まれる文字列";
                        $("detect", "detect", "desc").innerHTML = "";
                        $("detect", "detect", "parent").style.visibility = "hidden";
                        $("detect", "search", "parent").style.visibility = "visible";
                        break;
                }
                break;
            case 3:
                acs.loadPreset(sub);
                break;
        }
        acs.updateForm(tab, sub);
        return true;
    },
    addTextEvent: function() {
        var args = Array.prototype.slice.apply(arguments);
        $.apply(this, args).attachEvent("onchange", (function(args){
            return function(e) {
                var eargs = args.slice(0);
                eargs.unshift(e.srcElement.value);
                acs.changeForm.apply(this, eargs);
                acs.updateForm();
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
                acs.changeForm.apply(this, eargs);
                acs.updateForm();
            };
        })(args));
        return true;
    },
    addSelectEvent: function() {
        var args = Array.prototype.slice.apply(arguments);
        $.apply(this, args).attachEvent("onchange", (function(args){
            return function(e) {
                var eargs = args.slice(0);
                eargs.unshift(parseInt(e.srcElement.options[e.srcElement.selectedIndex].value));
                acs.changeForm.apply(this, eargs);
                acs.updateForm();
            };
        })(args));
        return true;
    },
    addBrowseEvent: function() {
        var args = Array.prototype.slice.apply(arguments);
        args.shift();
        args.push("browse");
        $.apply(this, args).attachEvent("onclick", (function(args, type){
            args.pop();
            return function(e) {
                var eargs = args.slice(0);
                var dest = $.apply(this, eargs).value.split("$AutoConvert$").join(acLib.acPath());
                var path = acHta.browse(type, ((type == 2) ? dest : acLib.fso.GetParentFolderName(dest)), "");
                if (path) {
                    path = path.split(acLib.acPath()).join("$AutoConvert$");
                    eargs.unshift(path);
                    acs.changeForm.apply(this, eargs);
                    acs.updateForm();
                }
            };
        })(args, arguments[0]));
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

window.onload = function(){
    var wsize = [700, 800];
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
            case 0:
                alert(msg);
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
    
    var ac = acLib.loadSetting(acLib.acPath() + "Settings\\AutoConvert.txt");
    if (!ac) window.close();
    acs.settings.ac = ac;
    
    var acu = acLib.loadSetting(acLib.acPath() + "Settings\\AutoConvertUtil.txt");
    if (!acu) window.close();
    acs.settings.acu = acu;
    
    var service = acLib.loadSetting(acLib.acPath() + "Settings\\Service.txt");
    if (!service) window.close();
    acs.settings.detect.service = service;
    
    var program = acLib.loadSetting(acLib.acPath() + "Settings\\Program.txt");
    if (!program) window.close();
    acs.settings.detect.program = program;
    
    var other = acLib.loadSetting(acLib.acPath() + "Settings\\Other.txt");
    if (!other) window.close();
    acs.settings.detect.other = other;
    
    acs.list.avs = acHta.checkPreset("avs");
    if (acs.list.avs.length == 0) {
        acLib.log("avsファイルが存在しません", 1);
        window.close();
    }
    acs.list.preset = acHta.checkPreset("txt");
    if (acs.list.preset.length == 0) {
        acLib.log("プリセットファイルが存在しません", 1);
        window.close();
    }
    
    acs.updatePreset();
    acs.changeTab(0, 0);
    
    window.attachEvent("onbeforeunload", function(e){
        if (acs.changed.ac || acs.changed.acu || acs.changed.detect.service || acs.changed.detect.program || acs.changed.detect.other || acs.changed.preset) {
            e.returnValue = "現在のAutoConvert設定の情報は破棄されます。";
        }
    });
    
    $("tab_ac").attachEvent("onclick", function(){
        acs.changeTab(0);
    });
    $("tab_acu").attachEvent("onclick", function(){
        acs.changeTab(1);
    });
    $("tab_detect_select").attachEvent("onchange", function(){
        acs.changeTab(2, parseInt($("tab_detect_select").options[$("tab_detect_select").selectedIndex].value));
    });
    $("tab_preset_select").attachEvent("onchange", function(){
        acs.changeTab(3, parseInt($("tab_preset_select").options[$("tab_preset_select").selectedIndex].value));
    });
    
    for (var key in acModel.ac.path) {
        switch (acModel.ac.path[key]) {
            case "string":
                acs.addTextEvent("ac", "path", key);
                acs.addBrowseEvent((key == "temppath" ? 2 : 0), "ac", "path", key);
                break;
        }
    }
    for (var key in acModel.ac.settings) {
        switch (acModel.ac.settings[key]) {
            case "string":
            case "number":
                acs.addTextEvent("ac", "settings", key);
                break;
            case "boolean":
                acs.addCheckBoxEvent("ac", "settings", key);
                break;
        }
    }
    
    for (var key in acModel.acu.path) {
        switch (acModel.acu.path[key]) {
            case "string":
                acs.addTextEvent("acu", "path", key);
                acs.addBrowseEvent((key == "output" || key == "move" ? 2 : 0), "acu", "path", key);
                break;
        }
    }
    for (var key in acModel.acu.settings) {
        switch (acModel.acu.settings[key]) {
            case "string":
            case "number":
                acs.addTextEvent("acu", "settings", key);
                break;
            case "boolean":
                acs.addCheckBoxEvent("acu", "settings", key);
                break;
        }
    }
    acs.addTextEvent("acu", "settings", "replace", "before");
    acs.addTextEvent("acu", "settings", "replace", "after");
    acs.addSelectEvent("acu", "settings", "replace");
    acs.addTextEvent("acu", "settings", "ep", "before");
    acs.addTextEvent("acu", "settings", "ep", "after");
    acs.addSelectEvent("acu", "settings", "ep");
    
    $("acu", "settings", "replace", "add").attachEvent("onclick", function(){
        var replace = acs.settings.acu.settings.replace;
        var arr = [$("acu", "settings", "replace", "before").value, $("acu", "settings", "replace", "after").value];
        if (acs.current.list.replace == -1) {
            replace.push(arr);
            acs.current.list.replace = replace.length - 1;
        } else {
            replace.splice(acs.current.list.replace, 1, replace[acs.current.list.replace], arr);
            acs.current.list.replace++;
        }
        $("acu", "settings", "replace", "before").value = "";
        $("acu", "settings", "replace", "after").value = "";
        acs.changed.acu = true;
        acs.updateForm();
    });
    $("acu", "settings", "replace", "delete").attachEvent("onclick", function(){
        var replace = acs.settings.acu.settings.replace;
        if (acs.current.list.replace != -1) {
            replace.splice(acs.current.list.replace, 1);
            if (acs.current.list.replace == replace.length) acs.current.list.replace--;
            if (acs.current.list.replace == -1) acs.current.list.replace--;
        }
        acs.changed.acu = true;
        acs.updateForm();
    });
    $("acu", "settings", "ep", "add").attachEvent("onclick", function(){
        var ep = acs.settings.acu.settings.ep;
        var arr = [$("acu", "settings", "ep", "before").value, $("acu", "settings", "ep", "after").value];
        if (acs.current.list.ep == -1) {
            ep.push(arr);
            acs.current.list.ep = ep.length - 1;
        } else {
            ep.splice(acs.current.list.ep, 1, ep[acs.current.list.ep], arr);
            acs.current.list.ep++;
        }
        $("acu", "settings", "ep", "before").value = "";
        $("acu", "settings", "ep", "after").value = "";
        acs.changed.acu = true;
        acs.updateForm();
    });
    $("acu", "settings", "ep", "delete").attachEvent("onclick", function(){
        var ep = acs.settings.acu.settings.ep;
        if (acs.current.list.ep != -1) {
            ep.splice(acs.current.list.ep, 1);
            if (acs.current.list.ep == ep.length) acs.current.list.ep--;
            if (acs.current.list.ep == -1) acs.current.list.ep--;
        }
        acs.changed.acu = true;
        acs.updateForm();
    });
    
    $("detect", "detect", "list", "add").attachEvent("onclick", function(){
        if (acs.current.list.search == -1 && acs.current.sub == 2) return false;
        var sub = acs.current.sub;
        var type = ["service", "program", "other"][sub];
        var detect = sub == 2 ? acs.settings.detect[type][acs.current.list.search].target : acs.settings.detect[type];
        if (acs.current.list.detect == -1) {
            var obj = {};
            obj.name = $("detect", "name").value;
            if (sub != 2 && $("detect", "detect").value) obj[type] = $("detect", "detect").value;
            if ($("detect", "file").value) obj.file = $("detect", "file").value;
            if ($("detect", "dir").value) obj.dir = $("detect", "dir").value;
            detect.push(obj);
            acs.current.list.detect = detect.length - 1;
        } else {
            detect.splice(acs.current.list.detect, 1, detect[acs.current.list.detect], acLib.clone(detect[acs.current.list.detect]));
            acs.current.list.detect++;
        }
        acs.changed.detect[type] = true;
        acs.updateForm();
    });
    
    $("detect", "detect", "list", "delete").attachEvent("onclick", function(){
        if (acs.current.list.detect == -1) return false;
        var sub = acs.current.sub;
        var type = ["service", "program", "other"][sub];
        var detect = sub == 2 ? acs.settings.detect[type][acs.current.list.search].target : acs.settings.detect[type];
        detect.splice(acs.current.list.detect, 1);
        if (acs.current.list.detect == detect.length) acs.current.list.detect--;
        if (acs.current.list.detect == -1) acs.current.list.detect--;
        acs.changed.detect[type] = true;
        acs.updateForm();
    });
    
    $("detect", "detect", "list", "up").attachEvent("onclick", function(){
        if (acs.current.list.detect == -1 || acs.current.list.detect == 0) return false;
        var sub = acs.current.sub;
        var type = ["service", "program", "other"][sub];
        var detect = sub == 2 ? acs.settings.detect[type][acs.current.list.search].target : acs.settings.detect[type];
        detect.splice(acs.current.list.detect - 1, 2, detect[acs.current.list.detect], detect[acs.current.list.detect - 1]);
        acs.current.list.detect--;
        acs.changed.detect[type] = true;
        acs.updateForm();
    });
    
    $("detect", "detect", "list", "down").attachEvent("onclick", function(){
        if (acs.current.list.detect == -1) return false;
        var sub = acs.current.sub;
        var type = ["service", "program", "other"][sub];
        var detect = sub == 2 ? acs.settings.detect[type][acs.current.list.search].target : acs.settings.detect[type];
        if (acs.current.list.detect == detect.length - 1) return false;
        detect.splice(acs.current.list.detect, 2, detect[acs.current.list.detect + 1], detect[acs.current.list.detect]);
        acs.current.list.detect++;
        acs.changed.detect[type] = true;
        acs.updateForm();
    });
    
    $("detect", "search", "list", "add").attachEvent("onclick", function(){
        if (acs.current.sub != 2) return false;
        var sub = acs.current.sub;
        var type = ["service", "program", "other"][sub];
        var search = acs.settings.detect[type];
        if (acs.current.list.search == -1) {
            var obj = {};
            obj.search = $("detect", "search").value;
            obj.target = [];
            search.push(obj);
            acs.current.list.search = search.length - 1;
        } else {
            search.splice(acs.current.list.search, 1, search[acs.current.list.search], acLib.clone(search[acs.current.list.search]));
            acs.current.list.search++;
        }
        acs.current.list.detect = -2;
        acs.changed.detect[type] = true;
        acs.updateForm();
    });
    
    $("detect", "search", "list", "delete").attachEvent("onclick", function(){
        if (acs.current.list.search == -1) return false;
        var sub = acs.current.sub;
        var type = ["service", "program", "other"][sub];
        var search = acs.settings.detect[type];
        search.splice(acs.current.list.search, 1);
        acs.current.list.detect = -2;
        if (acs.current.list.search == search.length) acs.current.list.search--;
        acs.changed.detect[type] = true;
        acs.updateForm();
    });
    
    $("detect", "search", "list", "up").attachEvent("onclick", function(){
        if (acs.current.list.search == -1 || acs.current.list.search == 0) return false;
        var sub = acs.current.sub;
        var type = ["service", "program", "other"][sub];
        var search = acs.settings.detect[type];
        search.splice(acs.current.list.search - 1, 2, search[acs.current.list.search], search[acs.current.list.search - 1]);
        acs.current.list.detect = -2;
        acs.current.list.search--;
        acs.changed.detect[type] = true;
        acs.updateForm();
    });
    
    $("detect", "search", "list", "down").attachEvent("onclick", function(){
        if (acs.current.list.search == -1) return false;
        var sub = acs.current.sub;
        var type = ["service", "program", "other"][sub];
        var search = acs.settings.detect[type];
        if (acs.current.list.search == search.length - 1) return false;
        search.splice(acs.current.list.search, 2, search[acs.current.list.search + 1], search[acs.current.list.search]);
        acs.current.list.detect = -2;
        acs.current.list.search++;
        acs.changed.detect[type] = true;
        acs.updateForm();
    });
    
    for (var key in acModel.acu.param) {
        switch (acModel.acu.param[key]) {
            case "string":
                acs.addSelectEvent("acu", "param", key);
                break;
            case "boolean":
                acs.addCheckBoxEvent("acu", "param", key);
                break;
        }
    }
    for (var key in acModel.acu.name.file) {
        switch (acModel.acu.name.file[key]) {
            case "string":
                acs.addTextEvent("acu", "name", "file", key);
                break;
        }
    }
    for (var key in acModel.acu.name.dir) {
        switch (acModel.acu.name.dir[key]) {
            case "string":
                acs.addTextEvent("acu", "name", "dir", key);
                break;
        }
    }
    
    for (var key in acModel.detect.param) {
        switch (acModel.detect.param[key]) {
            case "string":
                acs.addSelectEvent("detect", "param", key);
                break;
            case "boolean":
                acs.addCheckBoxEvent("detect", "param", key);
                break;
        }
    }
    for (var key in acModel.detect.level) {
        switch (acModel.detect.level[key]) {
            case "number":
                acs.addSelectEvent("detect", "level", key);
                break;
        }
    }
    
    acs.addTextEvent("detect", "name");
    acs.addTextEvent("detect", "detect");
    acs.addTextEvent("detect", "file");
    acs.addTextEvent("detect", "dir");
    acs.addSelectEvent("detect", "detect", "list");
    acs.addTextEvent("detect", "search");
    acs.addSelectEvent("detect", "search", "list");
    
    acs.addSelectEvent("preset", "type");
    acs.addTextEvent("preset", "ext");
    acs.addTextEvent("preset", "enc");
    acs.addBrowseEvent(0, "preset", "enc");
    acs.addTextEvent("preset", "opt");
    
    var e_delete = function(){
        if (acs.list.preset.length == 1) {
            acLib.log("最後のプリセットです", 1);
        }
        var confirm = acLib.confirm("削除してもよろしいですか?");
        if (!confirm) return false;
        acLib.deleteFile(acLib.acPath() + "Preset\\" + acs.list.preset[acs.current.sub] + ".txt");
        acs.changed.preset = false;
        
        acs.list.preset.splice(acs.current.sub, 1);
        
        acs.updatePreset();
        if (acs.current.sub == acs.list.preset.length) acs.current.sub--;
        acs.changeTab(acs.current.tab, acs.current.sub);
    };
    
    var e_save_as = function(){
        var preset = prompt("プリセット名", acs.list.preset[acs.current.sub]);
        if (!preset) return false;
        if (acLib.fso.FileExists(acLib.acPath() + "Preset\\" + preset + ".txt")) {
            acLib.log("ファイルが既に存在します", 1);
            return false;
        }
        acLib.writeFile(acLib.acPath() + "Preset\\" + preset + ".txt", "Shift-JIS", acLib.toSource(acs.settings.preset, true));
        acs.changed.preset = false;
        
        acs.list.preset.push(preset);
        
        acs.updatePreset();
        acs.changeTab(acs.current.tab, acs.list.preset.length - 1);
    };
    
    var e_save = function(){
        switch (acs.current.tab) {
            case 0:
                var path = acLib.acPath() + "Settings\\AutoConvert.txt";
                var json = acLib.toSource(acs.settings.ac, true);
                acs.changed.ac = false;
                break;
            case 1:
                var path = acLib.acPath() + "Settings\\AutoConvertUtil.txt";
                var json = acLib.toSource(acs.settings.acu, true);
                acs.changed.acu = false;
                break;
            case 2:
                var path = acLib.acPath() + "Settings\\" + ["Service", "Program", "Other"][acs.current.sub] + ".txt";
                var json = acLib.toSource(acs.settings.detect[["service", "program", "other"][acs.current.sub]], true);
                acs.changed.detect[["service", "program", "other"][acs.current.sub]] = false;
                break;
            case 3:
                var path = acLib.acPath() + "Preset\\" + acs.list.preset[acs.current.sub] + ".txt";
                var json = acLib.toSource(acs.settings.preset, true);
                acs.changed.preset = false;
                break;
        }
        
        acLib.writeFile(path, "Shift-JIS", json);
        acs.updateForm();
    };
    
    var e_reset = function() {
        switch (acs.current.tab) {
            case 0:
                var ac = acLib.loadSetting(acLib.acPath() + "Settings\\AutoConvert.txt");
                if (!ac) window.close();
                acs.settings.ac = ac;
                acs.changed.ac = false;
                break;
            case 1:
                var acu = acLib.loadSetting(acLib.acPath() + "Settings\\AutoConvertUtil.txt");
                if (!acu) window.close();
                acs.settings.acu = acu;
                acs.current.list.replace = -2;
                acs.current.list.ep = -2;
                acs.changed.acu = false;
                break;
            case 2:
                var detect = acLib.loadSetting(acLib.acPath() + "Settings\\" + ["Service", "Program", "Other"][acs.current.sub] + ".txt");
                if (!detect) window.close();
                acs.settings.detect[["service", "program", "other"][acs.current.sub]] = detect;
                acs.current.list.detect = -2;
                acs.current.list.search = -1;
                acs.changed.detect[["service", "program", "other"][acs.current.sub]] = false;
                break;
            case 3:
                var preset = acLib.loadSetting(acLib.acPath() + "Preset\\" + acs.list.preset[acs.current.sub] + ".txt");
                if (!preset) window.close();
                acs.settings.preset = preset;
                acs.changed.preset = false;
                break;
        }
        acs.updateForm();
    }
    
    var e_close = function(){
        window.close();
    }
    
    $("delete").attachEvent("onclick", e_delete);
    
    $("save_as").attachEvent("onclick", e_save_as);
    
    $("save").attachEvent("onclick", e_save);
    
    $("reset").attachEvent("onclick", e_reset);
    
    $("close").attachEvent("onclick", e_close);
    
    document.body.attachEvent("onkeydown", function(e) {
        if (window.event.ctrlKey) {
            switch (window.event.keyCode) {
                case 82:
                    if (!$("reset").disabled) e_reset();
                    break;
                case 83:
                    if (!$("save").disabled) e_save();
                    break;
            }
        }
    });
}