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


app.controller('AdminProductCtrl', function($scope, products, isLoggedIn, ProductFactory) {

  console.log(isLoggedIn);



});