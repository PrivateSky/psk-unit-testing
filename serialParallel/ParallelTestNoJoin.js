
require("../../engine/core").enableTesting();
var assert=require('double-check').assert;
var f = $$.callflow.create("joinsExample", {
    public:{
        result:"int"
    },
    start:function(){

        var join = this.parallel();

    }
});
f.start();