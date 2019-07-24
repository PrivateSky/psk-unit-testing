/////////////////////////////////////////////////////////////
// Check if malformed swarm names are handled 
//
/////////////////////////////////////////////////////////////
require('../../../psknode/bundles/pskruntime');
require("../../../psknode/bundles/psknode");
require("../../../psknode/bundles/httpinteract");
const assert = require('double-check').assert;
const interact = require('interact');
const VirtualMQ = require('../../../modules/virtualmq');
const removeDir = require('../Utils/virtualMQUtils').deleteFolder;
const channel = 'local/agent/test';
var endpoint = '';
const alias  = 'virtualMQLocal';
const folder = './tmp';

// const swarmName = 'interac\\..\\..\\..\\'; //path traversal
const swarmName = 'interac\/\tSwarm';
const phaseName = 'doSomething';

const args = [1,'2',{3: "val"}, [1,2]]

function createServer(callback) {
    let port = 8080;
    var server = VirtualMQ.createVirtualMQ(port, folder, undefined, (err, res) => {
        if (err) {
            console.log("Failed to create VirtualMQ server on port ", port);
            console.log("Trying again...");
            if (port > 1025 && port < 50000) {
                port++;
                createServer(callback);
            } else {
                console.log("There is no available port to start VirtualMQ instance needed for test!");
            }
        } else {
            console.log("Server ready and available on port ", port);
            endpoint = `http://127.0.0.1:${port}` 
            callback(server);
        }
    });
}
assert.callback('Malformed SwarmName Test' ,(finished) => {
    createServer(() => {
        $$.remote.newEndPoint(alias, endpoint, channel);
        let iSpace = interact.createRemoteInteractionSpace(alias, endpoint, channel);
        iSpace.startSwarm(swarmName, phaseName, ...args);

        // SwarmNames are not checked for '\' '|' '/' 
        // TODO: figure out how to check for error

        // removeDir(folder);
        // finished();

    });
},2000);