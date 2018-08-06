require("../../../engine/core");
const path = require("path");
const yauzl = $$.requireModule("yauzl");
const fs = require("fs");

let outputFolder = "output/unzip";

yauzl.open("input/yazltest.zip", {lazyEntries: true}, function(err, zipfile) {
	if (err) throw err;
	zipfile.readEntry();
	zipfile.on("entry", function(entry) {
		if (/\/$/.test(entry.fileName)) {
			zipfile.readEntry();
		} else {
			let folder = path.dirname(entry.fileName);
			$$.ensureFolderExists(folder, () => {
				zipfile.openReadStream(entry, function(err, readStream) {
					if (err) throw err;

					readStream.on("end", function() {
						zipfile.readEntry();
					});

					let fileName = path.join(outputFolder, entry.fileName);
					let folder = path.dirname(fileName);
					$$.ensureFolderExists(folder, () => {
						let output = fs.createWriteStream(fileName);
						readStream.pipe(output);
					});
				});
			});
		}
	});
});