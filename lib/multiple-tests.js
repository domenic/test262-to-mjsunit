"use strict";
var singleTest = require("./single-test.js");

var copyrightHeader =
"// Copyright " + (new Date()).getUTCFullYear() + " the V8 project authors. All rights reserved.\n" +
"// Use of this source code is governed by a BSD-style license that can be\n" +
"// found in the LICENSE file.";

module.exports = function (allTests, options) {
    if (options === undefined) { // ES6 can't come soon enough
        options = {};
    }

    var result = copyrightHeader;

    if (options.flags !== undefined) {
        result += "\n\n// Flags: " + options.flags + "";
    }

    allTests.forEach(function (test) {
        result += "\n\n\n" + singleTestWithPotentialSoftFail(test, options);
    });

    return result;
};

function singleTestWithPotentialSoftFail(test, options) {
    if (options.failHard) {
        return singleTestWithBetterErrorReporting(test, options);
    }

    try {
        return singleTestWithBetterErrorReporting(test, options);
    } catch (e) {
        var output = (e.known ? e.message : e.stack).replace(/\n/g, "\n// ");
        return "// !!! Test failed to convert:\n// " + output + "\n// !!!";
    }
}

function singleTestWithBetterErrorReporting(test, options) {
    try {
        return singleTest(test.contents, options);
    } catch (e) {
        e.message += "\nTest path: " + test.path;
        throw e;
    }
}
