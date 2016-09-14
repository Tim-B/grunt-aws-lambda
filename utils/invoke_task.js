/*
 * grunt-aws-lambda
 * https://github.com/Tim-B/grunt-aws-lambda
 *
 * Copyright (c) 2014 Tim-B
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var fs = require('fs');

var invokeTask = {};

invokeTask.loadFunction = function(file_name) {
    return require(path.resolve(file_name));
};

invokeTask.getHandler = function (grunt) {

    return function () {

        var options = this.options({
            'package_folder': './',
            'handler': 'handler',
            'file_name': 'index.js',
            'event': 'event.json',
            'client_context': 'client_context.json',
            'identity': 'identity.json',
            'expect_fail': false
        });

        grunt.log.writeln("");

        var done = this.async();

        var clientContext = null;

        //since clientContext should be optional, skip if doesn't exist
        try {
            clientContext = JSON.parse(fs.readFileSync(path.resolve(options.client_context), "utf8"));
        } catch (e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
        }

        var identity = null;
        //since identity should be optional, skip if doesn't exist
        try {
            identity = JSON.parse(fs.readFileSync(path.resolve(options.identity), "utf8"));
        } catch (e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
        }

        var cwd;
        if (options.package_folder) {
            cwd = process.cwd();
            process.chdir(path.resolve(options.package_folder));
        }

        var context = {
            done: function (error, result) {
                if (error === null || typeof(error) === 'undefined') {
                    context.succeed(result);
                } else {
                    context.fail(error);
                }
            },
            succeed: function (result) {
                if (cwd) {
                    process.chdir(cwd);
                }
                grunt.log.writeln("");
                var header = (options.expect_fail ? "Unexpected" : "Expected") + " Success!  Message:"
                grunt.log.writeln(header);
                grunt.log.writeln(grunt.repeat(header.length, "-"));
                var msg = (typeof(result) === 'object') ? JSON.stringify(result, 2) : result;
                grunt.log.writeln((typeof(result) !== 'undefined') ? msg : "Successful!");
                done(true && !options.expect_fail);
            },
            fail: function (error) {
                if (cwd) {
                    process.chdir(cwd);
                }
                grunt.log.writeln("");
                var header = (options.expect_fail ? "Expected" : "Unexpected") + " Failure!  Message:"
                grunt.log.writeln(header);
                grunt.log.writeln(grunt.repeat(header.length, "-"));
                var msg = (typeof(error) === 'object') ? JSON.stringify(error, 2) : error;
                grunt.log.writeln((typeof(error) !== 'undefined') ? msg : "Error not provided.");
                done(false || options.expect_fail);
            },
            awsRequestId: 'LAMBDA_INVOKE',
            logStreamName: 'LAMBDA_INVOKE',
            clientContext: clientContext,
            identity: identity
        };

        var callback = function(error, object) {
            context.done(error, object);
        };

        var lambda = invokeTask.loadFunction(options.file_name);
        var event = JSON.parse(fs.readFileSync(path.resolve(options.event), "utf8"));
        lambda[options.handler](event, context, callback);
    };
};

module.exports = invokeTask;