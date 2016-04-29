app.config(function($stateProvider) {
  $stateProvider.state('products', {
    url: '/products',
    templateUrl: '/js/products/products.html',
    controller: 'ProductCtrl',
    resolve: {
      products: function(ProductFactory) {
        return ProductFactory.getAll();
      }
      // isLoggedIn: function(AuthService) {
      //   return AuthService.isAuthenticated();
      // }
    }
  })

  $stateProvider.state('product', {
    url: '/product/:id',
    templateUrl: '/js/products/product.detail.html',
    controller:'ProductDetailCtrl',
    resolve: {
      product: function(ProductFactory,$stateParams) {
        return ProductFactory.getOne($stateParams.id);
      }
      // isLoggedIn: function(AuthService) {
      //   return AuthService.isAuthenticated();
      // }
    }
  })

})

app.controller('ProductCtrl', function($scope, products, CartFactory, AuthService) {
  $scope.products = products;
  $scope.isLoggedIn = AuthService.isAuthenticated;
  $scope.getLineItem = CartFactory.getLineItem;
  $scope.addToCart = CartFactory.addToCart;
  $scope.updateQty = CartFactory.updateQty;

});

app.controller('ProductDetailCtrl', function($scope, product, isLoggedIn, $stateParams) {
  $scope.product = product;

  $scope.isLoggedIn = isLoggedIn;

  $scope.addToCart = function(product) {
    // send over via cart factory?
  }

});

app.factory('ProductFactory', function($http, CartFactory) {
  var productObj;
  var _productCache = [];

  productObj = {
    getAll: function() {
      return $http.get('/api/products')
        .then(function(products) {
          var productsWithLineItem = products.data.map(function(product) {
            //will add lineItem to product object if it exists in cart
            product.lineItem = CartFactory.getLineItem(product._id);
            return product;
          });
          console.log(productsWithLineItem);
          angular.copy(productsWithLineItem, _productCache);
          return _productCache;
        });
    },

    getOne: function(id) {
      return $http.get('/api/products/' + id)
        .then(function(product) {
          return product.data;
        });
    }
  };

  return productObj;
});
