require("../../../builds/devel/pskruntime"); 
const assert = require("double-check").assert;
var f = $$.flow.create("assertCallbackNoName",{
    action:function(cb){
        this.cb = cb;
        this.cb();
    }
});
assert.callback("Callback simple test",function(cb){
    f.action(cb);
}, 1500);