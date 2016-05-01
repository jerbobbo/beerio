app.config(function($stateProvider) {
  $stateProvider.state('orders', {
    url: '/orders',
    templateUrl: '/js/orders/orders.html',
    controller: 'OrdersCtrl',
    resolve: {
      isLoggedIn: function(AuthService) {
        return AuthService.isAuthenticated();
      }
    }
  })


})

app.controller('OrdersCtrl', function($scope, orders, isLoggedIn, CartFactory) {

});


app.factory('OrderFactory', function($http) {
  var orderObj;
  

  return orderObj;
});
