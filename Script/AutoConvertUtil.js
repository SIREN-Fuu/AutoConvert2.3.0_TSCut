//------------------------------------------------------------------------------
//  AutoConvertUtil
//  ver 2.3.0
//  usage: cscript AutoConvertUtil.wsf input1.ts input2.ts input3.ts ...
//------------------------------------------------------------------------------

function AutoConvertUtil() {
    this.initialize.apply(this, arguments);
}

AutoConvertUtil.prototype = {
    initialize: function() {
        this.args = [];
        this.settings = {};
        this.service = [];
        this.program = [];
        this.other = [];
    },
    main: function() {
        if (WScript.Arguments.length == 0) {
            this.usage();
            return 0;
        }
        acLib.log("-----------------", 0);
        acLib.log(" AutoConvertUtil ", 0);
        acLib.log("-----------------", 0);
        acLib.log("", 0);
        acLib.log("設定読み込み...", 0);
        if (!this.loadSettings()) return 1;
        acLib.log("設定チェック...", 0);
        if (!this.checkSettings()) return 2;
        acLib.log("引数チェック...", 0);
        if (!this.getArguments()) return 3;
        for (var i = 0; i < this.args.length; i++) {
            var process = new AutoConvertUtilProcess(this.args[i], acLib.clone(this.settings), this.service, this.program, this.other);
            if (!process.main()) {
                if (acLib.confirm("次のファイルを処理しますか?")) {
                    acLib.log("処理を続行します", 0);
                } else {
                    break;
                }
            }
        }
        acLib.log("", 0);
        acLib.log("終了しました", 0);
        WScript.Sleep(10000);
        
        return 0;
    },
    usage: function() {
        acLib.log("-------------------------------------------------------------------------------", 0);
        acLib.log("AutoConvertUtil", 0);
        acLib.log("ver 2.3.0", 0);
        acLib.log("-------------------------------------------------------------------------------", 0);
        acLib.log("usage: cscript AutoConvertUtil.wsf input1.ts input2.ts input3.ts ...", 0);
        
        return true;
    },
    loadSettings: function() {
        var settings = acLib.loadSetting(acLib.acPath() + "Settings\\AutoConvertUtil.txt");
        if (!settings) return false;
        this.settings = settings;
        
        var service = acLib.loadSetting(acLib.acPath() + "Settings\\Service.txt");
        if (!service) return false;
        this.service = service;
        
        var program = acLib.loadSetting(acLib.acPath() + "Settings\\Program.txt");
        if (!program) return false;
        this.program = program;
        
        var other = acLib.loadSetting(acLib.acPath() + "Settings\\Other.txt");
        if (!other) return false;
        this.other = other;
        
        return true;
    },
    checkSettings: function() {
        if (!this.settings.path.output) {
            acLib.log("出力パスを指定してください", 1);
            return false;
        } else {
            this.settings.path.output = (this.settings.path.output.slice(-1) == "\\") ? this.settings.path.output : this.settings.path.output + "\\";
        }
        for (key in this.settings.path) {
            this.settings.path[key] = this.settings.path[key].split("$AutoConvert$").join(acLib.acPath());
        }
        if (this.settings.settings.screname) {
            if (!acLib.existFiles([this.settings.path.screname])) return false;
        }
        if (this.settings.settings.rplsinfo) {
            if (!acLib.existFiles([this.settings.path.rplsinfo])) return false;
        }
        
        return true;
    },
    getArguments: function() {
        var objArgs = WScript.Arguments;
        for (var i = 0; i < objArgs.length; i++) {
            if (!acLib.existFiles([objArgs(i)])) return false;
            this.args.push(objArgs(i));
        }
        
        return true;
    }
}

function AutoConvertUtilProcess() {
    this.initialize.apply(this, arguments);
}

