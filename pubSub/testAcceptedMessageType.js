require("../../../builds/devel/pskruntime"); 
const assert = require("double-check").assert;
const soundPubSub = require("soundpubsub").soundPubSub;
var test = [null, undefined, "string", false, function(){}, 5, Infinity, {}, []];
var channels = {ch1:"superFunChannel", ch2:"Random" };

var f = $$.flow.describe("testAcceptedMessageType",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channels.ch1, this.callback);
        for(var i = 0 ;i<test.length; i++) {
            this.publish(channels.ch1, test[i]);
        }
    },
    publish:function(channelName, message){
            soundPubSub.publish(channelName, message);
    },
    callback:function(message) {
        console.log(message);
        if (Array.isArray(message)){
            this.cb();
        }
    }
})();
assert.callback("testAcceptedChannelName", function (callback){
    f.init(callback);
}, 1500);
