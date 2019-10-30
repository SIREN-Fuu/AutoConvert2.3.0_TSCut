//------------------------------------------------------------------------------------------------------------------------
//  srtTrim
//  ver 1.0.1
//  usage: cscript srtTrim.js -i input.srt -a input.avs -o output.srt -d delay(ms) -f fps -e
//------------------------------------------------------------------------------------------------------------------------

function main() {
    var args = getArguments();
    if (!args) WScript.Quit(1);
    var input = inputSrt(args[0], args[5][0], args[3], args[6]);
    if (!input) WScript.Quit(3);
    var trim = inputTrim(args[1], args[5][1]);
    if (!trim) WScript.Quit(2);
    var srt = trimSrt(input, trim, args[4]);
    if (!srt) WScript.Quit(4);
    var output = outputSrt(srt, args[2], args[5][2]);
    if (!output) WScript.Quit(5);
    log("正常に終了しました");
    WScript.Quit(0);
    return true;
}

function log(mes) {
    WScript.Echo(mes);
    WScript.Sleep(1000);
    return true;
}

function getArguments() {
    var objArgs = WScript.Arguments;
    var delay = 0;
    var fps = [30000, 1001];
    var code = ["UTF-8", "UTF-8", "UTF-8"];
    var exclude = false;
    for (var i = 0; i < objArgs.length; i++) {
        if (i == objArgs.length - 1) {
            var args = ["-i", "-a", "-d", "-f", "-c", "-o"];
            for (var j = 0; j < args.length; j++) {
                if (objArgs(i) == args[j]) {
                    log("不正な引数です");
                    return false;
                }
            }
        }
        switch (objArgs(i)) {
            case "-i":
                var input = objArgs(i + 1);
                i++;
                break;
            case "-a":
                var avs = objArgs(i + 1);
                i++;
                break;
            case "-o":
                var output = objArgs(i + 1);
                i++;
                break;
            case "-d":
                var delay = parseInt(objArgs(i + 1), 10);
                if (isNaN(delay)) {
                    log("不正なディレイです");
                    return false;
                }
                i++;
                break;
            case "-f":
                if (String(objArgs(i + 1)).indexOf("/") == -1) {
                    var fps = [parseInt(objArgs(i + 1), 10), 1];
                    if (isNaN(fps[0])) {
                        log("不正なfpsです");
                        return false;
                    }
                } else {
                    var fps = String(objArgs(i + 1)).split("/");
                    for (var j = 0; j < fps.length; j++) fps[j] = parseInt(fps[j], 10);
                    if (fps.length != 2 || isNaN(fps[0]) || isNaN(fps[1])) {
                        log("不正なfpsです");
                        return false;
                    }
                }
                i++;
                break;
            case "-c":
                var code = String(objArgs(i + 1)).split(":");
                if (code.length != 3) {
                    log("不正な文字コードです");
                    return false;
                }
                i++;
                break;
            case "-e":
                var exclude = true;
                break;
            default:
                log("不正な引数です");
                return false;
                break;
        }
    }
    if (!input || !avs || !output) {
        log("引数が足りません");
        return false;
    }
    return [input, avs, output, delay, fps, code, exclude];
}

function readFile(file, rChar) {
    try {
        var ado = new ActiveXObject("ADODB.Stream");
        ado.Type = 2;
        ado.Charset = rChar;
        ado.Open();
        ado.LoadFromFile(file);
        var str = ado.ReadText();
        ado.Close();
        ado = null;
    } catch(e) {
        log("\"" + file +  "\" の読み込みに失敗しました");
        return false;
    }
    if (!str) {
        log("\"" + file +  "\" の内容がありません");
        return false;
    }
    return str;
}

function writeFile(file, wChar, str) {
    try {
        var ado = new ActiveXObject("ADODB.Stream");
        ado.Type = 2;
        ado.Charset = wChar;
        ado.Open();
        ado.WriteText(str);
        ado.SaveToFile(file, 2);
        ado.Close();
        ado = null;
    } catch(e) {
        log("\"" + file +  "\" の書き込みに失敗しました");
        return false;
    }
    return true;
}

