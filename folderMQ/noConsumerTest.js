require("../../engine/core").enableTesting();
var fs = require("fs");
var mq = require("../../engine/pubSub/core/folderMQ");

var folderPath = './noConsumerChannel';

var queue = mq.getFolderQueue(folderPath, function(){});
var assert = require("double-check").assert;

$$.requireLibrary("testSwarms");

// Try clear the dir before writing if anything exists
try{
    for(const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
}catch(e){};

// Get current number of files
var initialFilesNumber = fs.readdirSync(folderPath).length; //should be 0

// Start and send swarm to MQ
var f = $$.swarm.start("testSwarms.simpleSwarm");
var producerHandler = queue.getHandler();
producerHandler.addSwarm(f);


setTimeout(function(){
    var currentFiles = fs.readdirSync(folderPath);
    assert.equal(initialFilesNumber+1, currentFiles.length, "The file in queue was lost");
    fs.unlinkSync(folderPath + '/' + currentFiles[0]);
    fs.rmdirSync(folderPath);

    console.log("Test passed");
    process.exit();
}, 1000);
