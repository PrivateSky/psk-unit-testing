require("../../../../builds/devel/pskruntime");
var assert = require('double-check').assert;
var pskDB = require("pskdb");


var pds = pskDB.startDB("./testData");
var h = pds.getHandler();

console.log(h.readKey("k1"));

