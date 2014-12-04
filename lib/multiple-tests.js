"use strict";
var singleTest = require("./single-test.js");

var copyrightHeader =
"// Copyright " + (new Date()).getUTCFullYear() + " the V8 project authors. All rights reserved.\n" +
"// Use of this source code is governed by a BSD-style license that can be\n" +
"// found in the LICENSE file.";

module.exports = function (multipleTestContents, options) {
    if (options === undefined) { // ES6 can't come soon enough
        options = {};
    }

    var result = copyrightHeader;

    if (options.flags !== undefined) {
        result += "\n\n// Flags: " + options.flags + "";
    }

    var failHard = options.failHard;
    multipleTestContents.forEach(function (testContents) {
        result += "\n\n\n" + singleTestWithPotentialSoftFail(testContents, failHard);
    });

    return result;
};

function singleTestWithPotentialSoftFail(testContents, failHard) {
    if (failHard) {
        return singleTest(testContents);
    }

    try {
        return singleTest(testContents);
    } catch (e) {
        var output = e.known ? e.message : e.stack.replace(/\n/g, "\n// ");
        return "// !!! Test failed to convert:\n// " + output + "\n// !!!";
    }
}
