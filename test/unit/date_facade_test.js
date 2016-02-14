'use strict';

/*
 * grunt-aws-lambda
 * https://github.com/Tim-B/grunt-aws-lambda
 *
 * Copyright (c) 2014 Tim-B
 * Licensed under the MIT license.
 */

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

var dateFacade = require('../../utils/date_facade');

var dateFacadeTest = {};

dateFacadeTest.testGetFormattedTimestamp = function(test) {
    var fixedDate = new Date(2016, 1, 13, 14, 38, 13);
    test.equal(dateFacade.getFormattedTimestamp(fixedDate), '2016-1-13-14-38-13');
    test.done();
};

dateFacadeTest.testGetHumanReadableTimestamp = function(test) {
    var fixedDate = new Date(2016, 1, 13, 14, 38, 13);
    test.ok(dateFacade.getHumanReadableTimestamp(fixedDate).indexOf('Sat Feb 13 2016 14:38:13') > -1);
    test.done();
};
module.exports = dateFacadeTest;