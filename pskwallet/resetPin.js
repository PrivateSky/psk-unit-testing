require("../../../builds/devel/pskruntime"); 
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager = require('./lib/pskWalletManager')
const { createFileFromArray } = require('./lib/utility')

const assert = require("double-check").assert;
const testName = "resetPin"



var f = $$.flow.describe(testName, {
    init: function (cb) {
        this.cb = cb;
        this.manager = PskWalletManager();
        this.createCsb();

    },

    createCsb: function () {
        this.manager.createCsb(() => {
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
        this.manager.runCommand((output)=>{
            var buff2 = fs.readFileSync(paths.resolve(this.manager.tempFolder, ".privateSky", "Dseed"));
            assert.true(/ENOENT: no such file or directory/i.test(output), "Pskwallet threw an exception")
            assert.false(buff1.compare(buff2) == 0, "Dseed didn't change after changing the pin");
            this.resetWithFakeSeed();
        })
    },

    resetWithFakeSeed(){
        const fakeSeed = "veryveryveryfake"
        createFileFromArray(this.manager.inputFilePath, [fakeSeed, "0000000000000"])
        this.manager.runCommand((output)=>{
            assert.true(/ENOENT: no such file or directory/i.test(output), "Pskwallet accepted fake seed to change the password")
            this.cb();
        })
    }




});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
