const RootCSB = require('modules/pskwallet/libraries/RootCSB');

RootCSB.on('end', () => {
    console.log("end");
})

function CSBConsensusManager(localFolder) {

    let updatedCSBs = [];
    this.updatePending = function (dseed) {
        updatedCSBs.push(dseed);

    };

    this.backupPending = function (finishedUpdating, delta) {


    }
}

