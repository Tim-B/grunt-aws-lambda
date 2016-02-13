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

var deployTaskTest = {};

var awsSDKMock,
    lambdaAPIMock,
    defaultGruntConfig;

deployTaskTest.setUp = function(done) {
    mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
    });

    lambdaAPIMock = {
        getFunction: sinon.stub().callsArgWithAsync(1, null, {
            data: {
                Configuration: {
                    timeout: 100,
                    MemorySize: 128,
                    Handler: 'handler'
                }
            }
        }),
        updateFunctionConfiguration: sinon.stub().callsArgWithAsync(1, null, {

        }),
        updateFunctionCode: sinon.stub().callsArgWithAsync(1, null, {

        })
    };

    awsSDKMock = {
        SharedIniFileCredentials: sinon.stub(),
        EC2MetadataCredentials: sinon.stub(),
        TemporaryCredentials: sinon.stub(),
        config: {
            update: sinon.stub(),
            loadFromPath: sinon.stub()
        },
        Lambda: function(params) {
            return lambdaAPIMock;
        }
    };

    fsMock.reset();
    mockery.registerMock('fs', fsMock);

    fsMock.setFileContent('some-package.zip', 'abc123');

    mockery.registerMock('aws-sdk', awsSDKMock);

    defaultGruntConfig = {
        'lambda_deploy.fake-target.function': 'some-function',
        'lambda_deploy.fake-target.package': './dist/some-package.zip'
    };

    done();
};

deployTaskTest.tearDown = function(done) {
    mockery.disable();
    done();
};

deployTaskTest.testDeploySucceed = function(test) {
    test.expect(9);

    var deployTask = require('../../utils/deploy_task');

    var harnessParams = {
        options: {},
        config: defaultGruntConfig,
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 3);
            test.equal(harness.output[0], 'Uploading...');
            test.equal(harness.output[1], 'Package deployed.');
            test.equal(harness.output[2], 'No config updates to make.');

            test.ok(awsSDKMock.config.update.calledWith({region: 'us-east-1'}));
            test.ok(lambdaAPIMock.getFunction.calledWith({FunctionName: 'some-function'}));
            test.ok(lambdaAPIMock.updateFunctionCode.calledWith({FunctionName: 'some-function', ZipFile: 'abc123'}));
            test.ok(!lambdaAPIMock.updateFunctionConfiguration.called);
            test.done();
        }
    };
    gruntMock.execute(deployTask.getHandler, harnessParams);
};

deployTaskTest.testProfile = function(test) {
    test.expect(3);

    var deployTask = require('../../utils/deploy_task');

    var harnessParams = {
        options: {
            profile: 'some-profile'
        },
        config: defaultGruntConfig,
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 3);

            test.ok(awsSDKMock.SharedIniFileCredentials.calledWith({profile: 'some-profile'}));
            test.done();
        }
    };
    gruntMock.execute(deployTask.getHandler, harnessParams);
};

deployTaskTest.testRoleArn = function(test) {
    test.expect(3);

    var deployTask = require('../../utils/deploy_task');

    var harnessParams = {
        options: {
            RoleArn: 'arn:some:role'
        },
        config: defaultGruntConfig,
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 3);

            test.ok(awsSDKMock.TemporaryCredentials.calledWith({RoleArn: 'arn:some:role'}));
            test.done();
        }
    };
    gruntMock.execute(deployTask.getHandler, harnessParams);
};

deployTaskTest.testAccessKeys = function(test) {
    test.expect(3);

    var deployTask = require('../../utils/deploy_task');

    var harnessParams = {
        options: {
            accessKeyId: 'some-access-key',
            secretAccessKey: 'some-secret-access-key'
        },
        config: defaultGruntConfig,
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 3);

            test.ok(awsSDKMock.config.update.calledWith({accessKeyId: 'some-access-key',
                secretAccessKey: 'some-secret-access-key'}));
            test.done();
        }
    };
    gruntMock.execute(deployTask.getHandler, harnessParams);
};

deployTaskTest.testCredentialsJSON = function(test) {
    test.expect(3);

    var deployTask = require('../../utils/deploy_task');

    var harnessParams = {
        options: {
            credentialsJSON: 'credentials.json'
        },
        config: defaultGruntConfig,
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 3);

            test.ok(awsSDKMock.config.loadFromPath.calledWith('credentials.json'));
            test.done();
        }
    };
    gruntMock.execute(deployTask.getHandler, harnessParams);
};

deployTaskTest.testRegion = function(test) {
    test.expect(3);

    var deployTask = require('../../utils/deploy_task');

    var harnessParams = {
        options: {
            region: 'mars-north-8'
        },
        config: defaultGruntConfig,
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 3);

            test.ok(awsSDKMock.config.update.calledWith({region: 'mars-north-8'}));
            test.done();
        }
    };
    gruntMock.execute(deployTask.getHandler, harnessParams);
};

deployTaskTest.testTimeout = function(test) {
    test.expect(4);

    var deployTask = require('../../utils/deploy_task');

    var harnessParams = {
        options: {
            timeout: 3000
        },
        config: defaultGruntConfig,
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 3);
            test.equal(harness.output[2], 'Config updated.');

            test.ok(lambdaAPIMock.updateFunctionConfiguration.calledWithMatch({Timeout: 3000}));
            test.done();
        }
    };
    gruntMock.execute(deployTask.getHandler, harnessParams);
};

deployTaskTest.testMemorySize = function(test) {
    test.expect(4);

    var deployTask = require('../../utils/deploy_task');

    var harnessParams = {
        options: {
            memory: 1024
        },
        config: defaultGruntConfig,
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 3);
            test.equal(harness.output[2], 'Config updated.');

            test.ok(lambdaAPIMock.updateFunctionConfiguration.calledWithMatch({MemorySize: 1024}));
            test.done();
        }
    };
    gruntMock.execute(deployTask.getHandler, harnessParams);
};

deployTaskTest.testHandler = function(test) {
    test.expect(4);

    var deployTask = require('../../utils/deploy_task');

    var harnessParams = {
        options: {
            handler: 'some-handler'
        },
        config: defaultGruntConfig,
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 3);
            test.equal(harness.output[2], 'Config updated.');

            test.ok(lambdaAPIMock.updateFunctionConfiguration.calledWithMatch({Handler: 'some-handler'}));
            test.done();
        }
    };
    gruntMock.execute(deployTask.getHandler, harnessParams);
};

module.exports = deployTaskTest;