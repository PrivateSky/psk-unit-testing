require("../../../builds/devel/pskruntime"); 
const assert = $$.requireModule("double-check").assert;
const soundPubSub = $$.requireModule("soundpubsub").soundPubSub;
var channelName = "superFunChannel";

var f = $$.flow.create("unsubscribeTwice",{
    init:function(cb){
        soundPubSub.subscribe(channelName, this.callback);
	    soundPubSub.unsubscribe(channelName, this.callback);
	    soundPubSub.unsubscribe(channelName, this.callback);
        cb();
    },
    callback: function(){
        //dummy function
    }
});
assert.callback("waitingToReceiveMultipleMessages", function(callback){
    f.init(callback);
}, 1500);
