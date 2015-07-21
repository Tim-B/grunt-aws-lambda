'use strict';

var arnParser = require('../utils/arn_parser');

exports.parseFullArn = function(test){
    var arn = 'arn:aws:lambda:us-west-2:123456789012:function:MyFunctionName';
    var functionInfo = arnParser.parse(arn);
    test.ok(functionInfo, 'parser should return function info');
    test.equal(functionInfo.region, 'us-west-2');
    test.equal(functionInfo.accountId, '123456789012');
    test.equal(functionInfo.functionName, 'MyFunctionName');
    test.done();
};

exports.parsePartialArn = function(test){
    var arn = '123456789012:MyFunctionName';
    var functionInfo = arnParser.parse(arn);
    test.ok(functionInfo, 'parser should return function info');
    test.equal(functionInfo.region, undefined);
    test.equal(functionInfo.accountId, '123456789012');
    test.equal(functionInfo.functionName, 'MyFunctionName');
    test.done();
};

exports.parseFunctionName = function(test){
    var arn = 'MyFunctionName';
    var functionInfo = arnParser.parse(arn);
    test.ok(functionInfo, 'parser should return function info');
    test.equal(functionInfo.region, undefined);
    test.equal(functionInfo.accountId, undefined);
    test.equal(functionInfo.functionName, 'MyFunctionName');
    test.done();
};

exports.parseEmptyArn = function(test){
    var arn = '';
    var functionInfo = arnParser.parse(arn);
    test.equal(functionInfo, undefined);
    test.done();
};

exports.parseUndefinedArn = function(test){
    var functionInfo = arnParser.parse(undefined);
    test.equal(functionInfo, undefined);
    test.done();
};

exports.parseBadArn = function(test){
    var arn = ':#!!';
    var functionInfo = arnParser.parse(arn);
    test.equal(functionInfo, undefined);
    test.done();
};