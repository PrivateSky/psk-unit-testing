require("../../../builds/devel/pskruntime"); 
const assert = require("double-check").assert;
const soundPubSub = require("soundpubsub").soundPubSub;
var channelName = "superFunChannel";

var f = $$.flow.describe("publishAndEmpty",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback);
        var catchedSubscriberList = this.publish({msg:"World!"});
        if(Array.isArray(catchedSubscriberList)){
			catchedSubscriberList.splice(0, catchedSubscriberList.length);
        }
        assert.false(Array.isArray(catchedSubscriberList), "Captured list of subscribers");
    },
    publish:function(message){
        return soundPubSub.publish(channelName, message);
    },
    callback:function(message){
        assert.true(message.msg === "World!");
        this.cb();
    }
})();
assert.callback("publishToRegisteredSubscriber", function(callback){
    f.init(callback);
}, 1500);