AutoConvertUtilProcess.prototype = {
    initialize: function(input, settings, service, program, other) {
        this.info = {
            input: input,
            output: settings.path.output,
            name: acLib.fso.GetBaseName(input),
            dir: "",
            service: "",
            program: ""
        };
        this.pre = {
            name: "",
            dir: ""
        };
        this.param = {};
        this.level = {};
        this.detected = {
            service: -1,
            program: -1,
            other: [-1, -1]
        };
        this.macro = {};
        this.service = service;
        this.program = program;
        this.other = other;
        for (var key in settings) {
            this[key] = settings[key];
        }
        for (var key in acLib.param) {
            this.level[key] = 0;
        }
    },
    main: function() {
        acLib.log("", 0);
        acLib.log("[ " + this.info.input + " ]", 0);
        if (!this.analysis()) return false;
        if (!this.check()) return false;
        if (!this.prepare()) return false;
        if (!this.exec()) return false;
        
        return true;
    },
    analysis: function() {
         if (this.settings.edcb && acLib.fso.FileExists(this.info.input + ".program.txt")) {
            if (!this.edcbInfo()) return false;
            if (!this.detectService()) return false;
            if (!this.detectProgram()) return false;
            if (!this.detectOther()) return false;
            if (!this.edcbPrepare()) return false;
         } else if (this.settings.rplsinfo && acLib.fso.FileExists(this.path.rplsinfo)) {
            if (!this.rplsInfo()) return false;
            if (!this.detectService()) return false;
            if (!this.detectProgram()) return false;
            if (!this.detectOther()) return false;
            if (!this.rplsPrepare()) return false;
        } else {
            if (!this.fileInfo()) return false;
            if (!this.detectService()) return false;
            if (!this.detectProgram()) return false;
            if (!this.detectOther()) return false;
            if (!this.filePrepare()) return false;
        }
        
        return true;
    },
    fileInfo: function() {
        var title = this.info.name;
        
        var file = acLib.fso.GetFile(this.info.input);
        var start = new Date(file.DateCreated);
        var end = new Date(file.DateLastModified);
        
        for (var i = 0; i < this.service.length; i++) {
            if (this.info.name.indexOf(this.service[i].name) != -1) {
                var service = this.service[i].service;
            }
        }
        
        this.setMacro(title, start, end, service);
        
        return true;
    },
    edcbInfo: function() {
        var edcb = acLib.readFile(this.info.input + ".program.txt", "Shift-JIS");
        if (!edcb) return false;
        edcb = edcb.split("\r\n");
        
        var genre = [];
        var genre2 = [];
        var video = [];
        var audio = [];
        var srate = [];
        var lang = [];
        for (var i = 0; i < edcb.length; i++) {
            switch (i) {
                case 0:
                    var date = edcb[i].split(/[/\(\) :～]/);
                    var start = new Date(date[0], date[1] - 1, date[2], date[4], date[5], 0);
                    var end = new Date(date[0], date[1] - 1, date[2], date[6], date[7], 0);
                    if (date[4] > date[6]) end.setTime(end.getTime() + 86400000);
                    break;
                case 1:
                    var service = edcb[i];
                    break;
                case 2:
                    var title = edcb[i];
                    break;
                case 4:
                    var info = edcb[i];
                    break;
                default:
                    if (edcb[i] == "ジャンル : ") {
                        i++;
                        while (edcb[i]) {
                            genre.push(edcb[i].split(" - ")[0]);
                            genre2.push(edcb[i].split(" - ")[1]);
                            i++;
                        }
                    }
                    if (edcb[i].indexOf("映像 : ") != -1) {
                        edcb[i] = edcb[i].replace(/.+ : (.+)/, "$1");
                        if (!edcb[i]) i++;
                        while (edcb[i].indexOf("音声 : ") == -1 && edcb[i] != "映像") {
                            video.push(edcb[i]);
                            i++;
                        }
                    }
                    if (edcb[i].indexOf("音声 : ") != -1) {
                        edcb[i] = edcb[i].replace(/.+ : (.+)/, "$1");
                        if (!edcb[i]) i++;
                        while (edcb[i]) {
                            if (edcb[i].indexOf("サンプリングレート : ") != -1) {
                                srate.push(edcb[i].replace(/.+ : (.+)/, "$1"));
                            } else if (edcb[i].match(/語$/)) {
                                lang.push(edcb[i]);
                            } else {
                                audio.push(edcb[i]);
                            }
                            i++;
                        }
                    }
                    if (edcb[i] == "無料放送") var freeca = "無料放送";
                    if (edcb[i] == "有料放送") var freeca = "有料放送";
                    if (edcb[i].indexOf("OriginalNetworkID:") != -1) {
                        var onid = edcb[i].replace(/.+:([0-9]+).+/, "$1");
                    }
                    if (edcb[i].indexOf("TransportStreamID:") != -1) {
                        var tsid = edcb[i].replace(/.+:([0-9]+).+/, "$1");
                    }
                    if (edcb[i].indexOf("ServiceID:") != -1) {
                        var sid = edcb[i].replace(/.+:([0-9]+).+/, "$1");
                    }
                    if (edcb[i].indexOf("EventID:") != -1) {
                        var eid = edcb[i].replace(/.+:([0-9]+).+/, "$1");
                    }
                    
                    break;
            }
        }
        
        this.setMacro(title, start, end, service, info, genre, genre2, onid, tsid, sid, eid, video, audio, lang, srate, freeca);
        
        return true;
    },
    rplsInfo: function() {
        var out = acLib.shell.Exec("\"" + this.path.rplsinfo + "\" \"" + this.info.input + "\" -T -dtpcbig");
        var rpls = String(out.StdOut.ReadAll());
        if(!out || out.ExitCode !== 0) {
            acLib.log("rplsinfoから情報を取得出来ませんでした", 0);
            return false;
        }
        rpls = rpls.split("\t");
        
        var genre = ["",""];
        var date = (rpls[0] + " " + rpls[1] + " " + rpls[2]).split(/[/ :]/);
        var start = new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);
        var end = new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);
        end.setTime(end.getTime() + 3600000 * parseInt(date[6]) + 60000 * parseInt(date[7]) + 1000 * parseInt(date[8]));
        
        var service = rpls[3];
        var title = rpls[4];
        var info = rpls[5];
        var genre = rpls[6].split("〕").join("").split(" 〔");
        
        this.setMacro(title, start, end, service, info, [genre[0]], [genre[1]]);
        
        return true;
    },
    setMacro: function(title, start, end, service, info, genre, genre2, onid, tsid, sid, eid, video, audio, lang, srate, freeca) {
        var exclude = this.replaceTitle(title);
        title = (exclude) ? exclude : title;
        
        this.macro.$Title$ = title;
        this.macro.$Title2$ = title.replace(/\[.+?\]/g, "");
        
        this.macro.$SDYYYY$ = start.getFullYear();
        this.macro.$SDYY$ = String(start.getFullYear()).slice(-2);
        this.macro.$SDMM$ = ("0" + String(start.getMonth() + 1)).slice(-2);
        this.macro.$SDM$ = String(start.getMonth() + 1);
        this.macro.$SDDD$ = ("0" + String(start.getDate())).slice(-2);
        this.macro.$SDD$ = String(start.getDate());
        this.macro.$SDW$ = ["日", "月", "火", "水", "木", "金", "土"][start.getDay()];
        this.macro.$STHH$ = ("0" + String(start.getHours())).slice(-2);
        this.macro.$STH$ = String(start.getHours());
        this.macro.$STMM$ = ("0" + String(start.getMinutes())).slice(-2);
        this.macro.$STM$ = String(start.getMinutes());
        this.macro.$STSS$ = ("0" + String(start.getSeconds())).slice(-2);
        this.macro.$STS$ = String(start.getSeconds());
        this.macro.$EDYYYY$ = String(end.getFullYear());
        this.macro.$EDYY$ = String(end.getFullYear()).slice(-2);
        this.macro.$EDMM$ = ("0" + String(end.getMonth() + 1)).slice(-2);
        this.macro.$EDM$ = String(end.getMonth() + 1);
        this.macro.$EDDD$ = ("0" + String(end.getDate())).slice(-2);
        this.macro.$EDD$ = String(end.getDate());
        this.macro.$EDW$ = ["日", "月", "火", "水", "木", "金", "土"][end.getDay()];
        this.macro.$ETHH$ = ("0" + String(end.getHours())).slice(-2);
        this.macro.$ETH$ = String(end.getHours());
        this.macro.$ETMM$ = ("0" + String(end.getMinutes())).slice(-2);
        this.macro.$ETM$ = String(end.getMinutes());
        this.macro.$ETSS$ = ("0" + String(end.getSeconds())).slice(-2);
        this.macro.$ETS$ = String(end.getSeconds());
        
        this.macro.$ONID10$ = (onid) ? onid : "";
        this.macro.$TSID10$ = (tsid) ? tsid : "";
        this.macro.$SID10$ = (sid) ? sid : "";
        this.macro.$EID10$ = (eid) ? eid : "";
        this.macro.$ONID16$ = (onid) ? "0x" + ("000" + parseInt(onid).toString(16).toUpperCase()).slice(-4) : "";
        this.macro.$TSID16$ = (tsid) ? "0x" + ("000" + parseInt(tsid).toString(16).toUpperCase()).slice(-4) : "";
        this.macro.$SID16$ = (sid) ? "0x" + ("000" + parseInt(sid).toString(16).toUpperCase()).slice(-4) : "";
        this.macro.$EID16$ = (eid) ? "0x" + ("000" + parseInt(eid).toString(16).toUpperCase()).slice(-4) : "";
        
        this.macro.$ServiceName$ = (service) ? service : "";
        
        this.macro.$Genre$ = [];
        this.macro.$Genre2$ = [];
        this.macro.$Genre10$ = [];
        this.macro.$Genre210$ = [];
        this.macro.$Genre16$ = [];
        this.macro.$Genre216$ = [];
        
        if (genre) {
            for (var i = 0; i < genre.length; i++) {
                this.macro.$Genre$.push(genre[i]);
                for (var key in acDef.genre) {
                    if (acDef.genre[key] == genre[i]) {
                        this.macro.$Genre10$.push(parseInt(key, 16).toString(10));
                        this.macro.$Genre16$.push(key);
                        this.macro.$Genre2$.push(genre2[i]);
                        for (var key2 in acDef.genre2[key]) {
                            if (acDef.genre2[key][key2] == genre2[i]) {
                                this.macro.$Genre210$.push(parseInt(key2, 16).toString(10));
                                this.macro.$Genre216$.push(key2);
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
        
        this.macro.$Genre$ = this.macro.$Genre$.join(",");
        this.macro.$Genre2$ = this.macro.$Genre2$.join(",");
        this.macro.$Genre10$ = this.macro.$Genre10$.join(",");
        this.macro.$Genre210$ = this.macro.$Genre210$.join(",");
        this.macro.$Genre16$ = this.macro.$Genre16$.join(",");
        this.macro.$Genre216$ = this.macro.$Genre216$.join(",");
        
        this.macro.$SubTitle$ = (info) ? info : "";
        this.macro.$SubTitle2$ = (info && info.match(/^[#＃第][0-9０１２３４５６７８９]/)) ? info : "";
        
        this.macro.$Video$ = [];
        this.macro.$Audio$ = [];
        this.macro.$Lang$ = [];
        this.macro.$SamplingRate$ = [];
        this.macro.$FreeCA$ = "";
        this.macro.$Video10$ = [];
        this.macro.$Audio10$ = [];
        this.macro.$SamplingRate10$ = [];
        this.macro.$FreeCA10$ = "";
        this.macro.$Video16$ = [];
        this.macro.$Audio16$ = [];
        this.macro.$SamplingRate16$ = [];
        this.macro.$FreeCA16$ = "";
        
        if (video) {
            for (var i = 0; i < video.length; i++) {
                this.macro.$Video$.push(video[i]);
                for (var key in acDef.video) {
                    if (acDef.video[key] == video[i]) {
                        this.macro.$Video10$.push(parseInt(key, 16).toString(10));
                        this.macro.$Video16$.push(key);
                        break;
                    }
                }
            }
        }
        if (audio) {
            for (var i = 0; i < audio.length; i++) {
                this.macro.$Audio$.push(audio[i]);
                for (var key in acDef.audio) {
                    if (acDef.audio[key] == audio[i]) {
                        this.macro.$Audio10$.push(parseInt(key, 16).toString(10));
                        this.macro.$Audio16$.push(key);
                        break;
                    }
                }
            }
        }
        if (lang) {
            for (var i = 0; i < lang.length; i++) {
                this.macro.$Lang$.push(lang[i]);
            }
        }
        if (srate) {
            for (var i = 0; i < srate.length; i++) {
                this.macro.$SamplingRate$.push(srate[i]);
                for (var key in acDef.srate) {
                    if (acDef.srate[key] == srate[i]) {
                        this.macro.$SamplingRate10$.push(parseInt(key, 16).toString(10));
                        this.macro.$SamplingRate16$.push(key);
                        break;
                    }
                }
            }
        }
        if (freeca) {
            this.macro.$FreeCA$ = freeca;
            for (var key in acDef.freeca) {
                if (acDef.freeca[key] == freeca) {
                    this.macro.$FreeCA10$ = parseInt(key, 16).toString(10);
                    this.macro.$FreeCA16$ = key;
                    break;
                }
            }
        }
        
        this.macro.$Video$ = this.macro.$Video$.join(",");
        this.macro.$Audio$ = this.macro.$Audio$.join(",");
        this.macro.$Lang$ = this.macro.$Lang$.join(",");
        this.macro.$SamplingRate$ = this.macro.$SamplingRate$.join(",");
        this.macro.$Video10$ = this.macro.$Video10$.join(",");
        this.macro.$Audio10$ = this.macro.$Audio10$.join(",");
        this.macro.$SamplingRate10$ = this.macro.$SamplingRate10$.join(",");
        this.macro.$Video16$ = this.macro.$Video16$.join(",");
        this.macro.$Audio16$ = this.macro.$Audio16$.join(",");
        this.macro.$SamplingRate16$ = this.macro.$SamplingRate16$.join(",");
        
        this.macro.$ACtitle$ = "";
        this.macro.$ACtitle2$ = "";
        this.macro.$ACsubtitle$ = "";
        this.macro.$ACpart$ = "";
        this.macro.$ACnumber$ = "";
        this.macro.$ACnumber1$ = "";
        this.macro.$ACnumber2$ = "";
        this.macro.$ACnumber3$ = "";
        this.macro.$ACnumber4$ = "";
        
        var search = [acLib.toHalf(this.macro.$Title$)];
        if (info) search.push(acLib.toHalf(info));
        
        for (var i = 0; i < search.length; i++) {
            if (!this.macro.$ACnumber$) {
                for (var j = 0; j < this.settings.ep.length; j++) {
                    search[i] = search[i].replace(new RegExp("(" + this.settings.ep[j][0] + ")([〇一二三四五六七八九零壱弐参肆伍陸質捌玖壹貳參十百千拾佰仟陌阡]+)(" + this.settings.ep[j][1] + ")", "g"), function(whole, before, reg, after) {
                        var num = 0;
                        var pow = 1;
                        var number = "〇一二三四五六七八九零壱弐参肆伍陸質捌玖 壹貳參";
                        var number2 = "十百千拾佰仟 陌阡";
                        for (var i = 0; i < reg.length; i++) {
                            var knum = reg.charAt(reg.length - i - 1);
                            if (number.indexOf(knum) != -1) {
                                num += number.indexOf(knum) % 10 * pow;
                                pow = Math.pow(10, i + 1);
                            } else {
                                pow = Math.pow(10, number2.indexOf(knum) % 3 + 1);
                                if (i == reg.length -1) num += pow;
                            }
                        }
                        return before + num + after;
                    });
                    var reg = new RegExp(this.settings.ep[j][0] + "([0-9]+)" + this.settings.ep[j][1], "g");
                    var match = [];
                    var acnumber = [[], [], [], []];
                    var arr;
                    while ((arr = reg.exec(search[i])) !== null) {
                        match.push(arr[0]);
                        var ep = String(parseInt(arr[1], 10));
                        acnumber[0].push(ep);
                        acnumber[1].push((ep.length > 1) ? ep : ("0" + ep).slice(-2));
                        acnumber[2].push((ep.length > 2) ? ep : ("00" + ep).slice(-3));
                        acnumber[3].push((ep.length > 3) ? ep : ("000" + ep).slice(-4));
                    }
                    if (match.length > 0) {
                        this.macro.$ACnumber1$ = acnumber[0].join(",");
                        this.macro.$ACnumber2$ = acnumber[1].join(",");
                        this.macro.$ACnumber3$ = acnumber[2].join(",");
                        this.macro.$ACnumber4$ = acnumber[3].join(",");
                        this.macro.$ACnumber$ = this.macro.$ACnumber2$;
                        search[i] = search[i].split(search[i].slice(search[i].indexOf(match[0]), search[i].indexOf(match[match.length - 1]) + match[match.length - 1].length)).join("");
                        break;
                    }
                }
            }
            
            if (!this.macro.$ACpart$) {
                var match = search[i].match(/[前中後]編/);
                if (match) {
                    this.macro.$ACpart$ = match[0];
                    search[i] = search[i].split(match[0]).join("");
                }
            }
            
            if (!this.macro.$ACsubtitle$) {
                var match = search[i].match(/「(.*?)」/);
                if (match) {
                    this.macro.$ACsubtitle$ = match[1];
                    search[i] = search[i].split(match[0]).join("");
                }
            }
            
            if (i == 0) {
                var split = search[i].split(" ");
                for (var j = split.length - 1; j > -1; j--) {
                    if (!split[j]) split.splice(j, 1);
                }
                split = split.join(" ");
                this.macro.$ACtitle$ = split;
                this.macro.$ACtitle2$ = split.replace(/[\[【（].+?[\]】）]/g, "");
                if (this.macro.$ACnumber$ && this.macro.$ACpart$ && this.macro.$ACsubtitle$) break;
            }
        }
        return true;
    },
    detectService: function() {
        if (!this.macro.$ServiceName$) return true;
        for (var i = 0; i < this.service.length; i++) {
            if (acLib.toHalf(this.macro.$ServiceName$).indexOf(acLib.toHalf(this.service[i].name)) != -1) {
                if (!this.info.service) {
                    if (this.service[i].service) {
                        this.info.service = this.service[i].service;
                    }
                    this.detected.service = i;
                }
                if (!this.pre.file && this.service[i].file) {
                    this.pre.file = this.service[i].file;
                }
                if (!this.pre.dir && this.service[i].dir) {
                    this.pre.dir = this.service[i].dir;
                }
                this.detect(this.service[i]);
            }
        }
        
        return true;
    },
    detectProgram: function() {
        if (!this.macro.$Title$) return true;
        for (var i = 0; i < this.program.length; i++) {
            if (acLib.toHalf(this.macro.$Title$).indexOf(acLib.toHalf(this.program[i].name)) != -1) {
                if (!this.info.program) {
                    if (this.program[i].program) {
                        this.info.program = this.program[i].program;
                    }
                    this.detected.program = i;
                }
                if (!this.pre.file && this.program[i].file) {
                    this.pre.file = this.program[i].file;
                }
                if (!this.pre.dir && this.program[i].dir) {
                    this.pre.dir = this.program[i].dir;
                }
                this.detect(this.program[i]);
            }
        }
        
        return true;
    },
    detectOther: function() {
        for (var i = 0; i < this.other.length; i++) {
            if (!this.macro[this.other[i].search]) continue;
            for (var j = 0; j < this.other[i].target.length; j++) {
                if (this.macro[this.other[i].search].indexOf(this.other[i].target[j].name) != -1) {
                    if (this.detected.other[0] == -1) this.detected.other = [i, j];
                    if (!this.pre.file && this.other[i].target[j].file) {
                        this.pre.file = this.other[i].target[j].file;
                    }
                    if (!this.pre.dir && this.other[i].target[j].dir) {
                        this.pre.dir = this.other[i].target[j].dir;
                    }
                    this.detect(this.other[i].target[j]);
                }
            }
        }
        
        return true;
    },
    detect: function(detect, mode) {
        if (!detect.param) return true;
        for (var key in detect.param) {
            if (!detect.level[key]) continue;
            if (this.param[key] && this.level[key]) {
                if (detect.level[key] <= this.level[key] && !mode) continue;
            }
            
            this.param[key] = detect.param[key];
            this.level[key] = detect.level[key];
        }
        
        return true;
    },
    filePrepare: function() {
        if (this.name.file.normal) {
            var name = this.replaceMacro(this.name.file.normal);
            if (!name) this.info.name = name;
        }
        if (this.name.dir.normal) {
            var dir = this.replaceMacro(this.name.dir.normal);
            if (!dir) {
                this.info.dir = this.replaceMacro(this.name.dir.base);
            } else {
                this.info.dir = dir;
            }
        }
        if (this.pre.file) {
            var name = this.replaceMacro(this.pre.file);
            if (name) this.info.name = name;
        }
        if (this.pre.dir) {
            var dir = this.replaceMacro(this.pre.dir);
            if (dir) this.info.dir = dir;
        }
        if (this.settings.screname && this.macro.$ServiceName$) {
            if (this.name.file.screname && !this.pre.file) {
                var name = this.replaceScrename(this.name.file.screname);
                if (name) this.info.name = name;
            }
            if (this.name.dir.screname && !this.pre.dir) {
                var dir = this.replaceScrename(this.name.dir.screname);
                if (dir) this.info.dir = dir;
            }
        }
        
        return true;
    },
    edcbPrepare: function() {
        if (this.name.file.edcb) {
            var name = this.replaceMacro(this.name.file.edcb);
            if (name) this.info.name = name;
        }
        if (this.name.dir.edcb) {
            var dir = this.replaceMacro(this.name.dir.edcb);
            if (!dir) {
                this.info.dir = this.replaceMacro(this.name.dir.base);
            } else {
                this.info.dir = dir;
            }
        }
        if (this.pre.file) {
            var name = this.replaceMacro(this.pre.file);
            if (name) this.info.name = name;
        }
        if (this.pre.dir) {
            var dir = this.replaceMacro(this.pre.dir);
            if (dir) this.info.dir = dir;
        }
        if (this.settings.screname) {
            if (this.name.file.screname && !this.pre.file) {
                var name = this.replaceScrename(this.name.file.screname);
                if (name) this.info.name = name;
            }
            if (this.name.dir.screname && !this.pre.dir) {
                var dir = this.replaceScrename(this.name.dir.screname);
                if (dir) this.info.dir = dir;
            }
        }
        
        return true;
    },
    rplsPrepare: function() {
        if (this.name.file.rplsinfo) {
            var name = this.replaceMacro(this.name.file.rplsinfo);
            if (name) this.info.name = name;
        }
        if (this.name.dir.rplsinfo) {
            var dir = this.replaceMacro(this.name.dir.rplsinfo);
            if (!dir) {
                this.info.dir = this.replaceMacro(this.name.dir.base);
            } else {
                this.info.dir = dir;
            }
        }
        if (this.pre.file) {
            var name = this.replaceMacro(this.pre.file);
            if (name) this.info.name = name;
        }
        if (this.pre.dir) {
            var dir = this.replaceMacro(this.pre.dir);
            if (dir) this.info.dir = dir;
        }
        if (this.settings.screname) {
            if (this.name.file.screname && !this.pre.file) {
                var name = this.replaceScrename(this.name.file.screname);
                if (name) this.info.name = name;
            }
            if (this.name.dir.screname && !this.pre.dir) {
                var dir = this.replaceScrename(this.name.dir.screname);
                if (dir) this.info.dir = dir;
            }
        }
        
        return true;
    },
    check: function() {
        this.info.output = acLib.escapePath(this.info.output).split("：").join(":");
        this.info.name = acLib.escapePath(this.info.name).split("\\").join("￥");
        this.info.dir = acLib.escapePath(this.info.dir);
        
        if (!acLib.existFiles([["avsファイル", acLib.acPath() + "Preset\\" + this.param.avs + ".avs"], ["プリセットファイル", acLib.acPath() + "Preset\\" + this.param.preset + ".txt"]])) return false;
        var preset = acLib.loadSetting(acLib.acPath() + "Preset\\" + this.param.preset + ".txt");
        if (!preset) return false;
        
        if (preset.type == 2) {
            if (this.param.c2a) {
                acLib.log("エンコーダが その他 のため c2a を使用出来ません", 0);
                this.param.av = false;
            }
            if (this.param.av) {
                acLib.log("エンコーダが その他 のため av を使用出来ません", 0);
                this.param.av = false;
            }
            if (this.param.faw) {
                acLib.log("エンコーダが その他 のため faw を使用出来ません", 0);
                this.param.faw = false;
            }
        }
        
        if (this.param.cm) {
            if (!this.param.apm && !this.param.cs && !this.param.lg && !this.param.jls) {
                acLib.log("自動CMカットパラメーターが指定されていないため cm を使用出来ません", 0);
                this.param.cm = false;
            } else {
                for (var i = 0; i < acLib.param.cm.length; i++) {
                    this.param[acLib.param.cm[i]] = false;
                }
            }
        }
        if (this.param.cut) {
            for (var i = 0; i < acLib.param.cut.length; i++) {
                this.param[acLib.param.cut[i]] = false;
            }
        }
        
        if (this.param.cs) {
            for (var i = 0; i < acLib.param.cs.length; i++) {
                this.param[acLib.param.cs[i]] = false;
            }
        }
        if (this.param.lg) {
            if (!acLib.fso.FileExists(acLib.acPath() + "Logo\\" + this.info.service + ".lgd") ||
                !acLib.fso.FileExists(acLib.acPath() + "Logo\\" + this.info.service + ".lgd.autoTune.param")) {
                acLib.log("ロゴデータが見つからないため lg を使用できません", 0);
                this.param.lg = false;
            } else {
                for (var i = 0; i < acLib.param.lg.length; i++) {
                    this.param[acLib.param.lg[i]] = false;
                }
            }
        }
        if (this.param.jls) {
            if (!acLib.fso.FileExists(acLib.acPath() + "Logo\\" + this.info.service + ".lgd")) {
                acLib.log("ロゴデータが見つからないため jls を使用できません", 0);
                this.param.jls = false;
            } else {
                for (var i = 0; i < acLib.param.jls.length; i++) {
                    this.param[acLib.param.jls[i]] = false;
                }
            }
        }
        
        if (!this.param.cm && !this.param.cut) {
            if (!acLib.existFiles([acLib.acPath() + "Preset\\" + this.param.avs + ".avs", acLib.acPath() + "Preset\\" + this.param.preset + ".txt"])) return false;
        }
        
        return true;
    },
    prepare: function() {
        var base = acLib.fso.GetParentFolderName(this.info.input) + "\\" + acLib.fso.GetBaseName(this.info.input);
        if (this.param.cs) {
            if (acLib.fso.FileExists(acLib.acPath() + "Logo\\" + this.info.service + ".logo.txt")) {
                if (!acLib.copyFile(acLib.acPath() + "Logo\\" + this.info.service + ".logo.txt", base + ".logo.txt")) return false;
            }
            if (acLib.fso.FileExists(acLib.acPath() + "Logo\\" + this.info.service + ".ini")) {
                if (!acLib.copyFile(acLib.acPath() + "Logo\\" + this.info.service + ".ini", base + ".ini")) return false;
            }
        } else if (this.param.lg) {
            if (!acLib.copyFile(acLib.acPath() + "Logo\\" + this.info.service + ".lgd", base + ".lgd")) return false;
            if (!acLib.copyFile(acLib.acPath() + "Logo\\" + this.info.service + ".lgd.autoTune.param", base + ".lgd.autoTune.param")) return false;
        } else if (this.param.jls) {
            if (!acLib.copyFile(acLib.acPath() + "Logo\\" + this.info.service + ".lgd", base + ".lgd")) return false;
            if (acLib.fso.FileExists(acLib.acPath() + "Logo\\" + this.info.service + ".logoframe.txt")) {
                if (!acLib.copyFile(acLib.acPath() + "Logo\\" + this.info.service + ".logoframe.txt", base + ".logoframe.txt")) return false;
            }
        }
        if(!acLib.createFolder(this.info.output, this.info.dir)) return false;
        
        return true;
    },
    exec: function() {
        var retry = true;
        while (retry) {
            var args = this.before();
            var exec = this.run(args);
            var err = this.after(exec);
            if (err == 0) {
                return true;
            } else if (err == 1) {
                return false;
            } else if (err == 2) {
                return true;
            }
        }
        
        return true;
    },
    before: function(mode) {
        var args = "";
        args += " -i \"" + this.info.input + "\"";
        args += " -o \"" + this.info.output + this.info.dir + "\\" + this.info.name + "\"";
        var opt = "program = \"" + this.info.program + "\"\r\nservice = \"" + this.info.service + "\"\r\n";
        
        if (!this.param.cm && !this.param.cut) {
            args += " -a \"" + acLib.acPath() + "Preset\\acu.avs_\"";
            args += " -p \"" + acLib.acPath() + "Preset\\" + this.param.preset + ".txt\"";
            for (var key in this.param) {
                if (key == "avs" || key == "preset") continue;
                opt += key + " = " + this.param[key] + "\r\n";
            }
            if (!acLib.copyFile(acLib.acPath() + "Preset\\" + this.param.avs + ".avs", acLib.acPath() + "Preset\\acu.avs_")) return false;
            if (!acLib.replaceFile(acLib.acPath() + "Preset\\acu.avs_", "Shift-JIS", "Shift-JIS", ["__opt__", opt])) return false;
        }
        for (var key in acLib.param) {
            if (key == "avs" || key == "preset") continue;
            if (this.param[key]) args += " -" + key;
        }
        
        acLib.log("", 0);
        acLib.log(" input  : " + this.info.input, 0);
        acLib.log(" output : " + this.info.output + this.info.dir + "\\" + this.info.name, 0);
        if (!mode) {
            acLib.log(" avs    : " + ((this.param.cm || this.param.cut) ? "nothing" : this.param.avs), 0);
            acLib.log(" preset : " + ((this.param.cm || this.param.cut) ? "nothing" : this.param.preset), 0);
            for (var key in acLib.param) {
                if (key == "avs" || key == "preset") continue;
                acLib.log(" " + key + new Array(7 - key.length).join(" ") + " : " + this.param[key], 0);
            }
        }
        acLib.log("", 0);
        
        return args;
    },
    run: function(args) {
        var start = new Date();
        
        //var exec = 0;
        //var exec = acLib.log("cscript //nologo \"" + acLib.acPath() + "Script\\AutoConvert.wsf\" " + args, 0);
        var exec = acLib.shell.Run("cscript //nologo \"" + acLib.acPath() + "Script\\AutoConvert.wsf\" " + args, 7, true);
        
        var timer = new Date(1970, 1, 1);
        timer.setTime(timer.getTime() + (new Date()).getTime() - start.getTime());
        timer = "[" + ("0" + timer.getHours()).slice(-2) + ":" + ("0" + timer.getMinutes()).slice(-2) + ":" + ("0" + timer.getSeconds()).slice(-2) + "]";
        acLib.log("経過時間 : " + timer, 0);
        acLib.log("", 0);
        
        var logfile = acLib.acPath() + "AutoConvert.log";
        if (acLib.fso.FileExists(logfile)) var log = acLib.readFile(logfile, "Shift-JIS");
        log = log ? log + "\r\n" : "";
        acLib.writeFile(logfile, "Shift-JIS", log + ((exec == 0) ? "successful " : "error      ") + timer + " \"" + this.info.input + "\"" + ((exec == 0) ? "" : ("[" + exec + "]")));
        
        return exec;
    },
    after: function(exec) {
        switch (exec) {
            case 0:
                acLib.log("正常に処理されました", 0);
                if (this.settings.move) {
                    if(!this.moveInput()) return 1;
                }
                return 0;
                break
            case 7:
                acLib.log("DGDecNV でエラーが発生しました", 0);
                var param = "nv";
                break;
            case 9:
                acLib.log("ts2aac でエラーが発生しました", 0);
                var param = "t2a";
                break;
            case 11:
                acLib.log("Comskip でエラーが発生しました", 0);
                var param = "cs";
                break;
            case 12:
                acLib.log("logoGuillo でエラーが発生しました", 0);
                var param = "lg";
                break;
            case 13:
                acLib.log("joinlogoscp でエラーが発生しました", 0);
                var param = "jls";
                break;
            case 17:
                acLib.log("AutoVfr でエラーが発生しました", 0);
                var param = "av";
                break;
            case 18:
                acLib.log("Caption2Ass でエラーが発生しました", 0);
                var param = "c2a";
                break;
            case 19:
                acLib.log("FAW でエラーが発生しました", 0);
                var param = "faw";
                break;
            case -1073741510:
                acLib.log("エラーが発生しました", 0);
                return 1;
                break;
            default:
                acLib.log("エラーが発生しました", 0);
                if (this.settings.ignoreErr) {
                    acLib.log("エラーを無視して続行します", 0);
                    return 2;
                } else {
                    return 1;
                }
                break;
        }
        if (this.settings.autoRetry) {
            acLib.log("リトライします", 0);
            this.param[param] = false;
            return 3;
            
        } else if (this.settings.ignoreErr) {
            acLib.log("エラーを無視して続行します", 0);
            return 2;
        } else {
            if (acLib.confirm(param + " なしでリトライしますか?")) {
                acLib.log("リトライします", 0);
                this.param[param] = false;
                return 3;
            } else {
                acLib.log("処理を中断します", 0);
                return 1;
            }
        }
        
        return 0;
    },
    replaceMacro: function(name) {
        name = name.split("\\(").join("\t1").split("\\)").join("\t2");
        for (var key in this.macro) {
            if (!this.macro[key]) {
                var match = name.match(new RegExp("\\([^(]*" + key.split("$").join("\\$") +".*?\\)", "g"));
                if (match) {
                    for (var i = 0; i < match.length; i++) {
                        name = name.split(match[i]).join("");
                    }
                }
            }
            name = name.split(key).join(String(this.macro[key]).split("(").join("\t1").split(")").join("\t2"));
        }
        name = name.split("(").join("").split(")").join("").split("\t1").join("(").split("\t2").join(")");
        name = name.split("$Program$").join(this.info.program);
        name = name.split("$Service$").join(this.info.service);
        return name;
    },
    replaceTitle: function(name) {
        for (var i = 0; i < this.settings.replace.length; i++) {
            name = name.split(this.settings.replace[i][0]).join(this.settings.replace[i][1]);
        }
        return name;
    },
    replaceScrename: function(name) {
        var pre = this.macro.$SDYYYY$ + this.macro.$SDMM$ + this.macro.$SDDD$ + this.macro.$STHH$ + this.macro.$STMM$ + "_" + this.macro.$Title2$ + "_" + this.macro.$ServiceName$;
        pre = pre.split("\"").join("");
        var out = acLib.shell.Exec("cscript //nologo \"" + this.path.screname + "\" -t \"" + pre + "\" \"" + name + "\"");
        var screname = String(out.StdOut.ReadAll()).split("\r\n");
        screname = screname[screname.length - 2];
        if (screname == pre) {
            acLib.log("SCRenameで取得出来ませんでした", 0);
            return "";
        }
        return screname;
    },
    moveInput: function() {
        var move = this.replaceMacro(this.path.move);
        if (!move) return true;
        var pre;
        if(pre = move.match(/^[a-zA-Z]+?:\\/)) {
            var path = pre + "\\";
            var folder = move.split(pre).join("");
            var dest = move + "\\";
        } else {
            var path = acLib.fso.GetParentFolderName(this.info.input) + "\\";
            var folder = move;
            var dest = acLib.fso.BuildPath(path, folder) + "\\";
        }
        if(!acLib.createFolder(path, folder)) return false;
        acLib.shell.Run("cmd /c \"move \"" + acLib.fso.GetParentFolderName(this.info.input) + "\\" + acLib.fso.GetBaseName(this.info.input) + ".*\" \"" + dest + "\"\"", 7, true);
        //if(!acLib.moveFile(this.info.input, dest)) return false;
        return true;
    }
}
