require("../../../builds/devel/pskruntime"); 
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
            assert.false(/Error: ENOENT/i.test(output), 'Exception thrown on setting wrong entry type')
            this.setInvalidUrl2()
        }, "InvalidType");
    },

    setInvalidUrl2: function (){ // invalid csb
        this.manager.setInputPath(passwordInput);
        this.manager.createEntry((output)=>{
            assert.true(/Invalid Url/i.test(output), "Set url worked with invalid csb in the url")
            assert.false(/Error: ENOENT/i.test(output), 'Exception thrown on setting wrong csb')
            this.getValidUrl()
        }, "Notes", 'invalid_csb');
    },

    getValidUrl: function(){
        this.manager.createNote(()=>{
            this.manager.setInputPath(paths.resolve("getSetUrl","1.txt"))
            this.manager.getUrl((output)=>{
                assert.false(/Path: '[A-Za-z0-9]+' } does not exist/i.test(output), "Path not found when getting a valing URL")
            }, 'Notes', 'test_title')
        })
    },

    getInvalidUrl: function(){ //invalid csb
        this.manager.getUrl((output) => {
            assert.false(/TypeError: Cannot read property '0' of undefined/i.test(output), "Exception thrown on getting url with invalid csb")
            assert.false(/Path: '[A-Za-z0-9]+' } does not exist/i.test(output), "Path not found when getting a invalid csb")
            this.cb();
        }, 'Notes', 'test_title', 'invalid_csb')
    }



});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
