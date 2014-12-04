// Array.prototype.includes should use ToObject on this, so that when called
// with a number, it picks up numeric properties from Number.prototype (even in
// strict mode)
(function() {
  "use strict";
  Number.prototype[0] = "a";
  Number.prototype[1] = "b";

  Object.defineProperty(Number.prototype, 2, {
    get: function() {
      assertEquals("object", typeof this);
      return "c";
    }
  });

  Number.prototype.length = 3;
  assertTrue(Array.prototype.includes.call(5, "a"));
  assertTrue(Array.prototype.includes.call(5, "b"));
  assertTrue(Array.prototype.includes.call(5, "c"));
  assertFalse(Array.prototype.includes.call(5, "d"));
})();
