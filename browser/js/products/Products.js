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

app.controller('ProductCtrl', function($scope, products, CartFactory) {
  $scope.products = products;
});

app.controller('ProductDetailCtrl', function($scope, product, CartFactory, ProductFactory,$state) {
  $scope.product = product;

  $scope.editProduct = function(product){
    return ProductFactory.update(product)
            .then(function(updatedProduct){
                console.log('updated product is', updatedProduct);

                $state.go('product',{id:updatedProduct._id});
            })
  };

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
    },

    update: function(product) {
      return $http({
            url: '/api/products/' + product._id,
            method: "PUT",
            data: product
      })
        .then(function(product) {
          return product.data;
        });
    }
  };

  return productObj;
});
