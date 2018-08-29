require("../../../engine/core").enableTesting();
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
            this.manager.deleteMasterCsb();

            this.backup();
        });

    },

    backup: function(){
        this.manager.backupCsb((output)=>{
            assert.true
            this.restoreCsb(this.restoreNonexistent)
        })
    },

    restoreCsb: function(cb){
        this.manager.restore((output)=>{
            assert.true(/csb_test has been restored/i.test(output), "Failed to restore csb data")
            cb();
        })
    },

    restoreNonexistent: function(){
        var csbName = "nonexistent_csb"
        this.manager.restore((output)=>{
            assert.false(new RegExp(`${csbName} has been restored`,'i').test(output),
                                 "Succeded restoring nonexistent csb")
            this.restoreWithDeletedMaster()
        }, csbName)
    },

    restoreWithDeletedMaster: function(){
        this.manager.deleteMasterCsb();
        this.restoreCsb(this.cb)
    }



});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 4000);
