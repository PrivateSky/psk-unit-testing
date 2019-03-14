/*console.log(require.resolve("./lib1"), require("./lib1"));*/
//require("blabla")
require("../../../builds/devel/pskruntime");
require("callflow");

var assert = require("double-check").assert;

assert.callback("RenameLibrary", function(callback){
    //var lib1 = $$.loadLibrary("library1", "./lib1");

    var lib1 = $$.loadLibrary("library1", require("./lib1"));

    var lib2 = $$.loadLibrary("library2", "./lib1");
    assert.notEqual(lib1, lib2, "Libraries should not be the same");

    var test1 = $$.callflow.start(lib1.f1);
    assert.notEqual(test1, null, "Test1 is null");

    var test2 = $$.callflow.start(lib2.f1);
    assert.notEqual(test2, null, "Test2 is null");


    var test3 = $$.callflow.start("library2.f1");
    assert.notEqual(test2, null, "Test3 is null");

    callback();
});
