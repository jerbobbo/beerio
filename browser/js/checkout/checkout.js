app.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('checkout', {
		abstract: true,
		url: '/checkout',
		controller: 'checkOutCtrl',
		templateUrl: 'js/checkout/checkout.html',
	})
		.state('checkout.address', {
			url: '/address',
			templateUrl: 'js/checkout/addressForm.html',
			controller: 'addressCtrl',
			resolve: {
				order: function(CheckoutFactory) {
					return CheckoutFactory.createOrder()
				},
				current: function(CheckoutFactory) {
					CheckoutFactory.setIdx(0);
					return CheckoutFactory.getState();
				}
			}
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
		});
	// $urlRouterProvider.when('/checkout', '/checkout/address').otherwise('/checkcout/address');
}).run(function($rootScope, $urlRouter, $location, $state) {
	// intercept each state change
	$rootScope.$on('$locationChangeSuccess', function(e, toState, toParams) {
		if ($location.url() === '/checkout/address' && toParams.indexOf('/checkout/address' !== -1)) {
			$state.reload(true) // if above is true, reload state.
			$urlRouter.sync();
		}
	});
})

app.controller('addressCtrl', function($scope, current, order) {
	$scope.currentState = current;
	$scope.order = order
	console.log(order)

})

app.controller('checkOutCtrl', function($scope, $state, CheckoutFactory) {
	var stateIdx = 0;

	$scope.currentState = CheckoutFactory.getState();
	$scope.next = function(info, form) {

		if (info && form.$valid) {
			CheckoutFactory.saveState(info);
			CheckoutFactory.setIdx(++stateIdx);
			$scope.currentState = CheckoutFactory.getState();
			$state.go($scope.currentState.state)
		}
	};

	$scope.previous = function() {
		CheckoutFactory.setIdx(--stateIdx);
		$scope.currentState = CheckoutFactory.getState();
		$state.go($scope.currentState.state);
	}

	$scope.placeOrder = function() {
		// return CheckoutFactory.()
	}
});

app.factory('CheckoutFactory', function($http) {
	var _states = [{
		state: 'checkout.address',
		title: 'Shipping Info',
		progress: 10,
		form: {}
	}, {
		state: 'checkout.payment',
		title: 'Payment Info',
		progress: 60,
		form: {}
	}, {
		state: 'checkout.review',
		title: 'Review Order',
		progress: 90,
		form: {}
	}, {
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
		},
		createOrder: function(cart, info ) {
			$http.post('/api/orders')
				.then(function(order) {
					console.log(order)
					return order.data;
				})
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