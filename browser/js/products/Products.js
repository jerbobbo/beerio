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
  })
})

app.controller('ProductCtrl', function($scope, products) {
  $scope.products = products;

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
    }
  };

  return productObj;
});
