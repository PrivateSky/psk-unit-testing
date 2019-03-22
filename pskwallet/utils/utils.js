const fs = require("fs");
const path = require("path");

function deleteRecursively(inputPath, callback) {

    fs.stat(inputPath, function (err, stats) {
        if (err) {
            callback(err, stats);
            return;
        }
        if (stats.isFile()) {
            fs.unlink(inputPath, function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, true);
                }
            });
        } else if (stats.isDirectory()) {
            fs.readdir(inputPath, function (err, files) {
                if (err) {
                    callback(err, null);
                    return;
                }
                const f_length = files.length;
                let f_delete_index = 0;

                const checkStatus = function () {
                    if (f_length === f_delete_index) {
                        fs.rmdir(inputPath, function (err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, true);
                            }
                        });
                        return true;
                    }
                    return false;
                };
                if (!checkStatus()) {
                    files.forEach(function (file) {
                        const tempPath = path.join(inputPath, file);
                        deleteRecursively(tempPath, function removeRecursiveCB(err, status) {
                            if (!err) {
                                f_delete_index++;
                                checkStatus();
                            } else {
                                callback(err, null);
                            }
                        });
                    });
                }
            });
        }
    });
}

module.exports = {
    deleteRecursively
};