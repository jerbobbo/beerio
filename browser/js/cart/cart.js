app.config(function($stateProvider) {
  $stateProvider.state('cart', {
    url: '/cart',
    templateUrl: 'js/cart/cart.html',
    controller: 'CartCtrl'
  })
})

app.controller('CartCtrl', function($scope,$state) {
  // dummy data here
  $scope.cart =
  [
  {
    _id: 12312512323,
    name: "Cerveza",
    price: 3.99,
    quantity: 4
  },
  {
    _id: 123125123123,
    name: "Budweiser",
    price: 3.99,
    quantity: 4
  }];

  $scope.quantityChange = function(lineitem) {
    // save to factory and model

  }
});
