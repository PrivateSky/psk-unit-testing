var pdsFake = require("../../../../modules/signsensus/lib/InMemoryPDS");
const cutil = require("../../../../modules/signsensus/lib/consUtil");
var assert = require('double-check').assert;

var pds = pdsFake.newPDS();

var h = pds.getHandler();


var swarm = {
    swarmName: "Swarm"
};

h.writeKey("testKey", "value1");
h.writeKey("testKey", "value2");
h.writeKey("testKey", "value3");
h.readKey("READKeyM");
h.readKey("READKeyM");
h.readKey("READKeyM");
h.readKey("READKeyOnce");
h.writeKey("anotherKey", "value4");

var diff = pds.computeSwarmTransactionDiff(swarm, h);

var expected = { swarmName: 'Swarm',
    input: { testKey: 3, READKeyM: 0, READKeyOnce: 0, anotherKey: 1 },
    output: { testKey: 'value3', anotherKey: 'value4' } }


// console.log(JSON.stringify(diff));
// console.log( JSON.stringify(expected));
assert.equal(JSON.stringify(diff),JSON.stringify(expected),"Unexpected diff");

var t = cutil.createTransaction(0, diff);
var set = {};
set[t.digest] = t;
pds.commit(set);

var h = pds.getHandler();
h.writeKey("testKey", "value5");     //version 1
h.writeKey("anotherKey", "value6");  //version 1
h.writeKey("anotherKey2", "value7"); //version 0

var diff = pds.computeSwarmTransactionDiff(swarm, h);


//console.log("Without commit", diff);


//var h = pds.getHandler();
var expected = { swarmName: 'Swarm',
    input: { testKey: 2, anotherKey: 1, anotherKey2: 1 },
    output: { testKey: 'value8', anotherKey: 'value6', anotherKey2: 'value7' } }

h.writeKey("testKey", "value8");
var diff = pds.computeSwarmTransactionDiff(swarm, h);
//console.log("Should be version 2 for input testKey ", diff);
assert.equal(JSON.stringify(diff),JSON.stringify(expected),"Unexpected diff on version testing")
