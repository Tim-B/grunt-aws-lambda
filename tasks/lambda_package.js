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
    var archive = require('archiver');
    var fs = require('fs');
    var tmp = require('temporary');
    var mkdirp = require('mkdirp');
    var rimraf = require('rimraf');

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('lambda_package', 'Creates a package to be uploaded to lambda', function () {

        var task = this;

        var options = this.options({
            'dist_folder': 'dist',
            'include_time': true,
            'package_folder': './',
            'include_files': []
        });

        var pkg = grunt.file.readJSON(path.resolve(options.package_folder + '/package.json'));

        var dir = new tmp.Dir();
        var done = this.async();

        var now = new Date();
        var time_string = 'latest';

        if (options.include_time) {
            var time_components = [
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            ];
            time_string =  time_components.join('-');
        }

        var file_version = pkg.version.replace(/\./g, '-');
        var archive_name = pkg.name + '_' + file_version + '_' + time_string;


        npm.load([], function (err, npm) {

            npm.config.set('loglevel', 'silent');

            var install_location = dir.path;
            var zip_path = install_location + '/' + archive_name + '.zip';

            npm.commands.install(install_location, options.package_folder, function () {

                var output = fs.createWriteStream(zip_path);

                var zipArchive = archive('zip');

                /*
                 * Monkey patch to ensure permissions are always 777
                 * Prevents issues on Windows for directories that don't have execute permissions
                 * See https://github.com/Tim-B/grunt-aws-lambda/issues/6
                 */
                var old_normalizeEntryData = zipArchive._normalizeEntryData;
                zipArchive._normalizeEntryData = function(data, stats) {
                    // 0777 file permission
                    data.mode = 511;
                    return old_normalizeEntryData.apply(zipArchive, [data, stats]);
                };

                zipArchive.pipe(output);

                zipArchive.bulk([
                    {
                        src: ['./**'],
                        dot:true,
                        expand: true,
                        cwd: install_location + '/node_modules/' + pkg.name
                    }
                ]);

                if (options.include_files.length) {
                    zipArchive.bulk([
                        {
                            src: options.include_files,
                            dot: true,
                            expand: true,
                            cwd: options.package_folder
                        }
                    ]);
                }

                zipArchive.finalize();

                output.on('close', function () {
                    mkdirp('./' + options.dist_folder, function (err) {
                        var dist_path = './' + options.dist_folder + '/' + archive_name + '.zip';
                        var dist_zip = fs.createWriteStream(dist_path);
                        fs.createReadStream(zip_path).pipe(dist_zip);

                        dist_zip.on('close', function () {
                            rimraf(install_location, function () {
                                grunt.config.set('lambda_deploy.' + task.target + '.package', dist_path);
                                grunt.log.writeln('Created package at ' + dist_path);
                                done(true);
                            });
                        });
                    });
                });
            });
        });

    });

};
