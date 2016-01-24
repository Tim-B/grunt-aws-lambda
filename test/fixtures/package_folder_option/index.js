exports.handler = function (event, context) {
    context.done(null, process.cwd());
};
