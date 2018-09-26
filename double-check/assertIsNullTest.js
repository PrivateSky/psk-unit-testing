require("../../../builds/devel/pskruntime"); 
const assert = require("double-check").assert;
var f = $$.flow.create("assertNullTest",{
    action:function(cb){
        var x = null;
        this.dataArray = [ null , (function(){return null})(), x];
        this.dataArray.forEach(function(element) {
           assert.isNull(element, element + " is not null");
        });

		this.dataArray = [ function(){}, {}, undefined, true, false, "null"];
		this.dataArray.forEach(function(element) {
			assert.notNull(element, element + " is null");
		});

        cb();
	}
});
assert.callback("assertNullTest", function(cb){
    f.action(cb);
}, 1500);

