require("../../../psknode/bundles/pskruntime");
const soundPubSub = require("soundpubsub").soundPubSub;
const assert = require("double-check").assert;
var channelName = "superFunChannel";
var received = [];
var sent = ["Message should be received"];

var f = $$.flow.describe("unsubscribe",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, this.callback);
        this.publish({msg:sent[0]});
        var self = this;
        setTimeout(function(){
	        self.unsubscribe(channelName, self.callback);
	        self.publish({msg:"should not receive this!"});
	        self.publish({msg:"should not receive this!"});
	        setTimeout(self.test, 1000);
        }, 1);

    },
    publish:function(message){
        soundPubSub.publish(channelName, message);
    },
    unsubscribe:function (channelName, callback){
        soundPubSub.unsubscribe(channelName, callback);
    },
    callback:function(message){
        received.push(message.msg);
    },
    test :function () {
        assert.true(received.length >0, "No message was received " );
        for (var i = 0; i < sent.length; i++) {
            assert.true(received[i] === sent[i], "Unmatched elements");
        }
        this.cb();
    }
})();
assert.callback("unsubscribe", function(callback){
    f.init(callback);
}, 1500);
