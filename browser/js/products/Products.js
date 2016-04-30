app.config(function($stateProvider) {
  $stateProvider.state('products', {
    url: '/products',
    templateUrl: '/js/products/products.html',
    controller: 'ProductCtrl',
    resolve: {
      products: function(ProductFactory) {
        return ProductFactory.getAll();
      },
      isLoggedIn: function(AuthService) {
        return AuthService.isAuthenticated();
      }
    }
  })

  $stateProvider.state('product', {
    url: '/product/:id',
    templateUrl: '/js/products/product.detail.html',
    controller:'ProductDetailCtrl',
    resolve: {
      product: function(ProductFactory,$stateParams) {
        return ProductFactory.getOne($stateParams.id);
      },
      isLoggedIn: function(AuthService) {
        return AuthService.isAuthenticated();
      }
    }
  })

})

app.controller('ProductCtrl', function($scope, products, isLoggedIn, CartFactory) {
  $scope.products = products;
  console.log(isLoggedIn);
  $scope.isLoggedIn = isLoggedIn;

  $scope.addToCart = function(product) {
    CartFactory.addToCart(product);
  }

});

app.controller('ProductDetailCtrl', function($scope, product, isLoggedIn, $stateParams) {
  $scope.product = product;

  $scope.isLoggedIn = isLoggedIn;

  $scope.addToCart = function(product) {
    // send over via cart factory?
  }

});

app.factory('ProductFactory', function($http) {
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
    },

    add: function(product) {
      return $http({
            url: '/api/products/',
            method: "POST",
            data: product
      })
        .then(function(product) {
          return product.data;
        });
    }
  };

  return productObj;
});
