/*
 * grunt-aws-lambda
 * https://github.com/Tim-B/grunt-aws-lambda
 *
 * Copyright (c) 2014 Tim-B
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var path = require('path');
    var fs = require('fs');


    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('lambda_invoke', 'Invokes a lambda function for testing purposes', function () {

        var options = this.options({
            'handler': 'handler',
            'file_name': 'index.js',
            'event': 'event.json'
        });

        grunt.log.writeln("");

        var done = this.async();

        var context = {
            done: function (error, result) {
                if (error === null) {
                    this.succeed(result);
                } else {
                    this.fail(error);
                }
            },
            succeed: function (result) {
                grunt.log.writeln("");
                grunt.log.writeln("Success!  Message:");
                grunt.log.writeln("------------------");
                grunt.log.writeln(result);
                done(true);
            },
            fail: function (error) {
                grunt.log.writeln("");
                grunt.log.writeln("Failure!  Message:");
                grunt.log.writeln("------------------");
                grunt.log.writeln(error);
                done(false);
            },
            awsRequestId: 'LAMBDA_INVOKE',
            logStreamName: 'LAMBDA_INVOKE',
            clientContext: null,
            identity: null
        };

        var lambda = require(path.resolve(options.file_name));
        var event = JSON.parse(fs.readFileSync(path.resolve(options.event), "utf8"));
        lambda[options.handler](event, context);

    });

};
