#!/usr/bin/env node

"use strict";
var path = require("path");
var q = require("q");
var fs = require("fs");
var multipleTests = require("../lib/multiple-tests.js");
var packageJson = require("../package.json");

var readFile = q.denodeify(fs.readFile);

var usage = packageJson.description + "\n\n" + packageJson.name +
            " [--flags=<flags>] [--fail-hard] <test1> [<test2> [<test3> ...]]";
var argv = require("yargs")
    .usage(usage, {
        flags: {
            description: "Any V8 flags the test should run under",
            type: "string",
            alias: "f",
            requiresArg: true
        },
        "fail-hard": {
            description: "Whether to fail immediately if tests can't be converted",
            type: "boolean",
            alias: "h"
        },
        "ignore-includes": {
            description: "Whether to ignore includes, instead of failing conversion on them",
            type: "boolean",
            alias: "i"
        }
    })
    .require(1, "No test files supplied to convert")
    .addHelpOpt("help")
    .version(packageJson.version, "version")
    .argv;

q.all(argv._.map(function (filePath) {
    return readFile(filePath, { encoding: "utf-8" }).then(function (contents) {
        return { path: filePath, contents: contents };
    });
}))
.then(function (allTests) {
    console.log(multipleTests(allTests, argv));
})
.done();
