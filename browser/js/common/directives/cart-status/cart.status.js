app.directive('cartStatus', function (CartFactory) {
  return {
    templateUrl: '/js/common/directives/cart-status/cart.status.html',
    restrict: 'E',
    controller: 'CartCtrl'
    // link: function (scope) {
    //   CartFactory.fetchCart()
    //   .then(function(_cart) {
    //     scope.cart = _cart;
    //     scope.subtotal = 0;
    //     scope.numberOfItems = 0;
    //
    //     _cart.forEach(function(cartItem) {
    //       scope.numberOfItems += cartItem.quantity;
    //       ProductFactory.getOne(cartItem.productId)
    //       .then(function(product) {
    //         $scope.subtotal += cartItem.quantity * product.price;
    //       });
    //     });
    //   });
    // }
  };
});
