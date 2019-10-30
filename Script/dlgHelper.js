import System;
import System.Windows.Forms;

var type : int = 0;
var dest : String = "";
var filter: String = "";

var args : String[] = Environment.GetCommandLineArgs();

for (var i : int = 0; i < args.length; i++) {
    if (i == args.length - 1) {
        var opt : String[] = ["-t", "-d", "-f"];
        for (var j : int = 0; j < opt.length; j++) {
            if (args[i] == opt[j]) throw "Nothing Next.";
        }
    }
    switch (args[i]) {
        case "-t":
            type = int(args[++i]);
            break;
        case "-d":
            dest = String(args[++i]);
            break;
        case "-f":
            filter = String(args[++i]);
            break;
    }
}

if (type == 2) {
    var fbd : FolderBrowserDialog = new FolderBrowserDialog();
    fbd.SelectedPath = dest;
    fbd.Description = "Select a folder";
    if (fbd.ShowDialog() == DialogResult.OK) {
        Console.WriteLine(fbd.SelectedPath);
    }
} else {
    var ofd : OpenFileDialog = new OpenFileDialog();
    ofd.Multiselect = (type == 1) ? true : false;
    ofd.InitialDirectory = dest;
    ofd.FileName = "";
    ofd.Filter = filter;
    if (ofd.ShowDialog() == DialogResult.OK) {
        Console.WriteLine(String.Join("\t", ofd.FileNames));
    }
}