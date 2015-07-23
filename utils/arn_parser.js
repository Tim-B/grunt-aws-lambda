var arnParser = {};

/**
 * Parses Lambda ARNs to identify region and other components
 * See CreateFunction in the AWS Lambda API Reference for the ARN formats and regex
 * http://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html
 *
 * Acceptable ARN-like formats for Lambda include:
 *  - Function name only "Thumbnail"
 *  - Partial ARN "123456789012:Thumbnail"
 *  - Full ARN "arn:aws:lambda:us-west-2:123456789012:function:ThumbNail"
 *
 * @param {string} arn - An ARN-like string specifying the Lambda function.
 */
arnParser.parse = function (arn) {
    if (!arn) {
        return;
    }
    var match = arn.match(/(arn:aws:lambda:)?([a-z]{2}-[a-z]+-\d{1}:)?(\d{12}:)?(function:)?([a-zA-Z0-9-_]+)/);
    if (!match) {
        return;
    }
    var functionInfo = {
        "region": match[2] ? match[2].replace(":", "") : undefined,
        "accountId": match[3] ? match[3].replace(":", "") : undefined,
        "functionName": match[5]
    };
    return functionInfo;
};

module.exports = arnParser;