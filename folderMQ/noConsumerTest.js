require("../../../builds/devel/pskruntime"); 
const fs = require("fs");
const mq = require("../../../modules/foldermq/lib/folderMQ");

const folderPath = './noConsumerChannel';

const queue  = mq.getFolderQueue(folderPath, function () {});
const assert = require("double-check").assert;

$$.loadLibrary("testSwarms", "../../../libraries/testSwarms");

const flow = $$.flow.describe('noConsumerTest', {
	init: function (callback) {
		this.cb = callback;
		try {
			for (const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
		} catch (e) {}

		// Get current number of files
		this.initialFilesNumber = fs.readdirSync(folderPath).length; //should be 0
		this.sendSwarm();
		setTimeout(this.checkResults, 1000);
	},
	sendSwarm: function () {
		const f = $$.swarm.start("testSwarms.simpleSwarm");
		const producerHandler = queue.getHandler();
		producerHandler.addSwarm(f);
	},
	checkResults: function () {
		const currentFiles = fs.readdirSync(folderPath);
		assert.equal(this.initialFilesNumber + 1, currentFiles.length, "The file in queue was lost");
		fs.unlinkSync(folderPath + '/' + currentFiles[0]);
		fs.rmdirSync(folderPath);

		this.cb();
		process.exit();
	}
})();

assert.callback("noConsumerTest", function (callback) {
	flow.init(callback);
}, 2000);
