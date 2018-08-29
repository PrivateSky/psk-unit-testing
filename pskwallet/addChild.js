require("../../../engine/core").enableTesting();
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager = require('./lib/pskWalletManager')
const { createFileFromArray } = require('./lib/utility')

const assert = $$.requireModule("double-check").assert;
const testName = "addChild"
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
            this.createChildCsb()

        });
    },
    createChildCsb: function () {
        this.manager.setInputPath(paths.resolve('addChild', '2.txt'))
        this.manager.createEntry(() => {
            this.manager.printCsb((output) => {
                assert.true(/Alias: 'child_csb'/i.test(output) && !/There aren't any csbs in the current folder/i.test(output),
                    "Child csb with the name 'child_csb' couldn't be created")
                this.createChildCsbWithTheSameName()
            }, 'test_csb')
        }, 'Csb');
    },

    createChildCsbWithTheSameName: function(){
        this.manager.setInputPath(paths.resolve('addChild', '1.txt'))
        this.manager.createEntry(() => {
            this.manager.printCsb((output)=>{
                assert.true(/Alias: 'test_csb'/i.test(output) && !/There aren't any csbs in the current folder/i.test(output),
                     "Child csb with the same name as parent couldn't be created")
                
            }, 'test_csb')
        }, 'Csb');
    }



});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
