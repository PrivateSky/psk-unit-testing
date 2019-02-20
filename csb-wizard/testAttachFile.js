require('../../../builds/devel/pskruntime');
require('../../../builds/devel/psknode');
require('../../../builds/devel/virtualMQ');
require('../../../builds/devel/consoleTools');
const assert = require("double-check").assert;
const Seed = require('pskwallet').Seed;
const path = require('path');
const fs = require('fs');
const fileStateManager = require('../../../libraries/utils/FileStateManager').getFileStateManager();

const tempFolder = path.resolve('../../tmp');
const csbFolder = path.join(tempFolder, 'csb');
const fileName = 'fileName';
const multipleFilesNumber = 5;

const csbInteractions = require("../../../modules/csb-wizard/utils/csbInteractions");

const flow = $$.flow.describe('testAttachFile', {

    start: function (callback) {
        this.callback = callback;
        fileStateManager.saveState([tempFolder], () => {
            const serial = this.serial(this.result);
            serial.createCSB(serial.progress);
            serial.prepareFile(fileName, serial.progress);
            serial.attachSingleFile(serial.progress);
            serial.attachSameNameFile(serial.progress);
            serial.prepareMultipleFiles(0, serial.progress);
            serial.attachMultipleFiles(0, serial.progress);
        });
    },

    createCSB: function (callback) {
        csbInteractions.createCSB(csbFolder, "http://localhost:8080", (err, seed) => {
            assert.false(err, "Error creating CSB: " + (err && err.message));
            assert.true(seed, "Seed is undefined");
            assert.true(Seed.isValidForm(seed), 'Received invalid seed');
            this.dseed = Seed.deriveSeed(seed);
            callback();
        });
    },
    prepareFile: function (fileName, callback) {
        const file = Buffer.alloc(10000, 'a');
        // throw new Error('ddd');
        fs.writeFile(path.join(csbFolder, fileName), file, (err) => {
            assert.false(err, 'Error preparing file for test ' + (err && err.message));
            callback();
        });
    },

    attachSingleFile: function (callback) {
        csbInteractions.attachFile(csbFolder, fileName, this.dseed, (err) => {
            assert.false(err, 'Error attaching single file ' + (err && err.message));
            callback();
        })
    },
    attachSameNameFile: function (callback) {
        csbInteractions.attachFile(csbFolder, fileName , this.dseed, (err) => {
            assert.true(err, 'Error missing when attaching a file with an existing name ');
            callback();
        })
    },
    prepareMultipleFiles: function(index = 0, callback) {
        if(index >= multipleFilesNumber) {
            callback();
            return;
        }

        this.prepareFile(fileName + index, (err) => {
            assert.false(err, 'Unexpected error while preparing files ' + (err && err.message));
            this.prepareMultipleFiles(++index, callback);
        });
    },
    attachMultipleFiles: function (index = 0, callback) {
        if(index >= multipleFilesNumber) {
            callback();
            return;
        }

        csbInteractions.attachFile(csbFolder, fileName + index , this.dseed, (err) => {
            assert.false(err, 'Error missing when attaching file in sequence with number ' + index);
            this.attachMultipleFiles(++index, callback);
        });
    },
    restoreState: function (callback) {
        fileStateManager.restoreState(callback);
    },
    progress: function (err) {
        assert.false(err, 'Unexpected error ', (err && err.message));
    },
    result: function(err) {
        assert.false(err, 'Unexpected error ', (err && err.message));
        this.callback();
    }
})();

assert.callback('testAttachFile', function (callback) {
    flow.start(callback);
}, 2000);
