process.env.DEPLOYER_DEBUG = true;
require("../../../engine/core").enableTesting();
var fs = require("fs");

const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
var fsm = $$.requireLibrary("utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();
const assert = $$.requireModule("double-check").assert;

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummySrcDir = path.join(testWorkspaceDir, "./copy-source");
var dummyTargetDir = path.join(testWorkspaceDir, "./copy-destination");
var dependencyName = "file1.js";



var f = $$.flow.create("copyFileActionOptionOverrideTest", {
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
                    "src": `${dummySrcDir}`,
                    "actions": [{
                        "type": "copy",
                        "target": dummyTargetDir,
                        "options": {
                            "overwrite": false
                        }
                    }]
                }
            ]
        };

        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(dummySrcDir);
        fsExt.createDir(dummyTargetDir);
        fsExt.createFile(`${dummySrcDir}/file1.js`, "alert('test')!");
        this.sourceChecksum = fsExt.checksum(`${dummySrcDir}/file1.js`);
        fsExt.createFile(`${dummyTargetDir}/file1.js`, "alert('test-edited')!");
        this.destinationChecksum = fsExt.checksum(`${dummyTargetDir}/file1.js`);
    },
    act:function() {
        $$.callflow.start("deployer.Deployer").run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        console.log(`${dummySrcDir} +/file1.js`)
        assert.notNull(result, "Result should not be null!");
        assert.isNull(error, "Should not be any errors!");
        let targetPath = fsExt.resolvePath(dummyTargetDir + "/" + dependencyName);
        assert.false(this.destinationChecksum == this.sourceChecksum , `[FAIL] Dependency "${targetPath}" was overwritten!`);
        this.end();
    }
});
assert.callback("copyFileActionTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});


