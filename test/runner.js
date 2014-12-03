"use strict";
var path = require("path");
var q = require("q");
var baselineTester = q.denodeify(require("baseline-tester"));
var singleTest = require("../lib/single-test.js");

q()
.then(function () {
    return baselineTester(singleTest, {
        casesDirectory: path.resolve(__dirname, "cases"),
        inputExtension: "test262.js",
        outputExtension: "mjsunit.js"
    });
})
.then(function () {
    return baselineTester(singleTest, {
        casesDirectory: path.resolve(__dirname, "errors"),
        inputExtension: "test262.js",
        outputExtension: "txt",
        checkExceptions: true
    });
})
.done();
