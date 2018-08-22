const fs = require("fs");
const process = require("process");
const paths = require('path')
const { fork, execFile, spawnSync, spawn } = require("child_process")
const os = require('os');
const outputFileName = "output.txt"
const defaultCsb = "test_csb"
function PskWalletManager(){
    
    var obj =  {
        
        inputPath:          "",

        _stdout:            null,
        
        expectedOutputPath: null,
        
        tempFolder:         "temp",

        args:               [],

        _serverProc:         null,

        setExpectedOutputPath: function(path){
            this._stdout = fs.createWriteStream(path, { flags: 'a' });
        },

        deleteTrash: function(){
            removeFolder(this.tempFolder)
            removeFolder("tmp") // folder created by server
        },

        getOutput: function(){
            return fs.readFileSync(paths.resolve(this.tempFolder, outputFileName), "utf8");
        },

        resetOutput: function(){
            fs.unlinkSync(paths.resolve(this.tempFolder, outputFileName));
        },
        
        setArgs: function(args){
            if (args) {
                this.args = args
                this.args.unshift("../../../../bin/pskwallet.js")
            }
        },

        setInputPath: function(path){
            this.inputPath = path;
        },

        createCsb: function(callback, csbName=defaultCsb){

            this.setArgs(["create", 'csb', csbName])
            this.runCommand(callback)
        },

        createNote: function(callback, csbName=defaultCsb){
            this.createEntry(callback, 'Notes', csbName);
        },

        createEntry: function(callback, entryType, csbName=defaultCsb){
            this.setArgs(['set', 'url', `${csbName}/${entryType}`])
            this.runCommand(callback);
        },

        updateNote: function(callback, title, csbName=defaultCsb){
            this.updateEntry(callback, csbName, 'Notes', title)
        },

        updateEntry: function(callback, title, entryType, csbName=defaultCsb){
            this.setArgs(['set', 'key', csbName, entryType, title ])
            this.runCommand(callback);
        },

        printCsb: function(callback, csbName=defaultCsb){
          this.setArgs(['print', 'csb', csbName]);
          this.runCommand(callback);  
        },


        startServer: function(){
            this._serverProc = spawn("node", ['../../../libraries/utils/startServer.js'])
        },

        backupCsb: function (callback, address = 'http://localhost:8080'){
            this.setArgs(['add', 'backup', address])
            this.runCommand(callback)
        },

        restore: function(callback, csbName){
            var arr = ['create']
            if(csbName) arr.push(csbName)
            this.setArgs(arr);
            this.runCommand(callback);
        },

        stopServer: function(){
            // process.kill(this._serverProc.pid, "SIGINT");
            this._serverProc.kill("SIGINT");
        },       

        runCommand: function(callback){
            
            // this.deleteTrash();
            // console.log('before mkdir')
            if(!fs.existsSync(this.tempFolder))
                fs.mkdirSync(this.tempFolder, 0o777);
            // console.log("after mkdir")
            process.chdir(this.tempFolder)
            // console.log("hello")
            var file = fs.openSync(outputFileName, 'w')
            var stdioArr = ['pipe', file, 2]
            if(this.inputPath){
                var input = fs.openSync(paths.resolve("..", this.inputPath), 'r')
                stdioArr[0]=input;
            }
        
            
            var sub = spawn("node", this.args, 
            {
                stdio: stdioArr
            });

            // sub.stdin.on("drain", ()=>{
            //     var resp = responses[0];
            //     responses.splice(0, 1);
            // })

            sub.on("close", ()=>{
                fs.closeSync(file);
                process.chdir("..")
                callback(this.getOutput())
            })
        }
    }   
    obj.deleteTrash();
    return obj;
}

module.exports = PskWalletManager;



function removeFolder(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                removeFolder(curPath);
            } else { 
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};