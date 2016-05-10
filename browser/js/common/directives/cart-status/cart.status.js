app.directive('cartStatus', function () {
  return {
    templateUrl: '/js/common/directives/cart-status/cart.status.html',
    restrict: 'E',
    controller: 'CartCtrl',
    link: function(scope) {
      scope.show = false;
      scope.pulsate = false;
      scope.showDropdown = function(cartInfo) {
        if (cartInfo.numberOfItems > 0) {
          if (scope.show) {
            scope.show = false;
          } else {
            scope.show = true;    
          }
          
        }
      }
      scope.$on('itemAdded', function() {
        scope.pulsate = true;
        setTimeout(function() {
          scope.pulsate = false;
        }, 1500)
      })
    }
  };
});
