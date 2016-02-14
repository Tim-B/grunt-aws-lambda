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

var mockery = require('mockery');
var path = require('path');
var sinon = require('sinon');

mockery.registerAllowable('../../utils/invoke_task');
var gruntMock = require('../utils/grunt_mock');
var fsMock = require('../utils/fs_mock');

var packageTaskTest = {};

var mkdirpStub,
    rimrafStub,
    zipAPI,
    npmAPI;

packageTaskTest.setUp = function(done) {

    zipAPI = {
        pipe: sinon.stub(),
        bulk: sinon.stub(),
        finalize: sinon.stub(),
        _normalizeEntryData: sinon.stub()
    };

    npmAPI = {
        commands: {
            install: sinon.stub().callsArgAsync(2)
        },
        config: {
            set: sinon.stub()
        },
        load: sinon.stub()
    };

    npmAPI.load.callsArgWithAsync(1, null, npmAPI);

    mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
    });

    fsMock.reset();
    mockery.registerMock('fs', fsMock);
    fsMock.setJSONContent('package.json', {
        'name': 'some-npm-package',
        'version': '1.1.1'
    });

    mockery.registerMock('npm', npmAPI);

    mockery.registerMock('archiver', function(type) {
        return zipAPI;
    });

    mkdirpStub = sinon.stub().callsArgAsync(1);
    mockery.registerMock('mkdirp', mkdirpStub);

    rimrafStub = sinon.stub().callsArgAsync(1);
    mockery.registerMock('rimraf', rimrafStub);

    mockery.registerMock('temporary', {
        Dir: function () {
            return {
                path: 'temp-dir'
            };
        }
    });

    fsMock.createWriteStream = sinon.stub().returns({
        on: function(event, callback) {
            callback();
        }
    });

    var dateFacadeMock = {
        getFormattedTimestamp: sinon.stub().returns('2016-1-16-2-22-16')
    };
    mockery.registerMock('./date_facade', dateFacadeMock);

    done();
};

packageTaskTest.tearDown = function(done) {
    mockery.disable();
    done();
};

packageTaskTest.testDoneSucceed = function(test) {
    test.expect(10);

    var packageTask = require('../../utils/package_task');

    var harnessParams = {
        options: {},
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 1);
            test.equal(harness.output[0], 'Created package at ./dist/some-npm-package_1-1-1_2016-1-16-2-22-16.zip');
            test.ok(npmAPI.commands.install.calledWith('temp-dir', './'));
            test.ok(zipAPI.bulk.calledWithMatch(sinon.match(function(value) {
                return value[0].cwd === 'temp-dir/node_modules/some-npm-package';
            })));
            test.ok(mkdirpStub.calledWith('./dist'));
            test.ok(rimrafStub.calledWith('temp-dir'));
            test.ok(fsMock.createWriteStream.calledWith('temp-dir/some-npm-package_1-1-1_2016-1-16-2-22-16.zip'));
            test.ok(fsMock.createWriteStream.calledWith('./dist/some-npm-package_1-1-1_2016-1-16-2-22-16.zip'));
            test.equal(harness.config['lambda_deploy.fake-target.package'], './dist/some-npm-package_1-1-1_2016-1-16-2-22-16.zip');
            test.done();
        }
    };
    gruntMock.execute(packageTask.getHandler, harnessParams);
};

packageTaskTest.testDistFolder = function(test) {
    test.expect(10);

    var packageTask = require('../../utils/package_task');

    var harnessParams = {
        options: {
            'dist_folder': 'another/folder'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 1);
            test.equal(harness.output[0], 'Created package at ./another/folder/some-npm-package_1-1-1_2016-1-16-2-22-16.zip');
            test.ok(npmAPI.commands.install.calledWith('temp-dir', './'));
            test.ok(zipAPI.bulk.calledWithMatch(sinon.match(function(value) {
                return value[0].cwd === 'temp-dir/node_modules/some-npm-package';
            })));
            test.ok(mkdirpStub.calledWith('./another/folder'));
            test.ok(rimrafStub.calledWith('temp-dir'));
            test.ok(fsMock.createWriteStream.calledWith('temp-dir/some-npm-package_1-1-1_2016-1-16-2-22-16.zip'));
            test.ok(fsMock.createWriteStream.calledWith('./another/folder/some-npm-package_1-1-1_2016-1-16-2-22-16.zip'));
            test.equal(harness.config['lambda_deploy.fake-target.package'], './another/folder/some-npm-package_1-1-1_2016-1-16-2-22-16.zip');
            test.done();
        }
    };
    gruntMock.execute(packageTask.getHandler, harnessParams);
};

