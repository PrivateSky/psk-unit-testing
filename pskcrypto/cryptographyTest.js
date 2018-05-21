var crypto = require("./cryptography");



var keys = crypto.generateECDSAKeyPair();

var signature = crypto.sign(keys.private, 'some text');
console.log(signature);


console.log(crypto.verify(keys.public, signature, 'some text'));

var encryptionKey = crypto.generateEncryptionKey();




var data ={
    key1: "value1",
    key2: "value2"
};


var cipherText = crypto.encryptJson(data, encryptionKey );

var plaintext = crypto.decryptJson(cipherText, encryptionKey);

console.log(plaintext);

var http = require('http')
    , fs = require('fs');

fs.readFile('C:\\Users\\Acer 2\\Desktop\\ecb.jpg', function(err, data) {
    if (err) throw err; // Fail if the file can't be read.
    var enImg = crypto.encryptBlob(data, encryptionKey);
    var decImg = crypto.decryptBlob(enImg, encryptionKey);
    http.createServer(function(req, res) {
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.end(decImg); // Send the file data to the browser.
    }).listen(8124);
    console.log('Server running at http://localhost:8124/');
});

