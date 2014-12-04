//
// Array.prototype.includes should terminate if ToLength ends up being called on
// a symbol length
//
(function() {
  var fromIndexTrap = {
    valueOf: function() {
      assertUnreachable("Should not try to call ToInteger on valueOf");
    }
  };

  var badLength = {
    length: Symbol(),

    get 0() {
      assertUnreachable("Should not try to get the zeroth element");
    }
  };

  assertThrows(function() {
    Array.prototype.includes.call(badLength, "a", fromIndexTrap);
  }, TypeError);
})();
