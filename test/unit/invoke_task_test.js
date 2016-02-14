'use strict';

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

mockery.registerAllowable('../../utils/invoke_task');
var gruntMock = require('../utils/grunt_mock');
var fsMock = require('../utils/fs_mock');

var invokeTaskTests = {};

var setLambdaFunction = function(lambda, file_name, handler) {
    if(!file_name) {
        file_name = 'index.js';
    }
    if(!handler) {
        handler = 'handler';
    }
    var lambdaContainer = {};
    lambdaContainer[handler] = lambda;
    mockery.registerMock(path.resolve(file_name), lambdaContainer);
};

invokeTaskTests.setUp = function(done) {
    mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
    });
    fsMock.reset();
    mockery.registerMock('fs', fsMock);
    fsMock.setJSONContent('event.json', {
        'thisFile': 'event.json'
    });
    fsMock.setJSONContent('client_context.json', {
        'thisFile': 'client_context.json'
    });
    fsMock.setJSONContent('identity.json', {
        'thisFile': 'identity.json'
    });
    done();
};

invokeTaskTests.tearDown = function(done) {
    mockery.disable();
    done();
};

invokeTaskTests.testLambdaEnvironment = function(test) {
    test.expect(12);

    setLambdaFunction(function(event, context) {
        test.equals(event.thisFile, 'event.json');
        test.notEqual(context.done, undefined);
        test.notEqual(context.succeed, undefined);
        test.notEqual(context.fail, undefined);
        test.equals(context.awsRequestId, 'LAMBDA_INVOKE');
        test.equals(context.logStreamName, 'LAMBDA_INVOKE');
        test.equals(context.clientContext.thisFile, 'client_context.json');
        test.equals(context.identity.thisFile, 'identity.json');
        context.succeed('My Message');
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {},
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testDoneSucceed = function(test) {
    test.expect(4);

    setLambdaFunction(function(event, context) {
        context.done(null, 'My Message');
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {},
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testDoneWithObjectStatus = function(test) {
    test.expect(4);

    setLambdaFunction(function(event, context) {
        context.done(null, {some: "object"});
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {},
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], '{"some":"object"}');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testDoneUndefined = function(test) {
    test.expect(4);

    setLambdaFunction(function(event, context) {
        var notDefined;
        context.done(notDefined, 'My Message');
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {},
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testDoneError = function(test) {
    test.expect(4);

    setLambdaFunction(function(event, context) {
        var error = {message: 'Some Error'};
        context.done(error, 'My Message');
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {},
        callback: function(harness) {
            test.equal(harness.status, false);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Failure!  Message:');
            test.equal(harness.output[4], '{"message":"Some Error"}');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testFail = function(test) {
    test.expect(4);

    setLambdaFunction(function(event, context) {
        var error = {message: 'Some Error'};
        context.fail(error);
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {},
        callback: function(harness) {
            test.equal(harness.status, false);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Failure!  Message:');
            test.equal(harness.output[4], '{"message":"Some Error"}');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testFileName = function(test) {
    test.expect(4);

    setLambdaFunction(function(event, context) {
        context.succeed('My Message');
    }, 'something.js');

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {
            'file_name': 'something.js'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testHandler = function(test) {
    test.expect(4);

    setLambdaFunction(function(event, context) {
        context.succeed('My Message');
    }, 'index.js', 'something');

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {
            'handler': 'something'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testFileName = function(test) {
    test.expect(4);

    setLambdaFunction(function(event, context) {
        context.succeed('My Message');
    }, 'something.js');

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {
            'file_name': 'something.js'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testEvent = function(test) {
    test.expect(5);

    fsMock.setJSONContent('hello.json', {
        'thisFile': 'hello.json'
    });

    setLambdaFunction(function(event, context) {
        test.equals(event.thisFile, 'hello.json');
        context.succeed('My Message');
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {
            'event': 'hello.json'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testClientContext = function(test) {
    test.expect(5);

    fsMock.setJSONContent('something.json', {
        'thisFile': 'something.json'
    });

    setLambdaFunction(function(event, context) {
        test.equals(context.clientContext.thisFile, 'something.json');
        context.succeed('My Message');
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {
            'client_context': 'something.json'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testIdentity = function(test) {
    test.expect(5);

    fsMock.setJSONContent('something.json', {
        'thisFile': 'something.json'
    });

    setLambdaFunction(function(event, context) {
        test.equals(context.identity.thisFile, 'something.json');
        context.succeed('My Message');
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {
            'identity': 'something.json'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testPackageFolder = function(test) {
    test.expect(6);

    var original = process.cwd();
    var tmpDir = path.resolve('./tmp');

    setLambdaFunction(function(event, context) {
        test.equal(process.cwd(), tmpDir);
        context.done(null, 'My Message');
    }, './tmp/index.js');

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {
            'package_folder': './tmp'
        },
        callback: function(harness) {
            test.equal(process.cwd(), original);
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testNoClientContext = function(test) {
    test.expect(5);

    setLambdaFunction(function(event, context) {
        test.equal(context.clientContext, null);
        context.done(null, 'My Message');
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {
            'client_context': 'not-a-file.json'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

invokeTaskTests.testNoIdentity = function(test) {
    test.expect(5);

    setLambdaFunction(function(event, context) {
        test.equal(context.identity, null);
        context.done(null, 'My Message');
    });

    var invokeTask = require('../../utils/invoke_task');

    var harnessParams = {
        options: {
            'identity': 'not-a-file.json'
        },
        callback: function(harness) {
            test.equal(harness.status, true);
            test.equal(harness.output.length, 5);
            test.equal(harness.output[2], 'Success!  Message:');
            test.equal(harness.output[4], 'My Message');
            test.done();
        }
    };
    gruntMock.execute(invokeTask.getHandler, harnessParams);
};

module.exports = invokeTaskTests;