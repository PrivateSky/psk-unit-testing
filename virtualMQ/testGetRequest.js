require("../../../builds/devel/pskruntime");
require("../../../builds/devel/virtualMQ");
require("../../../builds/devel/psknode");

const assert = require("double-check").assert;
const VirtualMQ  = require('virtualmq');
const CHANNEL_NAME = Buffer.from('mychannel').toString('base64');
const fs = require("fs");
const http = require("http");

try{
    folder = fs.mkdtempSync("getMsg");
}catch(err){
    console.log("Failed to create tmp directory");
}

let port = 8089;

//Make a get request
function getMessage(){

    const opts = {
        host: '127.0.0.1',
        port: port,
        path: '/'+CHANNEL_NAME,
        method: 'GET'
    };

    var req = http.request(opts, (res) => {
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
    req.write("");
    req.end();
}

function createSwarmMessage(){
    return JSON.stringify({meta:{
        swarmId: swarmId,
		requestId: swarmId,
		swarmTypeName: 'testSwarm',
		phaseName: 'testPhase',
		args: undefined,
		command: 'relay',
		target: 'agent\\agent_x'}});
}

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

function testGet(finish){

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
            assert.equal(getMessage(createSwarmMessage()), data,"FAIL ON COMPARISON");
            console.log("Received message", data);
            finish();
            process.exit(0);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

createServer((server)=> {
    assert.callback("VirtualMQ GET request test", testGet, 1000)
});