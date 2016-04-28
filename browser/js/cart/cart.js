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

app.controller('CartCtrl', function($scope, cart, CartFactory) {

  $scope.cart = cart;

  $scope.quantityChange = function(lineItem, qty) {
    return CartFactory.updateQty(lineItem._id, qty);
  };
  
  $scope.removeItem = function(lineItem) {
    return CartFactory.removeItem(lineItem._id);
  };
  

});


app.factory('CartFactory', function($http) {
  var _cartCache = [];
  var cartObj = {};
  
  function _findInCart(id) {
    var foundIdx = -1;
    _cartCache.forEach(function (lineItemObj, idx) {
      if (lineItemObj._id === id) {
        foundIdx = idx;
      }
    })
    return foundIdx; // will only ever return last found matching item in cart
  };
  
  cartObj.fetchCart = function() {
    return $http.get('/api/cart')
      .then(function(response) {
        angular.copy(response.data.items, _cartCache);
        return _cartCache;
      });
  };

  cartObj.addToCart = function(product) {
    return $http.post('/api/cart/', product)
      .then(function(resp) {
        return resp.data;
      });
  };
  
  cartObj.updateQty = function(lineItemId, qty) {
    return $http.put('/api/cart/' + lineItemId, {quantity: qty})
      .then(function(resp) {
        return resp.data;
      })
  };
  
  cartObj.removeItem = function(lineItemId) {
    return $http.delete('/api/cart/' + lineItemId)
      .then(function(resp) {
        _cartCache.splice(_findInCart(lineItemId), 1);
        return resp.data;
      })
  };
  
  return cartObj;
});