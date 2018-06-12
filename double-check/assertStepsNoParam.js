const assert = $$.requireModule("double-check").assert;
var arr = [function a (){}, function b (){}];
assert.steps("Test with functions that take parameters", arr);

