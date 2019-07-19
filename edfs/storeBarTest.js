require("../../../builds/devel/pskruntime");
require("../../../builds/devel/consoleTools");
require("../../../builds/devel/psknode");

const utils = require("./utils/utils");

const edfs = require("edfs");
const bar = require("bar");
const assert = require("double-check").assert;

const url = "http://localhost:8080";
const createEDFSBrickStorage = edfs.createEDFSBrickStorage;
const createFsAdapter = bar.createFsBarWorker;

const ArchiveConfigurator = bar.ArchiveConfigurator;

ArchiveConfigurator.prototype.registerStorageProvider("EDFSBrickStorage", createEDFSBrickStorage, url);
ArchiveConfigurator.prototype.registerDiskAdapter("fsAdapter", createFsAdapter);

const archiveConfigurator = new ArchiveConfigurator();
archiveConfigurator.setStorageProvider("EDFSBrickStorage", url);
archiveConfigurator.setDiskAdapter("fsAdapter");
archiveConfigurator.setBufferSize(256);

const archive = new bar.Archive(archiveConfigurator);
const folders = ["fld/fld2", 'dot'];
const files = [
    "fld/a.txt", "fld/fld2/b.txt"
];

const text = ["asta e un text", "asta e un alt text"];
const folderPath = "fld";
let savePath = "dot";

assert.callback("StoreBarInEDFSTEst", (callback) => {
    utils.ensureFilesExist(folders, files, text, (err) => {
        assert.true(err === null || typeof err === "undefined", "Received error");

        utils.computeFoldersHashes([folderPath], (err, initialHashes) => {
            assert.true(err === null || typeof err === "undefined", "Received error");

            archive.addFolder(folderPath, (err, mapDigest) => {
                assert.true(err === null || typeof err === "undefined", "Received error");
                assert.true(typeof mapDigest !== "undefined", "Did not receive mapDigest");

                archive.getFolder(savePath, (err) => {
                    assert.true(err === null || typeof err === "undefined", "Received error");

                    utils.computeFoldersHashes([savePath], (err, decompressedHashes) => {
                        assert.true(err === null || typeof err === "undefined", "Received error");
                        assert.true(utils.hashArraysAreEqual(initialHashes, decompressedHashes), "Files are not identical");

                        utils.deleteFolders([folderPath, savePath], (err) => {
                            assert.true(err === null || typeof err === "undefined", "Received error");
                            callback();
                        });
                    });
                });
            });
        });
    });
}, 1500);


