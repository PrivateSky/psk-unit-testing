function simpleTest() {
    let fs = require("fs");
    let assert = require("assert");
    let welcomeMessage = "PrivateSky is a wonderful project";
    let exclamationMark = "!";
    let path = "/text.txt";

    describe('BrowserFS', function () {
        describe('writeFile', function () {
            it('should save without error', function (done) {
                fs.writeFile(path, welcomeMessage, done);
            });
        });

        describe("readFile", function () {
            it('should read the welcome message', function (done) {
                fs.readFile(path, function (err, data) {
                    if (err) {
                        done(err);
                    }
                    else {
                        assert.strictEqual(data.toString(), welcomeMessage);
                        done();
                    }
                });
            });
        });

        describe("appendFile", function () {
            it('should append an exclamation mark', function (done) {
                fs.appendFile(path, exclamationMark, function (err) {
                    if (err) {
                        done(err);
                    }
                    else {
                        fs.readFile(path, function (err, data) {
                            if (err) {
                                done(err);
                            }
                            else {
                                assert.strictEqual(data.toString(), welcomeMessage + exclamationMark);
                                done();
                            }
                        })
                    }
                });
            });
        });

        describe("removeFile", function () {
            it('should remove the file', function (done) {
                fs.unlink(path, function (err) {
                    if (err) {
                        done(err);
                    }
                    else {
                        fs.stat(path, function (err) {
                            assert.notEqual(err, undefined);
                            done();
                        })
                    }
                });
            })
        })
    });
}

simpleTest();