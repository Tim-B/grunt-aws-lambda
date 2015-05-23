'use strict';

var grunt = require('grunt');

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

exports.lambda_invoke = {
    setUp: function (done) {
        // setup here if necessary
        done();
    },
    default_options: function (test) {
        test.expect(1);

        grunt.util.spawn({
            grunt: true,
            args: ['lambda_invoke:default_options', '--no-color']
        }, function (err, result, code) {

            var expected = getNormalizedFile('test/expected/default_options');
            var actual = grunt.util.normalizelf(result.stdout);
            test.equal(actual, expected);
            test.done();
        });
    },
    custom_options: function (test) {
        test.expect(1);

        grunt.util.spawn({
            grunt: true,
            args: ['lambda_invoke:custom_options', '--no-color']
        }, function (err, result, code) {

            var expected = getNormalizedFile('test/expected/custom_options');
            var actual = grunt.util.normalizelf(result.stdout);
            test.equal(actual, expected);
            test.done();
        });
    },
    failure_options: function (test) {
        test.expect(1);

        grunt.util.spawn({
            grunt: true,
            args: ['lambda_invoke:failure_options', '--no-color']
        }, function (err, result, code) {

            var expected = getNormalizedFile('test/expected/failure_options');
            var actual = grunt.util.normalizelf(result.stdout);
            test.equal(actual, expected);
            test.done();
        });
    }
};
