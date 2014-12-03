"use strict";
var test262Parser = require("test262-parser");
var recast = require("recast");

module.exports = function (testContents) {
    var parsedTest = test262Parser.parseFile(testContents);

    if (parsedTest.attrs.negative) {
        throw new Error("Cannot convert negative tests.");
    }

    var header = "//\n// " + parsedTest.attrs.description.trim() + "\n//\n";
    var unprocessedBody = "(function() {" + parsedTest.contents.trim() + "})();";

    var ast = recast.parse(unprocessedBody);
    processBody(ast);

    return header + recast.prettyPrint(ast, { tabWidth: 2 }).code;
};

function processBody(ast) {
    // assert(a, m) => assertTrue(a)
    // assert.sameValue(a, b, m) => assertSame(b, a)
    // throw if $ERROR leftover

    recast.visit(ast, {
        visitCallExpression: function (path) {
            var node = path.node;

            if (node.callee.name === "assert") {
                node.callee.name = "assertTrue";
                node.arguments.splice(1);
            }

            this.traverse(path);
        }
    });
}
