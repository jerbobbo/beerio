app.config(function($stateProvider) {
  $stateProvider.state('products', {
    url: '/products',
    templateUrl: '/js/products/products.html',
    controller: 'ProductCtrl',
    resolve: {
      products: function(ProductFactory) {
        return ProductFactory.getAll();
      },
      categories: function(CategoryFactory){
          return CategoryFactory.getAll();
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
      },
      reviews: function(ProductFactory, $stateParams) {
        return ProductFactory.getReviews($stateParams.id);
      }
    }
  });

  $stateProvider.state('product.reviews', {
    url: '/reviews',
    templateUrl: '/js/products/product.reviews.html',
    controller: 'ProductDetailCtrl'
  });

  $stateProvider.state('productsByCategory', {
    url: '/category/:id/products',
    templateUrl: '/js/products/products.html',
    controller: 'ProductsCatCtrl',
    resolve: {
      products: function(CategoryFactory,$stateParams) {
        return CategoryFactory.getProducts($stateParams.id)
      },
      categories: function(CategoryFactory){
          return CategoryFactory.getAll();
      }
    }
  });

});

app.controller('ProductCtrl', function($scope, $uibModal, products,categories,CategoryFactory,ProductFactory) {
  $scope.products = products;
  $scope.categories = categories;

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


app.controller('ProductsCatCtrl', function($stateParams,$scope, products, categories, $uibModal,CategoryFactory,ProductFactory) {

  $scope.products=products;
  $scope.categories=categories;

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

app.controller('ProductDetailCtrl', function($scope, product, reviews, CartFactory, ProductFactory) {
  $scope.product = product;
  $scope.showReviewForm = false;
  $scope.newReview = {};
  $scope.newReview.productId = $scope.product._id;
  $scope.reviewLimit = 3;
  $scope.reviews = reviews;

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
      $scope.avgReview = getAvgReview();
      $scope.newReview = {};
    });
  };

  $scope.numReviews = function() {
    return $scope.reviews.length;
  };

  var getAvgReview = function() {
    if (!$scope.reviews.length) return 0;

    var ratingTotal = 0;
    $scope.reviews.forEach(function(review) {
      ratingTotal += review.stars;
    });
    return ratingTotal/$scope.reviews.length;
  };

  $scope.avgReview = getAvgReview();

});

app.controller('ProductDetailModalCtrl', function($scope, product, CartFactory, ProductFactory,$state,$uibModalInstance,categories) {
  $scope.product = product;
  $scope.categories=categories;

  $scope.editProduct = function(product){
    return ProductFactory.update(product)
            .then(function(updatedProduct){
                console.log('updated product is', updatedProduct);
                 $uibModalInstance.dismiss('cancel');
                $state.go('product',{id:updatedProduct._id});
            });
  };

  $scope.addCategory = function(cat){
    $scope.product.category.push(cat);
  };

  $scope.removeCategory = function(cat){
    var i = $scope.product.category.indexOf(cat);
    $scope.product.category.splice(i, 1);

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
