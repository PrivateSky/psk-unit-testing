/* This test aims to test if a get request works for other types of messages
 than the swarm messages in JSON format.
 The test should pass, but should show some errors in the console due to the bad message format */

require("../../../builds/devel/pskruntime");
require("../../../builds/devel/virtualMQ");
require("../../../builds/devel/psknode");

const utils  = require("../Utils/virtualMQUtils");
const assert = require("double-check").assert;
const VirtualMQ = require('virtualmq');
const CHANNEL_NAME = Buffer.from('testChannel').toString('base64');
let port = 8092;
var index = 0;
const fs = require("fs");
const http = require("http");
var folder;
var timer1 = null;
var timer2 = null;
var msgArr = ['msg_1', 'msg_2', 'msg_3', 'msg_4', 'msg_5'];
var newArr = ['msg_6', 'msg_7', 'msg_8', 'msg_9', 'msg_10'];
var countMsg = 0;

try {
    folder = fs.mkdtempSync("folder");
} catch (err) {
    console.log("Failed to create tmp folder");
}

//var server = new Server(sslConfig).listen(port);
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

// Make a bad post request with string format by simply passing the array elements
function postBadMessage(message, type) {

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
            console.log("Post bad message", message);
            index++;
            if(index == newArr.length-1){
                clearInterval(timer1);
            }
            if(index == newArr.length){
                return;
            }
           if(index==1){
                setTimeout(()=>{
                    postBadMessage(newArr[index]);
                }, 2000);
            }
           else{
                postBadMessage(newArr[index]);
            }
        });
    });
    req.write(message);
    req.end();
}

// Make a good post with JSON format, using the createSwarmMessage function
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
            console.log("Post good message", message);
            index++;
            if(index == msgArr.length-1){
                clearInterval(timer2);
            }
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

function getMessageFromQueue(finish) {
    //making a get request that will wait until timeout or somebody puts a message on the channel
    http.get(`http://localhost:${port}/${CHANNEL_NAME}`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            var expected = createSwarmMessage(msgArr[countMsg]);
            countMsg++;
            console.log("Got message", data);
            console.log("Expected message ", expected);
            assert.equal(expected, data, "Did not receive the right message back");

            if (countMsg == msgArr.length) {
                utils.deleteFolder(folder);
                finish();
                process.exit(0);
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    }).end();

}

function test(finish) {
    setTimeout(()=>{
        setInterval(()=> {getMessageFromQueue(finish)},100);
    }, 20000);

    //here we try to post some messages as strings
    timer1= setTimeout(()=>{postBadMessage(newArr[index])
    }, 5000);

    //here we sent some messages as JSON 
    timer2= setTimeout(()=>{
      postMessage(createSwarmMessage(msgArr[index]))
    }, 10000);

    //here we try to resend the messages as strings
    setTimeout(()=>{postBadMessage(newArr[index])
    }, 17000);
}
  
createServer((server) => {
    assert.callback("VirtualMQ channel request test", test, 30000);
});