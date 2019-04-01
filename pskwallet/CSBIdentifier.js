require('../../../builds/devel/pskruntime');
require('../../../builds/devel/consoleTools');
require("../../../builds/devel/virtualMQ");

const assert = require("double-check").assert;
const pskwallet = require("pskwallet");
const CSBIdentifier = pskwallet.CSBIdentifier;

const csbId = new CSBIdentifier(null, "http://localhost:8080");

assert.true(csbId !== undefined && csbId !== null, "Unexpected value for CSBIdentifier instance");

let seed = csbId.getSeed();
let dseed = csbId.getDseed();
let uid = csbId.getUid();

assert.true(seed !== null && seed !== undefined, "Seed is null or undefined");
assert.true(dseed !== null && dseed !== undefined, "Deed is null or undefined");
assert.true(uid !== null && uid !== undefined, "Uid is null or undefined");

let newCSBId = new CSBIdentifier(seed);
let newSeed = newCSBId.getSeed();
let newDseed = newCSBId.getDseed();
let newUid = newCSBId.getUid();
assert.true(newSeed !== null && newSeed !== undefined, "Seed is null or undefined");
assert.true(newDseed !== null && newDseed !== undefined, "Deed is null or undefined");
assert.true(newUid !== null && newUid !== undefined, "Uid is null or undefined");

newCSBId = new CSBIdentifier(dseed);
try{
    newCSBId.getSeed();
}catch(e){
    assert.true(e !== null && e !== undefined, "Error expected");
}
assert.true(newCSBId.getDseed() !== null && newCSBId.getDseed() !== undefined, "Deed is null or undefined");
assert.true(newCSBId.getDseed().toString() === newDseed.toString(), "Unexpected Dseed");
assert.true(newCSBId.getUid() !== null && newCSBId.getUid() !== undefined, "Uid is null or undefined");
assert.true(newCSBId.getUid().toString() === newUid.toString(), "Unexpected Uid");

newCSBId = new CSBIdentifier(uid);
try{
    newCSBId.getSeed();
}catch(e){
    assert.true(e !== null && e !== undefined, "Error expected");
}

try{
    newCSBId.getDseed();
}catch(e){
    assert.true(e !== null && e !== undefined, "Error expected");
}
assert.true(newCSBId.getUid() !== null && newCSBId.getUid() !== undefined, "Uid is null or undefined");
assert.true(newCSBId.getUid().toString() === newUid.toString(), "Unexpected Uid");
