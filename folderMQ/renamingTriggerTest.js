require("../../engine/core").enableTesting();
var fs = require("fs");
var mq = require("../../engine/pubSub/core/folderMQ");

var folderPath = './renamingTriggerTest';

var queue = mq.getFolderQueue(folderPath, function(){});
var assert = require("double-check").assert;
var fileCount = 0;
var filesToTry = 30;

// Try clear the dir before writing if anything exists
try{
    for(const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
}catch(e){};

// Write the test files
fs.writeFileSync(folderPath+'/main_file.test', JSON.stringify({test:0}));
for(var i=1;i<=filesToTry;i++){
    fs.writeFileSync(folderPath+'/file'+i+'.test.in_progress', JSON.stringify({test:i}));
}

// Consumer for the files
function consume(result){
    fileCount++;
    // console.log("Got file:", result.test);
}
// Register the consumer
for(var i=1;i<=filesToTry;i++){
    let j = i;
    setTimeout(function(){ fs.rename(folderPath+'/file'+j+'.test.in_progress', folderPath+'/file'+j+'.test'); }, j-1);
}
queue.registerConsumer(consume);

setTimeout(function(){
    console.log("## Consumed "+fileCount+" of "+(filesToTry+1)+" files");
    assert.equal(fileCount, filesToTry+1, "Some files were not consumed");

    try{
        for(const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
        fs.rmdirSync(folderPath);
    }catch(e){};

    if(fileCount == filesToTry+1){
        console.log("Test passed");
    }
    process.exit();
}, 1500);
