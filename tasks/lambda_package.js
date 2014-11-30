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

    grunt.registerTask('lambda_package', [], function () {

        var options = this.options({
            'name': 'lambda',
            'package_file': 'package.json',
            'dist_folder': 'dist'
        });

        var pkg = grunt.file.readJSON(path.resolve(options.package_file));

        var dir = new tmp.Dir();
        var done = this.async();

        var now = new Date();
        var time_string = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate()
            + '-' + now.getHours() + '-' + now.getMinutes() + '-' + now.getSeconds();

        var file_version = pkg.version.replace(/\./g, '-');
        var archive_name = pkg.name + '_' + file_version + '_' + time_string;


        npm.load([], function (er, npm) {

            npm.config.set('loglevel', 'silent');

            var install_location = dir.path;

            npm.commands.install(install_location, "./", function () {

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
                            grunt.config.set('lambda_deploy.latest_package',
                                './' + options.dist_folder + '/' + archive_name + '.zip');

                            grunt.log.writeln('Created package at ' + options.dist_folder + '/' + archive_name + '.zip')
                            done(true);
                        });
                    });
                });
            })
        })

    });

};
