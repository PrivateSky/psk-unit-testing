require('../../../modules/virtualmq/flows/remoteSwarming');
require("../../../engine/core").enableTesting();
const assert = $$.requireModule("double-check").assert;
const path = require('path');
const Duplex = require('stream').Duplex;
const fileStateManager = require('../../../libraries/utils/FileStateManager').getFileStateManager();

const CHANNEL_ID = '123';
const tempFolder = path.resolve('../../../tmp');

const flow = $$.flow.create('RemoteSwarmingFlowTest', {
	init: function(callback) {
		this.cb = callback;
		fileStateManager.saveState([tempFolder], () => {
			this.remoteSwarmingFlow = $$.flow.create('RemoteSwarming');
			this.remoteSwarmingFlow.init(tempFolder, (err) => {
				assert.false(err, 'Error initializing RemoteSwarming');
				this.startSwarm();
			});
		});
	},
	startSwarm: function() {
		const swarmBuffer = Buffer.from(JSON.stringify(swarmDefinition, 'utf8'));
		this.remoteSwarmingFlow.startSwarm(CHANNEL_ID, bufferToStream(swarmBuffer), (err, result) => {
			assert.false(err, 'Starting swarm has failed ' + (err && err.message));
			fileStateManager.restoreState();
			this.cb();
		})
	}
});

assert.callback("RemoteSwarmingFlowTest", function (callback) {
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

function bufferToStream(buffer) {
	const stream = new Duplex();
	stream.push(buffer);
	stream.push(null);
	return stream;
}