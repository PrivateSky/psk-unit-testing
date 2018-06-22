require("../../../engine/core").enableTesting();
const assert = $$.requireModule("double-check").assert;
const soundPubSub = $$.requireModule("soundpubsub").soundPubSub;
var channelName = "superFunChannel";


var f = $$.flow.create("VerifyChannelExistence",{
    init:function(cb){
        this.cb = cb;
        soundPubSub.subscribe(channelName, function(){});
        this.test();
    },
    test:function() {
        assert.true(soundPubSub.hasChannel(channelName) == true, "Subscribe did not work")
        this.cb();
    }
});
assert.callback("VerifyChannelExistence", function(callback){
    f.init(callback);
},1500);
