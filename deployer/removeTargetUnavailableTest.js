require("../../../builds/devel/pskruntime"); 
var fs = require("fs");
const assert = require("double-check").assert;
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
var fsm = require("../../../libraries/utils/FileStateManager.js");
var fileStateManager = fsm.getFileStateManager();

var deployer  = require( __dirname + "/../../../deployer/Deployer.js");

const path = require("path");
const os = require("os");
var testWorkspaceDir = path.join(os.tmpdir(), fsExt.guid());
var dummyTargetDir = path.join(testWorkspaceDir, "./remove-source");
var dependencyName = "dummy-dependency";

var f = $$.flow.describe("removeTargetUnavailable", {
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
                    "actions": [{
                        "type": "remove",
                        "target": dummyTargetDir
                    }]
                }
            ]
        };
    },

    act:function() {
        deployer.run(this.configObject, this.callback);
    },

    callback:function (error, result) {
        assert.notNull(result, "Should pass withour errors");
        assert.isNull(error, "Error should be null!");
        this.end();
    }
})();
assert.callback("removeTargetUnavailable", function(end) {
    f.start(end);
});

