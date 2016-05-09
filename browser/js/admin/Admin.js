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
      orders: function(OrderFactory){
        return OrderFactory.getAdminAll();
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
    url: '/userEdit',
    templateUrl: '/js/admin/admin.userEdit.html',
    controller: 'AdminUserCtrl'
  })

  $stateProvider.state('admin.orders', {
    url: '/orders',
    templateUrl: '/js/admin/admin.orders.html',
    controller: 'AdminOrderCtrl'
  })

})

app.controller('AdminCtrl', function($scope, products, users, isLoggedIn, ProductFactory) {
  $scope.products = products;
  console.log(isLoggedIn);
  $scope.isLoggedIn = isLoggedIn;

  $scope.users=users;



});

app.controller('AdminUserCtrl', function($scope,$state, users, isLoggedIn, UserFactory) {
  $scope.users = users;
  console.log(isLoggedIn);
  $scope.isLoggedIn = isLoggedIn;
  $scope.adminColumns=['email','resetpass','admin','deleted'];
  $scope.select= function(type){
    $scope.userType=type;
  };

  $scope.addUser= function(){
    var _admin=false;
    if($scope.userType=='Admin'){
      _admin=true;
    }

    return UserFactory.createUser({
            email:$scope.email,
            password:$scope.password,
            admin:_admin
          })
          .then(function(newUser){
            console.log(newUser)
            newUser.admin=_admin;
            newUser.deleted=false;
            newUser.resetpass=false;

            $scope.newUser=newUser;
            $scope.users.push(newUser);
            $scope.success=true;
            $state.go('admin.userEdit')
          });
  };

  $scope.toggleUserType= function(user){
    var _admin;

    if(!user.admin){
      _admin=true;
    } else if (user.admin){
      _admin=false;
    }
    user.admin=_admin;

    return UserFactory.update(user);
  };

  $scope.blockUser=function(user){
    return UserFactory.softDelete(user._id)
            .then(function(){
              $state.reload();
            })
  };

  $scope.passReset=function(user){
    return UserFactory.passReset(user._id)
            .then(function(){
              $state.reload();
            })
  };

});

app.controller('AdminOrderCtrl', function($scope,isLoggedIn,OrderFactory,orders, $uibModal) {

  $scope.orders=orders;
  $scope.adminColumns=['_id','user','status','total'];

  $scope.filterOrders= function(status){
    return OrderFactory.getByType(status)
            .then(function(orders){
              $scope.orders=orders;
            })
  };

  $scope.viewAll = function(){
    $scope.orders=orders;
  };

  $scope.toggleStatus = function(order){
      var _status;

      if(!order.status || order.status=='cancelled'){
        console.log('you cant uncancel an order');
        return;
     } else if(order.status=='cart'){
        _status='complete';
      } else if( order.status=='complete'){
        _status='cart';
      }
      order.status=_status;

      return OrderFactory.update(order);
  };

  $scope.cancelOrder = function(order){

      order.status='cancelled';

      return OrderFactory.update(order);
  };

  $scope.openModal = function(order) {
    console.log(order);
    $uibModal.open({
      templateUrl: '/js/orders/orders.detail.html',
      controller: 'OrderDetailCtrl',
      resolve: {
        order: function(OrderFactory) {
          return OrderFactory.fetchOne(order._id);
        },
        isLoggedIn: function(AuthService) {
          return AuthService.isAuthenticated();
        }
       }
     })
  };


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






