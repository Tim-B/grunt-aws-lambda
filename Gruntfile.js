/*
 * grunt-aws-lambda
 * https://github.com/Tim-B/grunt-aws-lambda
 *
 * Copyright (c) 2014 Tim-B
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        lambda_invoke: {
            default_options: {
                options: {
                    file_name: 'test/fixtures/index.js',
                    event: 'test/fixtures/event.json'
                }
            },
            custom_options: {
                options: {
                    file_name: 'test/fixtures/custom_index.js',
                    event: 'test/fixtures/custom_event.json',
                    handler: 'myfunction'
                }
            },
            failure_options: {
                options: {
                    file_name: 'test/fixtures/failing_index.js',
                    event: 'test/fixtures/event.json',
                    handler: 'myfunction'
                }
            }
        },
        lambda_package: {
            default_options: {
                options: {
                    dist_folder: 'tmp/dist',
                    package_folder: 'test/fixtures/package_default'
                }
            },
            custom_options: {
                options: {
                    dist_folder: 'tmp/dist',
                    include_time: false,
                    package_folder: 'test/fixtures/package_custom',
                    include_files: ['custom.json']
                }
            }
        },
        lambda_deploy: {
            default_options: {
                options: {
                },
                function: 'lambda-test'
            }
        },
        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }
    });

    // Actually load this plugin's task(s).
    grunt.task.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'lambda_package', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);
};
