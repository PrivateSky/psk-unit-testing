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
var dependencyTarget = path.join(testWorkspaceDir, "./demo-git");
var dependencyName = "demo-project";

var tempDir = path.join(testWorkspaceDir, "./git-new-files");

var f = $$.flow.describe("commitActionTest", {

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
                    "src": "http://bogdan.baran@docker.heavensolutions.com:50080/bogdan.baran/demo-project-bot.git",
                    "credentials": {
                        "username": "hs.bot",
                        "password": "6z5??JENc>e;]V@8"
                    },
                    "actions": [{
                        "type": "clone",
                        "options": {
                            "depth": "1",
                            "branch": "master"
                        },
                        "target": dependencyTarget
                    }, {
                        "type": "move",
                        "src": `${tempDir}/sub/`,
                        "target": `${dependencyTarget}/${dependencyName}`
                    }, {
                        "type": "commit",
                        "message": "[Auto-Commit] Committed new changes",
                        "target": fsExt.resolvePath(`${dependencyTarget}/${dependencyName}`)
                    }]
                }
            ]
        };
        fileStateManager.saveState([testWorkspaceDir]);

        fsExt.createDir(tempDir);
        fsExt.createDir(`${tempDir}/sub/`);
        fsExt.createFile(`${tempDir}/sub/file1.js`, "alert('test" + Math.floor(Math.random() * Math.floor(100000)) + "')!");
    },

    act: function() {
        deployer.run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("Restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        assert.notNull(result, "Result should not be null!");
        assert.isNull(error, "Should not be any errors!");
        this.end();
    }
});

assert.callback("commitActionTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 5500);
    f.start(end);
},5000);
