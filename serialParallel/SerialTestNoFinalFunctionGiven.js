require("../../../builds/devel/pskruntime");
var assert = $$.requireModule('double-check').assert;

var f = $$.callflow.create("serialExample", {
    start:function(){
        var serial = this.serial();
    }
});
try {
    f.start();
}catch(err){
    assert.notEqual(err,null,"Error expected");
}