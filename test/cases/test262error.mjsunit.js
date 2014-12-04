// Array.prototype.includes should terminate if getting an index throws an
// exception
(function() {
  var trappedZero = {
    length: 2,

    get 0() {
      throw new MjsUnitAssertionError("This error should be re-thrown");
    },

    get 1() {
      assertUnreachable("Should not try to get the first element");
    }
  };

  assertThrows(function() {
    Array.prototype.includes.call(trappedZero, "a");
  }, MjsUnitAssertionError);
})();
