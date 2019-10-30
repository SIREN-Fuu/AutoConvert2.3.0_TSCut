(function() {
    acModel = {
        ac: {
            "path": {
                "temppath": "string",
                "dgindex": "string",
                "dgindexnv": "string",
                "ts2aac": "string",
                "comskip": "string",
                "comskipini": "string",
                "caption2ass": "string",
                "logoguillo": "string",
                "dgdecode": "string",
                "logoframe": "string",
                "chapterexe": "string",
                "joinlogoscp": "string",
                "jlsavs": "string",
                "jlscmd": "string",
                "avspmod": "string",
                "avspmodavs": "string",
                "autovfr": "string",
                "autovfrini": "string",
                "autovfravs": "string",
                "avs2pipemod": "string",
                "neroaacenc": "string",
                "fawcl": "string",
                "tssplitter": "string",
                "tsconnector": "string",
                "mp4box": "string",
                "tc2mp4mod": "string"
            },
            "settings": {
                "dgindex": "string",
                "neroaacenc": "string",
                "tssplitter": "string",
                "logoguillo": "string",
                "logoframe": "string",
                "chapterexe": "string",
                "joinlogoscp": "string",
                "autovfr": "string",
                "mintrim": "number",
                "window": "number",
                "failurepause": "boolean",
                "tssconnect": "boolean"
            }
        },
        acu: {
            "path": {
                "output": "string",
                "move": "string",
                "rplsinfo": "string",
                "screname": "string"
            },
            "settings": {
                "move": "boolean",
                "rplsinfo": "boolean",
                "edcb": "boolean",
                "screname": "boolean",
                "ignoreErr": "boolean",
                "autoRetry": "boolean",
                "replace": [
                    ["string", "string"]
                ],
                "ep": [
                    ["string", "string"]
                ]
            },
            "param": {
                "avs": "string",
                "preset": "string",
                "cm": "boolean",
                "cut": "boolean",
                "tss": "boolean",
                "nv": "boolean",
                "t2a": "boolean",
                "cs": "boolean",
                "lg": "boolean",
                "jls": "boolean",
                "apm": "boolean",
                "c2a": "boolean",
                "av": "boolean",
                "faw": "boolean"
            },
            "name": {
                "file": {
                    "normal": "string",
                    "rplsinfo": "string",
                    "edcb": "string",
                    "screname": "string"
                },
                "dir": {
                    "base": "string",
                    "normal": "string",
                    "rplsinfo": "string",
                    "edcb": "string",
                    "screname": "string"
                }
                
            }
        },
        detect: {
            "name": "string",
            "service": "string",
            "program": "string",
            "file": "string",
            "dir": "string",
            "param": {
                "avs": "string",
                "preset": "string",
                "cm": "boolean",
                "cut": "boolean",
                "tss": "boolean",
                "nv": "boolean",
                "t2a": "boolean",
                "cs": "boolean",
                "lg": "boolean",
                "jls": "boolean",
                "apm": "boolean",
                "c2a": "boolean",
                "av": "boolean",
                "faw": "boolean"
            },
            "level": {
                "avs": "number",
                "preset": "number",
                "cm": "number",
                "cut": "number",
                "tss": "number",
                "nv": "number",
                "t2a": "number",
                "cs": "number",
                "lg": "number",
                "jls": "number",
                "apm": "number",
                "c2a": "number",
                "av": "number",
                "faw": "number"
            }
        },
        preset: {
            "type": "number",
            "ext": "string",
            "enc": "string",
            "opt": "string"
        }
    };
})();
