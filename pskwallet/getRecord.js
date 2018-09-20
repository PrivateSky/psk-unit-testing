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


var f = $$.flow.create(testName, {
    init: function (cb) {
        this.cb = cb;
        this.manager = PskWalletManager();
        this.createCsb();

    },

    createCsb: function () {
        this.manager.createCsb(() => {
            this.getRecord();
        });
    },

    createRecord: function(){
        this.manager.setInputPath(input1)
        this.manager.createNote(()=>{
            this.getKeyWithoutField()
        })
    },

    getKeyWithoutField: function(){
        this.manager.getKey((output)=>{
            var satisfied = ['test_title', 'test note nr.3'].every((v) =>
                new RegExp(`.*${v}.*`, 'i').test(output))
            assert.true(satisfied, "Get record doesn't work")
            this.getKeyWithoutTitle();
        }, "Notes", 'test_title');
    },
    getKeyWithoutTitle: function(){
        this.manager.getKey((output)=>{
            var satisfied = ['test_title', 'test note nr.3'].every((v) =>
                new RegExp(`.*${v}.*`, 'i').test(output))
            assert.false(satisfied, "Get key showed data by using only the field")
        }, "Notes", '', 'Title');
    },
    getKeyInvalidRecordType: function(){
        
        this.manager.getKey((output)=>{
            var satisfied = ['test_title', 'test note nr.3'].every((v) =>
                new RegExp(`.*${v}.*`, 'i').test(output))
            assert.true(satisfied, "Get key showed data by using invalid record type")
        }, "InvalidType");
    },
    getKeyWithInvalidTitle: function () {
        this.manager.getKey((output) => {
            var satisfied = ['test_title', 'test note nr.3'].every((v) =>
                new RegExp(`.*${v}.*`, 'i').test(output))
            assert.false(satisfied, "Get key showed data by using invalid title")
        }, "Notes", 'no_test_title');
    },
    getKeyWithInvalidField: function () {
        this.manager.getKey((output) => {
            var satisfied = ['test_title', 'test note nr.3'].every((v) =>
                new RegExp(`.*${v}.*`, 'i').test(output))
            assert.false(satisfied, "Get key showed data by using invalid field")
        }, "Notes", 'test_title', 'InvalidField');
    },
    getKeyWithInvalidFieldAndTitle: function () {
        this.manager.getKey((output) => {
            var satisfied = ['test_title', 'test note nr.3'].every((v) =>
                new RegExp(`.*${v}.*`, 'i').test(output))
            assert.false(satisfied, "Get key showed data by using invalid field")
        }, "Notes", 'no_test_title', 'InvalidField');
    },




});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
