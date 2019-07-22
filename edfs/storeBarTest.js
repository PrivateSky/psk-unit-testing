require("../../../builds/devel/pskruntime");
require("../../../builds/devel/consoleTools");
require("../../../builds/devel/psknode");
require("../../../builds/devel/virtualMQ");

const utils = require("./utils/utils");

const edfs = require("edfs-brick-storage");
const bar = require("bar");
const assert = require("double-check").assert;

const createEDFSBrickStorage = edfs.createEDFSBrickStorage;
const createFsAdapter = bar.createFsBarWorker;

const ArchiveConfigurator = bar.ArchiveConfigurator;

ArchiveConfigurator.prototype.registerDiskAdapter("fsAdapter", createFsAdapter);
ArchiveConfigurator.prototype.registerStorageProvider("EDFSBrickStorage", createEDFSBrickStorage);

const archiveConfigurator = new ArchiveConfigurator();
archiveConfigurator.setDiskAdapter("fsAdapter");
archiveConfigurator.setBufferSize(256);

const folders = ["fld/fld2", 'dot'];
const files = [
    "fld/a.txt", "fld/fld2/b.txt"
];

const text = ["asta e un text", "asta e un alt text"];
const folderPath = "fld";
let savePath = "dot";

let PORT = 9090;
const tempFolder = "../../../../tmp";

const VirtualMQ = require("virtualmq");
function createServer(callback) {
    let server = VirtualMQ.createVirtualMQ(PORT, tempFolder, undefined, (err, res) => {
        if (err) {
            console.log("Failed to create VirtualMQ server on port ", PORT);
            console.log("Trying again...");
            if (PORT > 0 && PORT < 50000) {
                PORT++;
                createServer(callback);
            } else {
                return callback(err);
            }
        } else {
            console.log("Server ready and available on port ", PORT);
            let url = `http://127.0.0.1:${PORT}`;
            callback(undefined, server, url);
        }
    });
}

assert.callback("StoreBarInEDFSTest", (callback) => {
    utils.ensureFilesExist(folders, files, text, (err) => {
        assert.true(err === null || typeof err === "undefined", "Received error");

        utils.computeFoldersHashes([folderPath], (err, initialHashes) => {
            assert.true(err === null || typeof err === "undefined", "Received error");
            createServer((err, server, url) => {

                assert.true(err === null || typeof err === "undefined", "Received error");
                archiveConfigurator.setStorageProvider("EDFSBrickStorage", url);
                const archive = new bar.Archive(archiveConfigurator);
                archive.addFolder(folderPath, (err, mapDigest) => {
                    if (err) {
                        throw err;
                    }
                    assert.true(err === null || typeof err === "undefined", "Received error");
                    assert.true(typeof mapDigest !== "undefined", "Did not receive mapDigest");

                    archive.extractFolder(savePath, (err) => {
                        if (err) {
                            throw err;
                        }
                        assert.true(err === null || typeof err === "undefined", "Received error");

                        utils.computeFoldersHashes([savePath], (err, decompressedHashes) => {
                            assert.true(err === null || typeof err === "undefined", "Received error");
                            assert.true(utils.hashArraysAreEqual(initialHashes, decompressedHashes), "Files are not identical");
                            server.close();
                            utils.deleteFolders([folderPath, savePath], (err) => {
                                assert.true(err === null || typeof err === "undefined", "Received error");
                                callback();
                            });
                        });
                    });
                });
            });

        });
    });
}, 1500);


