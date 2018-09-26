require("../../../builds/devel/pskruntime"); 
const fsExt = require('../../../libraries/utils/FSExtension').fsExt
const assert = require("double-check").assert;

const path = require("path");
const os = require("os");
var testWorkspaceDir = path.join(os.tmpdir(), fsExt.guid());
var dummyTargetDir = path.join(testWorkspaceDir, "./checksum-dummy");
var dummyTargetFile = `${dummyTargetDir}/file1.js`;

var f = $$.flow.create("checksumSourceUnavailable", {
    start:function() {
        assert.fail("checksumSourceUnavailable",  this.test)
    },
    test: function() {
        let checksum = fsExt.checksum(dummyTargetFile);
    }
});
f.start();

