require("../../../engine/core");
const path = require("path");
const yazl = $$.requireModule("yazl");
const fs = require("fs");

let outputFolder = "output";
let zipfile = new yazl.ZipFile();
zipfile.addFile("input/testfile.txt", "testfile.txt");
zipfile.addFile("input/testfile.txt", "newFolder/testfile.txt");
$$.ensureFolderExists(outputFolder, () => {
	zipfile.outputStream.pipe(fs.createWriteStream(path.join(outputFolder,"yazltest.zip"))).on("close", function() {
		console.log("done");
	});
});


// call end() after all the files have been added
zipfile.end();