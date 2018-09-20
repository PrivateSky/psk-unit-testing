require("../../../builds/devel/pskruntime"); 
const assert           = $$.requireModule("double-check").assert;
const fileStateManager = require('../../../libraries/utils/FileStateManager').getFileStateManager();
const VirtualMQ        = $$.requireModule('virtualmq');
const path             = require('path');
$$.requireModule('psk-http-client');

const PORT = 9090;
const tempFolder = path.resolve('../../../tmp');
const CHANNEL_NAME = 'testChannel';
const url = `http://127.0.0.1:${PORT}/${CHANNEL_NAME}`;

const flow = $$.flow.create('VirtualMQTest', {
	init: function(callback) {
		this.cb = callback;

		fileStateManager.saveState([tempFolder], (err) => {
			assert.false(err, 'Saving state has failed');
			this.virtualMq = VirtualMQ.createVirtualMQ(PORT, tempFolder, () => {
				this.sendSwarm(() => {
					this.getSwarm(() => {
						this.getSwarm(() => {

						});
						setTimeout(() => {
							this.sendSwarm(() => {
								this.virtualMq.close();
								fileStateManager.restoreState();
								this.cb();
							})
						}, 100);
					});
				});
			});
		});
	},
	sendSwarm: function(callback) {
		$$.remote.doHttpPost(url, JSON.stringify(swarmDefinition), (err, data) => {
			assert.false(err, 'Posting swarm failed ' + (err ? err.message : ''));
			callback();
		});
	},
	getSwarm: function(callback) {
		$$.remote.doHttpGet(url, (err, data) => {
			assert.false(err, 'Getting swarm has failed');
			callback();
		});
	}
});

assert.callback("VirtualMQTest", function (callback) {
	flow.init(callback);
}, 1500);

const swarmId = '26a4-01ba6a63a554';
const swarmDefinition = {
	meta: {
		swarmId: swarmId,
		requestId: swarmId,
		swarmTypeName: 'testSwarm',
		phaseName: 'testPhase',
		args: undefined,
		command: 'relay',
		target: 'agent\\agent_x'
	}
};
