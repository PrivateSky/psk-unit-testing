require("../../../engine/core").enableTesting();

var deployer  = require( __dirname + "/../../../libraries/deployer/Deployer.js");

const assert = $$.requireModule("double-check").assert;

var f = $$.flow.create("deployerNoConfigObject", {
    start:function() {
        this.act();
    },
    act: function() {

        deployer.run(null, this.check);
    },
    check: function(error) {
        assert.pass("deployerNoConfigObject", function() {
            assert.notNull(error, "Should not be errors!");
        })
    }
});
f.start();

