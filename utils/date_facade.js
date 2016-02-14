'use strict';

/*
 * grunt-aws-lambda
 * https://github.com/Tim-B/grunt-aws-lambda
 *
 * Copyright (c) 2014 Tim-B
 * Licensed under the MIT license.
 */

var dateFacade = {};

dateFacade.getFormattedTimestamp = function (dateObject) {
    var time_components = [
        dateObject.getFullYear(),
        dateObject.getMonth(),
        dateObject.getDate(),
        dateObject.getHours(),
        dateObject.getMinutes(),
        dateObject.getSeconds()
    ];
    return time_components.join('-');
};

dateFacade.getHumanReadableTimestamp = function (dateObject) {
    return dateObject.toLocaleString();
};

module.exports = dateFacade;