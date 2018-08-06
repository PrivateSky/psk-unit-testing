var packer = require('zip-stream');
var archive = new packer(); // OR new packer(options)

var fs = require('fs');

var out = fs.createWriteStream('out.zip');
var superFile = fs.createReadStream('C:\\Users\\Asac\\Downloads\\WebStorm-2018.1.5.exe');

archive.on('error', function(err) {
	throw err;
});

archive.pipe(out);

// pipe archive where you want it (ie fs, http, etc)
// listen to the destination's end, close, or finish event

archive.entry('string contents', { name: 'string.txt' }, function(err, entry) {
	if (err) throw err;
	archive.entry(null, { name: 'directory/' }, function(err, entry) {
		if (err) throw err;
		archive.entry(superFile, {name: "directory/WebStorm-2018.1.5.exe"}, function (err, entry){
			if(err) throw err;
			archive.finish();
		});
	});
});