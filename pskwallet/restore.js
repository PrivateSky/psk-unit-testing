require("../../../builds/devel/pskruntime"); 
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager = require('./lib/pskWalletManager')

const assert = $$.requireModule("double-check").assert;
const testName = "addBackup"
const { createFileFromArray } = require("./lib/utility")


var f = $$.flow.create(testName, {
    init: function (cb) {
        this.cb = cb;
        this.inputPath = "defaultPassword.txt"
        this.manager = PskWalletManager();
        this.manager.startServer();
        this.manager.setInputPath(this.inputPath)
        this.manager.createCsb(() => {
            console.log("before backup")
            
            this.backup();
        });

    },

    backup: function () {
        this.manager.backupCsb((output) => {
            assert.true(/All csbs are backed up/i.test(output), "Csbs weren't backed up")
            this.wrongAddressBackup()
        })
    },

    wrongAddressBackup: function () {
        var wrongAddress = "http://www.google.com"
        this.manager.backupCsb((output) => {
            assert.true(/Failed to post master Csb on server/i.test(output),
                "Pskwallet didn't reject a wrong address")
            
        }, wrongAddress)
    },

    restoreCsb: function () {
        this.manager.restore((output) => {
            assert.true(/has been restored/i.test(output), "Failed to restore csb data")
            this.restoreSpecificCsb(this.restoreWithDeletedMaster)
        })
    },

    restoreWithDeletedMaster: function(){
        this.manager.deleteMasterCsb();
        this.restoreSpecificCsb(()=>{
            
            this.manager.stopServer();
            this.cb();
        });
    },

    restoreSpecificCsb: function(cb){
        this.manager.restore((output)=>{
            assert.true(/test_csb has been restored/i.test(output), "Failed to restore test_csb")
            cb()
        }, 'test_csb')
    }



});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 4000);
