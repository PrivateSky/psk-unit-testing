require("../../../builds/devel/pskruntime");
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
const mq = require("../../../modules/foldermq/lib/folderMQ");
const assert = require("double-check").assert;
const fs = require("fs");
const path = require("path");
const os = require("os");

var temp_path = path.join(os.tmpdir(), fsExt.guid());
var test_dir = path.join(temp_path, './testdir');
const queue = mq.getFolderQueue(test_dir, function () {});
const queue_two = mq.getFolderQueue(test_dir, function () {});
let steps = 0;
const phases = [];
let steps_two = 0;
const phases_two = [];
const correctOrder = [1, 2, 3];

const flow_one = $$.flow.describe('firstflow', {
    init: function (callback_one) {
        this.cb = callback_one;
        this.registerConsumer();
        this.writeTestFiles();
        this.writeFilelater();
        setTimeout(this.checkResults, 2000);

    },
    writeTestFiles: function () {
        fsExt.createDir(test_dir);
        fs.writeFileSync(path.join(test_dir, '/file1.test'), JSON.stringify({test: 1}));
        fs.writeFileSync(path.join(test_dir, '/file2.test'), JSON.stringify({test: 2}));

    },
    writeFilelater: function () {
        fs.writeFileSync(path.join(test_dir, '/file3.test'), JSON.stringify({test: 3}));
    },
    consume: function (err, result) {
        assert.notEqual(result.test, null, "Bad data from folderMQ");
        if (typeof result.test !== 'undefined') {
            phases.push(result.test);
            console.log(phases);
        }
        steps++;
    },

    registerConsumer: function () {
        queue.registerConsumer(this.consume);
    },
    checkResults: function () {
        assert.arraysMatch(phases, correctOrder);
        assert.equal(steps, 3, "The 3 files were not consumed");

        this.cb();

    }
})();

const flow_two = $$.flow.describe('secondflow', {
    init: function (callback_two) {
        this.cb = callback_two;
        this.registerConsumer();
        setTimeout(this.checkResults, 6000);

    },

    consume_two: function (err, result) {
        assert.notEqual(result.test, null, "Bad data from folderMQ");
        if (typeof result.test !== 'undefined') {
            phases_two.push(result.test);
            console.log("Im hereeeeeeeeeeeeeee", phases_two)
        }
        steps_two++;
    },

    registerConsumer: function () {
        queue_two.registerConsumer(this.consume_two);
    },
    checkResults: function () {
        assert.arraysMatch(phases_two, correctOrder);
        assert.equal(steps_two, 3, "The 3 files were not consumed");
        this.cb();
        process.exit();
    }
})();

assert.callback("twoflows", function (callback_one,callback_two) {
    flow_one.init(callback_one);
    flow_two.init(callback_two);
}, 10000);

