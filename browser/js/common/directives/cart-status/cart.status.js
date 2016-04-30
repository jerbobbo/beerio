app.directive('cartStatus', function (CartFactory) {
  return {
    templateUrl: '/js/common/directives/cart-status/cart.status.html',
    restrict: 'E',
    controller: 'CartCtrl'
  };
});
