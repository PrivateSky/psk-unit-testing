/* This test aims to test if deletion of all the messages in a queue is working properly */
const utils = require("../Utils/virtualMQUtils");
const assert = require("double-check").assert;

var index = 0;
var nrOfDeletions = 0;
var msgArr = ['msg_1', 'msg_2', 'msg_3', 'msg_4', 'msg_5'];
var numberOfMessages = msgArr.length;
var intervalId = null, finishCallback;


let postCallback = function () {
    console.log('postCallback index = ', index);
    index++;
    if (index == msgArr.length) {
        return;
    }
    if (index == 1) {
        // just wait for file structure to be created
        setTimeout(() => {
            postCallback(utils.createSwarmMessage(msgArr[index]), postCallback);
        }, 5000);
    } else {
        postCallback(utils.createSwarmMessage(msgArr[index]), postCallback);
    }
};
let getMessageIdCallback = function (data) {
    console.log('message id =' , JSON.parse(data).confirmationId);
    console.log('nrOfDeletions initial = ' + nrOfDeletions + ' and msgArr.length initial = ' + msgArr.length );

    if (nrOfDeletions + 1 < 5 || msgArr.length > 0) {
        deleteMessage(JSON.parse(data).confirmationId);
        msgArr.shift();
        nrOfDeletions++;
        console.log('nrOfDeletions ' + nrOfDeletions + ' msgArr.length  = ' + msgArr.length );
    } else {
        clearInterval()
    }
};

let deleteMessageCallback = function (data) {
    if (nrOfDeletions == numberOfMessages) {
        clearInterval(intervalId);
        finishCallback();
        assert.equal(0, msgArr.length, "Queue is not empty");
        utils.deleteFolder(folder);
        process.exit(0);
    }
};

// Make a delete request
function deleteMessage(msgId) {
    let options = utils.getRequestOptions('DELETE', '/' + msgId);
    utils.httpRequest(msgId, deleteMessageCallback, 'DELETE', options);
}

function deleteMessageFromMQ(finish) {
    let options = utils.getRequestOptions('GET', '?waitConfirmation=true');
    utils.httpRequest(null, getMessageIdCallback, 'GET', options);
}

function test(finish) {
    finishCallback = finish;
    utils.createServer((server) => {
        utils.httpRequest(utils.createSwarmMessage(msgArr[index]), postCallback);

        //delete every message from queue
        intervalId = setTimeout(() => {
            setInterval(() => {
                deleteMessageFromMQ(finish);
            }, 500);
        }, 5000);
    });
}


utils.initVirtualMQ();
assert.callback("VirtualMQ GET request test", test, 25000);
//delete cretead test folder
utils.cleanUp(25000 + 3000);