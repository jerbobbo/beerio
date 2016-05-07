app.config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: '/js/admin/admin.html',
    controller: 'AdminCtrl',
    resolve: {
      products: function(ProductFactory) {
        return ProductFactory.getAll();
      },
      categories: function(CategoryFactory){
        return CategoryFactory.getAll();
      },
      users: function(UserFactory){
        return UserFactory.getAll();
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

  $stateProvider.state('admin.productDelete', {
    url: '/productEdit',
    templateUrl: '/js/admin/admin.productDelete.html',
    controller: 'AdminProductCtrl'
  })

  $stateProvider.state('admin.productEdit', {
    url: '/productEdit',
    templateUrl: '/js/admin/admin.productEdit.html',
    controller: 'AdminProductCtrl'
  })

  $stateProvider.state('admin.userAdd', {
    url: '/userAdd',
    templateUrl: '/js/admin/admin.userAdd.html',
    controller: 'AdminUserCtrl'
  })

  $stateProvider.state('admin.userEdit', {
    url: '/userAdd',
    templateUrl: '/js/admin/admin.userEdit.html',
    controller: 'AdminUserCtrl'
  })

})

app.controller('AdminCtrl', function($scope, products, isLoggedIn, ProductFactory) {
  $scope.products = products;
  console.log(isLoggedIn);
  $scope.isLoggedIn = isLoggedIn;

});

app.controller('AdminUserCtrl', function($scope, users, isLoggedIn, UserFactory) {
  $scope.users = users;
  console.log(isLoggedIn);
  $scope.isLoggedIn = isLoggedIn;

});


app.controller('AdminProductCtrl', function($scope, $state, $uibModal, isLoggedIn, ProductFactory,categories) {

  $scope.adminColumns=['name','available','deleted'];

  $scope.categories = categories;

  $scope.openModal = function(id) {
    $uibModal.open({
      templateUrl: '/js/admin/admin.productEdit.html',
      controller: 'ProductDetailModalCtrl',
      resolve: {
        product: function(ProductFactory) {
          return ProductFactory.getOne(id);
         },
        categories: function(CategoryFactory){
          return CategoryFactory.getAll();
        }
       }
     });
  };

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

  $scope.removeProduct=function(id){
    return ProductFactory.softDelete(id)
            .then(function(){
              $state.reload();
            })
  };

  $scope.toggleAvailability= function(id,available){
    return ProductFactory.toggle(id,available)
            .then(function(){
              $state.reload();
            })
  };



});