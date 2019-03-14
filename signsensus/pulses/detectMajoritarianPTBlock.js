const cutil = require("../../../../modules/signsensus/lib/consUtil");
const ssutil = require("../../../../modules/signsensus/lib/ssutil");
var lset = require("../../../../../psk-unit-testing/signsensus/pds/utilityCreateSet").set;

var assert = require('double-check').assert;

var pdsInM = require("../../../../modules/pskdb/lib/InMemoryPDS");

var pdsAdapter = pdsInM.newPDS();

var pulsesHistory = {

};
var currentPulse = 1;
var votingBox = cutil.createDemocraticVotingBox(3);


var pset = {};
var currentVSD = pdsAdapter.getVSD();

function recordPulse(from, pulse){
    if( !pulse.ptBlock){
        pulse.ptBlock = [];
    }
    pulse.blockDigest = ssutil.hashValues(pulse.ptBlock);
    if(!pulsesHistory[pulse.currentPulse]){
        pulsesHistory[pulse.currentPulse] = {};
    }
    pulsesHistory[pulse.currentPulse][from] = pulse;

    for(var d in pulse.lset){
        pset[d] = pulse.lset[d];
    }

}

var transactions1  = lset;
var transactions2  = lset;
var transactions3  = lset;

var block1 = block2 = block3 = [];


var p1 = cutil.createPulse("agent1", currentPulse, block1, transactions1, currentVSD);
var p2 = cutil.createPulse("agent2", currentPulse, block2, transactions2, currentVSD);
var p3 = cutil.createPulse("agent3", currentPulse, block3, transactions3, currentVSD);

recordPulse("agent1", p1);
recordPulse("agent2", p2);
recordPulse("agent3", p3);


currentPulse++;

//console.log(majoritarian); // should be empty

block1 = block2 =  pdsAdapter.computePTBlock(pset);

block3 = [];

p1 = cutil.createPulse("agent1", currentPulse, block1, {}, currentVSD);
p2 = cutil.createPulse("agent2", currentPulse, block2, {}, currentVSD);
p3 = cutil.createPulse("agent3", currentPulse, block3, {}, currentVSD);

recordPulse("agent1", p1);
recordPulse("agent2", p2);
recordPulse("agent3", p3);


//currentPulse++;
var majoritarian = cutil.detectMajoritarianPTBlock(currentPulse, pulsesHistory, votingBox);
//console.log(block1);
//console.log(majoritarian);

assert.equal(JSON.stringify(block1),JSON.stringify(majoritarian),"Different blocks");