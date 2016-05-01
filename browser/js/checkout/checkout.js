app.config(function ($stateProvider) {
    $stateProvider.state('checkout', {
        url: '/checkout',
        controller: 'checkOutCtrl',
        templateUrl: 'js/checkout/checkout.html'
    })
    .state('checkout.payment', {
    	url: '/payment', 
    	templateUrl: 'js/checkout/paymentForm.html'
    })
    .state('checkout.review', {
    	url: '/review'
    })
});

app.controller('checkOutCtrl', function($scope, $state, CartFactory) {
	var states = ['checkout', 'checkout.payment', 'checkout.review' ];
	var currentState = 'checkout';
	var previousState = 'checkout';
	$scope.progress = 10;
	$scope.progressTitle = "Shipping Info"

	$scope.submitOrder = function(info, form) {
		console.log(info, form)
		if (info && form.$valid) {
			console.log(info, form)
			previousState = currentState;
			currentState = 'checkout.payment';
			$scope.progress = 60;
			$scope.progressTitle = "Payment Info"
			$state.go(currentState)
		}
	}

	$scope.previous = function() {
		$scope.progress = 10;
		$state.go(previousState)
	}
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
		templateUrl: 'js/checkout/checkoutForm.html',
		controller: 'checkOutCtrl'
	}
})

app.directive('addressForm', function() {
	return {
		restrict: 'E',
		templateUrl: 'js/checkout/addressForm.html'
	}
})

app.directive('billingAddressForm', function() {
	return {
		restrict: 'E',
		templateUrl: 'js/checkout/billingAddressForm.html'
	}
})