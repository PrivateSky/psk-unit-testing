require("../../../builds/devel/pskruntime");
const fs = require("fs");
const mq = require("../../../modules/foldermq/lib/folderMQ");

const folderPath = './consumerwaiting';

const queue  = mq.getFolderQueue(folderPath, function () {});
const assert = require("double-check").assert;
let steps    = 0;
const phases = [];
let order =[];
const correctOrder = [1,2,3];

const flow = $$.flow.describe('consumerwaiting', {
    init: function (callback) {
        // Try clear the dir before writing if anything exists
        try {
            for (const file of fs.readdirSync(folderPath)) fs.unlink(folderPath + '/' + file);
        } catch (e) {}
        this.cb = callback;
        this.registerConsumer();
        this.writeTestFiles();
        this.writeFilelater();
        setTimeout(this.changeLabel,1000);
        setTimeout(this.checkResults, 4000);

    },
    writeTestFiles: function () {
        fs.writeFileSync(folderPath + '/file1.test', JSON.stringify({test: 1}));
        fs.writeFileSync(folderPath + '/file2.test', JSON.stringify({test: 2}));

    },
    writeFilelater:function(){
        fs.writeFileSync(folderPath + '/file3.test.in_progress', JSON.stringify({test: 3}));
    },
    changeLabel:function(){
               setTimeout(function () {
                       fs.rename(folderPath + '/file3.test.in_progress', folderPath + '/file3.test',(err) => {
                           assert.false(err, 'Error while renaming files');
                   });

    },0);
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
    checkResults: function (result) {
        console.log(order)

        assert.arraysMatch(order, correctOrder);
        assert.equal(steps, 3, "The 3 files were not consumed");

        try {
            for (const file of fs.readdirSync(folderPath)) fs.unlinkSync(folderPath + '/' + file);
            fs.rmdirSync(folderPath);
        } catch (e) {}

        this.cb();
        process.exit();
    }
})();

assert.callback("consumerwaiting", function (callback) {
    flow.init(callback);
}, 7000);

