require("../../../psknode/bundles/pskruntime");
const cartesianProduct = require("swarmutils").combos;
const assert = require("double-check").assert;

assert.callback("combosTest", function(callback){
    const permutations = cartesianProduct({
        greeting: ['Hello', 'Hi'],
        name: ['Jeremy', 'Jet']
    });

    var expected =[ { greeting: 'Hello', name: 'Jeremy' },
        { greeting: 'Hello', name: 'Jet' },
        { greeting: 'Hi', name: 'Jeremy' },
        { greeting: 'Hi', name: 'Jet' } ];

    assert.equal(permutations.length, expected.length, "Generated permutations have different lengths than expected");

    for(let i=0; i<permutations.length; i++){
        assert.objectHasFields(permutations[i], expected[i]);
    }

    callback();
});



