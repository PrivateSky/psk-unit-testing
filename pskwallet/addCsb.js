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
        this.manager = PskWalletManager();
        this.createCsb(()=>{
            this.manager.resetOutput()
            this.recreateCsb(this.cb);
        })
        
    },
    
    createCsb: function(callback){
        
        this.manager.createCsb( ()=>{
            let privateSkyFolder = paths.resolve(this.manager.tempFolder, ".privateSky");
            let folderExists = fs.existsSync(privateSkyFolder)
            let dseedExists = fs.existsSync(paths.resolve(privateSkyFolder, "Dseed"));
            var output = this.manager.getOutput();
            assert.true(folderExists, "Folder .privateSky wasn't created.");
            assert.true(dseedExists, "Dseed inside the folder .privateSky wasn't created");
            assert.true(/The default pin is: 12345678/i.test(output), "Default pin wasn't set to 12345678");
            console.log(output)
            this.checkCreatedCsb();
            callback();
        });
    },

    checkCreatedCsb: function(){
        var dir = fs.readdirSync(this.manager.tempFolder);
        assert.true(dir.length > 2, "Csb file wasn't created in the directory pskwallet was executed")
    },

    recreateCsb(callback){
        this.manager.setInputPath("defaultPassword.txt")
        this.manager.createCsb(() => {
            var output = this.manager.getOutput();
            // console.log("BEFORE CHECKING THE ATTEMPT")
            assert.true(/A csb with the provided alias already exists/i.test(output), "Attempted to create a csb over existing one")
            console.log("TEST FINISHED")
            callback();
        });
        
    }

    
});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
