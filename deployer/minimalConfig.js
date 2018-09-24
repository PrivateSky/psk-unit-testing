require("../../../builds/devel/pskruntime");

const deployer = require('../../../deployer/Deployer');
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const assert = require("double-check").assert;
const path = require('path');

const config = {
    'modules': ['callflow'],
    'libraries': ['launcher']
};


const flow = $$.flow.create('checksumActionTest', {
    init: function (callback) {
        this.cb = callback;
        this.computeOriginalFilesHashes();
        deployer.runBasicConfig('../../../', config, (err, res) => {
            assert.false(err, 'Deployer had an error ' + (err ? err : ''));
        this.checkDownloadedFiles(() => {
            this.cleanup();
    })
        ;
    })
        ;
    },
    computeOriginalFilesHashes: function (callback) {
        try {
            this.launcher_sha512 = fsExt.checksum('libraries/launcher', 'sha512', 'hex');
            this.callflow_sha512 = fsExt.checksum('modules/callflow', 'sha512', 'hex');
        } catch (err) {
            console.log(err);
        }

    },
    checkDownloadedFiles: function (callback) {
        const downloadedCallflowHash = fsExt.checksum(path.normalize('tests/psk-unit-testing/deployer/modules/callflow'), 'sha512', 'hex');
        const downloadedLauncherHash = fsExt.checksum(path.normalize('tests/psk-unit-testing/deployer/libraries/launcher'), 'sha512', 'hex');
        assert.equal(this.callflow_sha512, downloadedCallflowHash, 'Downloaded file is not the same as the original');
        assert.equal(this.launcher_sha512, downloadedLauncherHash, 'Downloaded file is not the same as the original');
        callback();
    },
    cleanup: function () {

        fsExt.remove(path.normalize('tests/psk-unit-testing/deployer/modules'), () => {
            fsExt.remove(path.normalize('tests/psk-unit-testing/deployer/libraries'), this.cb);
    })
        ;
    }
});

assert.callback('checksumActionTest', function (callback) {
    flow.init(callback);
}, 3000);
