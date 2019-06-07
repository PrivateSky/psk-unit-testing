require("../../../builds/devel/pskruntime");
require("../../../builds/devel/virtualMQ");
require("../../../builds/devel/psknode");

const assert = require("double-check").assert;
const VirtualMQ = require('virtualmq');
const CHANNEL_NAME = Buffer.from('testChannel').toString('base64');
const fs = require("fs");
const http = require("http");

try {
    folder = fs.mkdtempSync("test");
} catch (err) {
    console.log("Failed to create tmp directory");
}

let port = 8092;

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
            console.log(rawData);
        });
    });
    req.write(message);
    req.end();
}

var countMsg = 0;
var msgArr = ['firstMessage', 'secondMessage', 'afterDeleteMessage']

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
            console.log("Received message ", data);
            console.log("Expected message ", createSwarmMessage(msgArr[countMsg]));
            assert.equal(createSwarmMessage(msgArr[countMsg]),data, "Did not receive the right message back");
            countMsg ++;
            if (countMsg >= msgArr.length) {
                finish();
                process.exit(0);
            }

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    }).end();

}

function test(finish) {
    //test read/write to mq (post and get)
    getMessageFromQueue(finish);
    postMessage(createSwarmMessage(msgArr[0]));


    //test delete from mq
    postMessage(createSwarmMessage(msgArr[1]));
   /* postMessage(createSwarmMessage(msgArr[1]), 'DELETE');*/
    postMessage(createSwarmMessage(msgArr[2]));

//    getMessageFromQueue(finish);


}

createServer((server) => {
    assert.callback("VirtualMQ channel request test", test, 3000);
});