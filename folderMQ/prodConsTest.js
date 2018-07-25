require("../../../engine/core").enableTesting();
var mq = require("../../../modules/soundpubsub/lib/folderMQ");
var queue = mq.getFolderQueue("./testFolderMQ",function(){});

var assert = $$.requireModule("double-check").assert;

var f = $$.swarm.create("test", {
    public:{
        value:"int"
    },
    init:function(callback){
        this.callback=callback;
        this.value = 1;
    }
});

queue.registerConsumer(function(err, result){
    assert.notEqual(result,null,"Nothing is consumed");
    f.callback();
});

var producerHandler = queue.getHandler();

function filter(){
    return f.getInnerValue().meta.swarmId;
}

assert.callback("Producer-consumer Test for folderMQ",function(callback){
    f.observe(function(){
        f.init(callback);
        producerHandler.addSwarm(f, function(){});
    }, null,filter);

});

setTimeout(function(){
    process.exit();
}, 1000);