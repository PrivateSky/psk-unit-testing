require("../../engine/core").enableTesting();
var fs = require("fs");
var mq = require("../../engine/pubSub/core/folderMQ");

var folderPath = './InProgressChannel';
var inProgressFileName = 'file1.test.in_progress';

var queue = mq.getFolderQueue(folderPath, function(){});
var assert = require("double-check").assert;
var wasConsumed = 0;
// Try clear the dir before writing if anything exists
try{
    for(const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
}catch(e){};

// Write the test files
fs.writeFileSync(folderPath+'/'+inProgressFileName, JSON.stringify({test:1}));

// Consumer for the files
function consume(result){
    wasConsumed = 1;
    assert.notEqual(result.test, 1, "Test failed. The `In progress` file was consumed.");
}
// Register the consumer
queue.registerConsumer(consume);

setTimeout(function(){
    fs.unlinkSync(folderPath+'/'+inProgressFileName);
    fs.rmdirSync(folderPath);

    if(wasConsumed === 0){
        console.log("Test passed");
    }
    process.exit();
}, 1000);
