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

    grunt.registerMultiTask('lambda_deploy', 'Uploads a package to lambda', function () {

        grunt.config.requires('lambda_deploy.' + this.target + '.package');

        var options = this.options({
            profile: null,
            region: 'us-east-1',
            timeout: null,
            memory: null
        });

        if (options.profile !== null) {
            var credentials = new AWS.SharedIniFileCredentials({profile: options.profile});
            AWS.config.credentials = credentials;
        }

        var deploy_function = grunt.config.get('lambda_deploy.' + this.target + '.function');
        var deploy_arn = grunt.config.get('lambda_deploy.' + this.target + '.arn');
        var deploy_package = grunt.config.get('lambda_deploy.' + this.target + '.package');

        if(deploy_arn === null && deploy_function === null) {
            grunt.fail.warn('You must specify either an arn or a function name.');
        }

        if(deploy_arn !== null) {
            deploy_function = deploy_arn;
        }

        var done = this.async();

        AWS.config.update({region: options.region});
        var lambda = new AWS.Lambda({
            apiVersion: '2015-03-31'
        });

        lambda.getFunction({FunctionName: deploy_function}, function (err, data) {

            if (err) {
                if(err.statusCode === 404) {
                    grunt.fail.warn('Unable to find lambda function ' + deploy_function + ', verify the lambda function name and AWS region are correct.');
                } else {
                    grunt.fail.warn('AWS API request failed, check your AWS credentials, region and permissions are correct.');
                }
            }

            var current = data.Configuration;
            var configParams = {};


            if (options.timeout !== null) {
                configParams.Timeout = options.timeout;
            }

            if (options.memory !== null) {
                configParams.MemorySize = options.memory;
            }

            var updateConfig = function(func_name, func_options, callback) {
                if(Object.keys(func_options).length > 0) {
                    func_options.FunctionName = func_name;
                    lambda.updateFunctionConfiguration(func_options, function(err, data) {
                        if (err) {
                            grunt.fail.warn('Could not update config, check that values and permissions are valid');
                        }
                        grunt.log.writeln('Config updated.');
                        callback(data);
                    });
                } else {
                    grunt.log.writeln('No config updates to make.');
                    callback(false);
                    return;
                }
            }

            grunt.log.writeln('Uploading...');
            fs.readFile(deploy_package, function (err, data) {
                if (err) {
                    grunt.fail.warn('Could not read package file ('+deploy_package+'), verify the lambda package '+
                        'location is correct, and that you have already created the package using lambda_package.');
                }

                var codeParams = {
                    FunctionName: deploy_function,
                    ZipFile: data
                }

                lambda.updateFunctionCode(codeParams, function (err, data) {
                    if (err) {
                        grunt.fail.warn('Package upload failed, check you have lambda:UpdateFunctionCode permissions.');
                    }
                    grunt.log.writeln('Package deployed.');
                    updateConfig(deploy_function, configParams, function(data){
                        done(true);
                    });
                });
            });
        });
    });
};
