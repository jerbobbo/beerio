app.config(function($stateProvider) {
  $stateProvider.state('cart', {
    url: '/cart',
    templateUrl: '/js/cart/cart.html',
    controller: 'CartCtrl',
    resolve: {
      cart: function(CartFactory) {
        return CartFactory.fetchCart();
      }
    }
  })
})

app.controller('CartCtrl', function($scope, cart) {
  // dummy data here
  console.log(cart)
  $scope.cart = cart;

  $scope.quantityChange = function(lineitem) {
    // save to factory and model
  }
});


app.factory('CartFactory', function($http) {

  var cartObj = {};
  cartObj.fetchCart = function() {
    return $http.get('/api/cart')
      .then(function(response) {
        return response.data.items;
      });
  };

  cartObj.addToCart = function(product) {
    console.log(product)
    return $http.post('/api/cart/', product)
      .then(function(resp) {
        console.log(product, resp.data);
        return resp.data;
      })
  }
  return cartObj;
});