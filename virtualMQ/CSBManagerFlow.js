require('../../../modules/virtualmq/flows/CSBmanager');
require("../../../engine/core").enableTesting();
const assert = $$.requireModule("double-check").assert;
const path = require('path');
const Duplex = require('stream').Duplex;
const fileStateManager = require('../../../libraries/utils/FileStateManager').getFileStateManager();
const fs = require('fs');


const fileName = 'test-file.txt';
const demoFileBufferSize = 100000;
const tempFolder = path.resolve('../../../tmp');


const flow = $$.flow.create('CSBmanagerFlowTest', {
	init: function (callback) {
		this.cb = callback;
		fileStateManager.saveState([tempFolder], () => {
			this.__initializeCSBManager((err) => {
				assert.false(err, 'Error initializing CSBmanager: ' + (err && err.message));
				this.__getDemoFileStream();
				this.__writeFile(() => {
					this.__readFile();
				});
			});
		});
	},
	__initializeCSBManager: function (callback) {
		this.CSBManager = $$.flow.create('CSBmanager');
		this.CSBManager.init(`${tempFolder}/CSB`, callback);
	},
	__getDemoFileStream: function () {
		this.demoFileStream = bufferToStream(Buffer.alloc(100000, 'a'));
	},
	__writeFile: function (callback) {
		this.CSBManager.write(fileName, this.demoFileStream, (err) => {
			assert.false(err, "Error writing demo file: " + (err && err.message));
			callback();
		});
	},
	__readFile: function () {
		const tempWriteStream = fs.createWriteStream(`${tempFolder}/CSB/${fileName}`);

		this.CSBManager.read(fileName, tempWriteStream, (err) => {
			assert.false(err, "Error reading demo file: " + (err && err.message));

			streamToBuffer(fs.createReadStream(`${tempFolder}/CSB/${fileName}`), (err, buffer) => {
				if (err) {
					throw err;
				}

				let match = true;
				if (buffer.length !== demoFileBufferSize) {
					match = false;
				} else {
					for (let i = 0; i < demoFileBufferSize; ++i) {
						if (buffer[i] !== 'a') {
							match = false;
							break;
						}
					}
				}

				assert.true(match, "Read was not successful");

				fileStateManager.restoreState(this.cb);
			});
		});
	}
});

assert.callback("CSBmanagerFlowTest", function (callback) {
	flow.init(callback);
}, 1500);


function bufferToStream(buffer) {
	const stream = new Duplex();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

function streamToBuffer(stream, callback) {
	const buffers = [];
	stream.on('error', callback);
	stream.on('data', (data) => buffers.push(...data.toString('utf8')));
	stream.on('end', () => callback(null, buffers));
}
