require("../../../builds/devel/pskruntime"); 
var assert = require('double-check').assert;

var f = $$.callflow.create("joinsExample", {
    public:{
        result:"int"
    },
    start:function(){

        var join = this.parallel();

    }
});
f.start();