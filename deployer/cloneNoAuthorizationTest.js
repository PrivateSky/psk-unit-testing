require("../../../builds/devel/pskruntime"); 
var fs = require("fs");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("double-check").assert;
var fsm = require("../../../libraries/utils/FileStateManager.js");
var fileStateManager = fsm.getFileStateManager();

var deployer  = require( __dirname + "/../../../deployer/Deployer.js");

const path = require("path");
const os = require("os");
var testWorkspaceDir = path.join(os.tmpdir(), fsExt.guid());
var dependencyTarget = path.join(testWorkspaceDir, "./git");
var dependencyName = "swarm-engine";

var f = $$.flow.describe("cloneNoAuthorizationTest", {
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
                    "src": "http://unknownuser:nopass@docker.heavensolutions.com:50080/privatesky/swarm-engine.git",
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

    act: function() {
        deployer.run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        assert.notNull(error, "Should be errors!");
        assert.isNull(result, "Result should be null!" );
        let dependencyPath = fsExt.resolvePath(dependencyTarget + "/" + dependencyName);
        assert.true(!fs.existsSync(dependencyPath), `[FAIL] Dependency "${dependencyPath}" does not exist!`);
        this.end();
    }
})();

assert.callback("cloneNoAuthorizationTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 5500);
    f.start(end);
},5000);


