
require('../../../builds/devel/pskruntime');
const assert = require('double-check').assert;

var crypto = require("../../../modules/pskcrypto/cryptography");
var fs = require('fs');

const defaultIV = Buffer.from('defaultIV');
const defaultSalt = Buffer.from('defaultSalt');


var keys = crypto.generateECDSAKeyPair();

var signature = crypto.sign(keys.private, 'some text');
assert.notEqual(signature, null, 'Signature is null');


assert.true(crypto.verify(keys.public, signature, 'some text'), 'Fail to verify signature');


var seed = 'seed';
var pin = 'pin';



var data ={
    key1:"value1",
    key2:"value2"
};

crypto.saveDerivedSeed(seed, pin, 32);

var cipherText = crypto.encryptJson(data, pin);
assert.notEqual(cipherText, null, 'Ciphertext is null');


var plaintext = crypto.decryptJson(cipherText, pin);


assert.equal(JSON.stringify(data), JSON.stringify(plaintext), 'Decrypted data does not coincide with the original data');


var img = fs.readFileSync('./Anton_Chigurh.jpg');
var enImg = crypto.encryptBlob(img, pin);
assert.notEqual(enImg, null, 'Ciphertext is null');

var decImg = crypto.decryptBlob(enImg, pin);
assert.equal(img.toString(), decImg.toString(), 'The decrypted image is different from the original image');

function generateFile(size){ //size in Kb
    var file = 'file'+size;
    var data=[];
    for(let i = 0; i < size * 512; i++){
        data.push('a');
    }
    fs.writeFileSync(file, data);
}

// generateFile(100);

var data = fs.readFileSync('file100');
console.time('encryptFile');
crypto.encryptBlob(data, pin);
console.timeEnd('encryptFile');

var digestJson = crypto.hashJson(data);
console.log(digestJson);

var digestBlob = crypto.hashBlob(img);
console.log(digestBlob);
