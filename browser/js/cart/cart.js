app.config(function($stateProvider) {
  $stateProvider.state('cart', {
    url: '/cart',
    templateUrl: '/js/cart/cart.html',
    controller: 'CartCtrl'
  });
});

app.controller('CartCtrl', function($scope, $uibModal, CartFactory, ProductFactory) {

  $scope.cartInfo = CartFactory.getInfo();
  $scope.isInCart = CartFactory.isInCart;

  CartFactory.fetchCart()
    .then(function(_cart) {
      $scope.cart = _cart;
    });

  $scope.openModal = function(id) {
    $uibModal.open({
      templateUrl: 'js/products/product.detail.html',
      controller: 'ProductDetailCtrl',
      resolve: {
        product: function(ProductFactory) {
          return ProductFactory.getOne(id);
        }
      }
    });
  };

  $scope.quantityChange = function(lineItem, qty) {
    return CartFactory.updateQty(lineItem._id, qty);
  };

  $scope.removeItem = function(lineItem) {
    return CartFactory.removeItem(lineItem._id);
  };

  $scope.updateOne = function(lineItem, dir) {
    var qty = Number(lineItem.quantity);
    if (qty === 0) {
      return CartFactory.removeItem(lineItem._id);
    }
    qty += Number(dir);
    return CartFactory.updateQty(lineItem._id, qty);
  };

});


app.factory('CartFactory', function($http) {
  var _cartCache = [];
  var _cartInfo = {
    subtotal: 0,
    numberOfItems: 0
  };

  function _updateInfo() {
    _cartInfo.numberOfItems = 0;
    _cartInfo.subtotal = 0;
    _cartCache.forEach(function(cartItem) {
      _cartInfo.numberOfItems += +cartItem.quantity;
      _cartInfo.subtotal += (cartItem.quantity * parseInt(cartItem.productId.price));
    });

  }

  function _findInCart(id) {
    var foundIdx = -1;
    _cartCache.forEach(function(lineItemObj, idx) {
      if (lineItemObj._id === id) {
        foundIdx = idx;
      }
    });
    return foundIdx; // will only ever return last found matching item in cart
  }

  var cartObj = {};

  cartObj.getInfo = function() {
    return _cartInfo;
  };

  cartObj.getLineItem = function(productId) {
    var foundLineItem = null;
    _cartCache.forEach(function(lineItemObj) {
      if (lineItemObj.productId._id === productId) foundLineItem = lineItemObj;
    });
    return foundLineItem;
  };

  cartObj.fetchCart = function() {
    return $http.get('/api/cart')
      .then(function(response) {
        angular.copy(response.data.items, _cartCache);
        _updateInfo();
        return _cartCache;
      });
  };

  cartObj.addToCart = function(product) {
    return $http.post('/api/cart/', product)
      .then(function(resp) {
        _cartCache.push(resp.data);
        _updateInfo();
        return resp.data;
      });
  };

  cartObj.updateQty = function(lineItemId, qty) {
    if (qty == 0) return cartObj.removeItem(lineItemId);
    return $http.put('/api/cart/' + lineItemId, {
        quantity: qty
      })
      .then(function(resp) {
        _cartCache[_findInCart(lineItemId)].quantity = qty;
        _updateInfo();
        return resp.data;
      });
  };

  cartObj.removeItem = function(lineItemId) {
    return $http.delete('/api/cart/' + lineItemId)
      .then(function(resp) {
        _cartCache.splice(_findInCart(lineItemId), 1);
        _updateInfo();
        return resp.data;
      });
  };

  return cartObj;
});