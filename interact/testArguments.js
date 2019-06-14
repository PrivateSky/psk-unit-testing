/////////////////////////////////////////////////////////////
// Tests if the arguments passed through the interact module
// to the target swarm are received as expected
/////////////////////////////////////////////////////////////
require('../../../builds/devel/pskruntime');
require("../../../builds/devel/psknode");
const assert = require('double-check').assert;
const interact = require('../../../modules/interact');
const VirtualMQ = require('../../../modules/virtualmq');
var endpoint = '';
const alias  = 'virtualMQLocal';
const folder = './tmp';
const arg1 = 1;
const arg2 = 2;

function createServer(callback) {
    let port = 2000;
    var server = VirtualMQ.createVirtualMQ(port, folder, undefined, (err, res) => {
        if (err) {
            console.log("Failed to create VirtualMQ server on port ", port);
            console.log("Trying again...");
            if (port > 1025 && port < 50000) {
                port++;
                createServer(callback);
            } else {
                console.log("There is no available port to start VirtualMQ instance need it for test!");
            }
        } else {
            console.log("Server ready and available on port ", port);
            endpoint = `http://127.0.0.1:${port}` 
            callback(server);
        }
    });
}

$$.swarm.describe("interactSwarm",{
    doSomething:function(v1, v2){
        assert.equal(v1,arg1, 'Args not as expected!');
        assert.equal(v2,arg2, 'Args not as expected!');    
        this.return(v1, v2);
    }
});

assert.callback('Argument test' ,(finished)=>{
    createServer(() => {
        let iSpace = interact.createInteractionSpace(alias, endpoint);
        iSpace.startSwarm('interactSwarm', 'doSomething', arg1, arg2).onReturn(
            (res1, res2)=>{
                assert.equal(res1, arg1, 'Args not as expected!');
                assert.equal(res2, arg2, 'Args not as expected!');
                finished();
                process.exit(1);
            });
    });
});