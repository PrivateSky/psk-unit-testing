require("../../../engine/core").enableTesting();
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager = require('./lib/pskWalletManager')
const { createFileFromArray } = require('./lib/utility')

const assert = $$.requireModule("double-check").assert;
const testName = "getRecord"
const input1 = paths.resolve("getRecord", 'input.txt')
const passwordInput = "defaultPassword.txt"

var f = $$.flow.create(testName, {
    init: function (cb) {
        this.cb = cb;
        this.manager = PskWalletManager();
        this.createCsb();

    },

    createCsb: function () {
        this.manager.createCsb(() => {
            this.setInvalidUrl1();
        });
    },

    setInvalidUrl1: function (){ //invalid entry type
        this.manager.setInputPath(passwordInput);
        this.manager.createEntry((output)=>{
            assert.true(/Invalid Url/i.test(output), "Set url worked with invalid url")
            this.setInvalidUrl2()
        }, "InvalidType");
    },
    setInvalidUrl2: function (){ // invalid csb
        this.manager.setInputPath(passwordInput);
        this.manager.createEntry((output)=>{
            assert.true(/Invalid Url/i.test(output), "Set url worked with invalid csb in the url")
            
        }, "Notes", 'invalid_csb');
    }



});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
