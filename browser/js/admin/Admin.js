app.config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: '/js/admin/admin.html',
    controller: 'AdminCtrl',
    resolve: {
      products: function(ProductFactory) {
        return ProductFactory.getAll();
      },
      isLoggedIn: function(AuthService) {
        return AuthService.isAuthenticated();
      }
    }
  })

  $stateProvider.state('admin.productAdd', {
    url: '/productAdd',
    templateUrl: '/js/admin/admin.productAdd.html',
    controller: 'AdminProductCtrl'
  })

})

app.controller('AdminCtrl', function($scope, products, isLoggedIn, ProductFactory) {
  $scope.products = products;
  console.log(isLoggedIn);
  $scope.isLoggedIn = isLoggedIn;


});


app.controller('AdminProductCtrl', function($scope, $state, isLoggedIn, ProductFactory) {

  $scope.addProduct = function(product){
    return ProductFactory.add({
      name:$scope.productName,
      brewer:$scope.productBrewer,
      description:$scope.productDesc,
      style:$scope.productStyle,
      price:$scope.productPrice,
      abv:$scope.productABV,
      ratings:$scope.productRatings,
      scoreOverall:$scope.productScoreOverall,
      scoreCategory:$scope.productScoreCategory,
      imageUrl:$scope.productImageUrl
    }).then(function(newProduct){
      console.log(newProduct._id);
      $state.go('product',{id:newProduct._id});
    })
  };
});