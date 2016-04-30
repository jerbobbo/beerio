app.directive('addToCart', function(AuthService, CartFactory) {
  return {
    restrict: 'E',
    templateUrl: '/js/common/directives/add-to-cart/add.to.cart.html',
    scope: {
      product: '=',
      lineItem: '=',
      label: '@'
    },
    link: function (scope) {
      scope.isLoggedIn = AuthService.isAuthenticated;
      scope.addToCart = CartFactory.addToCart;
      scope.updateQty = CartFactory.updateQty;
      scope.removeItem = CartFactory.removeItem;
      scope.getLineItem = CartFactory.getLineItem;
    }
  };
});
