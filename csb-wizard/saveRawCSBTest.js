require('../../../builds/devel/pskruntime');
require('../../../builds/devel/consoleTools');

const csbCore = require("csb-core");
const url = "http://localhost:8080";
const csbIdentifier = new csbCore.CSBIdentifier(undefined, url);
const rootCSB = csbCore.RootCSB.createNew(process.cwd(), csbIdentifier);
const rawCSB = new csbCore.RawCSB();
const asset1 = rawCSB.getAsset("global.CSBReference", "csb1");
asset1.init("csb1", csbIdentifier.getSeed(), csbIdentifier.getDseed());
const asset2 = rawCSB.getAsset("global.CSBReference", "csb2");
asset2.init("csb2", csbIdentifier.getSeed(), csbIdentifier.getDseed());
rawCSB.saveAsset(asset1);
rawCSB.saveAsset(asset2);
rootCSB.__saveRawCSB(rawCSB, (err) => {
    if (err) {
        throw err;
    }

    console.log("saved");
    rootCSB.__loadRawCSB((err, csb) => {
        if (err) {
            throw err;
        }
        console.log("CSB loaded");
    })
})