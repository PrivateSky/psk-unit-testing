
var path = require("path");
process.env.PRIVATESKY_TMP = path.normalize(__dirname + "/../../../tmp");
require("../../engine/launcher");//.core.enableTesting();
//require("../../libraries/launcher/debugFacilitator").debugForks(true);
//require("../../engine/core").enableTesting();

$$.requireLibrary("testSwarms");

function runCode(){
    $$.swarm.start("testSwarms.testSandBoxExecution").init();
}


$$.container.declareDependency("onlyNowICanRunThis", [$$.DI_components.swarmIsReady], function(fail, ready){
    //console.log("onlyNowICanRunThis", fail, ready);
    if(!fail){
        runCode();
    }
});

