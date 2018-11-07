describe('BrowserFS-Streams', function () {
    let fs = require("fs");
    let assert = require("assert");

    let welcomeMessage = "PrivateSky is a wonderful project";
    let exclamationMark = "!";
    let fullMessage = welcomeMessage + exclamationMark;
    let path = "/text.txt";
    let pipePath = "/pipe.txt";

    describe('writeReadStream', function () {
        it('should write content:\"' + fullMessage + "\"", function (done) {
            let writeStream = fs.createWriteStream(path);
            writeStream.write(welcomeMessage);
            writeStream.end(exclamationMark, function () {
                fs.readFile(path, function (err, data) {
                    if (err) {
                        done(err);
                    }
                    else {
                        assert.strictEqual(data.toString(), fullMessage);
                        done();
                    }
                })
            });
        });
    });


    describe('create simple readStream', function () {
        it('should read content:\"' + fullMessage + "\"", function (done) {
            let readStream = fs.createReadStream(path);
            let myData = "";

            readStream.on("data", function (data) {
                myData += data;
            });
            readStream.on("end", function () {
                assert.strictEqual(myData, fullMessage);
                done();
            })

        });
    });

    describe('create readStream with start', function () {
        let start = 7;
        it('should read content:\"' + fullMessage.substring(start) + "\"", function (done) {
            let readStream = fs.createReadStream(path, {start: start});
            let myData = "";

            readStream.on("data", function (data) {
                myData += data;
            });
            readStream.on("end", function () {
                assert.strictEqual(myData, fullMessage.substring(start));
                done();
            })
        });
    });

    describe('create readStream with end', function () {
        let end = 25;
        it('should read content:\"' + fullMessage.substring(end) + "\"", function (done) {
            let readStream = fs.createReadStream(path, {end: end});
            let myData = "";

            readStream.on("data", function (data) {
                myData += data;
            });
            readStream.on("end", function () {
                assert.strictEqual(myData, fullMessage.substring(0, end+1));
                done();
            })
        });
    });

    describe('create readStream with start and end', function () {
        let start = 16;
        let end = 25;
        it('should read content:\"' + fullMessage.substring(start, end) + "\"", function (done) {
            let readStream = fs.createReadStream(path, {start: start, end: end});
            let myData = "";
            readStream.on("data", function (data) {
                myData += data;
            });
            readStream.on("end", function () {
                assert.strictEqual(myData, fullMessage.substring(start, end+1));
                done();
            })
        });
    });

    describe('create readStream with highWaterMark:', function () {
        let highWaterMark = 4;
        it('should read content using highWaterMark:', function (done) {
            let readStream = fs.createReadStream(path, {highWaterMark: highWaterMark});
            let start = 0;
            readStream.on("data", function (data) {
                assert.strictEqual(data.toString(), fullMessage.substring(start, start + highWaterMark));
                start += highWaterMark;
            });
            readStream.on("end", function () {
                done();
            })
        });
    });

    describe('create readStream with options as a string(encoding):', function () {

        it('should read content using highWaterMark:', function (done) {
            let readStream = fs.createReadStream(path, "base64");
            let myData = "";
            readStream.on("data", function (data) {
                myData += data;
            });
            readStream.on("end", function () {
                assert.strictEqual(myData, b64EncodeUnicode(fullMessage));
                done();
            })
        });
    });

    describe('create readStream and listen on readable event', function () {
        let highWaterMark = 1;
        it('should read content using read method:', function (done) {
            let readStream = fs.createReadStream(path, {highWaterMark: highWaterMark});
            let myData = "";
            readStream.on("readable", function () {
                var chunk = readStream.read();
                if (chunk) {
                    myData += chunk;
                }
            });

            readStream.on("end", function () {
                assert.strictEqual(myData, fullMessage);
                done();
            })
        });
    });

    describe('create readStream and use pause, resume functions', function () {
        let highWaterMark = 1;
        let pauseThreshold = 10;
        it('should read content:', function (done) {
            let readStream = fs.createReadStream(path, {highWaterMark: highWaterMark});
            let myData = "";
            let steps = 0;
            readStream.on("data", function (data) {
                myData += data;
                steps++;
                if (steps % pauseThreshold === 0) {
                    readStream.pause();
                    setTimeout(() => {
                        readStream.resume();
                    }, 10);
                }
            });
            readStream.on("end", function () {
                assert.strictEqual(myData, fullMessage);
                done();
            })
        });
    });


    describe('write and read stream using encoding', function () {
        let encoding = "base64";
        it('should read and write the same content:', function (done) {
            let writeStream = fs.createWriteStream(path, encoding);
            writeStream.write(fullMessage);

            writeStream.end(function () {
                let myData = "";
                let readStream = fs.createReadStream(path, encoding);
                readStream.on("data", function (data) {
                    myData += data;
                });

                readStream.on("end", function () {
                    assert.strictEqual(myData, b64EncodeUnicode(fullMessage));
                    done();
                });
            });
        });
    });


    describe('pipe test', function () {
        it('should read and write the same content', function (done) {

            let readStream = fs.createReadStream(path);
            let writeStream = fs.createWriteStream(pipePath);
            readStream.pipe(writeStream);
            writeStream.on("finish", function () {
                let pipeStream = fs.createReadStream(pipePath);
                let myData = "";
                pipeStream.on("data", function (data) {
                    myData += data;
                });

                pipeStream.on("end", function () {
                    assert.strictEqual(myData, fullMessage);
                    done();
                });
            });
        })

    });

    function b64EncodeUnicode(str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    }
});

