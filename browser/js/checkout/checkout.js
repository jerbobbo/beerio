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

app.controller('checkOutCtrl', function($scope, $state, CheckoutFactory) {

	var stateIdx = 0;
	$scope.currentState = CheckoutFactory.getState();
	// $scope.init = function(){
	// 	$scope.currentState = (function() {
	// 		CheckoutFactory.getState(stateIdx);
	// 	})();
	// }
	// console.log($scope.currentState)
	// var previousState = $scope.currentState;
	// not being used yet - will only be used on review template
	// $scope.submitOrder = function(info) {

	// }

	$scope.next = function(info, form) {
		if (info && form.$valid) {
			// previousState = $scope.currentState;
			CheckoutFactory.saveState(form);
			CheckoutFactory.setIdx(++stateIdx);
			// console.log(CheckoutFactory.getState())
			$scope.currentState = CheckoutFactory.getState();
			$state.go($scope.currentState.state)
		}
	};

	$scope.previous = function() {
		CheckoutFactory.setIdx(--stateIdx);
		$scope.currentState = CheckoutFactory.getState();
		console.log($scope.currentState)
		$state.go($scope.currentState.state);
	}
});

app.factory('CheckoutFactory', function($http) {
	var _states = [
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
	var _stateIdx = 0;

	return {

		getState: function() {
			return _states[_stateIdx];
		},

		saveState: function(form) {
			_states[_stateIdx].form = form;
			_stateIdx++;
		},

		setIdx: function(idx) {
			_stateIdx = idx;
			return _stateIdx;
		}
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