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
            this.backup();
        });

    },

    backup: function(){
        this.manager.backupCsb((output)=>{
            this.manager.stopServer();
            assert.true(/All csbs are backed up/i.test(output), "Csbs weren't backed up")
            this.wrongAddressBackup()
        })
    },

    wrongAddressBackup: function(){
        var wrongAddress = "http://www.google.com"
        this.manager.backupCsb((output)=>{
            assert.true(/Failed to post master Csb on server/i.test(output), 
                        "Pskwallet didn't reject a wrong address")
            this.restoreCsb()
        }, wrongAddress)
    },

    restoreCsb: function(){
        this.manager.restore((output)=>{
            assert.true(/restore successfully/i.test(output), "Failed to restore csb data")
            this.cb();
        })
    }



});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 4000);
