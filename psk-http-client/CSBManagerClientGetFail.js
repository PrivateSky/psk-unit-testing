require('../../../engine/core').enableTesting();
const VirtualMQ        = $$.requireModule('virtualmq');
const assert           = $$.requireModule("double-check").assert;
const fileStateManager = require('../../../libraries/utils/FileStateManager').getFileStateManager();
const fs               = require('fs');
const path             = require('path');
$$.requireModule('psk-http-client');


const tempFolder = path.resolve('../../../tmp');

const flow = $$.flow.create('CSBmanagerClientGetFail', {
	init: function (callback) {
		this.cb = callback;
		fileStateManager.saveState([tempFolder], () => {
			this.virtualMq = VirtualMQ.createVirtualMQ(8080, tempFolder + '/CSB');
			setTimeout(() => this.tryGet(), 500);
		});
	},
	tryGet: function() {
		$$.remote.doHttpGet('http://localhost:8080/test', (err, res) => {
			assert.true(err && typeof err === 'object', "Expected the request to fail but it didn't");
			assert.equal(err.code, 404, 'Did not received the expected 404 status code, got instead ' + err.code);

			this.virtualMq.close();
			fileStateManager.restoreState(this.cb);
		});
	}
});

assert.callback("CSBmanagerClientGetFail", function (callback) {
	flow.init(callback);
}, 1500);
