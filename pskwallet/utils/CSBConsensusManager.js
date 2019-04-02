const path = require("path");
const fs = require("fs");
const utils = require("./utils");
const is = require("interact").createInteractionSpace();
const pskwallet = require("pskwallet");
const RootCSB = pskwallet.RootCSB;
pskwallet.init();


function CSBConsensusManager(localFolder = process.cwd(), seed) {

    let rootCSB;

    this.saveBackup = function () {
        ensureRootCSBExists(err => {
            if (err) {
                throw err;
            }

            rootCSB.on("end", () => {
                is.startSwarm("saveBackup", "withSeed", seed, localFolder).on({
                    printInfo: utils.generateMessagePrinter(),
                    handleError: utils.generateErrorHandler(),
                    csbBackupReport: function ({errors, successes}) {

                    }
                });
            });
        });
    };

    function ensureRootCSBExists(callback) {
        if (!rootCSB || typeof rootCSB === "undefined") {
            RootCSB.loadWithSeed(localFolder, seed, (err, root) => {
                if (err) {
                    return callback(err);
                }

                rootCSB = root;
                callback();
            });
        }
    }
}

module.exports = CSBConsensusManager;
