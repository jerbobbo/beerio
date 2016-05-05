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

  $stateProvider.state('product.reviews', {
    url: '/reviews',
    templateUrl: '/js/products/product.reviews.html',
    controller: 'ProductDetailCtrl'
  });

});

app.controller('ProductCtrl', function($scope, products) {
  $scope.products = products;
});

app.controller('ProductDetailCtrl', function($scope, product, CartFactory, ProductFactory) {
  $scope.product = product;
  $scope.showReviewForm = false;
  $scope.newReview = {};
  $scope.newReview.productId = $scope.product._id;
  $scope.reviewLimit = 3;

  ProductFactory.getReviews(product._id)
  .then(function(_reviews) {
    $scope.reviews = _reviews;
  });

  $scope.toggleReview = function() {
    $scope.showReviewForm = !$scope.showReviewForm;
  };

  $scope.toggleReviewLimit = function() {
    if($scope.reviewLimit === 3) $scope.reviewLimit = $scope.reviews.length;
    else $scope.reviewLimit = 3;
  };

  $scope.addReview = function(product, review) {
    ProductFactory.addReview(product, review)
    .then(function(newReview) {
      $scope.reviews.unshift(newReview);
      $scope.newReview = {};
    });
  };

});

app.controller('ProductDetailModalCtrl', function($scope, product, CartFactory, ProductFactory,$state,$uibModalInstance) {
  $scope.product = product;

  $scope.editProduct = function(product){
    return ProductFactory.update(product)
            .then(function(updatedProduct){
                console.log('updated product is', updatedProduct);
                 $uibModalInstance.dismiss('cancel');
                $state.go('product',{id:updatedProduct._id});
            });
  };

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
        .then(function(_product) {
          return _product.data;
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
        .then(function(_product) {
          return _product.data;
        });
    },

    getReviews: function(productId) {
      return $http.get('/api/products/' + productId + '/reviews')
      .then(function(reviews) {
        return reviews.data;
      });
    },

    addReview: function(product, review) {
      return $http.post('/api/products/' + product._id + '/reviews', review)
      .then(function(_review) {
        return _review.data;
      });
    }
  };

  return productObj;
});
