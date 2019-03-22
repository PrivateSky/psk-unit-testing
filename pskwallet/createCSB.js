require('../../../builds/devel/pskruntime');
require('../../../builds/devel/consoleTools');

const utils = require("./utils/utils");
const path = require("path");
const is = require("interact").createInteractionSpace();
const pskwallet = require("pskwallet");
pskwallet.init();




const resourcesDir = path.resolve(__dirname, "./testResources");
const localFolder = path.join(resourcesDir, "testDir");
const fileName = "anne_hathaway.jpeg";


console.log("Local folder:", localFolder);

function handleError(err, info) {
    if (err) {
        throw err;
    }
}



const s = $$.swarm.describe("CSBTest", {
    init: function (localFolder) {
        utils.deleteRecursively(localFolder, (err)=>{
            if (err) {
                throw err;
            }

            $$.ensureFolderExists(localFolder, (err)=>{
                if (err) {
                    throw err;
                }
                this.localFolder = localFolder;
                this.createCSB();
            })
        });
    },

    createCSB: function () {
        const self = this;

        is.startSwarm("global.createCsb", "withoutPin", undefined, undefined, this.localFolder).on({
            handleError: handleError,
            printInfo: function (info) {
                console.log(info);
            },
            printSensitiveInfo: function (seed) {
                self.seed = seed;
                console.log("seed", seed.toString());
            },
            __return__: function () {
                // throw new Error("Next phase not implemented");
                self.attachFile(fileName);
            }
        });
    },

    attachFile: function (fileName) {
        is.startSwarm("attachFile", "withSeed", this.seed, fileName, path.join(resourcesDir, fileName), this.localFolder).on({
            handleError: function (err) {
                throw err;
            },
            
            __return__: function () {
                console.log("Success");
            }
        })
    },




})();

s.init(localFolder);
