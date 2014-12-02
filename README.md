# Convert test262 tests to mjsunit format

V8 hasn't quite gotten around to letting its contributors write [test262](https://github.com/tc39/test262/) tests directly, [as I found out recently](https://codereview.chromium.org/771863002). Instead they prefer to check in tests in their custom [mjsunit](https://code.google.com/p/v8/source/browse/branches/bleeding_edge/test/mjsunit/mjsunit.js) format.

But what if you've already written a bunch of test262 tests? Or what if you want to be a good citizen and contribute to the general cross-browser testing cause that is test262, and yet you'd like to be able to land features in V8? This project will solve your problems, by converting test262-format tests to mjsunit-format tests destined for V8.

## Usage

Pass the tests you'd like to convert to the CLI utility. The resulting mjsunit files will be written to standard out.

```
cd Array.prototype.includes
test262-to-mjsunit test/*.js > ../v8/test/mjsunit/array-includes.js
```
