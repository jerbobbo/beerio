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

app.controller('ProductDetailModalCtrl', function($scope, product, CartFactory, ProductFactory,$state,$uibModalInstance) {
  $scope.product = product;

  $scope.editProduct = function(product){
    return ProductFactory.update(product)
            .then(function(updatedProduct){
                console.log('updated product is', updatedProduct);
                 $uibModalInstance.dismiss('cancel');
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

    softDelete: function(id){
      //note - soft delete also sets available to false
      return $http({
            url: '/api/products/' + id,
            method: "PUT",
            data: {deleted:true}
        })
        .then(function(product) {
          console.log(product)
          return $http({
            url: '/api/products/' + product.data._id,
            method: "PUT",
            data: {available:false}
           })
        })
        .then(function(product) {
          console.log(product)
          return product.data;
        });
    },

    toggle: function(id,available){
      if(available){
        return $http({
            url: '/api/products/' + id,
            method: "PUT",
            data: {available:false}
        })
        .then(function(product) {
          return product.data;
        });
      } else {
        return $http({
            url: '/api/products/' + id,
            method: "PUT",
            data: {available:true}
        })
        .then(function(product) {
          return product.data;
        });
      }

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
