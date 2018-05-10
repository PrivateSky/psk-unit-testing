require("../../../engine/core").enableTesting();
var fsm = require("../../../libraries/utils/FileStateManager");
var fileStateManager = fsm.getFileStateManager();
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("../../../modules/double-check").assert;

$$.loadLibrary("deployer", __dirname + "/../../../libraries/deployer");

const path = require("path");
var testWorkspaceDir = "./" + fsExt.guid();
var dummySrcDir = path.join(testWorkspaceDir, "copy-source");
var dummyTargetDir = path.join(testWorkspaceDir, "copy-destination");
var dependencyName = "/";

var f = $$.flow.create("copySrcFileTest", {
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
        fsExt.createDir(dummyTargetDir);
    },

    act:function() {
        $$.callflow.start("deployer.Deployer").run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        let srcChecksumInitial = fsExt.checksum(dummySrcDir );
        let srcChecksumAfterAction = fsExt.checksum(dummySrcDir );
        assert.notNull(result, "Result should not be null!");
        assert.isNull(error, "Should not be any errors!");
        assert.true(srcChecksumAfterAction === srcChecksumInitial, `[FAIL] Files were changed by copy action. Before action checksum was ${srcChecksumInitial}, after action it is ${srcChecksumAfterAction}`);
        this.end();
    }
});
assert.callback("copySrcFileTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});

