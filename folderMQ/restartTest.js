require("../../engine/core").enableTesting();
var mq = require("../../engine/pubSub/core/folderMQ")

var queue = mq.getFolderQueue("./testFolderMQ",function(){});

var assert=require("double-check").assert;

var flow1 = $$.callflows.create("test", {
    public:{
        value:"int"
    },
    init:function(value){
        this.value = value;
    }
});


var flow2 = $$.callflows.start("test");
flow2.init(2);

var producerHandler = queue.getHandler();

function filter(){
    return flow1.getInnerValue().meta.swarmId;
}

var value=0;

flow1.observe(function(){
            flow1.init(1);
            producerHandler.addSwarm(flow1);
            producerHandler.addSwarm(flow2);
            queue.registerConsumer(function(result){
                value++;
                assert.notEqual(result,null,"Nothing is consumed");
            });
        }, null,filter);

setTimeout(function(){
    assert.equal(value,2,"Not consumed enough");
    process.exit();
}, 1000);