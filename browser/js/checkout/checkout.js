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
			progress: 10,
			form: {}
		},
		{
			state: 'checkout.payment',
			title: 'Payment Info',
			progress: 60,
			form: {}
		},
		{
			state: 'checkout.review',
			title: 'Review Order',
			progress: 90,
			form: {}
		},
		{
			state: 'checkout.complete',
			title: 'Order Placed',
			progress: 100,
			form: {}
		}];

	var stateIdx = 0;
	$scope.currentState = states[stateIdx];
	var previousState = states[stateIdx];

	// not being used yet - will only be used on review template
	$scope.submitOrder = function(info) {

	}
	$scope.next = function(info, form) {
		if (info && form.$valid) {
			previousState = $scope.currentState;
			$scope.currentState = states[++stateIdx];
			if (stateIdx === 2) {
				$scope.currentState.form.shipping = states[0].form;
				$scope.currentState.form.billing = states[1].form;
				console.log($scope)
			}
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