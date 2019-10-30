(function() {
    acLib = {
        shell: new ActiveXObject("WScript.Shell"),
        fso: new ActiveXObject("Scripting.FileSystemObject"),
        ado: new ActiveXObject("ADODB.Stream"),
        
        param: {
            avs: [],
            preset: [],
            cm: ["cut", "c2a", "av", "faw"],
            cut: ["cm", "nv", "t2a", "c2a", "av", "faw"],
            tss: [],
            nv: ["cut"],
            t2a: ["cut"],
            cs: ["lg", "jls"],
            lg: ["cs", "jls"],
            jls: ["cs", "lg"],
            apm: [],
            c2a: ["cm", "cut"],
            av: ["cm", "cut"],
            faw: ["cm", "cut"]
        },
        
        existFiles: function(files) {
            if (!acLib.checkArgs([files])) return false;
            for (var i = 0; i < files.length; i++) {
                if (files[i] instanceof Array) {
                    var name = files[i][0];
                    var file = files[i][1];
                } else {
                    var name = "ファイル";
                    var file = files[i];
                }
                if (file.indexOf("*", 0) == -1) {
                    if (!acLib.fso.FileExists(file)) {
                        acLib.log(name + " \"" + file + "\" が存在しません", 1);
                        return false;
                    }
                } else {
                    var objEnum = new Enumerator(acLib.fso.GetFolder(acLib.fso.GetParentFolderName(file)).Files);
                    var reg = new RegExp(acLib.fso.GetFileName(file).split(".").join("\\.").split("*").join(".*"));
                    while (!objEnum.atEnd()) {
                        if (acLib.fso.GetFileName(objEnum.item()).match(reg)) return true;
                        objEnum.moveNext();
                    }
                    acLib.log(name + " \"" + file + "\" が存在しません", 1);
                    return false;
                }
            }
            return true;
        },
        existFolders: function(folders) {
            if (!acLib.checkArgs([folders])) return false;
            for (var i = 0; i < folders.length; i++) {
                if (!acLib.fso.FolderExists(folders[i])) {
                    acLib.log("フォルダ \"" + folders[i] + "\" が存在しません", 1);
                    return false;
                }
            }
            return true;
        },
        copyFile: function(source, dest) {
            if (!acLib.checkArgs([source, dest])) return false;
            try {
                acLib.fso.CopyFile(source, dest);
            } catch(e) {
                acLib.log("\"" + source +  "\" のコピーに失敗しました", 1);
                return false;
            }
            return true;
        },
        moveFile: function(source, dest) {
            if (!acLib.checkArgs([source, dest])) return false;
            try {
                acLib.fso.MoveFile(source, dest);
            } catch(e) {
                acLib.log("\"" + source +  "\" の移動に失敗しました", 1);
                return false;
            }
            return true;
        },
        deleteFile: function(file) {
            if (!acLib.checkArgs([file])) return false;
            try {
                acLib.fso.DeleteFile(file)
            } catch(e) {
                acLib.log("\"" + file +  "\" の削除に失敗しました", 1);
                return false;
            }
            return true;
        },
        createFolder: function(path, folder) {
            folder = folder.split("\\");
            for (var i = 0; i < folder.length; i++) {
                path += folder[i] + "\\";
                if (!acLib.fso.FolderExists(path) && folder[i]) {
                    try {
                        acLib.fso.CreateFolder(path);
                    } catch(e) {
                        acLib.log("フォルダが作成できませんでした", 1);
                        return false;
                    }
                }
            }
            return true;
        },
        replaceFile: function(file, rChar, wChar, replace) {
            if (!acLib.checkArgs([file, rChar, wChar, replace])) return false;
            var str = acLib.readFile(file, rChar);
            if (!str) return false; 
            for (var i = 0; i < replace.length; i += 2) {
                str = str.split(replace[i]).join(replace[i + 1]);
            }
            if (!acLib.writeFile(file, wChar, str)) return false; 
            
            return true;
        },
        readFile: function(file, rChar) {
            if (!acLib.checkArgs([file, rChar])) return false;
            try {
                acLib.ado.Type = 2;
                acLib.ado.Charset = rChar;
                acLib.ado.Open();
                acLib.ado.LoadFromFile(file);
                var str = acLib.ado.ReadText();
                acLib.ado.Close();
            } catch(e) {
                acLib.log("\"" + file +  "\" の読み込みに失敗しました", 1);
                return false;
            }
            if (!str) {
                acLib.log("\"" + file +  "\" の内容がありません", 1);
                return false;
            }
            return str;
        },
        writeFile: function(file, wChar, str) {
            if (!acLib.checkArgs([file, wChar, str])) return false;
            try {
                acLib.ado.Type = 2;
                acLib.ado.Charset = wChar;
                acLib.ado.Open();
                acLib.ado.WriteText(str);
                acLib.ado.SaveToFile(file, 2);
                acLib.ado.Close();
            } catch(e) {
                acLib.log("\"" + file +  "\" の書き込みに失敗しました", 1);
                return false;
            }
            return true;
        },
        loadSetting: function(path) {
            var settings = acLib.readFile(path, "Shift-JIS");
            if (!settings) return false;
            try {
                settings = eval("(" + settings + ")");
            } catch(e) {
                acLib.log("\"" + path +  "\" は正常な設定ファイルではありません", 1);
                return false;
            }
            return settings;
        },
        replace: function(str, org, dest) {
            if (!acLib.checkArgs([str, org, dest])) return "";
            return str.split(org).join(dest);
        },
        toHalf: function(str) {
            return str.replace(/[！-～]/g, function(s) {
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            }).split("　").join(" ");
        },
        toFull: function(str) {
            return str.replace(/[\!-\~]/g, function(s) {
                return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
            }).split(" ").join("　");
        },
        toSource: function(obj, mode) {
            var source = (function(obj) {
                switch (typeof obj) {
                    case "undefined":
                        return "undefined";
                        break;
                    case "object":
                        var source = [];
                        if (!obj) {
                            return "null";
                        } else if (obj instanceof Date) {
                            return "new Date(" + obj.valueOf() + ")";
                        } else if (obj instanceof Array) {
                            for (var i = 0; i < obj.length; i++) {
                                source[i] = arguments.callee(obj[i]);
                            }
                            source = source.join(",\r\n");
                            return "[\r\n" + source + "\r\n]";
                        } else {
                            for (var prop in obj){
                                if (!obj.hasOwnProperty(prop)) continue;
                                source[source.length] = arguments.callee(prop) + ": " + arguments.callee(obj[prop]);
                            }
                            source = source.join(",\r\n");
                            return "{\r\n" + source + "\r\n}";
                        }
                        break;
                    case "string":
                        return "\"" + obj.toString().replace(/[\\"']/g, function(rep){ return "\\" + rep }).split("\r").join("\\r").split("\n").join("\\n") + "\"";
                        break;
                    default:
                        return obj.toString();
                        break;
                }
            })(obj);
            if (mode) {
                source = source.split("\r\n");
                var level = 0;
                for (var i = 0; i < source.length; i++) {
                    if (source[i].match(/^[}\]]/)) level--;
                    source[i] = new Array(level + 1).join("    ") + source[i];
                    if (source[i].match(/[{\[]$/)) level++;
                }
                source = source.join("\r\n");
                return source;
            } else {
                return source.split("\r\n").join("");
            }
            return "";
        },
        clone: function(obj) {
            var clone = obj instanceof Array ? [] : {};
            for (var key in obj) {
                var prop = obj[key];
                if (typeof prop == "object") {
                    if (prop instanceof Array) {
                        clone[key] = [];
                        for (var i = 0; i < prop.length; i++) {
                            if (typeof prop[i] != "object") {
                                clone[key].push(prop[i]);
                            } else {
                                clone[key].push(this.clone(prop[i]));
                            }
                        }
                    } else {
                        clone[key] = this.clone(prop);
                    }
                } else {
                    clone[key] = prop;
                }
            }
            return clone;
        },
        escapePath: function(name) {
            return name.replace(/([/\?\*:\|"<>])/g, acLib.toFull);
        },
        acPath: function() {
            return acLib.fso.GetParentFolderName(WScript.ScriptFullName.split(WScript.ScriptName).join("")) + "\\";
        },
        checkErr: function(err, code) {
            if (!acLib.checkArgs([err, code])) return false;
            for (var i = 0; i < code.length; i++) {
                if (err == code[i]) {
                    acLib.log("エラーが発生しました", 1);
                    return false;
                }
            }
            return true;
        },
        checkArgs: function(arg) {
            for (var i = 0; i < arg.length; i++) {
                if (typeof arg[i] === "undefined") {
                    acLib.log("関数の引数が足りません", 1);
                    return false;
                }
            }
            return true;
        },
        cd: function(dir) {
            if (!acLib.checkArgs([dir])) return false;
            acLib.shell.CurrentDirectory = dir;
            return true;
        },
        stdin: function(question) {
            acLib.log(question, 0);
            return WScript.StdIn.ReadLine();
        },
        confirm: function(question) {
            acLib.log(question + " (y / n)", 0);
            return (WScript.StdIn.ReadLine() == "y") ? true : false;
        },
        log: function(msg, level) {
            if (!acLib.checkArgs([msg, level])) return false;
            switch (level) {
                case 0:
                    WScript.Echo(msg);
                    break;
                case 1:
                    WScript.Echo("");
                    WScript.Echo("エラー : " + msg);
                    WScript.Sleep(10000);
                    break;
                case 2:
                    WScript.Echo("デバッグ : " + msg);
                    break;
            }
            return true;
        }
    };
})();