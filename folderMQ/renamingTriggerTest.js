require("../../../engine/core").enableTesting();
const fs = require("fs");
const mq = require("../../../modules/soundpubsub/lib/folderMQ");

const folderPath = './renamingTriggerTest';
const inProgressExtension = '.test.in_progress';

const queue = mq.getFolderQueue(folderPath, function () {});
const assert = $$.requireModule("double-check").assert;
let fileCount = 0;
const filesToTry = 30;


const flow = $$.flow.create('renamingTriggerTest', {
	init: function (callback) {
		this.cb = callback;
		// Try clear the dir before writing if anything exists
		try {
			for (const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
		} catch (e) {}
		this.writeTestFiles();
		this.registerConsumer();
		setTimeout(this.checkResults, 1000);
	},
	writeTestFiles: function () {
		fs.writeFileSync(folderPath + '/main_file.test', JSON.stringify({test: 0}));
		for (let i = 1; i <= filesToTry; i++) {
			fs.writeFileSync(folderPath + '/file' + i + inProgressExtension, JSON.stringify({test: i}));
		}
	},
	consume: function () {
		fileCount++;
	},
	registerConsumer: function () {
		for (let i = 1; i <= filesToTry; i++) {
			let j = i;
			setTimeout(function () {
				fs.rename(folderPath + '/file' + j + inProgressExtension, folderPath + '/file' + j + '.test', (err) => {
					assert.false(err, 'Error while renaming files');
				});
			}, j - 1);
		}
		queue.registerConsumer(this.consume);
	},
	checkResults: function () {
		console.log("## Consumed " + fileCount + " of " + (filesToTry + 1) + " files");
		assert.equal(fileCount, filesToTry + 1, `Some files were not consumed, consumed ${fileCount} of ${filesToTry + 1} files`);

		try {
			for (const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
			fs.rmdirSync(folderPath);
		} catch (e) {}

		if (fileCount === filesToTry + 1) {
			console.log("Test passed");
		}
		this.cb();
		process.exit();
	}
});

assert.callback("renamingTriggerTest", function (callback) {
	flow.init(callback);
}, 2000);
