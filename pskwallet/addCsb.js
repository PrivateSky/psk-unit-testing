require("../../../builds/devel/pskruntime"); 
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager  = require('./lib/pskWalletManager')

const assert = require("double-check").assert;
var test = [null, undefined, "string", false, function () { }, 5, Infinity, {}, []];
var channels = { ch1: "superFunChannel", ch2: "Random" };
const testName = "addCsb"



var f = $$.flow.describe(testName, {
    init: function (cb) {
        this.cb = cb;
        this.manager = PskWalletManager();
        this.createCsb(()=>{
            
        })
        
    },
    
    createCsb: function(){
        
        this.manager.createCsb( (output)=>{
            let privateSkyFolder = paths.resolve(this.manager.tempFolder, ".privateSky");
            let folderExists = fs.existsSync(privateSkyFolder)
            let dseedExists = fs.existsSync(paths.resolve(privateSkyFolder, "Dseed"));
            assert.true(folderExists, "Folder .privateSky wasn't created.");
            assert.true(dseedExists, "Dseed inside the folder .privateSky wasn't created");
            assert.true(/The default pin is: 12345678/i.test(output), "Default pin wasn't set to 12345678");
            this.checkCreatedCsb();
            this.manager.resetOutput()
            this.checkInMasterCsb();
        });
    },

    checkInMasterCsb: function(){
        this.manager.setInputPath("defaultPassword.txt")
        this.manager.printMasterCsb((output)=>{
            assert.true(/Title: 'test_csb'/i.test(output), "test_csb wasn't added to master csb")
            this.recreateCsb();
        })
    },

    checkCreatedCsb: function(){
        var dir = fs.readdirSync(this.manager.tempFolder);
        assert.true(dir.length > 2, "Csb file wasn't created in the directory pskwallet was executed")
    },

    recreateCsb(){
        
        this.manager.createCsb((output) => {
            // console.log("BEFORE CHECKING THE ATTEMPT")
            assert.true(/A csb with the provided alias already exists/i.test(output), "Attempted to create a csb over existing one")
            this.cb()
        });
        
    }

    
});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
