require("../../../engine/core").enableTesting();
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager = require('./lib/pskWalletManager')

const assert = $$.requireModule("double-check").assert;
const testName = "setRecord"
const { createFileFromArray }  = require("./lib/utility")


var f = $$.flow.create(testName, {
    init: function (cb) {
        this.cb = cb;
        this.inputPath = paths.resolve('setRecord', '1.txt')
        this.manager = PskWalletManager();
        this.manager.createCsb(()=>{
            this.addNote();
        });

    },

    

    addNote: function(){
        const arr = [
            '12345678',
            'test_title',
            'Useless content'
        ]
        createFileFromArray(this.inputPath, arr)
        this.manager.setInputPath(this.inputPath);
        this.manager.createNote(()=>{
            var args = arr.slice(1, 2)
            this.checkRecord(args, ()=> updateRecord(args));
        })
    },

    checkRecord: function(recordArguments, callback){
        var output = this.manager.getOutput()
        console.log(output);
        createFileFromArray(this.inputPath, ['12345678'])
        this.manager.printCsb(()=>{
            output = this.manager.getOutput();
            console.log(output)
            assert.false(/There aren't any csbs in the current folder/i.
                            test(output), 'No records were created')
            
            var satisfied = recordArguments.every((v)=> 
                    new RegExp(`.*${v}.*`, 'i').test(output))

            assert.true(satisfied, 'Record wasn\'t created')
            callback();
            
        })
    },
    updateRecord: function(recordArguments){
        var arr = ['12345678', 'y', 'title2', 'content2']
        createFileFromArray(this.inputPath, arr)
        this.manager.updateNote(()=>{
            this.checkRecord([arr[2], arr[3]], this.setRecordWithoutKey)
        }, recordArguments[1], 'test_csb')
    },

    setRecordWithoutKey: function(){
        
        this.manager.setArgs(['set', 'key', 'test_csb', 'Notes'])
        var fileLines = [
            '12345678',
            'title3',
            'test note nr.3'
        ]
        createFileFromArray(this.inputPath, fileLines)
        this.manager.runCommand(()=>{
            var output = this.manager.getOutput()
            console.log(output)
            this.checkRecord([fileLines[1],fileLines[2]])
        })
    }


});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
