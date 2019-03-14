var path = require("path");
process.env.PRIVATESKY_TMP = path.normalize(__dirname + "/../../../tmp");
require("../../../builds/devel/pskruntime");
require("../../../libraries/launcher/debugFacilitator").debugForks(true);
var assert = require("double-check").assert;

$$.loadLibrary("testSwarms", "../../../libraries/testSwarms");

function runCode(){
    var s = $$.swarm.start("testSwarms.testSandBoxExecution");

    assert.callback("Basic Sandboxing test", function(callback){
        s.init(callback);
	}, 3000);
}

$$.container.declareDependency("onlyNowICanRunThis", [$$.DI_components.swarmIsReady], function(fail, ready){
    //console.log("onlyNowICanRunThis", fail, ready);
    if(!fail){
        runCode();
    }
});
