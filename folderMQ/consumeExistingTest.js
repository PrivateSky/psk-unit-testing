require("../../../engine/core").enableTesting();
var fs = require("fs");
var mq = require("../../../modules/soundpubsub/lib/folderMQ");

var folderPath = './ConsumeExistingChannel';

var queue = mq.getFolderQueue(folderPath, function(){});
var assert = $$.requireModule("double-check").assert;
var steps = 0;
var phases = [];

// Try clear the dir before writing if anything exists
try{
    for (const file of fs.readdirSync(folderPath)) fs.unlink(folderPath + '/' + file);
}catch(e){};

// Write the test files
fs.writeFileSync(folderPath+'/file1.test', JSON.stringify({test:1}));
fs.writeFileSync(folderPath+'/file2.test', JSON.stringify({test:2}));
fs.writeFileSync(folderPath+'/file3.test', JSON.stringify({test:3}));

// Consumer for the files
function consume(err, result){
    assert.notEqual(result.test, null, "Bad data from folderMQ");
    if(typeof result.test !== 'undefined'){
        phases.push(result.test);
    }
    steps++;
}
// Register the consumer
queue.registerConsumer(consume);

setTimeout(function(){
    console.log("Read files order:", phases.join(", "));
    assert.equal(steps, 3, "The 3 files were not consumed");

    try{
        for(const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
        fs.rmdirSync(folderPath);
    }catch(e){};

    console.log("Test passed");
    process.exit();
}, 1000);
