require("../../../engine/core").enableTesting();
const assert = $$.requireModule("double-check").assert;
const Errors = require("../../../engine/util/Error");

var swarm = $$.swarm.create("SwarmExample", {
    private:{
        a1:"int",
        a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2){
        this.result = a1 + a2;
    }
});
swarm.begin(1,2);
var message = "just a simple message";
var prop = "public";
var value = [];
var error = new Errors.SyntaxError(message, swarm, prop, value);

function test(error){
    assert.true(error instanceof Errors.SyntaxError, "Wrong instance type");

    assert.true(error.message == message, "Wrong message");
    assert.true(error.swarm == swarm, "Wrong swarm");
    assert.true(error.property == prop, "Wrong prop");
    assert.true(error.value === value, "Wrong value");

    assert.true(error.inspect != null, "should have inspect function in order to overwrite console.log behavior");
}
test(error);

try{
    throw new Errors.SyntaxError(message);
}catch(error){
    assert.true(error!==null, "No error");
}

process.on('uncaughtException', function (err){
    test(err);
    self.callback();
});
var self = this;

assert.callback("uncaughtException test", function(callback){
    self.callback = callback;
});

message = "Intended error. Ignore it!";
error.message = message;
throw error;