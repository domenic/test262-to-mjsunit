//
// Array.prototype.includes stops once it hits the length of an array-like, even
// if there are more after
//
(function() {
  var arrayLike = {
    length: 2,
    0: "a",
    1: "b",

    get 2() {
      assertUnreachable("Should not try to get the second element");
    }
  };

  assertFalse(Array.prototype.includes.call(arrayLike, "c"));
})();
