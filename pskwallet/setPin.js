require("../../../builds/devel/pskruntime"); 
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager = require('./lib/pskWalletManager')

const assert = $$.requireModule("double-check").assert;
const testName = "setPin"



var f = $$.flow.create(testName, {
    init: function (cb) {
        this.cb = cb;
        this.manager = PskWalletManager();
        this.createCsb();

    },

    createCsb: function () {
        this.manager.setInputPath(paths.resolve("setPin", "input1.txt"))
        this.manager.createCsb(() => {
            var output = this.manager.getOutput();
            this.changePin();
        });
    },

    changePin(){ //dseed change check
        var buff1 = fs.readFileSync(paths.resolve(this.manager.tempFolder, ".privateSky", "Dseed"));
        this.manager.resetOutput();
        this.manager.setArgs(["set", "pin"])

        this.manager.runCommand(()=>{
            var output = this.manager.getOutput();
            console.log(output);
            // assert.false(/Pin is invalid/i.test(output), "Right pin code wasn't recognized by pskwallet");
            var buff2 = fs.readFileSync(paths.resolve(this.manager.tempFolder, ".privateSky", "Dseed"));
            assert.false(buff1.compare(buff2) == 0, "Dseed didn't change after changing the pin");
            this.insertInvalidPin()
        })
        
    },

    insertInvalidPin() {
        this.manager.setInputPath(paths.resolve("setPin", "input2.txt"));
        this.manager.resetOutput();
        this.manager.setArgs(["set", "pin"])

        this.manager.runCommand(() => {
            var output = this.manager.getOutput();
            console.log(output);
            assert.true(/Pin is invalid/i.test(output), "Wrong pin code  was accepted by pskwallet as right");
            this.cb();
        })

    }


});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
