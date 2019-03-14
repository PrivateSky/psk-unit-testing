require("../../../builds/devel/pskruntime");
var assert = require('double-check').assert;

var f = $$.callflow.describe("serialExample", {
    start:function(callback){
        var serial = this.serial(callback);
    }
})();

assert.callback("SerialExample", function(callback){
    f.start(callback);
});