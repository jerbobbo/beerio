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

app.controller('ProductCtrl', function($scope, $uibModal, products, CartFactory) {
  $scope.products = products;
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
  }
});

app.controller('ProductDetailCtrl', function($scope, product, CartFactory) {
  $scope.product = product;
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
    },

    delete: function(id){
      return $http.delete('/api/products/' + id)
        .then(function(product) {
          return product.data;
        });
    }
  };

  return productObj;
});
