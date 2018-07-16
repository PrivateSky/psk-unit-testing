require('../../../engine/core').enableTesting();
const VirtualMQ        = $$.requireModule('virtualmq');
const assert           = $$.requireModule("double-check").assert;
const fileStateManager = require('../../../libraries/utils/FileStateManager').getFileStateManager();
const fs               = require('fs');
const path             = require('path');
$$.requireModule('psk-http-client');


const tempFolder = path.resolve('../../../tmp');
const fileSize = 100000;

const flow = $$.flow.create('CSBmanagerClientBasic', {
	init: function (callback) {
		this.cb = callback;
		fileStateManager.saveState([tempFolder], () => {
			this.virtualMq = VirtualMQ.createVirtualMQ(8080, tempFolder + '/CSB');
			setTimeout(() => {
				this.postFile(() => {
					this.getFile();
				});
			}, 500);
		});
	},
	postFile: function (callback) {
		const buffer = Buffer.alloc(fileSize, 'a');
		$$.remote.doHttpPost('http://localhost:8080/CSB/testId', buffer, (err) => {
			assert.false(err, 'Post to virtualMq has failed');
			callback();
		});
	},
	getFile: function () {
		$$.remote.doHttpGet('http://localhost:8080/CSB/testId', (err, res) => {
			assert.false(err, "Get from virtualMq has failed");
			assert.true(fileSize === res.length, 'The received file is not complete or corrupted');

			let match = true;
			for(let i = 0; i < fileSize; ++i) {
				if(res[i] !== 'a') {
					match = false;
					break;
				}
			}

			assert.true(match, 'The received file is possibly corrupted');

			this.virtualMq.close();
			fileStateManager.restoreState(this.cb);
		});
	}
});

assert.callback("CSBmanagerClientBasic", function (callback) {
	flow.init(callback);
}, 1500);
