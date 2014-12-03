//
// Array.prototype.includes should use a negative value as the offset from the end of the array to compute fromIndex
//
(function() {
  assertTrue([12, 13].includes(13, -1));
  assertFalse([12, 13].includes(12, -1));
  assertTrue([12, 13].includes(12, -2));

  var arrayLike = {
    length: 2,

    get 0() {
      return "a";
    },

    get 1() {
      return "b";
    }
  };

  assertTrue(Array.prototype.includes.call(arrayLike, "b", -1));
  assertFalse(Array.prototype.includes.call(arrayLike, "a", -1));
  assertTrue(Array.prototype.includes.call(arrayLike, "a", -2));
})();
