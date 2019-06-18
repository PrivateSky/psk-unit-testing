<<<<<<< HEAD
require('../../../builds/devel/pskruntime');
const fs = require('fs');
const mq = require('../../../modules/foldermq/lib/folderMQ');

const folderPath = './watcherChannel';

const queue = mq.getFolderQueue(folderPath, function() {});
const assert = require('double-check').assert;

let ct = 0;
const numMessages = 4;
=======
////////////////////////////////////////////////////////////////////////
// Test if folderMQ consumes the contents of the folder queue in order
////////////////////////////////////////////////////////////////////////
require("../../../builds/devel/pskruntime"); 
const fs = require("fs");
const mq = require("../../../modules/foldermq/lib/folderMQ");

const folderPath = './watcherChannel';

const queue  = mq.getFolderQueue(folderPath, function () {});
const assert = require("double-check").assert;

let ct = 0;
>>>>>>> 0263e140a26278ddb5c1a8023439bd400ccfadd7
const expected = [];
const received = [];

const flow = $$.flow.describe('watcherTest', {
<<<<<<< HEAD
  init: function(callback) {
    // Try clear the dir before writing if anything exists
    try {
      for (const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
    } catch (e) {}

    this.cb = callback;
    this.registerConsumer();
    let setRef = setInterval(this.writeTestFile, 100);
    setTimeout(() => {
      clearInterval(setRef);
      this.checkResults();
    }, 1000);
  },
  registerConsumer: function() {
    queue.registerConsumer(this.consume);
  },
  consume: function(err, result) {
    assert.notEqual(result.test, null, 'Data in file is not fine');
    received.push(result.test);
  },
  writeTestFile: function() {
    expected.push(ct);
    fs.writeFileSync(folderPath + '/file' + ct + '.test', JSON.stringify({ test: ct }));
    ct++;
  },
  checkResults: function() {
    console.log(expected);
    console.log(received);
    let flag = true;
    for (let i in expected) {
      if (!(expected[i] === received[i])) {
        flag = false;
      }
    }
    assert.equal(flag, true, 'Wrong Order');
    this.end();
  },
  end: function() {
    try {
      for (const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
      fs.rmdirSync(folderPath);
    } catch (e) {}

    console.log('Test passed');
    this.cb();
    process.exit();
  }
})();

assert.callback(
  'consumeExistingTest',
  function(callback) {
    flow.init(callback);
  },
  20000
);
=======
	init: function (callback) {
		// Try clear the dir before writing if anything exists
		try {
			for (const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
		} catch (e) {}

		this.cb = callback;
		this.registerConsumer();
        let setRef = setInterval(this.writeTestFile, 100);
        setTimeout(() => {
            clearInterval(setRef);
            this.checkResults();
        },1000);
	},
	registerConsumer: function () {
		queue.registerConsumer(this.consume);
	},
	consume: function (err, result) {
		assert.equal(err,null);
		assert.notEqual(result.test, null, "Data in file is not fine");
        received.push(result.test);
	},
	writeTestFile: function () {
        expected.push(ct);
        fs.writeFileSync(folderPath + '/file' + ct +'.test', JSON.stringify({test: ct}));
        ct++;
	},
	checkResults: function () {
        console.log(expected);
        console.log(received);
        let flag = true;
        for (let i in expected){
            if(!(expected[i] === received[i])){
                flag=false;
            }
        }
        assert.equal(flag, true, 'Wrong Order');
        this.end();
    },
    end: function() {
		try {
			for (const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
			fs.rmdirSync(folderPath);
		} catch (e) {}

		console.log("Test passed");
		this.cb();
		process.exit();
    }
})();

assert.callback("orderTest", function (callback) {
	flow.init(callback);
}, 2000);
>>>>>>> 0263e140a26278ddb5c1a8023439bd400ccfadd7
