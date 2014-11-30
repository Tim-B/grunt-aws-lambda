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
    var AWS = require('aws-sdk');


    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerTask('lambda_upload', [], function (zip) {

        if (zip === undefined) {
            grunt.task.requires('lambda_package');
            zip = grunt.config.get('lambda_deploy.latest_package');
        }

        var options = this.options({
            function: 'lambda',
            profile: null,
            region: 'us-east-1'
        });

        if (options.profile !== null) {
            var credentials = new AWS.SharedIniFileCredentials({profile: options.profile});
            AWS.config.credentials = credentials;
        }

        AWS.config.update({region: options.region});

        var done = this.async();

        var lambda = new AWS.Lambda();

        lambda.getFunction({FunctionName: options.function}, function (err, data) {

            var current = data.Configuration;

            var params = {
                FunctionName: options.function,
                Handler: current.Handler,
                Mode: current.Mode,
                Role: current.Role,
                Runtime: current.Runtime
            }

            grunt.log.writeln('Uploading...');
            fs.readFile(zip, function (err, data) {
                params['FunctionZip'] = data;
                lambda.uploadFunction(params, function (err, data) {
                    grunt.log.writeln('Package deployed.');
                    done(true);
                });
            });
        })
    });
};