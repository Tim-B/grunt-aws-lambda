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
    var npm = require("npm");
    var tmp = require('temporary');
    var archive = require('archiver');
    var fs = require('fs');
    var mkdirp = require('mkdirp');
    var rimraf = require('rimraf');

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('lambda_package', 'Creates a package to be uploaded to lambda', function () {

        var task = this;

        var options = this.options({
            'dist_folder': 'dist',
            'include_time': true,
            'package_folder': './'
        });

        var pkg = grunt.file.readJSON(path.resolve(options.package_folder + '/package.json'));

        var dir = new tmp.Dir();
        var done = this.async();

        var now = new Date();
        var time_string = 'latest';

        if (options.include_time) {
            time_string = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes() + '-' + now.getSeconds();
        }

        var file_version = pkg.version.replace(/\./g, '-');
        var archive_name = pkg.name + '_' + file_version + '_' + time_string;


        npm.load([], function (er, npm) {

            npm.config.set('loglevel', 'silent');

            var install_location = dir.path;

            npm.commands.install(install_location, options.package_folder, function () {

                var output = fs.createWriteStream(install_location + '/' + archive_name + '.zip');
                var zipArchive = archive('zip');
                zipArchive.pipe(output);

                zipArchive.bulk([
                    {
                        src: ['./**'],
                        expand: true,
                        cwd: install_location + '/node_modules/' + pkg.name
                    }
                ]);

                zipArchive.finalize();

                output.on('close', function () {
                    mkdirp('./' + options.dist_folder, function (err) {
                        fs.createReadStream(install_location + '/' + archive_name + '.zip').pipe(
                            fs.createWriteStream('./' + options.dist_folder + '/' + archive_name + '.zip')
                        );

                        rimraf(install_location, function () {

                            grunt.config.set('lambda_deploy.' + task.target + '.package',
                                './' + options.dist_folder + '/' + archive_name + '.zip');

                            grunt.log.writeln('Created package at ' + options.dist_folder + '/' + archive_name + '.zip');
                            done(true);
                        });
                    });
                });
            });
        });

    });

};
