require("../../../engine/core").enableTesting();
var fs = require("fs");
var mq = require("../../../engine/pubSub/core/folderMQ");

var folderPath = './watcherChannel';

var queue = mq.getFolderQueue(folderPath, function(){});
var assert = $$.requireModule("double-check").assert;
// Try clear the dir before writing if anything exists
try{
    for(const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
}catch(e){}

var step = 0;

// First prepare and register the consumer for the files
function consume(result){
    assert.equal(step, 1, "Consuming before writing the file?");
    assert.notEqual(result.test, null, "Data in file is not fine");
    step++;
}
// Registering the consumer
queue.registerConsumer(consume);

// Then write to file
setTimeout(function(){
    step = 1;
    fs.writeFileSync(folderPath+'/file1.test', JSON.stringify({test:1}));
}, 500);

setTimeout(function(){
    assert.equal(step, 2, "Watcher was not triggered");

    try{
        for(const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
        fs.rmdirSync(folderPath);
    }catch(e){}

    console.log("Test passed");
    process.exit();
}, 1000);