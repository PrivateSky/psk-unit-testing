var pdsModule = require("../../../../modules/pskdb/lib/FolderPersistentPDS");
const cutil = require("../../../../modules/signsensus/lib/consUtil");
var assert = require('double-check').assert;

var pds = pdsModule.newPDS("./storageFolder");
var h = pds.getHandler();


var h = pds.getHandler();
h.writeKey("k1", "v1");
h.writeKey("k2", "v2");
h.writeKey("k3", "v3");

var swarm = {
    swarmName: "Swarm"
};

var diff = pds.computeSwarmTransactionDiff(swarm, h);

var t = cutil.createTransaction(0, diff);
var set = {};
set[t.digest] = t;
pds.commit(set);
