app.config(function ($stateProvider) {
    $stateProvider.state('checkout', {
        url: '/checkout',
        controller: 'checkOutCtrl',
        templateUrl: 'js/checkout/checkout.html'
    });
});

app.controller('checkOutCtrl', function($scope, CartFactory) {
	// $scope.cartInfo = Cart
})

app.directive('checkoutCartDetails', function() {
	return {
		restrict: 'E',
		templateUrl: 'js/checkout/checkoutDetail.html',
		controller: 'CartCtrl'
	}
})

app.directive('checkoutForm', function() {
	return {
		restrict: 'E',
		templateUrl: 'js/checkout/checkoutForm.html'
	}
})