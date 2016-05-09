app.directive('addToCart', function(AuthService, CartFactory) {
  return {
    restrict: 'E',
    templateUrl: '/js/common/directives/add-to-cart/add.to.cart.html',
    scope: {
      product: '=',
      lineItem: '=',
      label: '@',
      detail: '='
    },
    link: function (scope, link, attr) {
      scope.isLoggedIn = AuthService.isAuthenticated;
      scope.addToCart = function(product, ev, detail) {
        CartFactory.addToCart(product).then(function(cart) {
          if (detail) {
            ev.target.innerHTML = "Added to cart (" + cart.quantity + ")";
          }
        })
      };
      scope.updateQty = CartFactory.updateQty;
      scope.removeItem = CartFactory.removeItem;
      scope.getLineItem = CartFactory.getLineItem;
    }
  };
});
