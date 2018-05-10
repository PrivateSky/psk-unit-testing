require("../../engine/core").enableTesting();
var fs = require("fs");
var mq = require("../../engine/pubSub/core/folderMQ");
var assert = require("double-check").assert;
var beesHealer = require("../../engine/choreographies/beesHealer");
var folderPath = './BasicReviveChannel';

var queue = mq.getFolderQueue(folderPath, function(){});
// Try clear the dir before writing if anything exists
try{
    for (const file of fs.readdirSync(folderPath)) fs.unlink(folderPath + '/' + file);
}catch(e){};

// Describe and create a new swarm
var f = $$.swarm.create("test", {
    public:{
        result:"int"
    },
    private:{
        a1:"int",
        a2:"int"
    },
    phaseOne:function(a1, a2){
        this.a1 = a1;
        this.a2 = a2;
    },
    phaseTwo:function(a3, a4){
        this.result = this.a1 + this.a2 + a3 + a4;
    },
    phaseThree:function(){
        this.result++;
    }
});

var finalResult = null;

// Register a consumer
queue.registerConsumer(function(result){
    assert.notEqual(result, null, "Nothing is consumed");
    // Revive the swarm
    var f2 = $$.swarmsInstancesManager.revive_swarm(result);
    // Then (3) run the phaseThree of the swarm
    f2.phaseThree();
    finalResult = f2.result;
});

// Send swarm to folderMQ
var producerHandler = queue.getHandler();
f.observe(function () {
    // First (1) run the phase one before serialization
    f.phaseOne(7, 3);
    // Then (2) send phaseTwo to execution for the moment when it'll be revived
    var swarm = beesHealer.asJSON(f.getInnerValue(),"phaseTwo",[4,8],function () {

    })
    producerHandler.sendSwarmForExecution(swarm);
},null,null);



setTimeout(function(){
    assert.equal(finalResult, 23, "Phase two wasn't executed");
    if(finalResult === 23){
        console.log("Test passed");
    }

    try{
        for(const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
        fs.rmdirSync(folderPath);
    }catch(e){};

    process.exit();
}, 800);
