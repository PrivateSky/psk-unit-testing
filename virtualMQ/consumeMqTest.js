/* This test aims to test if deletion of all the messages in a queue is working properly */

require("../../../builds/devel/pskruntime");
require("../../../builds/devel/virtualMQ");
require("../../../builds/devel/psknode");

const utils  = require("../../psk-unit-testing/Utils/fileUtils");
const assert = require("double-check").assert;
const VirtualMQ = require('virtualmq');
const CHANNEL_NAME = Buffer.from('testChannel').toString('base64');
const fs = require("fs");
const http = require("http");
var folder;
var index = 0;
var nrOfDeletions=0;
var msgArr = ['msg_1', 'msg_2', 'msg_3', 'msg_4', 'msg_5'];
var numberOfMessages = msgArr.length;
var intervalId = null;

try {
    folder = fs.mkdtempSync("testFile");
} catch (err) {
    console.log("Failed to create tmp directory");
}

let port = 8092;
function createServer(callback) {
    var server = VirtualMQ.createVirtualMQ(port, folder, undefined, (err, res) => {
        if (err) {
            console.log("Failed to create VirtualMQ server on port ", port);
            console.log("Trying again...");
            if (port > 0 && port < 50000) {
                port++;
                createServer(callback);
            } else {
                console.log("There is no available port to start VirtualMQ instance need it for test!");
            }
        } else {
            console.log("Server ready and available on port ", port);
            callback(server);
        }
    });
}

function createSwarmMessage(msg) {
    return JSON.stringify({
        meta: {
            swarmId: msg
        }
    });
}

// Make a post with a message
function postMessage(message, type) {
    const options = {
        host: '127.0.0.1',
        port: port,
        path: '/' + CHANNEL_NAME,
        method: type || 'POST'
    };

    var req = http.request(options, (res) => {
        const statusCode = res;
        let error;
        if (statusCode >= 400) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        }

        if (error) {
            console.log(error);
            res.resume();
            return;
        }

        let rawData = '';
        res.on('data', (chunk) => {
            rawData += chunk;
        });
        res.on('end', () => {
            index++;
            if(index == msgArr.length){
                return;
            }
            if(index==1){
            // just wait for file structure to be created
                setTimeout(()=>{
                    postMessage(createSwarmMessage(msgArr[index]));
                }, 5000);
            }
            else{
                postMessage(createSwarmMessage(msgArr[index]));
            }
        });
    });
    req.write(message);
    req.end();
}

// Make a delete request
function deleteMessage(msgId, finish) {

    const options = {
        host: '127.0.0.1',
        port: port,
        path: '/' + CHANNEL_NAME + '/'+ msgId,
        method: 'DELETE',
        };

    var req = http.request(options, (res) => {
        const statusCode = res;
        let error;
        if (statusCode >= 400) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        }

        if (error) {
            console.log(error);
            res.resume();
            return;
        }

        let rawData = '';
        res.on('data', (chunk) => {
            rawData +=chunk;
        });

        res.on('end', () => {
            msgArr.shift();
            if(nrOfDeletions==numberOfMessages){
                clearInterval(intervalId);
                finish();
                assert.equal(0, msgArr.length, "Queue is not empty");
                utils.deleteFolder(folder); 
                process.exit(0);
            }
        });
    });
    req.write(msgId);
    req.end();
}

function deleteMessageFromMQ(finish) {
    //making a get request that will wait find out the confirmation id
    let url = `http://localhost:${port}/${CHANNEL_NAME}?waitConfirmation=true`;
    http.get(url, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
       
        // The whole response has been received. Print out the result.
        resp.on('end', () => {            
        if (nrOfDeletions+1<5 || msgArr.length>0) {
            deleteMessage(JSON.parse(data).confirmationId, finish);
            nrOfDeletions++;
        }else{
            clearInterval()
        }
        });  
   
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    }).end();
}

function test(finish) {
    postMessage(createSwarmMessage(msgArr[index]));

    //delete first message from queue
    intervalId = setTimeout(()=>{
     setInterval(() => {
          deleteMessageFromMQ(finish);
       }, 500); 
    }, 5000);
};

createServer((server) => {
    assert.callback("VirtualMQ dequeue test", test, 15000);
});


