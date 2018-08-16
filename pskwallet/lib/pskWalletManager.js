const fs = require("fs");
const process = require("process");
const paths = require('path')
const { fork, execFile, spawnSync, spawn } = require("child_process")
const os = require('os');
const outputFileName = "output.txt"
function PskWalletManager(){
    
    return {
        
        inputPath:          "",

        _stdout:            null,
        
        expectedOutputPath: null,
        
        tempFolder:         "temp",

        args:               [],

        setExpectedOutputPath: function(path){
            this._stdout = fs.createWriteStream(path, { flags: 'a' });
        },

        deleteTrash: function(){
            removeFolder(this.tempFolder)
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
            
            var command = "";

            this.args.forEach((val)=>{
                command += val + " ";
            })
            
            var sub = spawn("node", this.args, 
            {
                stdio: stdioArr
            });

            var responses = ["12345678\n", "87654321\n"];

            // sub.stdin.on("drain", ()=>{
            //     var resp = responses[0];
            //     responses.splice(0, 1);
            // })

            sub.on("close", ()=>{
                fs.closeSync(file);
                process.chdir("..")
                callback()
            })
        }
    }   
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