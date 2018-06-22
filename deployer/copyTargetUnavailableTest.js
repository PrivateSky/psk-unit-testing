require("../../../engine/core").enableTesting();
var fs = require("fs");
var fsm = require("../../../libraries/utils/FileStateManager.js");
var fileStateManager = fsm.getFileStateManager();
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = $$.requireModule("double-check").assert;

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummySrcDir = path.join(testWorkspaceDir, "copy-source");
var dummyTargetDir = path.join(testWorkspaceDir, "copy-destination");
var dependencyName = "/";


var f = $$.flow.create("copyTargetUnavailableTest", {
    start:function(end) {
        this.end = end;
        this.beforeExecution();
        this.act();
    },

    beforeExecution:function() {
        this.configObject = {
            "dependencies": [
                {
                    "name": dependencyName,
                    "src": dummySrcDir,
                    "actions": [{
                        "type": "copy",
                        "target": dummyTargetDir
                    }]
                }
            ]
        };
        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(dummySrcDir);
        fsExt.createFile(`${dummySrcDir}/file1.js`, "alert('test1')!");
        fsExt.createDir(`${dummySrcDir}/sub-dir`);
        fsExt.createFile(`${dummySrcDir}/sub-dir/file2.js`, "alert('test2')!");
    },

    act:function() {
        $$.callflow.start("deployer.Deployer").run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        assert.notNull(result, "Result should not be null!");
        assert.isNull(error, "Should not be any errors!");
        let targetPath = fsExt.resolvePath(dummyTargetDir)
        assert.true(fs.existsSync(targetPath), `[FAIL] Target directory was not created `);
        this.end();
    }
});

assert.callback("copyTargetUnavailableTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});
