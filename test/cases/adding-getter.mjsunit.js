//
// Array.prototype.includes sees a new element added by a getter that is hit during iteration
//
(function() {
  var arrayLike = {
    length: 5,
    0: "a",

    get 1() {
      this[2] = "c";
      return "b";
    }
  };

  assertTrue(Array.prototype.includes.call(arrayLike, "c"));
})();
