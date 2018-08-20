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
        this.inputPath = paths.resolve('addBackup', '1.txt')
        this.manager = PskWalletManager();
        this.manager.startServer();
        this.manager.createCsb(() => {
            this.backup();
        });

    },

    backup: function(csbName=""){
        this.manager.backupCsb(()=>{
            
        })
    }



});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
