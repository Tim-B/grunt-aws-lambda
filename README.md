# grunt-aws-lambda

> A grunt plugin to assist in developing functions for [AWS Lambda](http://aws.amazon.com/lambda/).

This plugin provides helpers for:
* Running Lambda functions locally
* Managing npm dependencies which are required by your function
* Packaging required dependencies with your function in a Lambda compatible zip
* Uploading package to Lambda

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-aws-lambda --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-aws-lambda');
```

## The "aws_lambda" task

### Overview

This plugin contains 3 tasks:
* lambda_invoke - Wrapper to run and test lambda functions locally and view output.
* lambda_package - Packages function along with any npm dependencies in a zip format suitable for lambda.
* lambda_deploy - Uploads the zip package to lambda.

lambda_invoke and lambda_package can be used independently, lambda_deploy will invoke lambda_package before uploading
the produced zip file.

### lambda_invoke

In your project's Gruntfile, add a section named `lambda_invoke` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  lambda_invoke: {
    options: {
      // Task-specific options go here.
    }
  },
});
```

#### Options

##### options.handler
Type: `String`
Default value: `handler`

Name of the handler function to invoke.

##### options.file_name
Type: `String`
Default value: `index.js`

Name of your script file which contains your handler function.

##### options.event
Type: `String`
Default value: `event.json`

Name of the .json file containing your test event relative to your Gruntfile.

#### Usage Examples

##### Default Options
In this example, the default options are used therefore if we have the following in our `Gruntfile.js`:

```js
grunt.initConfig({
  lambda_invoke: {
    options: {}
  },
});
```
And the following in `index.js`

```js
exports.handler = function (event, context) {
    console.log('value1 = ' + event.key1);
    console.log('value2 = ' + event.key2);
    console.log('value3 = ' + event.key3);

    context.done(null, 'Hello World');  // SUCCESS with message
};
```

And the following in `event.json`
```json
{
    "key1": "value1",
    "key2": "value2",
    "key3": "value3"
}
```

Then we run `grunt lambda_invoke`, we should get the following output:

```
Running "lambda_invoke" task

value1 = value1
value2 = value2
value3 = value3

Message
-------
Hello World

Done, without errors.
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 0.1.0 - Initial release
