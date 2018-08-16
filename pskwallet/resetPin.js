require("../../../engine/core").enableTesting();
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager = require('./lib/pskWalletManager')
const { createFileFromArray } = require('./lib/utility')

const assert = $$.requireModule("double-check").assert;
const testName = "resetPin"



var f = $$.flow.create(testName, {
    init: function (cb) {
        this.cb = cb;
        this.manager = PskWalletManager();
        this.manager.deleteTrash();
        this.createCsb(cb);

    },

    createCsb: function () {
        this.manager.setArgs(["create", 'csb', 'test_csb'])
        this.manager.runCommand(() => {
            this.resetPin();
        });
    },

    resetPin: function (){  
        var buff1 = fs.readFileSync(paths.resolve(this.manager.tempFolder, ".privateSky", "Dseed"));
        var output = this.manager.getOutput();
        var inputFilePath = paths.resolve("resetPin", "input1.txt");
        var regex = new RegExp(/^([^ ]+)$/, 'm');
        var seed = regex.exec(output)[0]
        createFileFromArray(inputFilePath, [seed.trim(), "0000000000000"])
        console.log(seed)
        // console.log(regex.lastMatch);

        this.manager.setInputPath(inputFilePath);
        this.manager.setArgs(["reset", "pin"]);
        this.manager.runCommand(()=>{
            var buff2 = fs.readFileSync(paths.resolve(this.manager.tempFolder, ".privateSky", "Dseed"));
            assert.false(buff1.compare(buff2) == 0, "Dseed didn't change after changing the pin");
            this.resetWithFakeSeed();
        })
    },

    resetWithFakeSeed(){
        const fakeSeed = "veryveryveryfake"
        createFileFromArray(this.manager.inputFilePath, [fakeSeed, "0000000000000"])
        this.manager.runCommand(()=>{
            var output = this.manager.getOutput();
            assert.true(/ENOENT: no such file or directory/i.test(output), "Pskwallet accepted fake seed to change the password")
            this.cb();
        })
    }




});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
