// Array.prototype.includes should terminate if getting an index throws an
// exception
(function() {
  function Test262Error() {}

  var trappedZero = {
    length: 2,

    get 0() {
      throw new Test262Error();
    },

    get 1() {
      assertUnreachable("Should not try to get the first element");
    }
  };

  assertThrows(function() {
    Array.prototype.includes.call(trappedZero, "a");
  }, Test262Error);
})();
