# Convert test262 tests to mjsunit format

V8 hasn't quite gotten around to letting its contributors write [test262](https://github.com/tc39/test262/) tests directly, [as I found out recently](https://codereview.chromium.org/771863002). Instead they prefer to check in tests in their custom [mjsunit](https://code.google.com/p/v8/source/browse/branches/bleeding_edge/test/mjsunit/mjsunit.js) format.

But what if you've already written a bunch of test262 tests? Or what if you want to be a good citizen and contribute to the general cross-browser testing cause that is test262, and yet you'd like to be able to land features in V8? This project will solve your problems, by converting test262-format tests to mjsunit-format tests destined for V8.

## Usage

Pass the tests you'd like to convert to the CLI utility. The resulting mjsunit files will be written to standard out.

```
$ cd Array.prototype.includes
$ test262-to-mjsunit test/*.js > ../v8/test/mjsunit/array-includes.js
```

### Fail-Hard

By default, if test262-to-mjsunit can't convert something, it will output a comment block with an error:

```js
// !!! Test failed to convert:
// Cannot convert negative tests.
// !!!
```

If you'd rather have it fail, pass the `--fail-hard` option.

### Flags

If you're testing a feature that needs a given V8 flag to run, use the `--flags` option to make the converter output the appropriate comment:

```
$ test262-to-mjsunit --flags="--harmony-array-includes" test/*.js > ../v8/test/mjsunit/array-includes.js
```

## Conversion Details

### Per-Test Changes

The process of converting to mjsunit consists of these steps:

First, test262-to-mjsunit removes the copyright header and YAML frontmatter. It reuses the `description` key from the frontmatter to build a header comment for the test.

Then, it wraps the test body in an IIFE.

If the test has the `onlyStrict` flag set, it prepends `"use strict";` to the test body (inside the IIFE).

If the test includes `Test262Error.js`, it prepends a quick `function Test262Error() {}`. (This ensures that any `assert.throws` that are converted to `assertThrows` work correctly.)

Next, it performs a series of substitutions on the test body (done at the abstract syntax-tree level, so it should be fairly robust):

<table>
    <thead>
        <tr>
            <th>test262 construct</th>
            <th>mjsunit construct</th>
        </tr>
    </thead>
    <tr>
        <td>assert(value, "message")</td>
        <td>assertTrue(value)</td>
    </tr>
    <tr>
        <td>assert.sameValue(value, true, "message")</td>
        <td>assertTrue(value)</td>
    </tr>
    <tr>
        <td>assert.sameValue(value, false, "message")</td>
        <td>assertFalse(value)</td>
    </tr>
    <tr>
        <td>assert.sameValue(value, <var>any other literal</var>, "message")</td>
        <td>assertEquals(<var>any other literal</var>, value)</td>
    </tr>
    <tr>
        <td>assert.throws(ErrorConstructor, functionToRun)</td>
        <td>assertThrows(functionToRun, ErrorConstructor)</td>
    </tr>
    <tr>
        <td>$ERROR("message")</td>
        <td>assertUnreachable("message")</td>
    </tr>
    <tr>
        <td>new Test262Error("message")</td>
        <td>new Test262Error()</td>
    </tr>
</table>

Finally, it reformats the test to be two-space indents, double quotes, and whatever else [Recast](https://github.com/benjamn/recast) does with its default pretty-printer.

### Unsupported features

Although there are presumably many features of test262 tests that this converter doesn't yet support, two are caught explicitly as early errors: negative tests and tests that include other files. Both of these are detected via the YAML frontmatter.

If either of these features is used in a test, the resulting output will be a three-line comment with an appropriate error message. For example:

```js
// !!! Test failed to convert:
// Cannot convert tests with includes.
// !!!
```

(However, there is one exception to the no-includes rule: `Test262Error.js`, as noted above.)

You can bypass the check for includes via the `--ignore-includes` option. Presumably in this case you're planning to supply the relevant includes by manually editing the output.

### Aggregation

Each test is processed separately according to the above process. Then, they are stitched together with double-newlines between them. The appropriate V8 copyright header is added to the top of the output, and if specified, the appropriate V8 flags comment is added below that.
