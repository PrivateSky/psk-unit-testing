require("../../../engine/core").enableTesting();
var deployer  = require( __dirname + "/../../../deployer/Deployer.js");
const fs = require("fs")
const assert = $$.requireModule("double-check").assert;
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
var fsm = require("../../../libraries/utils/FileStateManager.js");
var fileStateManager = fsm.getFileStateManager();

const path = require("path");
const os = require("os");
var testWorkspaceDir = path.join(os.tmpdir(), fsExt.guid());
var dependencyTarget = path.join(testWorkspaceDir, "./git");
var dependencyName = "whys";

var f = $$.flow.create("cloneSourceUnavailable", {
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
                    "src": "https://github.com/PrivateSky/",
                    "actions": [{
                        "type": "clone",
                        "options": {
                            "depth": "1",
                            "branch": "master"
                        },
                        "target": dependencyTarget
                    }]
                }
            ]
        };
        fileStateManager.saveState([testWorkspaceDir]);
    },

    act:function() {
        deployer.run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        console.log(JSON.stringify(error));
        assert.isNull(result, "Result should be null!");
        assert.notNull(error, "Should contain errors. If clone cannot be done, the callback with error should be invoked!");
        let dependencyPath = fsExt.resolvePath(dependencyTarget + "/" + dependencyName);
        assert.true(!fs.existsSync(dependencyPath), `[FAIL] Dependency "${dependencyPath}" does not exist!`);
        this.end();
    }
});

assert.callback("cloneSourceUnavailable", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});

