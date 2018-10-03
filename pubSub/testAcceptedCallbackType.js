require("../../../builds/devel/pskruntime"); 
const assert = require("double-check").assert;
const soundPubSub = require("soundpubsub").soundPubSub;
var received = null;
var test =[null, undefined, {}, "string", true, function(){received = true}];

var f = $$.flow.describe("testAcceptedCallbackType",{
    init:function(cb){
        this.cb = cb;
        for(var i = 0; i<test.length; i++) {
            this.subscribe("channel1", test[i]);
        }
	    this.publish("channel1", {msg:"hello"});
        setTimeout(function(){
            if(received){
	            cb();
            }
        }, 1000);
    },
    subscribe:function(channelName, callBack, waitForMore, filter){
            soundPubSub.subscribe(channelName, callBack, waitForMore, filter)
    },
    publish:function(channelName, message) {
        soundPubSub.publish(channelName, message);
    }
});
assert.callback("testAcceptedCallbackType", function (callback){
    f.init(callback);
}, 1500);
