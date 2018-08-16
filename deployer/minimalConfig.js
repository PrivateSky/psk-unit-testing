require("../../../engine/core").enableTesting();

const deployer = require('../../../deployer/Deployer');
const fsExt    = require('../../../libraries/utils/FSExtension').fsExt;
const assert   = $$.requireModule("double-check").assert;
const path     = require('path');

const config = {
    'modules'  : ['callflow'],
    'libraries': ['domain']
};

const CALLFLOW_SHA512 = '1224f566a526c366e3c5d49d4a8a87630b174dd37279d816a7abc953ab0095c4126efed670b85c5ac37374dd6bf2e13e3788ffd9e95361cba6b5aadc6f084c99';
const DOMAIN_SHA512 = 'e7ad8350643149e5cbd6b364e2f733733ce9bf50cded95f3c06ddd8337bd34113dfebe42bcf1b0e81b950ed1301886e7d63c7f4cd8ccba181fdf6ce18071badf';


const flow = $$.flow.create('checksumActionTest', {
    init: function (callback) {
        this.cb = callback;
        deployer.runBasicConfig('../../../', config, (err, res) => {
            assert.false(err, 'Deployer had an error ' + (err ? err : ''));
            console.log('res ?', res);
            this.checkDownloadedFiles(() => {
                this.cleanup();
            });
        });
    },
    checkDownloadedFiles: function (callback) {
        const downloadedCallflowHash = fsExt.checksum(path.normalize('tests/psk-unit-testing/deployer/modules/callflow'), 'sha512', 'hex');
        const downloadedDomainHash = fsExt.checksum(path.normalize('tests/psk-unit-testing/deployer/libraries/domain'), 'sha512', 'hex');
        assert.equal(CALLFLOW_SHA512, downloadedCallflowHash, 'Downloaded file is not the same as the original');
        assert.equal(DOMAIN_SHA512, downloadedDomainHash, 'Downloaded file is not the same as the original');
        callback();
    },
    cleanup: function () {
        fsExt.remove(path.normalize('tests/psk-unit-testing/deployer/modules'), () => {
            fsExt.remove(path.normalize('tests/psk-unit-testing/deployer/libraries'), this.cb);
        });
    }
});

assert.callback('checksumActionTest', function (callback) {
    flow.init(callback);
}, 3000);
