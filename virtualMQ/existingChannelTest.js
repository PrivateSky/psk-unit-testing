require("../../../builds/devel/pskruntime");
require("../../../builds/devel/virtualMQ");
require("../../../builds/devel/psknode");

const assert = require("double-check").assert;
const VirtualMQ  = require('virtualmq');
const CHANNEL_NAME = Buffer.from('testChannel').toString('base64');
const fs = require("fs");
const http = require("http");

try{
    folder = fs.mkdtempSync("test");
}catch(err){
    console.log("Failed to create tmp directory");
}

let port = 8089;
//var server = new Server(sslConfig).listen(port);
function createServer(callback){
    var server = VirtualMQ.createVirtualMQ(port, folder, undefined, (err, res)=>{
        if(err){
            console.log("Failed to create VirtualMQ server on port ", port);
            console.log("Trying again...");
            if(port >0 && port< 50000){
                port++;
                createServer(callback);
            }else{
                console.log("There is no available port to start VirtualMQ instance need it for test!");
            }            
        }else{
            console.log("Server ready and available on port ", port);
            callback(server);
        }
    });
}

function createSwarmMessage(){
    return JSON.stringify({
        meta:{
            swarmId: "notArandomId"
        }
    });
}

// Make a post with a message
function postMessage(message){

    const options = {
        host: '127.0.0.1',
        port: port,
        path: '/'+CHANNEL_NAME,
        method: 'POST'
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
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            console.log(rawData);
        });
    });
    req.write(message);
    req.end();
}

function test(finish){

    console.log(`http://localhost:${port}/${CHANNEL_NAME}`);

    //making a get request that will wait until timeout or somebody puts a message on the channel
    http.get(`http://localhost:${port}/${CHANNEL_NAME}`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            assert.equal(createSwarmMessage(), data, "Did not receive the right message back");
            console.log("Received message", data);

            finish();
            process.exit(0);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

    postMessage(createSwarmMessage());
}

createServer((server)=> {
    assert.callback("VirtualMQ channel request test",test, 10000);
});