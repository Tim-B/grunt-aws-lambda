'use strict';

var grunt = require('grunt');
var glob = require("glob");
var AdmZip = require('adm-zip');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

function getNormalizedFile(filepath) {
    return grunt.util.normalizelf(grunt.file.read(filepath));
}

exports.lambda_package = {
    setUp: function (done) {
        // setup here if necessary
        done();
    },
    default_options: function (test) {
        test.expect(5);
        glob("my-lambda-function_0-0-1_*.zip", {cwd: 'tmp/dist'}, function (er, files) {
            test.equals(1, files.length);

            var zip = new AdmZip('tmp/dist/' + files[0]);
            var zipEntries = zip.getEntries();

            test.equals(3, zipEntries.length);

            var required = [
                'index.js',
                'package.json',
                '.test'
            ];

            zipEntries.forEach(function (item) {
                if (required.indexOf(item.entryName) !== -1) {
                    test.ok(true, "Found " + item.entryName);
                }
            });

            test.done();
        });
    },
    custom_options: function (test) {
        test.expect(6);
        var zip = new AdmZip("tmp/dist/another-lambda-function_0-0-1_latest.zip");
        var zipEntries = zip.getEntries();

        var required = [
            'custom.json',
            'index.js',
            'package.json',
            'node_modules/',
            'node_modules/jquery/',
            'node_modules/jquery/package.json'
        ];

        zipEntries.forEach(function (item) {
            if (required.indexOf(item.entryName) !== -1) {
                test.ok(true, "Found " + item.entryName);
            }
        });

        test.done();
    }

};
