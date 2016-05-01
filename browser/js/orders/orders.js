app.config(function($stateProvider) {
  $stateProvider
    .state('orders', {
      url: '/orders',
      templateUrl: '/js/orders/orders.history.html',
      controller: 'OrdersCtrl',
      resolve: {
        isLoggedIn: function(AuthService) {
          return AuthService.isAuthenticated();
        },
        orders: function(OrderFactory) {
          return OrderFactory.fetchAll();
        }
      }
    })
    .state('order', {
      url: '/order/:orderId',
      templateUrl: '/js/orders/orders.detail.html',
      controller: 'OrderDetailCtrl',
      resolve: {
        order: function(OrderFactory, $stateParams) {
          return OrderFactory.fetchOne($staetParams.orderId);
        },
        isLoggedIn: function(AuthService) {
          return AuthService.isAuthenticated();
        }
      }
    })
})

app.controller('OrdersCtrl', function($scope, orders, isLoggedIn, CartFactory) {
  $scope.orders = orders;
});

app.controller('OrderDetailCtrl', function($scope, order, isLoggedIn, CartFactory) {;
  $scope.order = order;
});


app.factory('OrderFactory', function($http) {
  var orderObj = {};

  orderObj.fetchAll = function() {
    return $http.get('/api/orders/')
      .then(function(response) {
        return response.data;
      });
  };

  orderObj.fetchOne = function(orderId) {
    return $http.get('/api/orders/' + orderId)
      .then(function(response) {
        return response.data;
      });
  };


  return orderObj;
});
