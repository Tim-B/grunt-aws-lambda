# grunt-aws-lambda

> A grunt plugin to assist in developing functions for [AWS Lambda](http://aws.amazon.com/lambda/).

[![Build Status](https://travis-ci.org/Tim-B/grunt-aws-lambda.svg)](https://travis-ci.org/Tim-B/grunt-aws-lambda)

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

## Gotchas

### Add dist to your .npmignore

This will save you from packaging previous packages in future ones.

For example your `.npmignore` might look something like this:
```
event.json
Gruntfile.js
dist
*.iml
```

[Read More](#default-options-1)

### Include your dependencies in bundledDependencies

npm packages which should be bundled with your lambda function must be included in the `bundledDependencies` of your
 `package.json`, for example:

```json
...
"dependencies": {
    "jquery": "2.1.1"
},
...
"bundledDependencies": [
    "jquery"
]
...
```

[Read More](#default-options-1)


## Specify AWS credentials in ~/.aws/credentials

This will save you from accidentally committing AWS credentials.

[Read More](#aws-credentials)

## grunt-aws-lambda tasks

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
        default: {
            options: {
                // Task-specific options go here.
            }
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
        default: {
            options: {
                // Task-specific options go here.
            }
        }
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


### lambda_package

This task generates a lambda package including npm dependencies using the default npm install functionality, therefore
 your dependencies must be included in the **bundledDependencies** section of your package.json to be included in the
 produced package.

In your project's Gruntfile, add a section named `lambda_package` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    lambda_package: {
        default: {
            options: {
                // Task-specific options go here.
            }
        }
    },
});
```

#### Options

##### options.include_files
Type: `Array`
Default value: `[]`

List of files to explicitly include in the package, even if they would be ignored by NPM

##### options.include_time
Type: `Boolean`
Default value: `true`

Whether or not to timestamp the packages, if set to true the current date/time will be included in the zip name, if false
 then the package name will be constant and consist of just the package name and version.

##### options.package_folder
Type: `String`
Default value: `./`

The path to your npm package, must contain the package.json file.

##### options.dist_folder
Type: `String`
Default value: `dist`

The folder where the complete zip files should be saved relative to the Gruntfile.

#### Usage Examples

##### Default Options
In this example, the default options are used therefore if we have the following in our `Gruntfile.js`:

```js
grunt.initConfig({
    lambda_package: {
        default: {
            options: {
                // Task-specific options go here.
            }
        }
    },
});
```
And the following in `package.json`

```json
{
    "name": "my-lambda-function",
    "description": "An Example Lamda Function",
    "version": "0.0.1",
    "private": "true",
    "dependencies": {
        "jquery": "2.1.1"
    },
    "devDependencies": {
        "grunt": "0.4.*",
        "grunt-pack": "0.1.*",
        "grunt-aws-lambda": "0.1.*"
    },
    "bundledDependencies": [
        "jquery"
    ]
}
```

Then we run `grunt lambda_package`, we should see a new zip file in a new folder called `dist` called something like:

`my-lambda-function_0-0-1_2014-10-30-18-29-4.zip`

If you unzip that and look inside you should see something like:
```
index.js
package.json
node_modules/
node_modules/jquery
node_modules/jquery/... etc
```

Given that by default the dist folder is inside your function folder you can easily end up bundling previous packages
 inside subsequent packages therefore it is **strongly advised that you add dist to your .npmignore**.

For example your `.npmignore` might look something like this:
```
event.json
Gruntfile.js
dist
*.iml
```

### lambda_deploy

In your project's Gruntfile, add a section named `lambda_deploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    lambda_deploy: {
        default: {
            options: {
                // Task-specific options go here.
            },
            arn: 'arn:aws:lambda:us-east-1:123456781234:function:my-function'
        }
    },
});
```

#### Options


##### arn
Type: `String`
Default value: None - Required

The ARN of your target Lambda function.

##### function
Type: `String`
Default value: None - Required (if you havn't specified an ARN)

*This option is deprecated, use arn instead*. The name of your target Lambda function, ie. the name of the function in the AWS console.

##### package
Type: `String`
Default value: Package name set by package task of same target - see below.

The name of the package to be uploaded.

When the lambda_package task runs it sets the package value for the lambda_deploy target with the same name.

Therefore if lambda_package and lambda_deploy have a target (eg. default) with the same name you will not
 need to provide this value - it will be passed automatically.

For example, your Gruntfile.js might contain the following:


```js
grunt.initConfig({
    lambda_deploy: {
        default: {
            arn: 'arn:aws:lambda:us-east-1:123456781234:function:my-function'
        }
    },
    lambda_package: {
        default: {
        }
    }
});
```

You could then run `grunt lambda_package lambda_deploy` and it'll automatically create the package and deploy it without
 having to specify a package name.

##### options.profile
Type: `String`
Default value: `null`

If you wish to use a specific AWS credentials profile you can specify it here, otherwise it will use the environment default.

##### options.timeout
Type: `Integer`
Default value: `null`
Depending on your Lambda function, you might need to increase the timeout value. The default timeout assigned by AWS is currently 3 seconds.
 If you wish to increase this timeout set the value here.
 
##### options.memory
 Type: `Integer`
 Default value: `null`
 Sets the memory assigned to the function. If null then the current setting for the function will be used. Value is in
 MB and must be a multiple of 64.

#### Usage Examples

##### Default Options
In this example, the default options are used therefore if we have the following in our `Gruntfile.js`:

```js
grunt.initConfig({
    lambda_deploy: {
        default: {
            arn: 'arn:aws:lambda:us-east-1:123456781234:function:my-function'
        }
    }
});
```
And now if you run `grunt lambda_deploy` your package should be created and uploaded to the specified function.


##### Increasing the Timeout Options to 10 seconds
In this example, the timeout value is increased to 10 seconds and set memory to 256mb.

```js
grunt.initConfig({
    lambda_deploy: {
        default: {
            arn: 'arn:aws:lambda:us-east-1:123456781234:function:my-function',
            options: {
                timeout : 10,
                memory: 256            
            }
        }
    }
});
```

## Misc info

### Streamlining deploy

You can combine the lambda_package and lambda_deploy into a single deploy task by adding the following to your
 Gruntfile.js:

```js
grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy']);
```

You can then run `grunt deploy` to perform both these functions in one step.

### AWS credentials

The AWS SDK is configured to look for credentials in the environment, that is it will look in `~/.aws/credentials`.

This file should look something like:
```
[default]
aws_access_key_id = <YOUR_ACCESS_KEY_ID>
aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>
```

For more information [read this documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).

### AWS permissions

To run the deploy command the AWS credentials require permissions to access lambda including `lambda:UploadFunction` and
 `iam:PassRole` for the role which is assigned to the function.

It is recommended that the following two policies be applied to the user:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1404366560000",
      "Effect": "Allow",
      "Action": [
        "lambda:*"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1404366560000",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::<my_account_id>:role/<my_role_name>"
      ]
    }
  ]
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
### 0.1.0
Initial release

### 0.2.0
Adding some unit tests, refactoring deploy task into single task and converting tasks to multitasks

### 0.3.0
Adding more warnings for various failure cases

### 0.4.0

* Added support for succeed and fail functions - [pull request by jonyo](https://github.com/Tim-B/grunt-aws-lambda/pull/11) 
* Added NPM to package.json - [pull request by jonyo](https://github.com/Tim-B/grunt-aws-lambda/pull/13), should address [issue 2](https://github.com/Tim-B/grunt-aws-lambda/issues/2#issuecomment-104805707)
* Added timeout and memory options - [timeout pull request by aidancasey](https://github.com/Tim-B/grunt-aws-lambda/pull/3)
* Bumped aws-sdk version
* Bumped adm-zip version, will hopefully address [issue 4](https://github.com/Tim-B/grunt-aws-lambda/issues/4)

### 0.5.0
* Fixed issue where dotfiles weren't packaged - [see issue 17](https://github.com/Tim-B/grunt-aws-lambda/issues/17) 
* Fixed issue where task could be done before zip writing is finished - [pull request by qen](https://github.com/Tim-B/grunt-aws-lambda/pull/16) 
* Monkey patched node-archiver to force permissions to be 777 for all files in package - [see issue 6](https://github.com/Tim-B/grunt-aws-lambda/issues/6)

### 0.6.0
* Fixing a minor issue caused by some code that shouldn't have been commented out.

### 0.7.0
* Removing some unneeded files from the NPM package.

### 0.8.0
* Adding `include_files` option to package - [pull request by dhleong](https://github.com/Tim-B/grunt-aws-lambda/pull/19)


