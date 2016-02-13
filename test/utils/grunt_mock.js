/*
 * grunt-aws-lambda
 * https://github.com/Tim-B/grunt-aws-lambda
 *
 * Copyright (c) 2014 Tim-B
 * Licensed under the MIT license.
 */


'use strict';

var gruntMock = {};

var fakeGrunt = function (harness) {
    this.log = {
        writeln: function(value) {
            harness.output.push(value);
        }
    };
    this.config = {
        set: function(key, value) {
            harness.config[key] = value;
        },
        requires: function(key) {

        },
        get: function(key) {
            return harness.config[key];
        }
    };
};

var fakeOptions = function (gruntFileOptions) {
    return function (baseOptions) {
        for(var key in gruntFileOptions) {
            baseOptions[key] = gruntFileOptions[key];
        }
        return baseOptions;
    };
};

var fakeAsync = function(callback, harness) {
    return function() {
        return function(status) {
            harness.status = status;
            callback(harness);
        };
    };
};

gruntMock.execute = function(handler, params) {

    var harness = {
        output: [],
        config: {},
        status: null
    };

    if(params.config) {
        harness.config = params.config;
    }

    var NewHandler = handler(new fakeGrunt(harness));
    NewHandler.prototype.options = fakeOptions(params.options);
    NewHandler.prototype.async = fakeAsync(params.callback, harness);
    NewHandler.prototype.target = 'fake-target';

    new NewHandler();
};

module.exports = gruntMock;