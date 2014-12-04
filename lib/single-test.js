"use strict";
var test262Parser = require("test262-parser");
var recast = require("recast");
var wordWrap = require("word-wrap");

var b = recast.types.builders;

module.exports = function (testContents) {
    var parsedTest = test262Parser.parseFile(testContents);

    if (parsedTest.attrs.negative) {
        throw knownError("Cannot convert negative tests.");
    }

    if (parsedTest.attrs.includes.length > 0) {
        if (!(parsedTest.attrs.includes.length === 1 && parsedTest.attrs.includes[0] === "Test262Error.js")) {
            throw knownError("Cannot convert tests with includes.");
        }
    }

    var header = getDescriptionHeader(parsedTest.attrs.description);
    var strict = parsedTest.attrs.flags.onlyStrict ? "\"use strict\";\n" : "";
    var unprocessedBody = "(function() {" + strict + parsedTest.contents.trim() + "})();";

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
        visitIdentifier: function (path) {
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
    if (node.name === "Test262Error") {
        node.name = "MjsUnitAssertionError";
    }
}

function knownError(message) {
    var error = new Error(message);
    error.known = true;
    return error;
}

function getDescriptionHeader(description) {
    var wrapped = wordWrap(description.trim(), { width: 77, indent: "// " });
    // Fix for https://github.com/jonschlinkert/word-wrap/issues/2
    wrapped = wrapped.split("\n").map(function (l) { return l.trim(); }).join("\n");
    return wrapped + "\n";
}
