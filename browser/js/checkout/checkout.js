app.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('checkout', {
			abstract: true,
			url: '/checkout',
			controller: 'checkOutCtrl',
			templateUrl: 'js/checkout/checkout.html'
		})
		.state('checkout.address', {
			url: '/address',
			templateUrl: 'js/checkout/addressForm.html',
			controller: 'addressCtrl',
			resolve: {
				current: function(CheckoutFactory) {
					return CheckoutFactory.getState();
				},
				order: function(CheckoutFactory) {
					return CheckoutFactory.createOrder();
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
		})
	$urlRouterProvider.when('/checkout', '/checkout/address').otherwise('/checkout/address');
}).run(function($rootScope, $urlRouter, $location, $state) {
	// intercept each state change
	$rootScope.$on('$locationChangeSuccess', function(e, toState, toParams) {
		if ($location.url() === '/checkout/address' && toParams.indexOf('address') === -1) {
			$state.reload(true) // if above is true, reload state.
			$urlRouter.sync();
		}
	});
});

app.controller('addressCtrl', function($scope, current, order) {
	$scope.currentState = current;
})

app.controller('checkOutCtrl', function($scope, $state, CheckoutFactory, CartFactory) {
	var stateIdx = 0;
	var currentOrder;
	$scope.currentState = CheckoutFactory.getState();
	
	if ($scope.currentState.state != $state.current.name) {
		$state.go($scope.currentState.state);	
	}
	
	$scope.next = function(info, form) {
		if (info && form.$valid) {
			currentOrder = CheckoutFactory.getOrder();
			CheckoutFactory.saveState(info, $scope.cart, $scope.cartInfo);
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
	 	CheckoutFactory.placeOrder()
	 		.then(function(order) {
	 			$scope.cart = [];
	 			CartFactory.clear()
	 		})
	}
});

app.factory('CheckoutFactory', function($http) {
	var _states = [{
		state: 'checkout.address',
		title: 'Shipping Info',
		progress: 10,
		form: {},
		lineItems: [],
		cartInfo: {}
	}, {
		state: 'checkout.payment',
		title: 'Payment Info',
		progress: 60,
		form: {},
		lineItems: [],
		cartInfo: {}
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
	var _order;
	var	_updateObj = {
		lineItems: [],
		subtotal: 0,
		total: 0,
		billingAddress: null,
		shippingAddress: null,
		status: null
	};

	return {
		placeOrder: function() {
			_updateObj.status = 'complete';
			return $http.put('/api/orders/' + _order._id, _updateObj)
				.then(function(order) {
					return order.data;
				})
		},
		
		getState: function() {
			return _states[_stateIdx];
		},

		saveState: function(form, lineItems, cartInfo) {
			var addrObj = {
				name: form.firstName + ' ' + form.lastName,
				street: form.address,
				city: form.city,
				state: form.state,
				country: form.country,
				postal: form.zip,
				email: form.email
			}

			if (cartInfo.subtotal !== _updateObj.subtotal) {
				lineItems.forEach(function(item) {
					_updateObj.lineItems.push({
						productId: item.productId._id,
						quantity: item.quantity,
						name: item.productId.name,
						price: item.productId.price
					});
				});
				_updateObj.subtotal = cartInfo.subtotal;
				_updateObj.total = cartInfo.subtotal + 5;
			};

			if (_stateIdx === 0) {
				addrObj.type = 'shipping';
				_updateObj.shippingAddress = addrObj;
			} else if (_stateIdx === 1 && !form.billingAddressNotNeeded) {
				addrObj.type = 'billing';
				_updateObj.billingAddress = addrObj;
			};
			_states[_stateIdx].form = form;
			if (_stateIdx === 0) {
				_states[2].form = _states[0].form
			}
			_stateIdx++;
		},
		getOrder: function() {
			return _order;
		},
		setIdx: function(idx) {
			_stateIdx = idx;
			return _stateIdx;
		},
		createOrder: function() {
			if (!_order || _order.status === 'complete') {
				// create a new order
				$http.post('/api/orders')
					.then(function(order) {
						_order = order.data;
						return order.data;
					});
			}
			else {
				return _order;
			}
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