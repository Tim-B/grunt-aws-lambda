'use strict';

/*
 * grunt-aws-lambda
 * https://github.com/Tim-B/grunt-aws-lambda
 *
 * Copyright (c) 2014 Tim-B
 * Licensed under the MIT license.
 */

var fsMock = {};
var files = {};
var writtenFiles = {};

var findFile = function (wanted) {
    for(var file in files) {
        if(wanted.indexOf(file, wanted.length - file.length) !== -1) {
            return files[file];
        }
    }
    var exception = new Error();
    exception.code = 'ENOENT';
    throw exception;
};

fsMock.readFileSync = function (file) {
    var content = findFile(file);
    return content;
};

fsMock.createReadStream = function (path) {
    return {
        pipe: function (dir) {

        }
    };
};

fsMock.readFile = function(file, callback) {
    callback(null, findFile(file));
};

fsMock.setFileContent = function (suffix, content) {
    files[suffix] = content;
};

fsMock.setJSONContent = function (suffix, json) {
    fsMock.setFileContent(suffix, JSON.stringify(json));
};

fsMock.reset = function() {
    files = {};
};

module.exports = fsMock;