function inputSrt(path, code, delay, exclude) {
    var str = readFile(path, code);
    if (!str) return false;
    str = str.split("\r\n");
    var srt = [[], [], []];
    var index = 0;
    var flag = 0;
    for (var i = 0; i < str.length; i++) {
        switch (flag) {
            case 0:
                if (parseInt(str[i]) == index + 1) flag = 1;
                break;
            case 1:
                var time = str[i].split(" ").join("").split(/(:|,|-->)/);
                srt[0][index] = Date.UTC(1970, 0, 1, parseInt(time[0], 10), parseInt(time[1], 10), parseInt(time[2], 10), parseInt(time[3], 10)) + delay;
                srt[1][index] = Date.UTC(1970, 0, 1, parseInt(time[4], 10), parseInt(time[5], 10), parseInt(time[6], 10), parseInt(time[7], 10)) + delay;
                flag = 2;
                break;
            case 2:
                if (str[i]) {
                    if (exclude) {
                        str[i] = str[i].replace(/\[外:.+?\]/g, "");
                        if (!str[i]) str[i] = " ";
                    }
                    srt[2][index] = (srt[2][index]) ? srt[2][index] + "\r\n" + str[i] : str[i];
                } else {
                    index++;
                    flag = 0;
                }
                break
        }
    }
    if (index == 0) {
        log("srt に字幕 が含まれていません");
        return false;
    }
    return srt;
}

function inputTrim(path, code) {
    var str = readFile(path, code);
    if (!str) return false;
    str = str.split("\r\n");
    
    for (var i = 0; i < str.length; i++) {
        if (str[i].match(/^#/)) continue;
        if (str[i].match(/trim/i)) {
            var line = str[i];
            break;
        }
    }
    if (!line) {
        log("avs に Trim が含まれていません");
        return false;
    }
    
    var arr = line.split(" ").join("").split(/(\(|\)|,|\+\+)/);
    var trim = [[], []];
    for (var i = 0; i < arr.length - 2; i++) {
        if (arr[i].match(/trim/i)) {
            trim[0].push(arr[i + 1]);
            trim[1].push(arr[i + 2]);
            i += 2;
        }
    }
    if (trim.length == 0) {
        log("avs に Trim が含まれていません");
        return false;
    }
    return trim;
}

function trimSrt(arr, trim, fps) {
    var srt = [[], [], []];
    var offset, start, end;
    offset = start = end = 0;
    for (var i = 0; i < trim[0].length; i++) {
        start = parseInt(trim[0][i] * 1000 * fps[1] / fps[0]);
        end = parseInt(trim[1][i] * 1000 * fps[1] / fps[0]);
        var flag = 0;
        for (var j = 0; j < arr[0].length; j++) {
            if (flag == 0) {
                if (arr[0][j] >= start) {
                    srt[0].push(arr[0][j] - start + offset);
                    srt[1].push(arr[1][j] - start + offset);
                    srt[2].push(arr[2][j]);
                    flag = 1;
                } else if (arr[1][j] >= start) {
                    srt[0].push(offset);
                    srt[1].push(arr[1][j] - start + offset);
                    srt[2].push(arr[2][j]);
                    flag = 1;
                }
            } else if (flag == 1) {
                if (arr[0][j] >= end) {
                    flag = 2;
                    break;
                } else if (arr[1][j] >= end) {
                    srt[0].push(arr[0][j] - start + offset);
                    srt[1].push(end - start + offset);
                    srt[2].push(arr[2][j]);
                    flag = 2;
                    break;
                } else {
                    srt[0].push(arr[0][j] - start + offset);
                    srt[1].push(arr[1][j] - start + offset);
                    srt[2].push(arr[2][j]);
                }
            }
        }
        offset += end - start;
    }
    if (srt.length == 0) {
        log("srt の Trim 結果に 字幕 が含まれていません");
        return false;
    }
    return srt;
}

function outputSrt(arr, path, code) {
    var srt = "";
    for (var i = 0; i < arr[0].length; i++) {
        var start = new Date();
        start.setTime(arr[0][i]);
        var end = new Date();
        end.setTime(arr[1][i]);
        srt += String(i + 1) + "\r\n";
        srt += ("0" + String(start.getUTCHours())).slice(-2) + ":" + ("0" + String(start.getUTCMinutes())).slice(-2) + ":" + ("0" + String(start.getUTCSeconds())).slice(-2) + "," + ("00" + String(start.getUTCMilliseconds())).slice(-3) + " --> ";
        srt += ("0" + String(end.getUTCHours())).slice(-2) + ":" + ("0" + String(end.getUTCMinutes())).slice(-2) + ":" + ("0" + String(end.getUTCSeconds())).slice(-2) + "," + ("00" + String(end.getUTCMilliseconds())).slice(-3) + "\r\n";
        srt += arr[2][i] + "\r\n";
        srt += "\r\n";
    }
    if (!writeFile(path, code, srt)) return false;
    return true;
}

main();
