/*
 * grunt-aws-lambda
 * https://github.com/Tim-B/grunt-aws-lambda
 *
 * Copyright (c) 2014 Tim-B
 * Licensed under the MIT license.
 */

'use strict';

var invokeTask = require('../utils/invoke_task');

module.exports = function (grunt) {



    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('lambda_invoke', 'Invokes a lambda function for testing purposes', invokeTask.getHandler(grunt));

};
