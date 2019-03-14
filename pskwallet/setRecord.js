require("../../../builds/devel/pskruntime"); 
const { spawn, fork } = require("child_process");
const fs = require('fs')
const process = require("process")
const paths = require("path")
const PskWalletManager = require('./lib/pskWalletManager')

const assert = require("double-check").assert;
const testName = "setRecord"
const { createFileFromArray }  = require("./lib/utility")


var f = $$.flow.describe(testName, {
    init: function (cb) {
        this.cb = cb;
        this.inputPath = paths.resolve('setRecord', '1.txt')
        this.manager = PskWalletManager();
        this.manager.createCsb(()=>{
            this.addNote();
        });

    },

    

    addNote: function(){ //record de anumit tip
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
        this.manager.printCsb((output)=>{
            console.log(output)
            assert.false(/There aren't any csbs in the current folder/i.
                            test(output), 'No records were created/modified')
            
            var satisfied = recordArguments.every((v)=> 
                    new RegExp(`.*${v}.*`, 'i').test(output))

            assert.true(satisfied, 'Record wasn\'t created/modified')
            callback();
            
        })
    },
    updateRecord: function(recordArguments){ //testarea modificarii unui field intr-un record avand cheia specificata
        var arr = ['12345678', 'y', 'title2', 'content2']
        createFileFromArray(this.inputPath, arr)
        this.manager.updateNote(()=>{
            this.checkRecord([arr[2], arr[3]], this.setRecordWithoutKeyAndField)
        }, recordArguments[1], 'test_csb')
    },

    setRecordWithoutKeyAndField: function(){ //with unspecified key and field
        
        this.manager.setArgs(['set', 'key', 'test_csb', 'Notes'])
        var fileLines = [
            '12345678',
            'title3',
            'test note nr.3'
        ]
        createFileFromArray(this.inputPath, fileLines)
        this.manager.runCommand((output)=>{ 
            console.log(output)
            this.checkRecord([fileLines[1],fileLines[2]], ()=>{
                this.setRecordWithoutField();
            })
        })
    },
    setRecordWithoutField: function(){ //with unspecified field
        
        this.manager.setArgs(['set', 'key', 'test_csb', 'Notes', 'title3'])
        var fileLines = [
            '12345678',
            'y',
            'title4',
            'test note nr.3'
        ]
        createFileFromArray(this.inputPath, fileLines)
        this.manager.runCommand((output)=>{ 
            
            this.checkRecord([fileLines[2],fileLines[3]], this.setInvalidRecordType)
        })
    },
    setInvalidRecordType: function(){ //with unspecified field
        
        this.manager.setArgs(['set', 'key', 'test_csb', 'InvalidRecord', 'title3'])
        var fileLines = [
            '12345678',
            'y',
            'title4',
            'test note nr.3'
        ]
        createFileFromArray(this.inputPath, fileLines)
        this.manager.runCommand((output)=>{ 
            
            this.checkRecord([fileLines[2],fileLines[3]], ()=>{
                this.cb();
            })
        })
    },





});
assert.callback(testName, function (callback) {
    f.init(callback);
}, 1000);
