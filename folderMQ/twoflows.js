require("../../../builds/devel/pskruntime");
const fs = require("fs");
const mq = require("../../../modules/foldermq/lib/folderMQ");

const folderPath = './consumerwaiting';

const queue  = mq.getFolderQueue(folderPath, function () {});
const queue_two  = mq.getFolderQueue(folderPath, function () {});
const assert = require("double-check").assert;
let steps    = 0;
const phases = [];
let order =[];
const correctOrder = [1,2,3];

const flow = $$.flow.describe('firstflow', {
    init: function (callback) {
        // Try clear the dir before writing if anything exists
        try {
            for (const file of fs.readdirSync(folderPath)) fs.unlink(folderPath + '/' + file);
        } catch (e) {}
        this.cb = callback;
        this.registerConsumer();

        this.writeTestFiles();
        setTimeout(this.writeFilelater,1000);
        setTimeout(this.checkResults, 4000);

    },
    writeTestFiles: function () {
        fs.writeFileSync(folderPath + '/file1.test', JSON.stringify({test: 1}));
        fs.writeFileSync(folderPath + '/file2.test', JSON.stringify({test: 2}));

    },
    writeFilelater:function(){
        fs.writeFileSync(folderPath + '/file3.test', JSON.stringify({test: 3}));
    },
    consume: function (err, result) {
        assert.notEqual(result.test, null, "Bad data from folderMQ");
        if (typeof result.test !== 'undefined') {
            phases.push(result.test);
            order.push(result.test)
        }
        steps++;
    },

    registerConsumer: function () {
        queue.registerConsumer(this.consume);
    },
    checkResults: function () {

        assert.arraysMatch(order, correctOrder);
        assert.equal(steps, 3, "The 3 files were not consumed");

        try {
            for (const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
            fs.rmdirSync(folderPath);
        } catch (e) {}

        this.cb();

    }
})();
assert.callback("firstflow", function (callback) {
    flow.init(callback);
}, 6000);

const flow_two = $$.flow.describe('secondflow', {
    init: function (callback) {
        // Try clear the dir before writing if anything exists
        try {
            for (const file of fs.readdirSync(folderPath)) fs.unlink(folderPath + '/' + file);
        } catch (e) {}
        this.cb = callback;
        this.registerConsumer();
        setTimeout(this.checkResults, 2000);

    },

    consume_two: function (err, result) {
        assert.notEqual(result.test, null, "Bad data from folderMQ");
        if (typeof result.test !== 'undefined') {
            phases.push(result.test);
            order.push(result.test)
            console.log("Rreading with second flow here",result.test)
        }
        steps++;
    },

    registerConsumer: function () {
        queue_two.registerConsumer(this.consume_two);
    },
    checkResults: function () {
    console.log(order)



    }
})();

assert.callback("secondflow", function (callback) {
    flow_two.init(callback);
}, 2000);

