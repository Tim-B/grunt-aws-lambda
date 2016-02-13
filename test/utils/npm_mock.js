/*
 * grunt-aws-lambda
 * https://github.com/Tim-B/grunt-aws-lambda
 *
 * Copyright (c) 2014 Tim-B
 * Licensed under the MIT license.
 */

var npmMock = {};

var params = {};

npmMock.load = function(options, callback) {
    callback(null, npmMock);
};

npmMock.commands = {
    install: function(location, folder, callback) {
        //params.location = location;
        //params.folder = folder;
        //callback();
    }
};

npmMock.config = {
    set: function(key, value) {}
};

npmMock.reset = function() {
    params = {};
};

module.exports = npmMock;