packageTaskTest.testIncludeTime = function(test) {
    test.expect(10);

    var packageTask = require('../../utils/package_task');

    var harnessParams = {
        options: {
            'include_time': false
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 1);
            test.equal(harness.output[0], 'Created package at ./dist/some-npm-package_1-1-1_latest.zip');
            test.ok(npmAPI.commands.install.calledWith('temp-dir', './'));
            test.ok(zipAPI.bulk.calledWithMatch(sinon.match(function(value) {
                return value[0].cwd === 'temp-dir/node_modules/some-npm-package';
            })));
            test.ok(mkdirpStub.calledWith('./dist'));
            test.ok(rimrafStub.calledWith('temp-dir'));
            test.ok(fsMock.createWriteStream.calledWith('temp-dir/some-npm-package_1-1-1_latest.zip'));
            test.ok(fsMock.createWriteStream.calledWith('./dist/some-npm-package_1-1-1_latest.zip'));
            test.equal(harness.config['lambda_deploy.fake-target.package'], './dist/some-npm-package_1-1-1_latest.zip');
            test.done();
        }
    };
    gruntMock.execute(packageTask.getHandler, harnessParams);
};

packageTaskTest.testPackageFolder = function(test) {
    test.expect(10);

    var packageTask = require('../../utils/package_task');

    var harnessParams = {
        options: {
            'package_folder': './anotherfolder'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 1);
            test.equal(harness.output[0], 'Created package at ./dist/some-npm-package_1-1-1_2016-1-16-2-22-16.zip');
            test.ok(npmAPI.commands.install.calledWith('temp-dir', './anotherfolder'));
            test.ok(zipAPI.bulk.calledWithMatch(sinon.match(function(value) {
                return value[0].cwd === 'temp-dir/node_modules/some-npm-package';
            })));
            test.ok(mkdirpStub.calledWith('./dist'));
            test.ok(rimrafStub.calledWith('temp-dir'));
            test.ok(fsMock.createWriteStream.calledWith('temp-dir/some-npm-package_1-1-1_2016-1-16-2-22-16.zip'));
            test.ok(fsMock.createWriteStream.calledWith('./dist/some-npm-package_1-1-1_2016-1-16-2-22-16.zip'));
            test.equal(harness.config['lambda_deploy.fake-target.package'], './dist/some-npm-package_1-1-1_2016-1-16-2-22-16.zip');
            test.done();
        }
    };
    gruntMock.execute(packageTask.getHandler, harnessParams);
};

packageTaskTest.testIncludeFiles = function(test) {
    test.expect(11);

    var packageTask = require('../../utils/package_task');

    var harnessParams = {
        options: {
            'include_files': [
                'foo/bar.txt'
            ]
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 1);
            test.equal(harness.output[0], 'Created package at ./dist/some-npm-package_1-1-1_2016-1-16-2-22-16.zip');
            test.ok(npmAPI.commands.install.calledWith('temp-dir', './'));
            test.ok(zipAPI.bulk.calledWithMatch(sinon.match(function(value) {
                return value[0].cwd === 'temp-dir/node_modules/some-npm-package';
            })));
            test.ok(zipAPI.bulk.calledWithMatch(sinon.match(function(value) {
                return value[0].src[0] === 'foo/bar.txt';
            })));
            test.ok(mkdirpStub.calledWith('./dist'));
            test.ok(rimrafStub.calledWith('temp-dir'));
            test.ok(fsMock.createWriteStream.calledWith('temp-dir/some-npm-package_1-1-1_2016-1-16-2-22-16.zip'));
            test.ok(fsMock.createWriteStream.calledWith('./dist/some-npm-package_1-1-1_2016-1-16-2-22-16.zip'));
            test.equal(harness.config['lambda_deploy.fake-target.package'], './dist/some-npm-package_1-1-1_2016-1-16-2-22-16.zip');
            test.done();
        }
    };
    gruntMock.execute(packageTask.getHandler, harnessParams);
};

packageTaskTest.testIncludeVersion = function(test) {
    test.expect(10);

    var packageTask = require('../../utils/package_task');

    var harnessParams = {
        options: {
            'include_version': false
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 1);
            test.equal(harness.output[0], 'Created package at ./dist/some-npm-package_2016-1-16-2-22-16.zip');
            test.ok(npmAPI.commands.install.calledWith('temp-dir', './'));
            test.ok(zipAPI.bulk.calledWithMatch(sinon.match(function(value) {
                return value[0].cwd === 'temp-dir/node_modules/some-npm-package';
            })));
            test.ok(mkdirpStub.calledWith('./dist'));
            test.ok(rimrafStub.calledWith('temp-dir'));
            test.ok(fsMock.createWriteStream.calledWith('temp-dir/some-npm-package_2016-1-16-2-22-16.zip'));
            test.ok(fsMock.createWriteStream.calledWith('./dist/some-npm-package_2016-1-16-2-22-16.zip'));
            test.equal(harness.config['lambda_deploy.fake-target.package'], './dist/some-npm-package_2016-1-16-2-22-16.zip');
            test.done();
        }
    };
    gruntMock.execute(packageTask.getHandler, harnessParams);
};

module.exports = packageTaskTest;