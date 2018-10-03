require("../../../builds/devel/pskruntime");
var assert = require('double-check').assert;

var f = $$.callflow.describe("serialExample", {
    start:function(){
        var serial = this.serial();
    }
});
try {
    f.start();
}catch(err){
    assert.notEqual(err,null,"Error expected");
}