/*
* Test message order in queue
* Wait after first post to create the structure.
* */


require("../../../builds/devel/pskruntime");
require("../../../builds/devel/virtualMQ");
require("../../../builds/devel/psknode");

const utils  = require("../../Utils/fileUtils");
const assert = require("double-check").assert;
const VirtualMQ = require('virtualmq');
const CHANNEL_NAME = Buffer.from('testChannel').toString('base64');
const fs = require("fs");
const http = require("http");
var folder;

try {
    folder = fs.mkdtempSync("testFile");
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
var index = 0;
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
            console.log("Post message", message, new Date().getTime());
            index++;
            if(index == msgArr.length){
                return;
            }
            if(index==1){
                console.log('-------- just wait for file structure to be created --------');
                setTimeout(()=>{
                    postMessage(createSwarmMessage(msgArr[index]));
                }, 5000);
            }else{
                postMessage(createSwarmMessage(msgArr[index]));
            }



        });
    });
    req.write(message);
    req.end();
}


var msgArr = ['msg_1', 'msg_2', 'msg_3', 'msg_4', 'msg_5'];
var countMsg = 0;

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

    }, 10000);

    postMessage(createSwarmMessage(msgArr[index]));

}

createServer((server) => {
    assert.callback("VirtualMQ channel request test", test, 25000);
});