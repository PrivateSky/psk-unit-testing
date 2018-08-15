require("../../../engine/core").enableTesting();
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager  = require('./lib/pskWalletManager')

const assert = $$.requireModule("double-check").assert;
var test = [null, undefined, "string", false, function () { }, 5, Infinity, {}, []];
var channels = { ch1: "superFunChannel", ch2: "Random" };
const testName = "addCsb"



var f = $$.flow.create(testName, {
    init: function (cb) {
        this.cb = cb;
        console.log("hello")
        this.manager = new PskWalletManager();
        this.createCsb(()=>{
            this.manager.resetOutput()
            this.recreateCsb(this.cb);
        })
        
    },
    
    createCsb: function(callback){
        this.manager.createPskWallet(["create", 'csb', 'test_csb'], ()=>{
            let privateSkyFolder = paths.resolve(this.manager.tempFolder, ".privateSky");
            let folderExists = fs.existsSync(privateSkyFolder)
            let dseedExists = fs.existsSync(paths.resolve(privateSkyFolder, "Dseed"));
            var output = this.manager.getOutput();
            assert.true(folderExists, "Folder .privateSky wasn't created.");
            assert.true(dseedExists, "Dseed inside the folder .privateSky wasn't created");
            assert.true(/The default pin is: 12345678/i.test(output), "Default pin wasn't set to 12345678");
            console.log(output)
            callback();
        });
    },

    recreateCsb(callback){
        this.manager.inputPath = "input.txt";
        this.manager.createPskWallet(null, () => {
            var output = this.manager.getOutput();
            assert.true(/A csb with the provided alias already exists/i.test(output), "Attempted to create a csb over existing one")
            callback();
        });
        
    }

    
});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 5000);
