require("../../../builds/devel/pskruntime"); 
const assert = require("double-check").assert;
var f = $$.flow.describe("assertObjectHasFieldsPrototype", {
    action: function (cb) {
        this.cb = cb;
        this.f = function () {
            this.name = "Adam";
            this.age = 23;
        };
        this.f.prototype.citty = "Kansas";
        this.x = new this.f();

        this.y = {
            age: 23,
            name: "Adam",
            citty: "Kansas"
        };

        let didThrow = false;

        try {
	        assert.objectHasFields(this.x, this.y);
        } catch (e) {
            didThrow = true;
        }

        assert.false(didThrow, 'It looks like it compared prototype values too');
        this.cb();
    }
})();
assert.callback("assertObjectHasFieldsPrototype", function(cb){
    f.action(cb);
}, 1500);