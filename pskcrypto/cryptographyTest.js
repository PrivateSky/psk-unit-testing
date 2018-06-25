
require('../../../engine/core').enableTesting();
const assert = $$.requireModule('double-check').assert;

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

crypto.saveDerivedSeed(seed, pin, 10000, 32);

var cipherText = crypto.encryptJson(data, pin, 10000, 32);
assert.notEqual(cipherText, null, 'Ciphertext is null');


var plaintext = crypto.decryptJson(cipherText, pin, 10000, 32);


assert.equal(JSON.stringify(data), JSON.stringify(plaintext), 'Decrypted data does not coincide with the original data');


var img = fs.readFileSync('./Anton_Chigurh.jpg');
var enImg = crypto.encryptBlob(img, pin, 1000, 32);
assert.notEqual(enImg, null, 'Ciphertext is null');

var decImg = crypto.decryptBlob(enImg, pin, 1000, 32);
assert.equal(img.toString(), decImg.toString(), 'The decrypted image is different from the original image');



