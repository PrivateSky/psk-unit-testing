const fs = require("fs")
const os = require("os")

function createFileFromArray(path, arr){
    var str = ""
    arr.forEach((val)=>{
        str += val + os.EOL;
    })
    str += os.EOL + os.EOL;
    console.log('before write')
    fs.writeFileSync(path, str, { encoding: "utf8"} );
}

module.exports = {
    createFileFromArray: createFileFromArray
}