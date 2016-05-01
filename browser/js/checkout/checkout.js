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
    	url: '/review',
    	templateUrl: 'js/checkout/review.html'
    })
    .state('checkout.complete', {
    	url: '/complete',
    	templateUrl: 'js/checkout/complete.html'
    })
});

app.controller('checkOutCtrl', function($scope, $state, CartFactory) {
	var states = [
		{
			state: 'checkout',
			title: 'Shipping Info',
			progress: 10
		},
		{
			state: 'checkout.payment',
			title: 'Payment Info',
			progress: 60
		},
		{
			state: 'checkout.review',
			title: 'Review Order',
			progress: 90
		},
		{
			state: 'checkout.complete',
			title: 'Order Placed',
			progress: 100
		}];

	var stateIdx = 0;
	$scope.currentState = states[stateIdx];
	var previousState = states[stateIdx];

	// not being used yet - will only be used on review template
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
	$scope.next = function(info, form) {
		if (info && form.$valid) {
			previousState = $scope.currentState;
			$scope.currentState = states[++stateIdx];
			$state.go($scope.currentState.state)
		}
	};

	$scope.previous = function() {
		$scope.currentState = states[--stateIdx];
		$state.go($scope.currentState.state);
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