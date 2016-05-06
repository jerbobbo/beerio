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
          return OrderFactory.fetchOne($stateParams.orderId);
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

app.controller('OrderDetailCtrl', function($scope, order, isLoggedIn, CartFactory) {
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

  orderObj.getAdminAll = function() {
    return $http.get('/api/orders/all')
      .then(function(response) {

        return response.data;
      });
  };

  orderObj.getByType = function(status) {
    return $http.get('/api/orders/all')
      .then(function(response) {

        return response.data;
      })
      .then(function(orders){
        var filteredOrders=orders.filter(function(order){

          if (order.status==status) {
            return true;
          }
        })
        return filteredOrders;
      })
  };

  orderObj.fetchOne = function(orderId) {
    return $http.get('/api/orders/' + orderId)
      .then(function(response) {
        return response.data;
      });
  };

  orderObj.update = function(order) {
      return $http({
            url: '/api/products/' + order._id,
            method: "PUT",
            data: order
      })
        .then(function(_order) {
          return _order.data;
        });
  };


  return orderObj;
});
