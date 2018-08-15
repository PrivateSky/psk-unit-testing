const fs = require("fs");
const process = require("process");
const paths = require('path')
const { fork, spawnSync, spawn } = require("child_process")

const outputFileName = "output.txt"

class PskWalletManager{
    
    constructor(){
        
        this.inputPath="";
        this._stdout = null;
        this.expectedOutputPath = null;
        this.tempFolder = "temp";
        this.args=[]
    }

    setExpectedOutputPath(path){
        this._stdout = fs.createWriteStream(path, { flags: 'a' });
    }

    deleteTrash(){
        removeFolder(this.tempFolder)
    }

    getOutput(){
        return fs.readFileSync(paths.resolve(this.tempFolder, outputFileName), "utf8");
    }

    resetOutput(){
        fs.unlinkSync(paths.resolve(this.tempFolder, outputFileName));
    }
    

    createPskWallet(args, callback){
        if(args){
            this.args = args
            this.args.unshift("../../../../bin/pskwallet.js")
        }
        // this.deleteTrash();
        console.log('before mkdir')
        if(!fs.existsSync(this.tempFolder))
            fs.mkdirSync(this.tempFolder, 0o777);
        console.log("after mkdir")
        process.chdir(this.tempFolder)
        console.log("hello")
        
        var file = fs.openSync(outputFileName, 'a')
        var sub = spawn("node", this.args, 
        {
            stdio: [ 0, file, 2]
        });

        if(this.inputPath){
            var content =  fs.readFileSync(paths.resolve("..", this.inputPath),"utf8")
            console.log(content);
            sub.stdin.write(content);
        }

        sub.on("close", ()=>{
            fs.closeSync(file);
            process.chdir("..")
            callback()
        })

        // this.deleteTrash()
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