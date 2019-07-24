require("../../../psknode/bundles/pskruntime"); 
const assert = require("double-check").assert;
const soundPubSub = require("soundpubsub").soundPubSub;
var channelName = "BBC3";

var f = $$.flow.describe("pubSubUnsubscribeFromUnregisteredChannel",{
    init:function(cb){
        this.unsubscribe(channelName, function(){});
        cb();
    },
    unsubscribe:function (channelName, callback){
        soundPubSub.unsubscribe(channelName, callback);
    }
})();
assert.callback("pubSubUnsubscribeFromUnregisteredChannel", function(callback){
    f.init(callback);
}, 1500);
