"use strict";
var test262Parser = require("test262-parser");
var recast = require("recast");
var wordWrap = require("word-wrap");

var b = recast.types.builders;

module.exports = function (testContents, options) {
    var parsedTest = test262Parser.parseFile(testContents);
    var ignoreIncludes = options && options.ignoreIncludes;

    if (!parsedTest.attrs.description) {
        throw knownError("Cannot convert test files without a description.");
    }

    if (parsedTest.attrs.negative) {
        throw knownError("Cannot convert negative tests.");
    }

    var test262ErrorPrelude = "";
    if (parsedTest.attrs.includes.length > 0) {
        if (parsedTest.attrs.includes.length === 1 && parsedTest.attrs.includes[0] === "Test262Error.js") {
            test262ErrorPrelude = "function Test262Error() {}";
        } else if (!ignoreIncludes) {
            throw knownError("Cannot convert tests with includes (except Test262Error.js).");
        }
    }

    var header = getDescriptionHeader(parsedTest.attrs.description);
    var strict = parsedTest.attrs.flags.onlyStrict ? "\"use strict\";\n" : "";
    var unprocessedBody = "(function() {" + strict + test262ErrorPrelude + parsedTest.contents.trim() + "})();";

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
            processAssert(node);
            processSameValue(node);
            processAssertThrows(node);
            process$ERROR(node);

            this.traverse(path);
        },
        visitNewExpression: function (path) {
            var node = path.node;
            processTest262Error(node);

            this.traverse(path);
        }
    });
}

function processAssert(node) {
    if (node.callee.name === "assert") {
        node.callee.name = "assertTrue";
        node.arguments.splice(1);
    }
}

function processSameValue(node) {
    if (node.callee.type === "MemberExpression" && node.callee.object.name === "assert" &&
            node.callee.property.name === "sameValue") {
        return processSameValueTrue(node) || processSameValueFalse(node) || processSameValueOtherLiteral(node);
    }
}

function processSameValueTrue(node) {
    if (node.arguments[1].type === "Literal" && node.arguments[1].value === true) {
        node.callee = b.identifier("assertTrue");
        node.arguments.splice(1);
        return true;
    }
}

function processSameValueFalse(node) {
    if (node.arguments[1].type === "Literal" && node.arguments[1].value === false) {
        node.callee = b.identifier("assertFalse");
        node.arguments.splice(1);
        return true;
    }
}

function processSameValueOtherLiteral(node) {
    if (node.arguments[1].type === "Literal") {
        node.callee = b.identifier("assertEquals");
        node.arguments = [node.arguments[1], node.arguments[0]];
    }
}

function processAssertThrows(node) {
    if (node.callee.type === "MemberExpression" && node.callee.object.name === "assert" &&
            node.callee.property.name === "throws") {
        node.callee = b.identifier("assertThrows");
        node.arguments = [node.arguments[1], node.arguments[0]];
    }
}

function process$ERROR(node) {
    if (node.callee.name === "$ERROR") {
        node.callee.name = "assertUnreachable";
    }
}

function processTest262Error(node) {
    if (node.callee.name === "Test262Error") {
        node.arguments.length = 0;
    }
}

function knownError(message) {
    var error = new Error(message);
    error.known = true;
    return error;
}

function getDescriptionHeader(description) {
    return wordWrap(description.trim(), { width: 77, indent: "// ", trim: true }) + "\n";
}
