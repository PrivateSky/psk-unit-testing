require("../../../builds/devel/pskruntime"); 
const assert = require("double-check").assert;
const soundPubSub = require("soundpubsub").soundPubSub;
var channelName = "superFunChannel";

var f = $$.flow.describe("unsubscribeTwice",{
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
