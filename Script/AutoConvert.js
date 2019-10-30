//------------------------------------------------------------------------------------------------------------------------
//  AutoConvert
//  ver 2.3.0
//  usage: cscript AutoConvert.wsf -i input.ts -o output -a avs -p preset -cm -apm -cut -tss -nv -t2a -cs -lg -jls -faw
//------------------------------------------------------------------------------------------------------------------------

function AutoConvert() {
    this.initialize.apply(this, arguments);
}

AutoConvert.prototype = {
    initialize: function() {
        this.args = {
            input: "",
            output: "",
            avs: "",
            preset: ""
        };
        
        this.param = {
            cm: false,
            cut: false,
            tss: false,
            nv: false,
            t2a: false,
            cs: false,
            lg: false,
            jls: false,
            apm: false,
            c2a: false,
            av: false,
            faw: false
        };
        
        this.preset = {
            type: 0,
            ext: "",
            enc: "",
            opt: ""
        };
        
        this.temp = {
            base: "",
            opt: "",
            pid: {
                audio: "",
                video: "",
                pcr: ""
            },
            aac: "",
            delay: 0,
            trim: {
                str: "",
                arr: [[], []]
            }
        };
    },
    main: function() {
        if (WScript.Arguments.length == 0) {
            this.usage();
            return 0;
        }
        acLib.log("-------------", 0);
        acLib.log(" AutoConvert ", 0);
        acLib.log("-------------", 0);
        acLib.log("", 0);
        var i = 1;
        while (true) {
            switch (i) {
                case 1:
                    acLib.log("設定読み込み...", 0);
                    if (!this.loadSettings()) break;
                    i++;
                case 2:
                    acLib.log("引数チェック...", 0);
                    if (!this.getArguments()) break;
                    i++;
                case 3:
                    acLib.log("設定チェック...", 0);
                    if (!this.checkSettings()) break;
                    i++;
                case 4:
                    if (this.param.tss) {
                        acLib.log("TsSplitter...", 0);
                        if (!this.tssplitter()) break;
                    }
                    if (this.param.cut) {
                        i = 10;
                        continue;
                    }
                    i++;
                case 5:
                    acLib.log("PID情報...", 0);
                    if (!this.getPid()) break;
                    i++;
                case 6:
                    if (!this.param.nv) {
                        acLib.log("DGIndex...", 0);
                        if (!this.dgindex()) break;
                    }
                    i++;
                case 7:
                    if (this.param.nv) {
                        acLib.log("DGIndexNV...", 0);
                        if (!this.dgindexnv()) break;
                    }
                    i++;
                case 8:
                    if (!this.param.t2a) {
                        acLib.log("AAC情報...", 0);
                        if (!this.getAac()) break;
                    }
                    i++;
                case 9:
                    if (this.param.t2a) {
                        acLib.log("ts2aac...", 0);
                        if (!this.ts2aac()) break;
                    }
                    i++;
                case 10:
                    if (this.param.apm || this.param.cs || this.param.lg || this.param.jls) {
                        acLib.log("Trim準備...", 0);
                        if (!this.preTrim()) break;
                    }
                    i++;
                case 11:
                    if (this.param.cs) {
                        acLib.log("Comskip...", 0);
                        if (!this.comskip()) break;
                    }
                    i++;
                case 12:
                    if (this.param.lg) {
                        acLib.log("logoGuillo...", 0);
                        if (!this.logoguillo()) break;
                    }
                    i++;
                case 13:
                    if (this.param.jls) {
                        acLib.log("joinlogoscp...", 0);
                        if (!this.joinlogoscp()) break;
                    }
                    i++;
                case 14:
                    if (this.param.apm) {
                        acLib.log("AvsPmod...", 0);
                        if (!this.avspmod()) break;
                    }
                    if (this.param.cm) {
                        i = 26;
                        continue;
                    }
                    i++;
                case 15:
                    acLib.log("Trim情報...", 0);
                    if (!this.getTrim()) break;
                    if (this.param.cut) {
                        i = 24;
                        continue;
                    }
                    i++;
                case 16:
                    if (this.param.c2a) {
                        acLib.log("Caption2Ass...", 0);
                        if (!this.caption2ass()) break;
                    }
                    i++;
                case 17:
                    if (this.param.av) {
                        acLib.log("AutoVfr...", 0);
                        if (!this.autovfr()) break;
                    }
                    i++;
                case 18:
                    if (!this.param.faw && this.preset.type != 2) {
                        acLib.log("NeroAACEnc...", 0);
                        if (!this.neroaacenc()) break;
                    }
                    i++;
                case 19:
                    if (this.param.faw) {
                        acLib.log("FakeAacWav...", 0);
                        if (!this.fawcl()) break;
                    }
                    i++;
                case 20:
                    if (this.preset.type == 2) {
                        acLib.log("Wav...", 0);
                        if (!this.wav()) break;
                    }
                    i++;
                case 21:
                    acLib.log("エンコード...", 0);
                    if (!this.encode()) break;
                    i++;
                case 22:
                    if (this.preset.type != 2 && !this.param.av) {
                        acLib.log("Mp4Box...", 0);
                        if (!this.mp4box()) break;
                    }
                    i++;
                case 23:
                    if (this.param.av) {
                        acLib.log("tc2mp4Mod...", 0);
                        if (!this.tc2mp4mod()) break;
                    }
                    i++;
                case 24:
                    if (this.param.cut) {
                        acLib.log("TSカット...", 0);
                        if (!this.tscut()) break;
                    }
                    i++;
                case 25:
                    acLib.log("コピー...", 0);
                    if (!this.transfer()) break;
                    i++;
                case 26:
                    acLib.log("最終処理...", 0);
                    if (!this.clean()) break;
                    i++;
                case 27:
                    acLib.log("", 0);
                    acLib.log("正常に終了しました", 0);
                    WScript.Sleep(10000);
                    break;
            }
            if (i == 27) break;
            if (this.settings.failurepause) {
                acLib.log("エラーが発生しました", 0);
                var stdin = acLib.stdin("同じ箇所をリトライしますか? (y / n / [number])");
                if (stdin == "y") {
                    acLib.log("リトライします", 0);
                    continue;
                } else if (stdin > 0 && stdin < 28) {
                    acLib.log("リトライします", 0);
                    i = parseInt(stdin);
                    continue;
                } else {
                    acLib.log("処理を中断します", 0);
                    WScript.Sleep(10000);
                    return i;
                }
                acLib.log("", 0);
            } else {
                return i;
            }
        }
        
        return 0;
    },
    usage: function() {
        acLib.log("-------------------------------------------------------------------------------", 0);
        acLib.log("AutoConvert", 0);
        acLib.log("ver 2.3.0", 0);
        acLib.log("-------------------------------------------------------------------------------", 0);
        acLib.log("usage: cscript AutoConvert.wsf -i input.ts -o output -a avs -p preset -cm -cut -tss -nv -t2a -cs -lg -jls -apm -av -faw", 0);
        
        return true;
    },
    loadSettings: function() {
        var settings = acLib.loadSetting(acLib.acPath() + "Settings\\AutoConvert.txt");
        if (!settings) return false;
        settings = settings;
        
        for (var key in settings) {
            this[key] = settings[key];
        }
        
        return true;
    },
    getArguments: function() {
        var objArgs = WScript.Arguments;
        for (var i = 0; i < objArgs.length; i++) {
            if (i == objArgs.length - 1) {
                var args = ["-i", "-o", "-e", "-a", "-p"];
                for (var j = 0; j < args.length; j++) {
                    if (objArgs(i) == args[j]) {
                        acLib.log("不正な引数です", 1);
                        return false;
                    }
                }
            }
            switch (objArgs(i)) {
                case "-i":
                    this.args.input = objArgs(i + 1);
                    i++;
                    break;
                case "-o":
                    this.args.output = objArgs(i + 1);
                    i++;
                    break;
                case "-a":
                    this.args.avs = objArgs(i + 1);
                    i++;
                    break;
                case "-p":
                    this.args.preset = objArgs(i + 1);
                    i++;
                    break;
                case "-cm":
                    this.param.cm = true;
                    break;
                case "-cut":
                    this.param.cut = true;
                    break;
                case "-tss":
                    this.param.tss = true;
                    break;
                case "-nv":
                    this.param.nv= true;
                    break;
                case "-t2a":
                    this.param.t2a = true;
                    break;
                case "-c2a":
                    this.param.c2a = true;
                    break;
                case "-cs":
                    this.param.cs = true;
                    break;
                case "-lg":
                    this.param.lg = true;
                    break;
                case "-jls":
                    this.param.jls = true;
                    break;
                case "-apm":
                    this.param.apm = true;
                    break;
                case "-av":
                    this.param.av = true;
                    break;
                case "-faw":
                    this.param.faw = true;
                    break;
                default:
                    acLib.log("不正な引数です", 1);
                    return false;
                    break;
            }
        }
        
        return true;
    },
    checkSettings: function() {
        if (this.args.input == "") {
            acLib.log("入力ファイルを指定してください", 1);
            return false;
        }
        if (this.args.output == "") {
            this.args.output = acLib.fso.GetParentFolderName(this.args.input) + "\\" + acLib.fso.GetBaseName(this.args.input);
        }
        if (this.args.avs == "" && (!this.param.cm && !this.param.cut)) {
            acLib.log("avsファイルを指定してください", 1);
            return false;
        }
        if (this.args.preset == "" && (!this.param.cm && !this.param.cut)) {
            acLib.log("プリセットファイルを指定してください", 1);
            return false;
        }
        
        if (!this.param.cm && !this.param.cut) {
            var preset = acLib.loadSetting(this.args.preset);
            if (!preset) return false;
            this.preset = preset;
            this.preset.enc = this.preset.enc.split("$AutoConvert$").join(acLib.acPath());
        }
        
        for (key in this.path) {
            this.path[key] = this.path[key].split("$AutoConvert$").join(acLib.acPath());
        }
        
        this.path.temppath = (this.path.temppath.slice(-1) == "\\") ? this.path.temppath : this.path.temppath + "\\";
        this.path.tempfile = "temp_" + Math.floor(Math.random() * 65536);
        this.path.temp = this.path.temppath + this.path.tempfile;
        
        this.temp.base = acLib.fso.GetParentFolderName(this.args.input) + "\\" + acLib.fso.GetBaseName(this.args.input);
        
        var files = [["入力ファイル", this.args.input]];
        var folders = [acLib.fso.GetParentFolderName(this.args.output + ".ext"), this.path.temppath];
        
        for (var key in acLib.param) {
            if (!this.param[key]) continue;
            for (var i = 0; i < acLib.param[key].length; i++) {
                this.param[acLib.param[key][i]] = false;
            }
        }
        
        if (this.param.cm) {
            if (!this.param.apm && !this.param.cs && !this.param.lg && !this.param.jls) {
                acLib.log("CMカットパラメータが指定されていません", 1);
                return false;
            }
        } else if (this.param.cut) {
            this.preset.ext = "ts";
            files.push(["TsSplitter", this.path.tssplitter]);
            files.push(["TsConnector", this.path.tsconnector]);
        } else {
            if (this.preset.type == 2) {
                if (this.param.c2a) {
                    acLib.log("エンコーダが その他 のため c2a を使用出来ません", 0);
                    this.param.c2a = false;
                }
                if (this.param.av) {
                    acLib.log("エンコーダが その他 のため av を使用出来ません", 0);
                    this.param.av = false;
                }
                if (this.param.faw) {
                    acLib.log("エンコーダが その他 のため faw を使用出来ません", 0);
                    this.param.faw = false;
                }
            } else {
                files.push(["MP4Box", this.path.mp4box]);
            }
            if (this.param.c2a) {
                files.push(["Caption2Ass", this.path.caption2ass]);
            }
            if (this.param.av) {
                files.push(["AutoVfr", this.path.autovfr]);
                files.push(["AutoVfr avs", this.path.autovfravs]);
                files.push(["tc2mp4Mod", this.path.tc2mp4mod]);
            }
            if (this.param.faw) {
                files.push(["fawcl", this.path.fawcl]);
            } else {
                files.push(["NeroAacEnc", this.path.neroaacenc]);
            }
            files.push(["avsファイル", this.args.avs]);
            files.push(["プリセットファイル", this.args.preset]);
            files.push(["エンコーダ", this.preset.enc]);
        }
        if (!this.param.cut) {
            if (this.param.tss) {
                files.push(["TsSplitter", this.path.tssplitter]);
                if (this.settings.tssconnect) {
                    files.push(["TsConnector", this.path.tsconnector]);
                }
            }
            if (this.param.nv) {
                files.push(["DGIndexNV", this.path.dgindexnv]);
            } else {
                files.push(["DGIndex", this.path.dgindex]);
            }
            if (this.param.t2a) {
                files.push(["ts2aac", this.path.ts2aac]);
            }
        }
        files.push(["avs2pipemod", this.path.avs2pipemod]);
        if (this.param.cs) {
            files.push(["comskip", this.path.comskip]);
        } else if (this.param.lg) {
            files.push(["logoGuillo", this.path.logoguillo]);
            files.push(["DGDecode.dll", this.path.dgdecode]);
            if(this.path.caption2ass) files.push(["Caption2Ass", this.path.caption2ass]);
            files.push(["ロゴデータ", this.temp.base + ".lgd"]);
            files.push(["ロゴパラメータ", this.temp.base + ".lgd.autoTune.param"]);
        } else if (this.param.jls) {
            files.push(["logoframe", this.path.logoframe]);
            files.push(["chapterexe", this.path.chapterexe]);
            files.push(["joinlogoscp", this.path.joinlogoscp]);
            files.push(["joinlogoscp avs", this.path.jlsavs]);
            files.push(["joinlogoscp cmd", this.path.jlscmd]);
            files.push(["ロゴデータ", this.temp.base + ".lgd"]);
        }
        if (this.param.apm) {
            files.push(["AvsPmod", this.path.avspmod]);
            files.push(["AvsPmod avs", this.path.avspmodavs]);
        }
        
        if (!acLib.existFiles(files)) return false;
        if (!acLib.existFolders(folders)) return false;
        
        acLib.cd(this.path.temppath);
        
        acLib.log("", 0);
        acLib.log(" input  : " + this.args.input, 0);
        acLib.log(" output : " + this.args.output + "." + this.preset.ext, 0);
        acLib.log(" temp   : " + this.path.temp, 0);
        acLib.log("", 0);
        
        return true;
    },
    tssplitter: function() {
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.tssplitter + "\" " + this.settings.tssplitter + " -OUT \"" + this.path.temppath.slice(0, -1) + "\" \"" + this.args.input + "\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temppath + acLib.fso.GetBaseName(this.args.input) + "_HD.ts"])) return false;
        
        if (this.settings.tssconnect) {
            var files = [this.path.temppath + acLib.fso.GetBaseName(this.args.input) + "_HD.ts"];
            var i = 1;
            while (true) {
                if (!acLib.fso.FileExists(this.path.temppath + acLib.fso.GetBaseName(this.args.input) + "_HD-" + i + ".ts")) break;
                files.push("\"" + this.path.temppath + acLib.fso.GetBaseName(this.args.input) + "_HD-" + i + ".ts\"");
                i++;
            }
            if (files.length != 1) {
                files = files.join(" ");
                
                var err = acLib.shell.Run("cmd /c \"\"" + this.path.tsconnector + "\" " + files + " \"" + this.path.temp + "_.ts\"\"", this.settings.window, true);
                if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
                if (!acLib.existFiles([this.path.temp + "_.ts"])) return false;
                this.args.input = this.path.temp + "_.ts";
                
                return true;
            }
        }
        acLib.fso.MoveFile(this.path.temppath + acLib.fso.GetBaseName(this.args.input) + "_HD.ts", this.path.temp + "_.ts");
        this.args.input = this.path.temp + "_.ts";
        
        return true;
    },
    getPid: function() {
        if (acLib.fso.FileExists(this.args.input + ".err")) {
            var err = acLib.readFile(this.args.input + ".err", "Shift-JIS");
            if (err) {
                err = err.split("\r\n");
                for (var i = 0; i < err.length; i++) {
                    if (err[i].indexOf("MPEG2 AAC") != -1) {
                        var total = parseInt(err[i].split(/( |Total:)/)[2]);
                        if (!apid || (atotal < 25000 && total > 25000)) {
                            var apid = err[i].split(/( |PID:|0x0*)/)[0];
                            var atotal = total;
                        }
                    } else if (err[i].indexOf("MPEG2 VIDEO") != -1) {
                        var total = parseInt(err[i].split(/( |Total:)/)[2]);
                        if (!vpid || total > vtotal) {
                            var vpid = err[i].split(/( |PID:|0x0*)/)[0];
                            var vtotal = total;
                        }
                    } else if (err[i].indexOf("PCR") != -1) {
                        var total = parseInt(err[i].split(/( |Total:)/)[2]);
                        if (!ppid || total > ptotal) {
                            var ppid = err[i].split(/( |PID:|0x0*)/)[0];
                            var ptotal = total;
                        }
                    }
                }
                if (apid) this.temp.pid.audio = apid;
                if (vpid) this.temp.pid.video = vpid;
                if (ppid) this.temp.pid.pcr = ppid;
            }
        }
        
        return true;
    },
    dgindex: function() {
        var files = [this.path.temp + ".d2v"];
        if (!this.param.cm) files.push(this.path.temp + ".avs");
        if (this.param.t2a) {
            var param = "-om 0";
            if (!this.param.cm) {
                if (!acLib.copyFile(this.args.avs, this.path.temp + ".avs")) return false;
                if (!acLib.replaceFile(this.path.temp + ".avs", "Shift-JIS", "Shift-JIS", ["__vid__", this.path.temp + ".d2v"])) return false;
            }
        } else {
            var param = "-om 1";
            if (!this.param.cm) {
                param += " -at \"" + this.args.avs + "\"";
            }
            files.push(this.path.temp + "*.aac");
        }
        
        if (this.temp.pid.audio) param += " -ap " + this.temp.pid.audio;
        if (this.temp.pid.video) param += " -vp " + this.temp.pid.video;
        if (this.temp.pid.pcr) param += " -pp " + this.temp.pid.pcr;
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.dgindex + "\" -i \"" + this.args.input + "\" -o \"" + this.path.temp + "\" " + this.settings.dgindex + " " + param + " -exit -minimize\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles(files)) return false;
        
        return true;
    },
    dgindexnv: function() {
        var files = [this.path.temp + ".dgi"];
        if (!this.param.cm) files.push(this.path.temp + ".avs");
        if (this.param.t2a) {
            var param = "";
            if (!this.param.cm) {
                if (!acLib.copyFile(this.args.avs, this.path.temp + ".avs")) return false;
                if (!acLib.replaceFile(this.path.temp + ".avs", "Shift-JIS", "Shift-JIS", ["__vid__", this.path.temp + ".dgi"])) return false;
            }
        } else {
            var param = "-a";
            if (!this.param.cm) {
                param += " -at \"" + this.args.avs + "\"";
            }
            files.push(this.path.temp + "*.aac");
        }
        if (this.temp.pid.video) param += " -v " + this.temp.pid.video;
        if (this.temp.pid.pcr) param += " -p " + this.temp.pid.pcr;
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.dgindexnv + "\" -i \"" + this.args.input + "\" -o \"" + this.path.temp + ".dgi\" -h " + param + "\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles(files)) return false;
        
        return true;
    },
    getAac: function() {
        var objEnum = new Enumerator(acLib.fso.GetFolder(this.path.temppath).Files);
        var reg = new RegExp(this.path.tempfile + ".*\\.aac");
        while (!objEnum.atEnd()) {
            if (acLib.fso.GetFileName(objEnum.item()).match(reg)) {
                var aac = String(objEnum.item());
                var info = aac.split(/( |ms|\.)/);
                for (var i = 0; i < info.length; i++) {
                    if (info[i].match(/DELAY/i)) {
                        var delay = info[i + 1];
                        break;
                    }
                }
                if (delay) break;
            }
            objEnum.moveNext();
        }
        if (!aac || !delay) {
            acLib.log("aacファイルの情報を取得出来ませんでした", 1);
            return false;
        }
        this.temp.aac = aac;
        this.temp.delay = parseInt(delay);
        
        return true;
    },
    ts2aac: function() {
        var param = "";
        if (this.temp.pid.video) param += " -v 0x" + this.temp.pid.video;
        if (this.temp.pid.audio) param += " -a 0x" + this.temp.pid.audio;
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.ts2aac + "\" -i \"" + this.args.input + "\" -o \"" + this.path.temp + "\"" + param + " -B > \"" + this.path.temp + ".ts2aac.txt\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + "*.aac"])) return false;
        
        var t2aout = acLib.readFile(this.path.temp + ".ts2aac.txt", "Shift-JIS");
        if (!t2aout) return false;
        t2aout = t2aout.split("\r\n");
        
        for (var i = 0; i < t2aout.length; i++) {
            if (t2aout[i].indexOf("outfile:") != -1) {
                var aac = t2aout[i].split("outfile:").join("");
                continue;
            }
            if (t2aout[i].indexOf("ディレイ") != -1) {
                var delay = t2aout[i].split(/(:|ms)/)[3];
                continue;
            }
        }
        
        if (!aac || !delay) {
            acLib.log("ts2aacの出力情報を取得出来ませんでした", 1);
            return false;
        }
        this.temp.aac = aac;
        this.temp.delay = parseInt(delay);
        
        if (!this.param.cm) {
            if (!acLib.replaceFile(this.path.temp + ".avs", "Shift-JIS", "Shift-JIS", ["__aud__", this.temp.aac, "__del__", this.temp.delay / 1000])) return false;
        }
        
        return true;
    },
    preTrim: function() {
        if (acLib.fso.FileExists(this.args.input + ".avs")) {
            if (this.param.cm) {
                if (!acLib.deleteFile(this.args.input + ".avs")) return false;
                return true;
            }
            var avs = acLib.readFile(this.args.input + ".avs", "Shift-JIS");
            if (!avs) return false;
            avs = avs.split("\r\n");
            
            for (var i = 0; i < avs.length; i++) {
                if (avs[i].match(/^#/)) continue;
                if (avs[i].match(/trim/i)) return true;
            }
            if (!acLib.deleteFile(this.args.input + ".avs")) return false;
        }
        
        return true;
    },
    comskip: function() {
        if (acLib.fso.FileExists(this.args.input + ".avs")) return true;
        
        var param = "";
        if (acLib.fso.FileExists(this.temp.base + ".ini")) {
            param += "--ini=\"" + this.temp.base + ".ini\" ";
        } else if (acLib.fso.FileExists(this.path.comskipini)) {
            param += "--ini=\"" + this.path.comskipini + "\" ";
        }
        
        if (acLib.fso.FileExists(this.temp.base + ".logo.txt")) {
            param += "--logo=\"" + this.temp.base + ".logo.txt\" ";
        }
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.comskip + "\" -t \"" + this.args.input + "\" " + param + "\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.args.input + ".avs"])) return false;
        
        return true;
    },
    logoguillo: function() {
        if (acLib.fso.FileExists(this.args.input + ".avs")) return true;
        
        if (this.param.nv) {
            var err = acLib.shell.Run("cmd /c \"\"" + this.path.dgindex + "\" -i \"" + this.args.input + "\" -o \"" + this.path.temp + "\" " + this.settings.dgindex + " -om 0\"", this.settings.window, true);
            if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
            if (!acLib.existFiles([this.path.temp + ".d2v"])) return false;
        }
        
        if (this.path.caption2ass) {
            var err = acLib.shell.Run("cmd /c \"\"" + this.path.caption2ass + "\" -format srt \"" + this.args.input + "\" \"" + this.temp.base + ".srt\"\"", this.settings.window, true);
            if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        }
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.logoguillo + "\" -video \"" + this.path.temp + ".d2v\" -lgd \"" +
            this.temp.base + ".lgd\" -avs2x \"" + this.path.avs2pipemod + "\" -avsPlg \"" + this.path.dgdecode + "\" -prm \"" +
            this.temp.base + ".lgd.autoTune.param\" -out \"" + this.args.input + ".avs\" -outFmt avs " + this.settings.logoguillo + "\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.args.input + ".avs"])) return false;
        
        return true;
    },
    joinlogoscp: function() {
        if (acLib.fso.FileExists(this.args.input + ".avs")) return true;
        
        if (!acLib.copyFile(this.path.jlsavs, this.path.temp + ".jls.avs")) return false;
        if (!acLib.replaceFile(this.path.temp + ".jls.avs", "Shift-JIS", "Shift-JIS", ["__ac__", acLib.acPath(), "__nv__", "nv = " + this.param.nv, "__vid__", this.path.temp + ((this.param.nv) ? ".dgi" : ".d2v"), "__aud__", this.temp.aac, "__del__", this.temp.delay / 1000])) return false;
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.logoframe + "\" \"" + this.path.temp + ".jls.avs\" -logo \"" + this.temp.base + ".lgd\" -oa \"" + this.path.temp + ".logoframe.txt\" " + this.settings.logoframe + "\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + ".logoframe.txt"])) return false;
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.chapterexe + "\" -v \"" + this.path.temp + ".jls.avs\" -o \"" + this.path.temp + ".chapterexe.txt\" " + this.settings.chapterexe + "\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + ".chapterexe.txt"])) return false;
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.joinlogoscp + "\" -inlogo \"" + this.path.temp + ".logoframe.txt\" -inscp \"" + this.path.temp + ".chapterexe.txt\" -incmd \"" + this.path.jlscmd + "\" -o \"" + this.args.input + ".avs\" " + this.settings.joinlogoscp + "\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.args.input + ".avs"])) return false;
        
        return true;
    },
    avspmod: function() {
        var trim = "";
        if (acLib.fso.FileExists(this.args.input + ".avs")) {
            var avs = acLib.readFile(this.args.input + ".avs", "Shift-JIS");
            if (!avs) return false;
            avs = avs.split("\r\n");
            
            for (var i = 0; i < avs.length; i++) {
                if (avs[i].match(/^#/)) continue;
                if (avs[i].match(/trim/i)) {
                    trim = avs[i];
                    break;
                }
            }
        }
        
        if (!acLib.copyFile(this.path.avspmodavs, this.path.temp + ".avspmod.avs")) return false;
        if (!acLib.replaceFile(this.path.temp + ".avspmod.avs", "Shift-JIS", "Shift-JIS", ["__ac__", acLib.acPath(), "__nv__", "nv = " + this.param.nv, "__vid__", this.path.temp + ((this.param.nv) ? ".dgi" : ".d2v"), "__aud__", this.temp.aac, "__del__", this.temp.delay / 1000, "__trim__", trim])) return false;
        
        acLib.shell.Run("cmd /c \"\"" + this.path.avspmod + "\" \"" + this.path.temp + ".avspmod.avs" + "\"\"", this.settings.window, true);
        if (!acLib.copyFile(this.path.temp + ".avspmod.avs", this.args.input + ".avs")) return false;
        
        return true;
    },
    getTrim: function() {
        if (acLib.fso.FileExists(this.args.input + ".avs")) {
            var avs = acLib.readFile(this.args.input + ".avs", "Shift-JIS");
            if (!avs) return false;
            avs = avs.split("\r\n");
            
            for (var i = 0; i < avs.length; i++) {
                if (avs[i].match(/^#/)) continue;
                if (avs[i].match(/trim/i)) {
                    var trim = avs[i];
                    break;
                }
            }
            if (!trim) {
                acLib.log("Trim情報を取得出来ませんでした", 1);
                return false;
            }
            
            trim = trim.split(" ").join("").split(/(\(|\)|,|\+\+)/);
            this.temp.trim.str = [];
            for (var i = 0; i < trim.length - 2; i++) {
                if (trim[i].match(/trim/i)) {
                    this.temp.trim.arr[0].push(trim[i + 1]);
                    this.temp.trim.arr[1].push(trim[i + 2]);
                    this.temp.trim.str.push("trim(" + trim[i + 1] + "," + trim[i + 2] + ")");
                    i += 2;
                }
            }
            if (this.temp.trim.arr.length == 0) {
                acLib.log("Trim情報を取得出来ませんでした", 1);
                return false;
            }
            this.temp.trim.str = this.temp.trim.str.join(" ++ ");
        }
        if (!this.param.cut) {
            if (!acLib.replaceFile(this.path.temp + ".avs", "Shift-JIS", "Shift-JIS", ["__ac__", acLib.acPath(), "__trim__", this.temp.trim.str])) return false;
        }
        
        return true;
    },
    caption2ass: function() {
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.caption2ass + "\" -format srt \"" + this.args.input + "\" \"" + this.path.temp + (this.temp.trim.arr.length == 0 ? ".srt" : "_.srt") + "\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.fso.FileExists(this.path.temp + (this.temp.trim.arr.length == 0 ? ".srt" : "_.srt"))) {
            acLib.log("srt字幕ファイルが存在しないためスキップします");
            this.param.c2a = false;
            return true;
        }
        
        if (this.temp.trim.arr.length != 0) {
            var err = acLib.shell.Run("cscript //nologo \"" + acLib.acPath() + "Script\\srtTrim.js\" -i \"" + this.path.temp + "_.srt\" -a \"" + this.args.input + ".avs\" -o \"" + this.path.temp + ".srt\" -e", this.settings.window, true);
            if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
            if (!acLib.existFiles([this.path.temp + ".srt"])) return false;
        }
        
        return true;
    },
    autovfr: function() {
        if (!acLib.copyFile(this.path.autovfravs, this.path.temp + ".autovfr.avs")) return false;
        if (!acLib.replaceFile(this.path.temp + ".autovfr.avs", "Shift-JIS", "Shift-JIS", ["__ac__", acLib.acPath(), "__nv__", "nv = " + this.param.nv, "__trim__", this.temp.trim.str, "__vid__", this.path.temp + ((this.param.nv) ? ".dgi" : ".d2v"), "__vfr__", this.path.temp + ".autovfr.txt"])) return false;
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.avs2pipemod + "\" -benchmark \"" + this.path.temp + ".autovfr.avs\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + ".autovfr.txt"])) return false;
        
        var param = "";
        if (acLib.fso.FileExists(this.path.autovfrini)) {
            param += "-ini \"" + this.path.autovfrini + "\"";
        }
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.autovfr + "\" -i \"" + this.path.temp + ".autovfr.txt\" -o \"" + this.path.temp + ".def\" " + param + " " + this.settings.autovfr +"\"");
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        WScript.Sleep(1000);
        if (!acLib.existFiles([this.path.temp + ".def"])) return false;
        
        if (!acLib.replaceFile(this.path.temp + ".avs", "Shift-JIS", "Shift-JIS", ["__def__", this.path.temp + ".def", "__tmc__", this.path.temp + ".tmc"])) return false;
        
        return true;
    },
    neroaacenc: function() {
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.avs2pipemod + "\" -wav \"" + this.path.temp + ".avs\" | \"" + this.path.neroaacenc + "\" " + this.settings.neroaacenc + " -if - -of \"" + this.path.temp + ".aac\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + ".aac"])) return false;
        
        return true;
    },
    fawcl: function() {
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.avs2pipemod + "\" -wav \"" + this.path.temp + ".avs\" > \"" + this.path.temp + ".wav\"&\"" + this.path.fawcl + "\" \"" + this.path.temp +  ".wav\" \"" + this.path.temp + ".aac\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + ".aac"])) return false;
        
        return true;
    },
    wav: function() {
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.avs2pipemod + "\" -wav \"" + this.path.temp + ".avs\" > \"" + this.path.temp + ".wav\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + ".wav"])) return false;
        
        return true;
    },
    encode:function() {
        var ext = "";
        var type = "-y4mp";
        var enc = this.preset.enc;
        var opt = this.preset.opt;
        switch (this.preset.type) {
            case 0:
            case 1:
                ext = ".h264";
                break;
            case 2:
                ext = "." + this.preset.ext;
                break;
        }
        
        
        if (opt.indexOf("<rawvideo>") != -1) {
            opt = opt.split("<rawvideo>").join("");
            type = "-rawvideo";
            acLib.shell.Run("cmd /c \"\"" + this.path.avs2pipemod + "\" -x264raw \"" + this.path.temp + ".avs\" > \"" + this.path.temp + ".pipe.txt\"\"", this.settings.window, true);
            var pipe = acLib.readFile(this.path.temp + ".pipe.txt" ,"Shift-JIS").split("\r\n")[0];
            pipe = pipe.split(" ");
            for(var i = 0; i < pipe.length; i++) {
                switch (pipe[i]) {
                    case "--input-csp":
                        opt = opt.split("<csp>").join(pipe[++i]);
                        break;
                    case "--input-depth":
                        opt = opt.split("<depth>").join(pipe[++i]);
                        break;
                    case "--input-res":
                        var res = pipe[++i].split("x");
                        opt = opt.split("<width>").join(res[0]);
                        opt = opt.split("<height>").join(res[1]);
                        break;
                    case "--frames":
                        opt = opt.split("<frames>").join(pipe[++i]);
                        break;
                    case "--fps":
                        var fps = pipe[++i].split("/");
                        opt = opt.split("<fpsnum>").join(fps[0]);
                        opt = opt.split("<fpsden>").join(fps[1]);
                        break;
                }
            }
        }
        opt = opt.split("<video>").join("-");
        opt = opt.split("<audio>").join("\"" + this.path.temp + ".wav\"");
        opt = opt.split("<output>").join("\"" + this.path.temp + ext + "\"");
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.avs2pipemod + "\" " + type + " \"" + this.path.temp + ".avs\" | \"" + enc + "\" " + opt + "\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + ext])) return false;
        
        return true;
    },
    mp4box: function() {
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.mp4box + "\" -add \"" + this.path.temp + ".h264\" -add \"" + this.path.temp + ".aac\"" + (this.param.c2a ? " -add \"" + this.path.temp + ".srt\"" : "") + " -new \"" + this.path.temp + "." + this.preset.ext + "\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + "." + this.preset.ext])) return false;
        
        return true;
    },
    tc2mp4mod: function() {
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.tc2mp4mod + "\" -i \"" + this.path.temp + ".h264\" -o \"" + this.path.temp + "." + this.preset.ext + "\" -t \"" + this.path.temp + ".tmc" + "\" -L \"" + this.path.mp4box + "\" -s \"" + this.path.temp + ".aac\"" + (this.param.c2a ? " -O \" -add \"" + this.path.temp + ".srt\"\"" : "") + "\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + "." + this.preset.ext])) return false;
        
        return true;
    },
    tscut: function() {
        if (this.temp.trim.arr.length == 0) {
            acLib.log("Trim情報がありません", 1);
            return false;
        }
        var trim = [];
        for (var i = 0; i < this.temp.trim.arr.length; i++) {
            var sec = Math.round(this.temp.trim.arr[i] / (30000/1001));
            if (sec == 0) sec = 1;
            
            if (trim.length > 0 && Math.abs(sec - trim[trim.length - 1]) <= 1) {
                trim.pop();
            } else {
                trim.push(sec);
            }
        }
        if (trim.length == 0) {
            acLib.log("Trim情報が短すぎます", 1);
            return false;
        }
        
        for (var i = 0; i < trim.length; i++) {
            var time = [];
            var sec = trim[i];
            time.push(("0" + String(sec % 60)).slice(-2));
            sec = Math.floor(sec / 60);
            time.push(("0" + String(sec % 60)).slice(-2));
            sec = Math.floor(sec / 60);
            time.push(("0" + String(sec)).slice(-2));
            time.reverse();
            trim[i] = time.join(":");
        }
        var cut = trim.join(",");
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.tssplitter + "\" " + this.settings.tssplitter + " -OUT \"" + this.path.temppath.slice(0, -1) + "\" -CUT" + cut + " \"" + this.args.input + "\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        
        var files = [];
        for (var i = 0; i < trim.length / 2; i++) {
            if (!acLib.existFiles([this.path.temppath + acLib.fso.GetBaseName(this.args.input) + "_HD-" + ((i * 2) + 1) + ".ts"])) return false;
            files.push("\"" + this.path.temppath + acLib.fso.GetBaseName(this.args.input) + "_HD-" + ((i * 2) + 1) + ".ts\"");
        }
        files = files.join(" ");
        
        var err = acLib.shell.Run("cmd /c \"\"" + this.path.tsconnector + "\" " + files + " \"" + this.path.temp + "." + this.preset.ext + "\"\"", this.settings.window, true);
        if (!acLib.checkErr(parseInt(err), [-1073741510])) return false;
        if (!acLib.existFiles([this.path.temp + "." + this.preset.ext])) return false;
        
        acLib.shell.Run("cmd /c \"del /q \"" + this.path.temppath + acLib.fso.GetBaseName(this.args.input) + "_*.ts\"\"", this.settings.window, true);
        
        return true;
    },
    transfer: function() {
        if (acLib.fso.FileExists(this.args.output + "." + this.preset.ext)) {
            this.args.output += "_" + this.path.tempfile;
        }
        
        if (!acLib.copyFile(this.path.temp + "." + this.preset.ext, this.args.output + "." + this.preset.ext)) return false;
        if (!acLib.existFiles([this.args.output + "." + this.preset.ext])) return false;
        
        return true;
    },
    clean: function() {
        acLib.shell.Run("cmd /c \"del /q \"" + this.path.temp + "*.*\"\"", this.settings.window, true);
        
        var files = [this.temp.base + ".log", this.temp.base + ".logo.txt", this.temp.base + ".txt", this.temp.base + ".ini", this.args.input + ".txt", this.temp.base + ".lgd", this.temp.base + ".lgd.autoTune.param", this.temp.base + ".logoframe.txt"];
        for (var i = 0; i < files.length; i++) {
            if (acLib.fso.FileExists(files[i])) {
                if (!acLib.deleteFile(files[i])) return false;
            }
        }
        
        return true;
    }
}
