app.config(function($stateProvider) {
  $stateProvider.state('products', {
    url: '/products',
    templateUrl: '/js/products/products.html',
    controller: 'ProductCtrl',
    resolve: {
      products: function(ProductFactory) {
        return ProductFactory.getAll();
      }
    }
  });

  $stateProvider.state('product', {
    url: '/product/:id',
    templateUrl: '/js/products/product.detail.html',
    controller:'ProductDetailCtrl',
    resolve: {
      product: function(ProductFactory,$stateParams) {
        return ProductFactory.getOne($stateParams.id);
      }
    }
  });

});

app.controller('ProductCtrl', function($scope, products, CartFactory, AuthService) {
  $scope.products = products;
  $scope.isLoggedIn = AuthService.isAuthenticated;
  $scope.getLineItem = CartFactory.getLineItem;
  $scope.addToCart = CartFactory.addToCart;
  $scope.updateQty = CartFactory.updateQty;

});

app.controller('ProductDetailCtrl', function($scope, product, CartFactory, AuthService) {
  $scope.product = product;
  $scope.isLoggedIn = AuthService.isAuthenticated;
  $scope.getLineItem = CartFactory.getLineItem;
  $scope.addToCart = CartFactory.addToCart;
  $scope.updateQty = CartFactory.updateQty;

});

app.factory('ProductFactory', function($http, CartFactory) {
  var productObj;
  var _productCache = [];

  productObj = {
    getAll: function() {
      return $http.get('/api/products')
        .then(function(products) {
          angular.copy(products.data, _productCache);
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
