(function() {
    acHta = {
        inArray: function(elem, arr, i) {
            var len;
            if (arr) {
                len = arr.length;
                i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;
                for (; i < len; i++ ) {
                    if ( i in arr && arr[ i ] === elem ) {
                        return i;
                    }
                }
            }
            return -1;
        },
        args: function(index) {
            var args = [];
            var reg = /"([^"]+)"|([^ ]+)/g;
            var match;
            while(match = reg.exec(String(oAutoConvert.commandLine))) {
                args[args.length] = match[1] || match[2];
            }
            return args[index] || args;
        },
        browse: function(type, dest, filter) {
            if (!acLib.fso.FileExists(acLib.acPath() + "Script\\dlgHelper.lock")) {
                if (acLib.fso.FolderExists(acLib.fso.GetSpecialFolder(0).Path + "\\Microsoft.NET\\Framework\\")) {
                    var objEnum = new Enumerator(acLib.fso.GetFolder(acLib.fso.GetSpecialFolder(0).Path + "\\Microsoft.NET\\Framework\\").SubFolders);
                    while (!objEnum.atEnd()) {
                        if (acLib.fso.FileExists(objEnum.item() + "\\jsc.exe")) {
                            var jsc = objEnum.item() + "\\jsc.exe";
                        }
                        objEnum.moveNext();
                    }
                    if (jsc) acLib.shell.Run("cmd /c \"\"" + jsc + "\" /target:winexe /out:\"" + acLib.acPath() + "Script\\dlgHelper.exe\" \"" + acLib.acPath() + "Script\\dlgHelper.js\"\"", 7, true);
                }
                acLib.fso.CreateTextFile(acLib.acPath() + "Script\\dlgHelper.lock");
            }
            
            if (acLib.fso.FileExists(acLib.acPath() + "Script\\dlgHelper.exe")) {
                var out = acLib.shell.Exec(acLib.acPath() + "Script\\dlgHelper.exe -t \"" + type + "\" -d \"" + (dest.slice(-1) == "\\" ? dest.slice(0, -1) : dest) + "\" -f \"" + filter + "\"");
                var path = String(out.StdOut.ReadAll()).split("\r\n").join("");
            } else {
                switch (type) {
                    case 0:
                        var path = $("objHtmlDlgHelper").openfiledlg(((dest) ? dest + "\\*" : ""), null, null, "ファイルの選択");
                        if (!path) return "";
                        for (var i = 0; i < path.length; i++) {
                            if (path.charAt(i) == "\0") {
                                path = path.slice(0, i);
                                break;
                            }
                        }
                        break;
                    case 1:
                        var path = "";
                        var objIE = new ActiveXObject("InternetExplorer.Application");
                        objIE.Navigate("about:blank");
                        objIE.Document.open();
                        objIE.Document.write("<input id=\"file\" type=\"file\" multiple><input id=\"temp\" type\"text\">");
                        objIE.Document.close();
                        while (objIE.busy || objIE.readyState !== 4) {};
                        var file = objIE.document.getElementById("file");
                        var temp = objIE.document.getElementById("temp");
                        file.click();
                        if (file.value) {
                            file.focus();
                            file.select();
                            objIE.ExecWB(12, 0);
                            temp.focus();
                            objIE.ExecWB(13, 0);
                            path = String(temp.value).split(", ").join("\t");
                        }
                        objIE.Quit();
                        break;
                    case 2:
                        var objFolder = new ActiveXObject("Shell.Application").BrowseForFolder(0, "フォルダの選択", 0);
                        if (!objFolder || !objFolder.Items() || !objFolder.Items().Item()) return "";
                        var path = objFolder.Items().Item().Path;
                        break;
                }
            }
            return path;
        },
        addOption: function(value, text, select) {
            var option = document.createElement("option");
            option.setAttribute("value", value);
            option.appendChild(document.createTextNode(text));
            select.appendChild(option);
            return true;
        },
        resetOption: function(select) {
            for (var i = select.childNodes.length - 1; i > -1; i--) {
                if (select.childNodes[i].value == "-1") continue;
                select.removeChild(select.childNodes[i]);
            }
            return true;
        },
        getOption: function(value, select) {
            for (var i = 0; i < select.length; i++) {
                if (select.options[i].value == value) return i;
            }
            return -1;
        },
        checkPreset: function(ext) {
            var objEnum = new Enumerator(acLib.fso.GetFolder(acLib.acPath() + "Preset").Files);
            var reg = new RegExp("." + ext + "$");
            var arr = [];
            while (!objEnum.atEnd()) {
                if (acLib.fso.GetFileName(objEnum.item()).match(reg)) {
                    if (ext == "txt") {
                        try {
                            var test = eval("(" + acLib.readFile(objEnum.item(), "Shift-JIS") + ")");
                            arr.push(acLib.fso.GetBaseName(objEnum.item()));
                        } catch(e) {
                            
                        }
                    } else {
                        arr.push(acLib.fso.GetBaseName(objEnum.item()));
                    }
                }
                objEnum.moveNext();
            }
            return arr;
        }
    };
})();