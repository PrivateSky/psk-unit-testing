require("../../../builds/devel/pskruntime"); 
var assert = require('double-check').assert;

var f = $$.callflow.describe("joinsExample", {
    public:{
        result:"int"
    },
    start:function(callback){
        var join = this.parallel(callback);
    }
})();

assert.callback("joinsExample", function(callback){
    f.start(callback);
});