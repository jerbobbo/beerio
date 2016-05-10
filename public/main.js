'use strict';

window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'ngMaterial', 'ngAria']);

app.config(function ($urlRouterProvider, $locationProvider) {
  if (typeof TEST_MODE === 'undefined') {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
  }
  // Trigger page refresh when accessing an OAuth route
  $urlRouterProvider.when('/auth/:provider', function () {
    window.location.reload();
  });
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

  // The given state requires an authenticated user.
  var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
    return state.data && state.data.authenticate;
  };

  // $stateChangeStart is an event fired
  // whenever the process of changing a state begins.
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

    if (!destinationStateRequiresAuth(toState)) {
      // The destination state does not require authentication
      // Short circuit with return.
      return;
    }

    if (AuthService.isAuthenticated()) {
      // The user is authenticated.
      // Short circuit with return.
      return;
    }

    // Cancel navigating to new state.
    event.preventDefault();

    AuthService.getLoggedInUser().then(function (user) {
      // If a user is retrieved, then renavigate to the destination
      // (the second time, AuthService.isAuthenticated() will work)
      // otherwise, if no user is logged in, go to "login" state.
      if (user) {
        $state.go(toState.name, toParams);
      } else {
        $state.go('login');
      }
    });
  });
});

app.config(function ($stateProvider) {

  // Register our *about* state.
  $stateProvider.state('about', {
    url: '/about',
    controller: 'AboutController',
    templateUrl: 'js/about/about.html'
  });
});

app.controller('AboutController', function ($scope, FullstackPics) {

  // Images of beautiful Fullstack people.
  $scope.images = _.shuffle(FullstackPics);
});
app.config(function ($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: '/js/admin/admin.html',
    controller: 'AdminCtrl',
    resolve: {
      products: function products(ProductFactory) {
        return ProductFactory.getAll();
      },
      categories: function categories(CategoryFactory) {
        return CategoryFactory.getAll();
      },
      users: function users(UserFactory) {
        return UserFactory.getAll();
      },
      orders: function orders(OrderFactory) {
        return OrderFactory.getAdminAll();
      },
      isLoggedIn: function isLoggedIn(AuthService) {
        return AuthService.isAuthenticated();
      }
    }
  });

  $stateProvider.state('admin.productAdd', {
    url: '/productAdd',
    templateUrl: '/js/admin/admin.productAdd.html',
    controller: 'AdminProductCtrl'
  });

  $stateProvider.state('admin.productDelete', {
    url: '/productEdit',
    templateUrl: '/js/admin/admin.productDelete.html',
    controller: 'AdminProductCtrl'
  });

  $stateProvider.state('admin.productEdit', {
    url: '/productEdit',
    templateUrl: '/js/admin/admin.productEdit.html',
    controller: 'AdminProductCtrl'
  });

  $stateProvider.state('admin.userAdd', {
    url: '/userAdd',
    templateUrl: '/js/admin/admin.userAdd.html',
    controller: 'AdminUserCtrl'
  });

  $stateProvider.state('admin.userEdit', {
    url: '/userEdit',
    templateUrl: '/js/admin/admin.userEdit.html',
    controller: 'AdminUserCtrl'
  });

  $stateProvider.state('admin.orders', {
    url: '/orders',
    templateUrl: '/js/admin/admin.orders.html',
    controller: 'AdminOrderCtrl'
  });
});

app.controller('AdminCtrl', function ($scope, products, users, isLoggedIn, ProductFactory) {
  $scope.products = products;
  console.log(isLoggedIn);
  $scope.isLoggedIn = isLoggedIn;

  $scope.users = users;
});

app.controller('AdminUserCtrl', function ($scope, $state, users, isLoggedIn, UserFactory) {
  $scope.users = users;
  console.log(isLoggedIn);
  $scope.isLoggedIn = isLoggedIn;
  $scope.adminColumns = ['email', 'resetpass', 'admin', 'deleted'];
  $scope.select = function (type) {
    $scope.userType = type;
  };

  $scope.addUser = function () {
    var _admin = false;
    if ($scope.userType == 'Admin') {
      _admin = true;
    }

    return UserFactory.createUser({
      email: $scope.email,
      password: $scope.password,
      admin: _admin
    }).then(function (newUser) {
      console.log(newUser);
      newUser.admin = _admin;
      newUser.deleted = false;
      newUser.resetpass = false;

      $scope.newUser = newUser;
      $scope.users.push(newUser);
      $scope.success = true;
      $state.go('admin.userEdit');
    });
  };

  $scope.toggleUserType = function (user) {
    var _admin;

    if (!user.admin) {
      _admin = true;
    } else if (user.admin) {
      _admin = false;
    }
    user.admin = _admin;

    return UserFactory.update(user);
  };

  $scope.blockUser = function (user) {
    return UserFactory.softDelete(user._id).then(function () {
      $state.reload();
    });
  };

  $scope.passReset = function (user) {
    return UserFactory.passReset(user._id).then(function () {
      $state.reload();
    });
  };
});

app.controller('AdminOrderCtrl', function ($scope, isLoggedIn, OrderFactory, orders, $uibModal) {

  $scope.orders = orders;
  $scope.adminColumns = ['_id', 'user', 'status', 'total'];

  $scope.filterOrders = function (status) {
    return OrderFactory.getByType(status).then(function (orders) {
      $scope.orders = orders;
    });
  };

  $scope.viewAll = function () {
    $scope.orders = orders;
  };

  $scope.toggleStatus = function (order) {
    var _status;

    if (!order.status || order.status == 'cancelled') {
      console.log('you cant uncancel an order');
      return;
    } else if (order.status == 'cart') {
      _status = 'complete';
    } else if (order.status == 'complete') {
      _status = 'cart';
    }
    order.status = _status;

    return OrderFactory.update(order);
  };

  $scope.cancelOrder = function (order) {

    order.status = 'cancelled';

    return OrderFactory.update(order);
  };

  $scope.openModal = function (_order2) {
    console.log(_order2);
    $uibModal.open({
      templateUrl: '/js/orders/orders.detail.html',
      controller: 'OrderDetailCtrl',
      resolve: {
        order: function order(OrderFactory) {
          return OrderFactory.fetchOne(_order2._id);
        },
        isLoggedIn: function isLoggedIn(AuthService) {
          return AuthService.isAuthenticated();
        }
      }
    });
  };
});

app.controller('AdminProductCtrl', function ($scope, $state, $uibModal, isLoggedIn, ProductFactory, categories) {

  $scope.adminColumns = ['name', 'available', 'deleted'];

  $scope.categories = categories;

  $scope.openModal = function (id) {
    $uibModal.open({
      templateUrl: '/js/admin/admin.productEdit.html',
      controller: 'ProductDetailModalCtrl',
      resolve: {
        product: function product(ProductFactory) {
          return ProductFactory.getOne(id);
        },
        categories: function categories(CategoryFactory) {
          return CategoryFactory.getAll();
        }
      }
    });
  };

  $scope.addProduct = function (product) {
    return ProductFactory.add({
      name: $scope.productName,
      brewer: $scope.productBrewer,
      description: $scope.productDesc,
      style: $scope.productStyle,
      price: $scope.productPrice,
      abv: $scope.productABV,
      ratings: $scope.productRatings,
      scoreOverall: $scope.productScoreOverall,
      scoreCategory: $scope.productScoreCategory,
      imageUrl: $scope.productImageUrl
    }).then(function (newProduct) {
      console.log(newProduct._id);
      $state.go('product', { id: newProduct._id });
    });
  };

  $scope.removeProduct = function (id) {
    return ProductFactory.softDelete(id).then(function () {
      $state.reload();
    });
  };

  $scope.toggleAvailability = function (id, available) {
    return ProductFactory.toggle(id, available).then(function () {
      $state.reload();
    });
  };
});

app.config(function ($stateProvider) {
  $stateProvider.state('cart', {
    url: '/cart',
    templateUrl: '/js/cart/cart.html',
    controller: 'CartCtrl'
  });
});

app.controller('CartCtrl', function ($scope, $uibModal, CartFactory, ProductFactory) {

  $scope.cartInfo = CartFactory.getInfo();
  $scope.isInCart = CartFactory.isInCart;

  CartFactory.fetchCart().then(function (_cart) {
    $scope.cart = _cart;
  });

  $scope.openModal = function (id) {
    $uibModal.open({
      templateUrl: 'js/products/product.detail.html',
      controller: 'ProductDetailCtrl',
      resolve: {
        product: function product(ProductFactory) {
          return ProductFactory.getOne(id);
        },
        reviews: function reviews(ProductFactory) {
          return ProductFactory.getReviews(id);
        }
      }
    });
  };

  $scope.quantityChange = function (lineItem, qty) {
    return CartFactory.updateQty(lineItem._id, qty);
  };

  $scope.removeItem = function (lineItem) {
    return CartFactory.removeItem(lineItem._id);
  };

  $scope.$on('refreshCart', function (ev) {
    CartFactory.fetchCart().then(function (_cart) {
      $scope.cart = _cart;
      $scope.cartInfo = CartFactory.getInfo();
      $scope.isInCart = CartFactory.isInCart;
    });
  });

  $scope.updateOne = function (lineItem, dir) {
    var qty = Number(lineItem.quantity);
    if (qty === 0) {
      return CartFactory.removeItem(lineItem._id);
    }
    qty += Number(dir);
    return CartFactory.updateQty(lineItem._id, qty);
  };
});

app.factory('CartFactory', function ($http, $rootScope) {
  var _cartCache = [];
  var _cartInfo = {
    subtotal: 0,
    numberOfItems: 0
  };
  var _cartId = null;

  function _updateInfo() {
    _cartInfo.numberOfItems = 0;
    _cartInfo.subtotal = 0;
    _cartCache.forEach(function (cartItem) {
      _cartInfo.numberOfItems += +cartItem.quantity;
      _cartInfo.subtotal += cartItem.quantity * parseInt(cartItem.productId.price);
    });
  }

  function _findInCart(id) {
    var foundIdx = -1;
    _cartCache.forEach(function (lineItemObj, idx) {
      if (lineItemObj._id === id) {
        foundIdx = idx;
      }
    });
    return foundIdx; // will only ever return last found matching item in cart
  }

  var cartObj = {};

  cartObj.getInfo = function () {
    return _cartInfo;
  };

  cartObj.getLineItem = function (productId) {
    var foundLineItem = null;
    _cartCache.forEach(function (lineItemObj) {
      if (lineItemObj.productId._id === productId) foundLineItem = lineItemObj;
    });
    return foundLineItem;
  };

  cartObj.fetchCart = function () {
    return $http.get('/api/cart').then(function (response) {
      _cartId = response.data._id;
      angular.copy(response.data.items, _cartCache);
      _updateInfo();
      return _cartCache;
    });
  };

  cartObj.addToCart = function (product) {

    var search = _cartCache.find(function (cartItem) {
      return cartItem.productId._id === product._id;
    });

    if (search) {
      return this.updateQty(search._id, search.quantity + 1);
    }
    return $http.post('/api/cart/', product).then(function (resp) {
      _cartCache.push(resp.data);
      _updateInfo();
      return resp.data;
    });
  };

  cartObj.updateQty = function (lineItemId, qty) {
    if (qty == 0) return cartObj.removeItem(lineItemId);
    return $http.put('/api/cart/' + lineItemId, {
      quantity: qty
    }).then(function (resp) {
      _cartCache[_findInCart(lineItemId)].quantity = qty;
      _updateInfo();
      return resp.data;
    });
  };

  cartObj.removeItem = function (lineItemId) {
    return $http.delete('/api/cart/' + lineItemId).then(function (resp) {
      _cartCache.splice(_findInCart(lineItemId), 1);
      _updateInfo();
      return resp.data;
    });
  };

  cartObj.clear = function () {
    return $http.delete('/api/cart/remove/' + _cartId).then(function (deleted_cart) {
      _cartCache = [];
      _cartInfo.subtotal = 0, _cartInfo.numberOfItems = 0;
      console.log(deleted_cart);
      return deleted_cart;
    });
  };

  return cartObj;
});

app.factory('CategoryFactory', function ($http) {
  var catObj = {};

  catObj.getAll = function () {

    return $http.get('/api/categories/').then(function (response) {
      return response.data;
    });
  };

  catObj.getOne = function (id) {
    return $http.get('/api/categories/' + id).then(function (response) {
      return response.data;
    });
  };

  catObj.getProducts = function (id) {

    return $http.get('/api/categories/' + id + '/products').then(function (response) {
      return response.data;
    });
  };

  return catObj;
});
app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('checkout', {
    abstract: true,
    url: '/checkout',
    controller: 'checkOutCtrl',
    templateUrl: 'js/checkout/checkout.html'
  }).state('checkout.address', {
    url: '/address',
    templateUrl: 'js/checkout/addressForm.html',
    controller: 'addressCtrl',
    resolve: {
      current: function current(CheckoutFactory) {
        return CheckoutFactory.getState();
      }
    }
  }). // order: function(CheckoutFactory) {
  // 	return CheckoutFactory.createOrder();
  // }
  state('checkout.payment', {
    url: '/payment',
    templateUrl: 'js/checkout/paymentForm.html'
  }).state('checkout.review', {
    url: '/review',
    templateUrl: 'js/checkout/review.html'
  }).state('checkout.complete', {
    url: '/complete',
    templateUrl: 'js/checkout/complete.html'
  });
  $urlRouterProvider.when('/checkout', '/checkout/address').otherwise('/checkout/address');
}).run(function ($rootScope, $urlRouter, $location, $state) {
  // intercept each state change
  $rootScope.$on('$locationChangeSuccess', function (e, toState, toParams) {
    if ($location.url() === '/checkout/address' && toParams.indexOf('address') === -1) {
      $state.reload(true); // if above is true, reload state.
      $urlRouter.sync();
    }
  });
});

app.controller('addressCtrl', function ($scope, current) {
  $scope.currentState = current;
});

app.controller('checkOutCtrl', function ($scope, $state, CheckoutFactory, CartFactory) {
  var stateIdx = 0;
  var currentOrder;
  $scope.currentState = CheckoutFactory.getState();

  if ($scope.currentState.state != $state.current.name) {
    $state.go($scope.currentState.state);
  }

  $scope.next = function (info, form) {
    if (info && form.$valid) {
      currentOrder = CheckoutFactory.getOrder();
      CheckoutFactory.saveState(info, $scope.cart, $scope.cartInfo);
      CheckoutFactory.setIdx(++stateIdx);
      $scope.currentState = CheckoutFactory.getState();
      $state.go($scope.currentState.state);
    }
  };

  $scope.previous = function () {
    CheckoutFactory.setIdx(--stateIdx);
    $scope.currentState = CheckoutFactory.getState();
    $state.go($scope.currentState.state);
  };

  $scope.placeOrder = function () {
    CheckoutFactory.placeOrder().then(function (order) {
      $scope.cart = [];
      CartFactory.clear();
    });
  };
});

app.factory('CheckoutFactory', function ($http) {
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
  var _updateObj = {
    lineItems: [],
    subtotal: 0,
    total: 0,
    billingAddress: null,
    shippingAddress: null,
    status: null
  };

  return {
    placeOrder: function placeOrder() {
      _updateObj.status = 'complete';
      return $http.post('/api/orders/', _updateObj).then(function (order) {
        console.log(order);
        return order.data;
      });
    },

    getState: function getState() {
      return _states[_stateIdx];
    },

    saveState: function saveState(form, lineItems, cartInfo) {
      var addrObj = {
        name: form.firstName + ' ' + form.lastName,
        street: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postal: form.zip,
        email: form.email
      };

      if (cartInfo.subtotal !== _updateObj.subtotal) {
        lineItems.forEach(function (item) {
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
        _states[2].form = _states[0].form;
      }
      _stateIdx++;
    },
    getOrder: function getOrder() {
      return _order;
    },
    setIdx: function setIdx(idx) {
      _stateIdx = idx;
      return _stateIdx;
    },
    createOrder: function createOrder() {
      if (!_order || _order.status === 'complete') {
        // create a new order
        $http.post('/api/orders').then(function (order) {
          _order = order.data;
          return order.data;
        });
      } else {
        return _order;
      }
    }
  };
});

app.directive('checkoutCartDetails', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/checkout/checkoutDetail.html',
    controller: 'CartCtrl'
  };
});

app.directive('checkoutForm', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/checkout/checkoutForm.html',
    controller: 'checkOutCtrl'
  };
});

app.directive('addressForm', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/checkout/addressForm.html'
  };
});

app.directive('billingAddressForm', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/checkout/billingAddressForm.html'
  };
});
app.config(function ($stateProvider) {
  $stateProvider.state('docs', {
    url: '/docs',
    templateUrl: 'js/docs/docs.html'
  });
});

(function () {

  'use strict';

  // Hope you didn't forget Angular! Duh-doy.

  if (!window.angular) throw new Error('I can\'t find Angular!');

  var app = angular.module('fsaPreBuilt', []);

  app.factory('Socket', function () {
    if (!window.io) throw new Error('socket.io not found!');
    return window.io(window.location.origin);
  });

  // AUTH_EVENTS is used throughout our app to
  // broadcast and listen from and to the $rootScope
  // for important events about authentication flow.
  app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    //needsPassReset:'auth-needs-pass-reset',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  });

  app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    var statusDict = {
      401: AUTH_EVENTS.notAuthenticated,
      403: AUTH_EVENTS.notAuthorized,
      419: AUTH_EVENTS.sessionTimeout,
      440: AUTH_EVENTS.sessionTimeout
    };
    return {
      responseError: function responseError(response) {
        $rootScope.$broadcast(statusDict[response.status], response);
        return $q.reject(response);
      }
    };
  });

  app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(['$injector', function ($injector) {
      return $injector.get('AuthInterceptor');
    }]);
  });

  app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

    function onSuccessfulLogin(response) {
      var data = response.data;
      Session.create(data.id, data.user);
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      return data.user;
    }

    // function checkPR(user){
    //     if(user.resetpass){
    //         $rootScope.$broadcast(AUTH_EVENTS.needsPassReset);
    //         return data.user;
    //     } else {
    //         $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
    //         return data.user;
    //     }
    // }

    // Uses the session factory to see if an
    // authenticated user is currently registered.
    this.isAuthenticated = function () {
      return !!Session.user;
    };
    this.isAdmin = function () {
      if (Session.user) {
        return !!Session.user.admin;
      }
    };

    this.getLoggedInUser = function (fromServer) {

      // If an authenticated session exists, we
      // return the user attached to that session
      // with a promise. This ensures that we can
      // always interface with this method asynchronously.

      // Optionally, if true is given as the fromServer parameter,
      // then this cached value will not be used.

      if (this.isAuthenticated() && fromServer !== true) {
        return $q.when(Session.user);
      }

      // Make request GET /session.
      // If it returns a user, call onSuccessfulLogin with the response.
      // If it returns a 401 response, we catch it and instead resolve to null.
      return $http.get('/session').then(onSuccessfulLogin).catch(function () {
        return null;
      });
    };

    this.login = function (credentials) {
      return $http.post('/login', credentials).then(onSuccessfulLogin)
      // .then(checkPR)
      .catch(function (err) {
        console.log(err);
        var _message;
        if (err.data) {
          _message = err.data;
        };
        return $q.reject({ message: _message });
      });
    };

    this.logout = function () {
      return $http.get('/logout').then(function () {
        Session.destroy();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
      });
    };
  });

  app.service('Session', function ($rootScope, AUTH_EVENTS) {

    var self = this;

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
      self.destroy();
    });

    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
      self.destroy();
    });

    this.id = null;
    this.user = null;

    this.create = function (sessionId, user) {
      this.id = sessionId;
      this.user = user;
    };

    this.destroy = function () {
      this.id = null;
      this.user = null;
    };
  });
})();

app.config(function ($stateProvider) {
  $stateProvider.state('home', {
    url: '/',
    templateUrl: '/js/products/products.html',
    controller: 'ProductCtrl',
    resolve: {
      products: function products(ProductFactory) {
        return ProductFactory.getAll();
      },
      categories: function categories(CategoryFactory) {
        return CategoryFactory.getAll();
      }
    }

  });
});

app.config(function ($stateProvider) {

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'js/login/login.html',
    controller: 'LoginCtrl'
  });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

  $scope.login = {};
  $scope.error = null;

  $scope.sendLogin = function (loginInfo) {

    $scope.error = null;

    AuthService.login(loginInfo).then(function () {
      $state.go('home');
    }).catch(function (err) {
      console.log(err);
      $scope.error = err.message;
    });
  };
});
app.config(function ($stateProvider) {

  $stateProvider.state('membersOnly', {
    url: '/members-area',
    template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
    controller: function controller($scope, SecretStash) {
      SecretStash.getStash().then(function (stash) {
        $scope.stash = stash;
      });
    },
    // The following data.authenticate is read by an event listener
    // that controls access to this state. Refer to app.js.
    data: {
      authenticate: true
    }
  });
});

app.factory('SecretStash', function ($http) {

  var getStash = function getStash() {
    return $http.get('/api/members/secret-stash').then(function (response) {
      return response.data;
    });
  };

  return {
    getStash: getStash
  };
});
app.config(function ($stateProvider) {
  $stateProvider.state('orders', {
    url: '/orders',
    templateUrl: '/js/orders/orders.history.html',
    controller: 'OrdersCtrl',
    resolve: {
      isLoggedIn: function isLoggedIn(AuthService) {
        return AuthService.isAuthenticated();
      },
      orders: function orders(OrderFactory) {
        return OrderFactory.fetchAll();
      }
    }
  }).state('order', {
    url: '/order/:orderId',
    templateUrl: '/js/orders/orders.detail.html',
    controller: 'OrderDetailCtrl',
    resolve: {
      order: function order(OrderFactory, $stateParams) {
        return OrderFactory.fetchOne($stateParams.orderId);
      },
      isLoggedIn: function isLoggedIn(AuthService) {
        return AuthService.isAuthenticated();
      }
    }
  });
});

app.controller('OrdersCtrl', function ($scope, orders, isLoggedIn, CartFactory) {
  $scope.orders = orders;
});

app.controller('OrderDetailCtrl', function ($scope, order, isLoggedIn, CartFactory) {
  $scope.order = order;
});

app.factory('OrderFactory', function ($http) {
  var orderObj = {};

  orderObj.fetchAll = function () {
    return $http.get('/api/orders/').then(function (response) {
      return response.data;
    });
  };

  orderObj.getAdminAll = function () {
    return $http.get('/api/orders/all').then(function (response) {
      return response.data;
    });
  };

  orderObj.getByType = function (status) {
    return $http.get('/api/orders/all').then(function (response) {

      return response.data;
    }).then(function (orders) {
      var filteredOrders = orders.filter(function (order) {

        if (order.status == status) {
          return true;
        }
      });
      return filteredOrders;
    });
  };

  orderObj.fetchOne = function (orderId) {
    return $http.get('/api/orders/' + orderId).then(function (response) {
      return response.data;
    });
  };

  orderObj.update = function (order) {
    return $http.put('/api/orders/' + order._id, { "status": order.status }).then(function (_order) {
      return _order.data;
    });
  };

  return orderObj;
});

app.config(function ($stateProvider) {

  $stateProvider.state('passreset', {
    url: '/passreset',
    templateUrl: 'js/passwordreset/passwordreset.html',
    controller: 'passCtrl',
    params: {
      user: null
    }
  });
});

app.controller('passCtrl', function ($scope, UserFactory, $state, $stateParams) {

  $scope.sendPass = function (pass) {

    console.log($stateParams.user);
    console.log(pass.new);
    var _user = $stateParams.user;
    _user.passwordreset = false;
    _user.password = pass.new;

    return UserFactory.update(_user).then(function (user) {
      console.log('returned user:', user);
      $state.go('home');
    });
  };
});
app.config(function ($stateProvider) {
  $stateProvider.state('products', {
    url: '/products',
    templateUrl: '/js/products/products.html',
    controller: 'ProductCtrl',
    resolve: {
      products: function products(ProductFactory) {
        return ProductFactory.getAll();
      },
      categories: function categories(CategoryFactory) {
        return CategoryFactory.getAll();
      }
    }
  });

  $stateProvider.state('product', {
    url: '/product/:id',
    templateUrl: '/js/products/product.detail.html',
    controller: 'ProductDetailCtrl',
    resolve: {
      product: function product(ProductFactory, $stateParams) {
        return ProductFactory.getOne($stateParams.id);
      },
      reviews: function reviews(ProductFactory, $stateParams) {
        return ProductFactory.getReviews($stateParams.id);
      }
    }
  });

  $stateProvider.state('product.reviews', {
    url: '/reviews',
    templateUrl: '/js/products/product.reviews.html',
    controller: 'ProductDetailCtrl'
  });

  $stateProvider.state('productsByCategory', {
    url: '/category/:id/products',
    templateUrl: '/js/products/products.html',
    controller: 'ProductsCatCtrl',
    resolve: {
      products: function products(CategoryFactory, $stateParams) {
        return CategoryFactory.getProducts($stateParams.id);
      },
      categories: function categories(CategoryFactory) {
        return CategoryFactory.getAll();
      }
    }
  });
});

app.controller('ProductCtrl', function ($scope, $uibModal, $filter, $state, products, categories, CategoryFactory, ProductFactory) {
  $scope.products = products;
  $scope.categories = categories;
  $scope.state = $state;
  $scope.searchProduct = '';

  $scope.searchFor = function (input) {
    $scope.$watch(function () {
      return $scope.input;
    }, function () {
      $scope.filteredProducts = $filter('filter')($scope.products, $scope.searchValue);
    });
  };

  $scope.openModal = function (id) {
    $uibModal.open({
      templateUrl: 'js/products/product.detail.html',
      controller: 'ProductDetailCtrl',
      resolve: {
        product: function product(ProductFactory) {
          return ProductFactory.getOne(id);
        },
        reviews: function reviews(ProductFactory) {
          return ProductFactory.getReviews(id);
        }
      }
    });
  };
});

app.controller('ProductsCatCtrl', function ($stateParams, $scope, products, categories, $uibModal, CategoryFactory, ProductFactory) {

  $scope.products = products;
  $scope.categories = categories;

  $scope.openModal = function (id) {
    $uibModal.open({
      templateUrl: 'js/products/product.detail.html',
      controller: 'ProductDetailCtrl',
      resolve: {
        product: function product(ProductFactory) {
          return ProductFactory.getOne(id);
        },
        reviews: function reviews(ProductFactory) {
          return ProductFactory.getReviews(id);
        }
      }
    });
  };
});

app.controller('ProductDetailCtrl', function ($scope, product, reviews, CartFactory, ProductFactory) {
  $scope.product = product;
  $scope.showReviewForm = false;
  $scope.newReview = {};
  $scope.newReview.productId = $scope.product._id;
  $scope.reviewLimit = 3;
  $scope.reviews = reviews;

  $scope.toggleReview = function () {
    $scope.showReviewForm = !$scope.showReviewForm;
  };

  $scope.toggleReviewLimit = function () {
    if ($scope.reviewLimit === 3) $scope.reviewLimit = $scope.reviews.length;else $scope.reviewLimit = 3;
  };

  $scope.addReview = function (product, review) {
    ProductFactory.addReview(product, review).then(function (newReview) {
      $scope.reviews.unshift(newReview);
      $scope.avgReview = getAvgReview();
      $scope.newReview = {};
    });
  };

  $scope.numReviews = function () {
    return $scope.reviews.length;
  };

  var getAvgReview = function getAvgReview() {
    if (!$scope.reviews.length) return 0;

    var ratingTotal = 0;
    $scope.reviews.forEach(function (review) {
      ratingTotal += review.stars;
    });
    return ratingTotal / $scope.reviews.length;
  };

  $scope.avgReview = getAvgReview();
});

app.controller('ProductDetailModalCtrl', function ($scope, product, CartFactory, ProductFactory, $state, $uibModalInstance, categories) {
  $scope.product = product;
  $scope.categories = categories;

  $scope.editProduct = function (product) {
    return ProductFactory.update(product).then(function (updatedProduct) {
      console.log('updated product is', updatedProduct);
      $uibModalInstance.dismiss('cancel');
      $state.go('product', { id: updatedProduct._id });
    });
  };

  $scope.addCategory = function (cat) {
    $scope.product.category.push(cat);
  };

  $scope.removeCategory = function (cat) {
    var i = $scope.product.category.indexOf(cat);
    $scope.product.category.splice(i, 1);
  };
});

app.factory('ProductFactory', function ($http) {
  var productObj;
  var _productCache = [];

  productObj = {
    getAll: function getAll() {
      return $http.get('/api/products').then(function (products) {
        angular.copy(products.data, _productCache);
        return _productCache;
      });
    },

    getOne: function getOne(id) {
      return $http.get('/api/products/' + id).then(function (product) {
        return product.data;
      });
    },

    add: function add(product) {
      return $http({
        url: '/api/products/',
        method: "POST",
        data: product
      }).then(function (_product) {
        return _product.data;
      });
    },

    delete: function _delete(id) {
      return $http.delete('/api/products/' + id).then(function (product) {
        return product.data;
      });
    },

    softDelete: function softDelete(id) {
      //note - soft delete also sets available to false
      return $http({
        url: '/api/products/' + id,
        method: "PUT",
        data: { deleted: true }
      }).then(function (product) {
        console.log(product);
        return $http({
          url: '/api/products/' + product.data._id,
          method: "PUT",
          data: { available: false }
        });
      }).then(function (product) {
        console.log(product);
        return product.data;
      });
    },

    toggle: function toggle(id, available) {
      if (available) {
        return $http({
          url: '/api/products/' + id,
          method: "PUT",
          data: { available: false }
        }).then(function (product) {
          return product.data;
        });
      } else {
        return $http({
          url: '/api/products/' + id,
          method: "PUT",
          data: { available: true }
        }).then(function (product) {
          return product.data;
        });
      }
    },

    update: function update(product) {
      return $http({
        url: '/api/products/' + product._id,
        method: "PUT",
        data: product
      }).then(function (_product) {
        return _product.data;
      });
    },

    getReviews: function getReviews(productId) {
      return $http.get('/api/products/' + productId + '/reviews').then(function (reviews) {
        return reviews.data;
      });
    },

    addReview: function addReview(product, review) {
      return $http.post('/api/products/' + product._id + '/reviews', review).then(function (_review) {
        return _review.data;
      });
    }

  };

  return productObj;
});

// app.directive('searchBar', function() {
//     return {
//         restrict: 'E',
//         templateUrl: 'js/search/searchbar.html'
//     }
// })
app.config(function ($stateProvider) {

  $stateProvider.state('userCreate', {
    url: '/user/create',
    templateUrl: 'js/user/createuser.html',
    controller: 'UserCtrl'
  });
});

app.controller('UserCtrl', function ($scope, UserFactory, $state) {
  $scope.createUser = {};
  $scope.error = null;

  $scope.sendCreateUser = function (user) {
    if (user.password1 != user.password2) {
      $scope.error = "Passwords do not match";
      return;
    }
    if (user.email && user.password1 && user.password2) {
      var userObj = {
        email: user.email,
        password: user.password1
      };

      UserFactory.createUser(userObj).then(function (user) {
        $state.go('home');
      }).catch(function (err) {
        if (err.status === 409) {
          $scope.error = 'Email already exists.';
          return;
        }
        $scope.error = 'Invalid User credentials.';
      });
    } else {
      $scope.error = 'Please fill in all the fields.';
    }
  };
});

app.factory('UserFactory', function ($http) {
  var UserFactory = {};

  UserFactory.createUser = function (user) {
    return $http.post('/api/user/', user).then(function (response) {
      return response.data;
    });
  };

  UserFactory.getAll = function () {
    // console.log('getting all cats');

    return $http.get('/api/user/').then(function (response) {
      // console.log(response)
      return response.data;
    });
  };

  UserFactory.getOne = function (id) {
    return $http.get('/api/user/' + id).then(function (response) {
      return response.data;
    });
  };

  UserFactory.update = function (user) {
    return $http({
      url: '/api/user/' + user._id,
      method: "PUT",
      data: user
    }).then(function (_user) {
      console.log('update put on user response:', _user);
      return _user.data;
    });
  };

  UserFactory.softDelete = function (id) {
    return $http({
      url: '/api/user/' + id,
      method: "PUT",
      data: { "deleted": "true" }
    }).then(function (_user) {
      console.log('user returned', _user);
      return _user.data;
    });
  };

  UserFactory.passReset = function (id) {
    return $http({
      url: '/api/user/' + id,
      method: "PUT",
      data: { "resetpass": "true" }
    }).then(function (_user) {
      console.log('user returned', _user);
      return _user.data;
    });
  };

  return UserFactory;
});
app.factory('FullstackPics', function () {
  return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('RandomGreetings', function () {

  var getRandomFromArray = function getRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.', 'こんにちは、ユーザー様。', 'Welcome. To. WEBSITE.', ':D', 'Yes, I think we\'ve met before.', 'Gimme 3 mins... I just grabbed this really dope frittata', 'If Cooper could offer only one piece of advice, it would be to nevSQUIRREL!'];

  return {
    greetings: greetings,
    getRandomGreeting: function getRandomGreeting() {
      return getRandomFromArray(greetings);
    }
  };
});

app.filter('abbr', function () {
  return function (input) {
    var max = 13;
    if (input.length > max) {
      return input.slice(0, max) + '..';
    }
    return input;
  };
});
app.directive('addToCart', function (AuthService, CartFactory) {
  return {
    restrict: 'E',
    templateUrl: '/js/common/directives/add-to-cart/add.to.cart.html',
    scope: {
      product: '=',
      lineItem: '=',
      label: '@',
      detail: '='
    },
    link: function link(scope, _link, attr) {
      scope.isLoggedIn = AuthService.isAuthenticated;
      scope.addToCart = function (product, ev, detail) {
        CartFactory.addToCart(product).then(function (cart) {
          if (detail) {
            ev.target.innerHTML = "Added to cart (" + cart.quantity + ")";
          }
        });
      };
      scope.updateQty = CartFactory.updateQty;
      scope.removeItem = CartFactory.removeItem;
      scope.getLineItem = CartFactory.getLineItem;
    }
  };
});

app.directive('cartStatus', function (CartFactory) {
  return {
    templateUrl: '/js/common/directives/cart-status/cart.status.html',
    restrict: 'E',
    controller: 'CartCtrl'
  };
});

app.directive('fullstackLogo', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
  };
});
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'js/common/directives/navbar/navbar.html',
    link: function link(scope) {

      scope.items = [{ label: 'Home', state: 'home' }, { label: 'About', state: 'about' }, { label: 'Products', state: 'products' }, { label: 'Orders', state: 'orders', auth: true }];

      scope.user = null;

      scope.isLoggedIn = function () {
        return AuthService.isAuthenticated();
      };

      scope.adminAccess = function () {
        return AuthService.isAdmin();
      };

      scope.logout = function () {
        AuthService.logout().then(function () {
          $state.go('home');
          $rootScope.$broadcast('refreshCart');
        });
      };

      var setUser = function setUser() {
        AuthService.getLoggedInUser().then(function (user) {
          console.log('set user:', user);
          scope.user = user;
          if (user.resetpass) {
            passReset(user);
          }
        });
      };

      var removeUser = function removeUser() {
        scope.user = null;
      };

      var passReset = function passReset(_user) {
        $state.go('passreset', { user: _user });
      };

      setUser();

      $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
      //$rootScope.$on(AUTH_EVENTS.needsPassReset, passReset);
      $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
      $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
    }

  };
});

app.directive('randoGreeting', function (RandomGreetings) {

  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
    link: function link(scope) {
      scope.greeting = RandomGreetings.getRandomGreeting();
    }
  };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYWRtaW4vQWRtaW4uanMiLCJjYXJ0L2NhcnQuanMiLCJjYXRlZ29yaWVzL0NhdGVnb3JpZXMuanMiLCJjaGVja291dC9jaGVja291dC5qcyIsImRvY3MvZG9jcy5qcyIsImZzYS9mc2EtcHJlLWJ1aWx0LmpzIiwiaG9tZS9ob21lLmpzIiwibG9naW4vbG9naW4uanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwib3JkZXJzL29yZGVycy5qcyIsInBhc3N3b3JkcmVzZXQvcGFzc3dvcmRyZXNldC5qcyIsInByb2R1Y3RzL1Byb2R1Y3RzLmpzIiwidXNlci91c2VyLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZmlsdGVycy9hYmJyZXZpYXRlLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYWRkLXRvLWNhcnQvYWRkLnRvLmNhcnQuanMiLCJjb21tb24vZGlyZWN0aXZlcy9jYXJ0LXN0YXR1cy9jYXJ0LnN0YXR1cy5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQUNBLE9BQUEsR0FBQSxHQUFBLFFBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBOztBQUVBLElBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBO0FBQ0EsTUFBQSxPQUFBLFNBQUEsS0FBQSxXQUFBLEVBQUE7O0FBRUEsc0JBQUEsU0FBQSxDQUFBLElBQUE7O0FBRUEsdUJBQUEsU0FBQSxDQUFBLEdBQUE7QUFDQTs7QUFFQSxxQkFBQSxJQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQSxRQUFBLENBQUEsTUFBQTtBQUNBLEdBRkE7QUFHQSxDQVhBOzs7QUFjQSxJQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxNQUFBLCtCQUFBLFNBQUEsNEJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxXQUFBLE1BQUEsSUFBQSxJQUFBLE1BQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxHQUZBOzs7O0FBTUEsYUFBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSw2QkFBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0E7QUFDQTs7QUFFQSxRQUFBLFlBQUEsZUFBQSxFQUFBLEVBQUE7OztBQUdBO0FBQ0E7OztBQUdBLFVBQUEsY0FBQTs7QUFFQSxnQkFBQSxlQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxRQUFBLElBQUEsRUFBQSxRQUFBO0FBQ0EsT0FGQSxNQUVBO0FBQ0EsZUFBQSxFQUFBLENBQUEsT0FBQTtBQUNBO0FBQ0EsS0FUQTtBQVdBLEdBNUJBO0FBOEJBLENBdkNBOztBQ2pCQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7O0FBR0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFNBQUEsUUFEQTtBQUVBLGdCQUFBLGlCQUZBO0FBR0EsaUJBQUE7QUFIQSxHQUFBO0FBTUEsQ0FUQTs7QUFXQSxJQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQTs7O0FBR0EsU0FBQSxNQUFBLEdBQUEsRUFBQSxPQUFBLENBQUEsYUFBQSxDQUFBO0FBRUEsQ0FMQTtBQ1hBLElBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFNBQUEsUUFEQTtBQUVBLGlCQUFBLHNCQUZBO0FBR0EsZ0JBQUEsV0FIQTtBQUlBLGFBQUE7QUFDQSxnQkFBQSxrQkFBQSxjQUFBLEVBQUE7QUFDQSxlQUFBLGVBQUEsTUFBQSxFQUFBO0FBQ0EsT0FIQTtBQUlBLGtCQUFBLG9CQUFBLGVBQUEsRUFBQTtBQUNBLGVBQUEsZ0JBQUEsTUFBQSxFQUFBO0FBQ0EsT0FOQTtBQU9BLGFBQUEsZUFBQSxXQUFBLEVBQUE7QUFDQSxlQUFBLFlBQUEsTUFBQSxFQUFBO0FBQ0EsT0FUQTtBQVVBLGNBQUEsZ0JBQUEsWUFBQSxFQUFBO0FBQ0EsZUFBQSxhQUFBLFdBQUEsRUFBQTtBQUNBLE9BWkE7QUFhQSxrQkFBQSxvQkFBQSxXQUFBLEVBQUE7QUFDQSxlQUFBLFlBQUEsZUFBQSxFQUFBO0FBQ0E7QUFmQTtBQUpBLEdBQUE7O0FBdUJBLGlCQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBO0FBQ0EsU0FBQSxhQURBO0FBRUEsaUJBQUEsaUNBRkE7QUFHQSxnQkFBQTtBQUhBLEdBQUE7O0FBTUEsaUJBQUEsS0FBQSxDQUFBLHFCQUFBLEVBQUE7QUFDQSxTQUFBLGNBREE7QUFFQSxpQkFBQSxvQ0FGQTtBQUdBLGdCQUFBO0FBSEEsR0FBQTs7QUFNQSxpQkFBQSxLQUFBLENBQUEsbUJBQUEsRUFBQTtBQUNBLFNBQUEsY0FEQTtBQUVBLGlCQUFBLGtDQUZBO0FBR0EsZ0JBQUE7QUFIQSxHQUFBOztBQU1BLGlCQUFBLEtBQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxTQUFBLFVBREE7QUFFQSxpQkFBQSw4QkFGQTtBQUdBLGdCQUFBO0FBSEEsR0FBQTs7QUFNQSxpQkFBQSxLQUFBLENBQUEsZ0JBQUEsRUFBQTtBQUNBLFNBQUEsV0FEQTtBQUVBLGlCQUFBLCtCQUZBO0FBR0EsZ0JBQUE7QUFIQSxHQUFBOztBQU1BLGlCQUFBLEtBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxTQUFBLFNBREE7QUFFQSxpQkFBQSw2QkFGQTtBQUdBLGdCQUFBO0FBSEEsR0FBQTtBQU1BLENBNURBOztBQThEQSxJQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsY0FBQSxFQUFBO0FBQ0EsU0FBQSxRQUFBLEdBQUEsUUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLFVBQUE7QUFDQSxTQUFBLFVBQUEsR0FBQSxVQUFBOztBQUVBLFNBQUEsS0FBQSxHQUFBLEtBQUE7QUFJQSxDQVRBOztBQVdBLElBQUEsVUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxTQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsVUFBQTtBQUNBLFNBQUEsVUFBQSxHQUFBLFVBQUE7QUFDQSxTQUFBLFlBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsQ0FBQTtBQUNBLFNBQUEsTUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxRQUFBLEdBQUEsSUFBQTtBQUNBLEdBRkE7O0FBSUEsU0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsU0FBQSxLQUFBO0FBQ0EsUUFBQSxPQUFBLFFBQUEsSUFBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLElBQUE7QUFDQTs7QUFFQSxXQUFBLFlBQUEsVUFBQSxDQUFBO0FBQ0EsYUFBQSxPQUFBLEtBREE7QUFFQSxnQkFBQSxPQUFBLFFBRkE7QUFHQSxhQUFBO0FBSEEsS0FBQSxFQUtBLElBTEEsQ0FLQSxVQUFBLE9BQUEsRUFBQTtBQUNBLGNBQUEsR0FBQSxDQUFBLE9BQUE7QUFDQSxjQUFBLEtBQUEsR0FBQSxNQUFBO0FBQ0EsY0FBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLGNBQUEsU0FBQSxHQUFBLEtBQUE7O0FBRUEsYUFBQSxPQUFBLEdBQUEsT0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsYUFBQSxPQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLGdCQUFBO0FBQ0EsS0FmQSxDQUFBO0FBZ0JBLEdBdEJBOztBQXdCQSxTQUFBLGNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQTs7QUFFQSxRQUFBLENBQUEsS0FBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLElBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQTtBQUNBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsTUFBQTs7QUFFQSxXQUFBLFlBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLEdBWEE7O0FBYUEsU0FBQSxTQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLFlBQUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUNBLElBREEsQ0FDQSxZQUFBO0FBQ0EsYUFBQSxNQUFBO0FBQ0EsS0FIQSxDQUFBO0FBSUEsR0FMQTs7QUFPQSxTQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsWUFBQSxTQUFBLENBQUEsS0FBQSxHQUFBLEVBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxhQUFBLE1BQUE7QUFDQSxLQUhBLENBQUE7QUFJQSxHQUxBO0FBT0EsQ0E1REE7O0FBOERBLElBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBOztBQUVBLFNBQUEsTUFBQSxHQUFBLE1BQUE7QUFDQSxTQUFBLFlBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsQ0FBQTs7QUFFQSxTQUFBLFlBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsYUFBQSxTQUFBLENBQUEsTUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLE1BQUEsRUFBQTtBQUNB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QUNBLEdBRkE7O0FBSUEsU0FBQSxVQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLFlBQUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBO0FBQ0EsR0FGQTs7QUFLQSxTQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxTQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLEdBQUEsS0FBQTtBQUNBLGFBQUEsUUFBQSxHQUFBLFlBQUEsT0FBQSxFQUFBO0FBQ0EsYUFBQSxRQUFBLEdBQUEsWUFBQSxRQUFBO0FBQ0EsS0FMQTtBQU1BLEdBUEE7O0FBU0EsU0FBQSxTQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLE9BQUEsU0FBQSxRQUFBLENBQUE7QUFDQSxRQUFBLFFBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxZQUFBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQTtBQUNBO0FBQ0EsV0FBQSxPQUFBLEdBQUEsQ0FBQTtBQUNBLFdBQUEsWUFBQSxTQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0EsR0FQQTtBQVVBLENBckRBOztBQXdEQSxJQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsTUFBQSxhQUFBLEVBQUE7QUFDQSxNQUFBLFlBQUE7QUFDQSxjQUFBLENBREE7QUFFQSxtQkFBQTtBQUZBLEdBQUE7QUFJQSxNQUFBLFVBQUEsSUFBQTs7QUFFQSxXQUFBLFdBQUEsR0FBQTtBQUNBLGNBQUEsYUFBQSxHQUFBLENBQUE7QUFDQSxjQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsZUFBQSxPQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxhQUFBLElBQUEsQ0FBQSxTQUFBLFFBQUE7QUFDQSxnQkFBQSxRQUFBLElBQUEsU0FBQSxRQUFBLEdBQUEsU0FBQSxTQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxLQUhBO0FBS0E7O0FBRUEsV0FBQSxXQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsT0FBQSxDQUFBLFVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsWUFBQSxHQUFBLEtBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsR0FBQTtBQUNBO0FBQ0EsS0FKQTtBQUtBLFdBQUEsUUFBQSxDO0FBQ0E7O0FBRUEsTUFBQSxVQUFBLEVBQUE7O0FBRUEsVUFBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFdBQUEsU0FBQTtBQUNBLEdBRkE7O0FBSUEsVUFBQSxXQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7QUFDQSxRQUFBLGdCQUFBLElBQUE7QUFDQSxlQUFBLE9BQUEsQ0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLFVBQUEsWUFBQSxTQUFBLENBQUEsR0FBQSxLQUFBLFNBQUEsRUFBQSxnQkFBQSxXQUFBO0FBQ0EsS0FGQTtBQUdBLFdBQUEsYUFBQTtBQUNBLEdBTkE7O0FBUUEsVUFBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFdBQUEsTUFBQSxHQUFBLENBQUEsV0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLFNBQUEsSUFBQSxDQUFBLEdBQUE7QUFDQSxjQUFBLElBQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUEsVUFBQTtBQUNBO0FBQ0EsYUFBQSxVQUFBO0FBQ0EsS0FOQSxDQUFBO0FBT0EsR0FSQTs7QUFVQSxVQUFBLFNBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTs7QUFFQSxRQUFBLFNBQUEsV0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsU0FBQSxDQUFBLEdBQUEsS0FBQSxRQUFBLEdBQUE7QUFDQSxLQUZBLENBQUE7O0FBSUEsUUFBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLE9BQUEsUUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsV0FBQSxNQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsQ0FBQSxLQUFBLElBQUE7QUFDQTtBQUNBLGFBQUEsS0FBQSxJQUFBO0FBQ0EsS0FMQSxDQUFBO0FBTUEsR0FmQTs7QUFpQkEsVUFBQSxTQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxPQUFBLENBQUEsRUFBQSxPQUFBLFFBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLFdBQUEsTUFBQSxHQUFBLENBQUEsZUFBQSxVQUFBLEVBQUE7QUFDQSxnQkFBQTtBQURBLEtBQUEsRUFHQSxJQUhBLENBR0EsVUFBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxZQUFBLFVBQUEsQ0FBQSxFQUFBLFFBQUEsR0FBQSxHQUFBO0FBQ0E7QUFDQSxhQUFBLEtBQUEsSUFBQTtBQUNBLEtBUEEsQ0FBQTtBQVFBLEdBVkE7O0FBWUEsVUFBQSxVQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxXQUFBLE1BQUEsTUFBQSxDQUFBLGVBQUEsVUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLE1BQUEsQ0FBQSxZQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQTtBQUNBLGFBQUEsS0FBQSxJQUFBO0FBQ0EsS0FMQSxDQUFBO0FBTUEsR0FQQTs7QUFTQSxVQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsV0FBQSxNQUFBLE1BQUEsQ0FBQSxzQkFBQSxPQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsWUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQTtBQUNBLGdCQUFBLFFBQUEsR0FBQSxDQUFBLEVBQ0EsVUFBQSxhQUFBLEdBQUEsQ0FEQTtBQUVBLGNBQUEsR0FBQSxDQUFBLFlBQUE7QUFDQSxhQUFBLFlBQUE7QUFDQSxLQVBBLENBQUE7QUFRQSxHQVRBOztBQVdBLFNBQUEsT0FBQTtBQUNBLENBdEdBOztBQzlEQSxJ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QUdBLFdBQUEsWUFBQSxjQUhBO0FBSUEsV0FBQSxZQUFBO0FBSkEsS0FBQTtBQU1BLFdBQUE7QUFDQSxxQkFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxVQUFBLENBQUEsV0FBQSxTQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUE7QUFDQSxlQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBO0FBSkEsS0FBQTtBQU1BLEdBYkE7O0FBZUEsTUFBQSxNQUFBLENBQUEsVUFBQSxhQUFBLEVBQUE7QUFDQSxrQkFBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FEQSxFQUVBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsYUFBQSxVQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBO0FBQ0EsS0FKQSxDQUFBO0FBTUEsR0FQQTs7QUFTQSxNQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsRUFBQSxFQUFBOztBQUVBLGFBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxVQUFBLE9BQUEsU0FBQSxJQUFBO0FBQ0EsY0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLEVBQUEsS0FBQSxJQUFBO0FBQ0EsaUJBQUEsVUFBQSxDQUFBLFlBQUEsWUFBQTtBQUNBLGFBQUEsS0FBQSxJQUFBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBY0EsU0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGFBQUEsQ0FBQSxDQUFBLFFBQUEsSUFBQTtBQUNBLEtBRkE7QUFHQSxTQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxRQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxDQUFBLFFBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQTtBQUVBLEtBTEE7O0FBT0EsU0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxVQUFBLEtBQUEsZUFBQSxNQUFBLGVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLElBQUEsQ0FBQSxRQUFBLElBQUEsQ0FBQTtBQUNBOzs7OztBQUtBLGFBQUEsTUFBQSxHQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxpQkFBQSxFQUFBLEtBQUEsQ0FBQSxZQUFBO0FBQ0EsZUFBQSxJQUFBO0FBQ0EsT0FGQSxDQUFBO0FBSUEsS0FyQkE7O0FBdUJBLFNBQUEsS0FBQSxHQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxNQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsV0FBQSxFQUNBLElBREEsQ0FDQSxpQkFEQTs7QUFBQSxPQUdBLEtBSEEsQ0FHQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLEdBQUEsQ0FBQSxHQUFBO0FBQ0EsWUFBQSxRQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsRUFBQTtBQUNBLHFCQUFBLElBQUEsSUFBQTtBQUNBO0FBQ0EsZUFBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLFNBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxPQVZBLENBQUE7QUFXQSxLQVpBOztBQWNBLFNBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLE1BQUEsR0FBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGdCQUFBLE9BQUE7QUFDQSxtQkFBQSxVQUFBLENBQUEsWUFBQSxhQUFBO0FBQ0EsT0FIQSxDQUFBO0FBSUEsS0FMQTtBQU9BLEdBM0VBOztBQTZFQSxNQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFFBQUEsT0FBQSxJQUFBOztBQUVBLGVBQUEsR0FBQSxDQUFBLFlBQUEsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQSxPQUFBO0FBQ0EsS0FGQTs7QUFJQSxlQUFBLEdBQUEsQ0FBQSxZQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQSxPQUFBO0FBQ0EsS0FGQTs7QUFJQSxTQUFBLEVBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxJQUFBLEdBQUEsSUFBQTs7QUFFQSxTQUFBLE1BQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxXQUFB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QSxFQUFBLFlBQUEsRUFBQTtBQUNBLGVBQUEsYUFBQSxRQUFBLENBQUEsYUFBQSxPQUFBLENBQUE7QUFDQSxPQUhBO0FBSUEsa0JBQUEsb0JBQUEsV0FBQSxFQUFBO0FBQ0EsZUFBQSxZQUFBLGVBQUEsRUFBQTtBQUNBO0FBTkE7QUFKQSxHQWRBO0FBMkJBLENBNUJBOztBQThCQSxJQUFBLFVBQUEsQ0FBQSxZQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0EsQ0FGQTs7QUFJQSxJQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLENBRkE7O0FBS0EsSUFBQSxPQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsTUFBQSxXQUFBLEVBQUE7O0FBRUEsV0FBQSxRQUFBLEdBQUEsWUFBQTtBQUNBLFdBQUEsTUFBQSxHQUFBLENBQUEsY0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGFBQUEsU0FBQSxJQUFBO0FBQ0EsS0FIQSxDQUFBO0FBSUEsR0FMQTs7QUFPQSxXQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsV0FBQSxNQUFBLEdBQUEsQ0FBQSxpQkFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGFBQUEsU0FBQSxJQUFBO0FBQ0EsS0FIQSxDQUFBO0FBSUEsR0FMQTs7QUFPQSxXQUFBLFNBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsTUFBQSxHQUFBLENBQUEsaUJBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxRQUFBLEVBQUE7O0FBRUEsYUFBQSxTQUFBLElBQUE7QUFDQSxLQUpBLEVBS0EsSUFMQSxDQUtBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsVUFBQSxpQkFBQSxPQUFBLE1BQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxZQUFBLE1BQUEsTUFBQSxJQUFBLE1BQUEsRUFBQTtBQUNBLGlCQUFBLElBQUE7QUFDQTtBQUNBLE9BTEEsQ0FBQTtBQU1BLGFBQUEsY0FBQTtBQUNBLEtBYkEsQ0FBQTtBQWNBLEdBZkE7O0FBaUJBLFdBQUEsUUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxNQUFBLEdBQUEsQ0FBQSxpQkFBQSxPQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsYUFBQSxTQUFBLElBQUE7QUFDQSxLQUhBLENBQUE7QUFJQSxHQUxBOztBQU9BLFdBQUEsTUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQSxNQUFBLEdBQUEsQ0FBQSxpQkFBQSxNQUFBLEdBQUEsRUFBQSxFQUFBLFVBQUEsTUFBQSxNQUFBLEVBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsSUFBQTtBQUNBLEtBSEEsQ0FBQTtBQUlBLEdBTEE7O0FBUUEsU0FBQSxRQUFBO0FBQ0EsQ0FsREE7O0FDdkNBLElBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGlCQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxTQUFBLFlBREE7QUFFQSxpQkFBQSxxQ0FGQTtBQUdBLGdCQUFBLFVBSEE7QUFJQSxZQUFBO0FBQ0EsWUFBQTtBQURBO0FBSkEsR0FBQTtBQVNBLENBWEE7O0FBYUEsSUFBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBOztBQUdBLFNBQUEsUUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLFlBQUEsR0FBQSxDQUFBLGFBQUEsSUFBQTtBQUNBLFlBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLFFBQUEsUUFBQSxhQUFBLElBQUE7QUFDQSxVQUFBLGFBQUEsR0FBQSxLQUFBO0FBQ0EsVUFBQSxRQUFBLEdBQUEsS0FBQSxHQUFBOztBQUVBLFdB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QSxlQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLFNBQUEsUUFBQSxHQUFBLFFBQUE7QUFDQSxTQUFBLFVBQUEsR0FBQSxVQUFBOztBQUVBLFNBQUEsU0FBQSxHQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxJQUFBLENBQUE7QUFDQSxtQkFBQSxpQ0FEQTtBQUVBLGtCQUFBLG1CQUZBO0FBR0EsZUFBQTtBQUNBLGlCQUFBLGlCQUFBLGNBQUEsRUFBQTtBQUNBLGlCQUFBLGVBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFNBSEE7QUFJQSxpQkFBQSxpQkFBQSxjQUFBLEVBQUE7QUFDQSxpQkFBQSxlQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQTtBQU5BO0FBSEEsS0FBQTtBQVlBLEdBYkE7QUFlQSxDQXBCQTs7QUFzQkEsSUFBQSxVQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0EsU0FBQSxjQUFBLEdBQUEsS0FBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEVBQUE7QUFDQSxTQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxPQUFBLENBQUEsR0FBQTtBQUNBLFNBQUEsV0FBQSxHQUFBLENBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxPQUFBOztBQUVBLFNBQUEsWUFBQSxHQUFBLFlBQUE7QUFDQSxXQUFBLGNBQUEsR0FBQSxDQUFBLE9BQUEsY0FBQTtBQUNBLEdBRkE7O0FBSUEsU0FBQSxpQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE9BQUEsV0FBQSxLQUFBLENBQUEsRUFBQSxPQUFBLFdBQUEsR0FBQSxPQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FDQSxPQUFBLFdBQUEsR0FBQSxDQUFBO0FBQ0EsR0FIQTs7QUFLQSxTQUFBLFNBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxtQkFBQSxTQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtBQUNBLGFBQUEsU0FBQSxHQUFBLGNBQUE7QUFDQSxhQUFBLFNBQUEsR0FBQSxFQUFBO0FBQ0EsS0FMQTtBQU1BLEdBUEE7O0FBU0EsU0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFdBQUEsT0FBQSxPQUFBLENBQUEsTUFBQTtBQUNBLEdBRkE7O0FBSUEsTUFBQSxlQUFBLFNBQUEsWUFBQSxHQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxPQUFBLENBQUE7O0FBRUEsUUFBQSxjQUFBLENBQUE7QUFDQSxXQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxxQkFBQSxPQUFBLEtBQUE7QUFDQSxLQUZBO0FBR0EsV0FBQSxjQUFBLE9BQUEsT0FBQSxDQUFBLE1BQUE7QUFDQSxHQVJBOztBQVVBLFNBQUEsU0FBQSxHQUFBLGNBQUE7QUFFQSxDQTFDQTs7QUE0Q0EsSUFBQSxVQUFBLENBQUEsd0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxNQUFBLEVBQUEsaUJBQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0EsU0FBQSxVQUFBLEdBQUEsVUFBQTs7QUFFQSxTQUFBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsZUFBQSxNQUFBLENBQUEsT0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGNBQUEsR0FBQSxDQUFBLG9CQUFBLEVBQUEsY0FBQTtBQUNBLHdCQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsU0FBQSxFQUFBLEVBQUEsSUFBQSxlQUFBLEdBQUEsRUFBQTtBQUNBLEtBTEEsQ0FBQTtBQU1BLEdBUEE7O0FBU0EsU0FBQSxXQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUE7QUFD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QUEsS0FBQSxLQURBO0FBRUEsa0JBQUEsS0FBQTtBQUZBLE9BQUE7O0FBS0Esa0JBQUEsVUFBQSxDQUFBLE9BQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxNQUFBO0FBQ0EsT0FIQSxFQUlBLEtBSkEsQ0FJQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsSUFBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLHVCQUFBO0FBQ0E7QUFDQTtBQUNBLGVBQUEsS0FBQSxHQUFBLDJCQUFBO0FBQ0EsT0FWQTtBQVdBLEtBakJBLE1BaUJBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsZ0NBQUE7QUFDQTtBQUNBLEdBekJBO0FBMkJBLENBL0JBOztBQWlDQSxJQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxNQUFBLGNBQUEsRUFBQTs7QUFFQSxjQUFBLFVBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsTUFBQSxJQUFBLENBQUEsWUFBQSxFQUFBLElBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxRQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsSUFBQTtBQUNBLEtBSEEsQ0FBQTtBQUlBLEdBTEE7O0FBT0EsY0FBQSxNQUFBLEdBQUEsWUFBQTs7O0FBR0EsV0FBQSxNQUFBLEdBQUEsQ0FBQSxZQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsUUFBQSxFQUFBOztBQUVBLGFBQUEsU0FBQSxJQUFBO0FBQ0EsS0FKQSxDQUFBO0FBS0EsR0FSQTs7QUFVQSxjQUFBLE1BQUEsR0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsTUFBQSxHQUFBLENBQUEsZUFBQSxFQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsYUFBQSxTQUFBLElBQUE7QUFDQSxLQUhBLENBQUE7QUFJQSxHQUxBOztBQU9BLGNBQUEsTUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxNQUFBO0FBQ0EsV0FBQSxl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QUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsZUFBQSxFQUFBOztBQUVBLFNBQUE7QUFDQSxjQUFBLEdBREE7QUFFQSxpQkFBQSx5REFGQTtBQUdBLFVBQUEsY0FBQSxLQUFBLEVBQUE7QUFDQSxZQUFBLFFBQUEsR0FBQSxnQkFBQSxpQkFBQSxFQUFBO0FBQ0E7QUFMQSxHQUFBO0FBUUEsQ0FWQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCduZ01hdGVyaWFsJywnbmdBcmlhJ10pO1xyXG5cclxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xyXG4gICAgaWYgKHR5cGVvZiBURVNUX01PREUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxyXG4gICAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcclxuICAgICAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cclxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcbiAgICB9XHJcbiAgICAvLyBUcmlnZ2VyIHBhZ2UgcmVmcmVzaCB3aGVuIGFjY2Vzc2luZyBhbiBPQXV0aCByb3V0ZVxyXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLndoZW4oJy9hdXRoLzpwcm92aWRlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXHJcbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcclxuXHJcbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxyXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcclxuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcclxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxyXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xyXG5cclxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcclxuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cclxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXHJcbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XHJcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cclxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXHJcbiAgICAgICAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xyXG5cclxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxyXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xyXG4gICAgICAgIHVybDogJy9hYm91dCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBGdWxsc3RhY2tQaWNzKSB7XHJcblxyXG4gICAgLy8gSW1hZ2VzIG9mIGJlYXV0aWZ1bCBGdWxsc3RhY2sgcGVvcGxlLlxyXG4gICAgJHNjb3BlLmltYWdlcyA9IF8uc2h1ZmZsZShGdWxsc3RhY2tQaWNzKTtcclxuXHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4nLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4nLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvYWRtaW4vYWRtaW4uaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5DdHJsJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgcHJvZHVjdHM6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldEFsbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBjYXRlZ29yaWVzOiBmdW5jdGlvbihDYXRlZ29yeUZhY3Rvcnkpe1xyXG4gICAgICAgIHJldHVybiBDYXRlZ29yeUZhY3RvcnkuZ2V0QWxsKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVzZXJzOiBmdW5jdGlvbihVc2VyRmFjdG9yeSl7XHJcbiAgICAgICAgcmV0dXJuIFVzZXJGYWN0b3J5LmdldEFsbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBvcmRlcnM6IGZ1bmN0aW9uKE9yZGVyRmFjdG9yeSl7XHJcbiAgICAgICAgcmV0dXJuIE9yZGVyRmFjdG9yeS5nZXRBZG1pbkFsbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBpc0xvZ2dlZEluOiBmdW5jdGlvbihBdXRoU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbi5wcm9kdWN0QWRkJywge1xyXG4gICAgdXJsOiAnL3Byb2R1Y3RBZGQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvYWRtaW4vYWRtaW4ucHJvZHVjdEFkZC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBZG1pblByb2R1Y3RDdHJsJ1xyXG4gIH0pXHJcblxyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbi5wcm9kdWN0RGVsZXRlJywge1xyXG4gICAgdXJsOiAnL3Byb2R1Y3RFZGl0JyxcclxuICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLnByb2R1Y3REZWxldGUuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Qcm9kdWN0Q3RybCdcclxuICB9KVxyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4ucHJvZHVjdEVkaXQnLCB7XHJcbiAgICB1cmw6ICcvcHJvZHVjdEVkaXQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvYWRtaW4vYWRtaW4ucHJvZHVjdEVkaXQuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Qcm9kdWN0Q3RybCdcclxuICB9KVxyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4udXNlckFkZCcsIHtcclxuICAgIHVybDogJy91c2VyQWRkJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLnVzZXJBZGQuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Vc2VyQ3RybCdcclxuICB9KVxyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4udXNlckVkaXQnLCB7XHJcbiAgICB1cmw6ICcvdXNlckVkaXQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvYWRtaW4vYWRtaW4udXNlckVkaXQuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Vc2VyQ3RybCdcclxuICB9KVxyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4ub3JkZXJzJywge1xyXG4gICAgdXJsOiAnL29yZGVycycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJy9qcy9hZG1pbi9hZG1pbi5vcmRlcnMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5PcmRlckN0cmwnXHJcbiAgfSlcclxuXHJcbn0pXHJcblxyXG5hcHAuY29udHJvbGxlcignQWRtaW5DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBwcm9kdWN0cywgdXNlcnMsIGlzTG9nZ2VkSW4sIFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgJHNjb3BlLnByb2R1Y3RzID0gcHJvZHVjdHM7XHJcbiAgY29uc29sZS5sb2coaXNMb2dnZWRJbik7XHJcbiAgJHNjb3BlLmlzTG9nZ2VkSW4gPSBpc0xvZ2dlZEluO1xyXG5cclxuICAkc2NvcGUudXNlcnM9dXNlcnM7XHJcblxyXG5cclxuXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0FkbWluVXNlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsJHN0YXRlLCB1c2VycywgaXNMb2dnZWRJbiwgVXNlckZhY3RvcnkpIHtcclxuICAkc2NvcGUudXNlcnMgPSB1c2VycztcclxuICBjb25zb2xlLmxvZyhpc0xvZ2dlZEluKTtcclxuICAkc2NvcGUuaXNMb2dnZWRJbiA9IGlzTG9nZ2VkSW47XHJcbiAgJHNjb3BlLmFkbWluQ29sdW1ucz1bJ2VtYWlsJywncmVzZXRwYXNzJywnYWRtaW4nLCdkZWxldGVkJ107XHJcbiAgJHNjb3BlLnNlbGVjdD0gZnVuY3Rpb24odHlwZSl7XHJcbiAgICAkc2NvcGUudXNlclR5cGU9dHlwZTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuYWRkVXNlcj0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfYWRtaW49ZmFsc2U7XHJcbiAgICBpZigkc2NvcGUudXNlclR5cGU9PSdBZG1pbicpe1xyXG4gICAgICBfYWRtaW49dHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gVXNlckZhY3RvcnkuY3JlYXRlVXNlcih7XHJcbiAgICAgICAgICAgIGVtYWlsOiRzY29wZS5lbWFpbCxcclxuICAgICAgICAgICAgcGFzc3dvcmQ6JHNjb3BlLnBhc3N3b3JkLFxyXG4gICAgICAgICAgICBhZG1pbjpfYWRtaW5cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihuZXdVc2VyKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobmV3VXNlcilcclxuICAgICAgICAgICAgbmV3VXNlci5hZG1pbj1fYWRtaW47XHJcbiAgICAgICAgICAgIG5ld1VzZXIuZGVsZXRlZD1mYWxzZTtcclxuICAgICAgICAgICAgbmV3VXNlci5yZXNldHBhc3M9ZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUubmV3VXNlcj1uZXdVc2VyO1xyXG4gICAgICAgICAgICAkc2NvcGUudXNlcnMucHVzaChuZXdVc2VyKTtcclxuICAgICAgICAgICAgJHNjb3BlLnN1Y2Nlc3M9dHJ1ZTtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdhZG1pbi51c2VyRWRpdCcpXHJcbiAgICAgICAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUudG9nZ2xlVXNlclR5cGU9IGZ1bmN0aW9uKHVzZXIpe1xyXG4gICAgdmFyIF9hZG1pbjtcclxuXHJcbiAgICBpZighdXNlci5hZG1pbil7XHJcbiAgICAgIF9hZG1pbj10cnVlO1xyXG4gICAgfSBlbHNlIGlmICh1c2VyLmFkbWluKXtcclxuICAgICAgX2FkbWluPWZhbHNlO1xyXG4gICAgfVxyXG4gICAgdXNlci5hZG1pbj1fYWRtaW47XHJcblxyXG4gICAgcmV0dXJuIFVzZXJGYWN0b3J5LnVwZGF0ZSh1c2VyKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuYmxvY2tVc2VyPWZ1bmN0aW9uKHVzZXIpe1xyXG4gICAgcmV0dXJuIFVzZXJGYWN0b3J5LnNvZnREZWxldGUodXNlci5faWQpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgJHN0YXRlLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5wYXNzUmVzZXQ9ZnVuY3Rpb24odXNlcil7XHJcbiAgICByZXR1cm4gVXNlckZhY3RvcnkucGFzc1Jlc2V0KHVzZXIuX2lkKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICRzdGF0ZS5yZWxvYWQoKTtcclxuICAgICAgICAgICAgfSlcclxuICB9O1xyXG5cclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignQWRtaW5PcmRlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsaXNMb2dnZWRJbixPcmRlckZhY3Rvcnksb3JkZXJzLCAkdWliTW9kYWwpIHtcclxuXHJcbiAgJHNjb3BlLm9yZGVycz1vcmRlcnM7XHJcbiAgJHNjb3BlLmFkbWluQ29sdW1ucz1bJ19pZCcsJ3VzZXInLCdzdGF0dXMnLCd0b3RhbCddO1xyXG5cclxuICAkc2NvcGUuZmlsdGVyT3JkZXJzPSBmdW5jdGlvbihzdGF0dXMpe1xyXG4gICAgcmV0dXJuIE9yZGVyRmFjdG9yeS5nZXRCeVR5cGUoc3RhdHVzKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihvcmRlcnMpe1xyXG4gICAgICAgICAgICAgICRzY29wZS5vcmRlcnM9b3JkZXJzO1xyXG4gICAgICAgICAgICB9KVxyXG4gIH07XHJcblxyXG4gICRzY29wZS52aWV3QWxsID0gZnVuY3Rpb24oKXtcclxuICAgICRzY29wZS5vcmRlcnM9b3JkZXJzO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS50b2dnbGVTdGF0dXMgPSBmdW5jdGlvbihvcmRlcil7XHJcbiAgICAgIHZhciBfc3RhdHVzO1xyXG5cclxuICAgICAgaWYoIW9yZGVyLnN0YXR1cyB8fCBvcmRlci5zdGF0dXM9PSdjYW5jZWxsZWQnKXtcclxuICAgICAgICBjb25zb2xlLmxvZygneW91IGNhbnQgdW5jYW5jZWwgYW4gb3JkZXInKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgfSBlbHNlIGlmKG9yZGVyLnN0YXR1cz09J2NhcnQnKXtcclxuICAgICAgICBfc3RhdHVzPSdjb21wbGV0ZSc7XHJcbiAgICAgIH0gZWxzZSBpZiggb3JkZXIuc3RhdHVzPT0nY29tcGxldGUnKXtcclxuICAgICAgICBfc3RhdHVzPSdjYXJ0JztcclxuICAgICAgfVxyXG4gICAgICBvcmRlci5zdGF0dXM9X3N0YXR1cztcclxuXHJcbiAgICAgIHJldHVybiBPcmRlckZhY3RvcnkudXBkYXRlKG9yZGVyKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuY2FuY2VsT3JkZXIgPSBmdW5jdGlvbihvcmRlcil7XHJcblxyXG4gICAgICBvcmRlci5zdGF0dXM9J2NhbmNlbGxlZCc7XHJcblxyXG4gICAgICByZXR1cm4gT3JkZXJGYWN0b3J5LnVwZGF0ZShvcmRlcik7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IGZ1bmN0aW9uKG9yZGVyKSB7XHJcbiAgICBjb25zb2xlLmxvZyhvcmRlcik7XHJcbiAgICAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL29yZGVycy9vcmRlcnMuZGV0YWlsLmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnT3JkZXJEZXRhaWxDdHJsJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIG9yZGVyOiBmdW5jdGlvbihPcmRlckZhY3RvcnkpIHtcclxuICAgICAgICAgIHJldHVybiBPcmRlckZhY3RvcnkuZmV0Y2hPbmUob3JkZXIuX2lkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTG9nZ2VkSW46IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgfVxyXG4gICAgIH0pXHJcbiAgfTtcclxuXHJcblxyXG59KTtcclxuXHJcblxyXG5hcHAuY29udHJvbGxlcignQWRtaW5Qcm9kdWN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkdWliTW9kYWwsIGlzTG9nZ2VkSW4sIFByb2R1Y3RGYWN0b3J5LGNhdGVnb3JpZXMpIHtcclxuXHJcbiAgJHNjb3BlLmFkbWluQ29sdW1ucz1bJ25hbWUnLCdhdmFpbGFibGUnLCdkZWxldGVkJ107XHJcblxyXG4gICRzY29wZS5jYXRlZ29yaWVzID0gY2F0ZWdvcmllcztcclxuXHJcbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLnByb2R1Y3RFZGl0Lmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnUHJvZHVjdERldGFpbE1vZGFsQ3RybCcsXHJcbiAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICBwcm9kdWN0OiBmdW5jdGlvbihQcm9kdWN0RmFjdG9yeSkge1xyXG4gICAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldE9uZShpZCk7XHJcbiAgICAgICAgIH0sXHJcbiAgICAgICAgY2F0ZWdvcmllczogZnVuY3Rpb24oQ2F0ZWdvcnlGYWN0b3J5KXtcclxuICAgICAgICAgIHJldHVybiBDYXRlZ29yeUZhY3RvcnkuZ2V0QWxsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgfVxyXG4gICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5hZGRQcm9kdWN0ID0gZnVuY3Rpb24ocHJvZHVjdCl7XHJcbiAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuYWRkKHtcclxuICAgICAgbmFtZTokc2NvcGUucHJvZHVjdE5hbWUsXHJcbiAgICAgIGJyZXdlcjokc2NvcGUucHJvZHVjdEJyZXdlcixcclxuICAgICAgZGVzY3JpcHRpb246JHNjb3BlLnByb2R1Y3REZXNjLFxyXG4gICAgICBzdHlsZTokc2NvcGUucHJvZHVjdFN0eWxlLFxyXG4gICAgICBwcmljZTokc2NvcGUucHJvZHVjdFByaWNlLFxyXG4gICAgICBhYnY6JHNjb3BlLnByb2R1Y3RBQlYsXHJcbiAgICAgIHJhdGluZ3M6JHNjb3BlLnByb2R1Y3RSYXRpbmdzLFxyXG4gICAgICBzY29yZU92ZXJhbGw6JHNjb3BlLnByb2R1Y3RTY29yZU92ZXJhbGwsXHJcbiAgICAgIHNjb3JlQ2F0ZWdvcnk6JHNjb3BlLnByb2R1Y3RTY29yZUNhdGVnb3J5LFxyXG4gICAgICBpbWFnZVVybDokc2NvcGUucHJvZHVjdEltYWdlVXJsXHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uKG5ld1Byb2R1Y3Qpe1xyXG4gICAgICBjb25zb2xlLmxvZyhuZXdQcm9kdWN0Ll9pZCk7XHJcbiAgICAgICRzdGF0ZS5nbygncHJvZHVjdCcse2lkOm5ld1Byb2R1Y3QuX2lkfSk7XHJcbiAgICB9KVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5yZW1vdmVQcm9kdWN0PWZ1bmN0aW9uKGlkKXtcclxuICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5zb2Z0RGVsZXRlKGlkKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICRzdGF0ZS5yZWxvYWQoKTtcclxuICAgICAgICAgICAgfSlcclxuICB9O1xyXG5cclxuICAkc2NvcGUudG9nZ2xlQXZhaWxhYmlsaXR5PSBmdW5jdGlvbihpZCxhdmFpbGFibGUpe1xyXG4gICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LnRvZ2dsZShpZCxhdmFpbGFibGUpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgJHN0YXRlLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gIH07XHJcblxyXG59KTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjYXJ0Jywge1xyXG4gICAgdXJsOiAnL2NhcnQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvY2FydC9jYXJ0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0NhcnRDdHJsJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdDYXJ0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHVpYk1vZGFsLCBDYXJ0RmFjdG9yeSwgUHJvZHVjdEZhY3RvcnkpIHtcclxuXHJcbiAgJHNjb3BlLmNhcnRJbmZvID0gQ2FydEZhY3RvcnkuZ2V0SW5mbygpO1xyXG4gICRzY29wZS5pc0luQ2FydCA9IENhcnRGYWN0b3J5LmlzSW5DYXJ0O1xyXG5cclxuICBDYXJ0RmFjdG9yeS5mZXRjaENhcnQoKVxyXG4gICAgLnRoZW4oZnVuY3Rpb24oX2NhcnQpIHtcclxuICAgICAgJHNjb3BlLmNhcnQgPSBfY2FydDtcclxuICAgIH0pO1xyXG5cclxuICAkc2NvcGUub3Blbk1vZGFsID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9wcm9kdWN0cy9wcm9kdWN0LmRldGFpbC5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ1Byb2R1Y3REZXRhaWxDdHJsJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIHByb2R1Y3Q6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0T25lKGlkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJldmlld3M6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0UmV2aWV3cyhpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucXVhbnRpdHlDaGFuZ2UgPSBmdW5jdGlvbihsaW5lSXRlbSwgcXR5KSB7XHJcbiAgICByZXR1cm4gQ2FydEZhY3RvcnkudXBkYXRlUXR5KGxpbmVJdGVtLl9pZCwgcXR5KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucmVtb3ZlSXRlbSA9IGZ1bmN0aW9uKGxpbmVJdGVtKSB7XHJcbiAgICByZXR1cm4gQ2FydEZhY3RvcnkucmVtb3ZlSXRlbShsaW5lSXRlbS5faWQpO1xyXG4gIH07XHJcblxyXG5cclxuICAkc2NvcGUuJG9uKCdyZWZyZXNoQ2FydCcsIGZ1bmN0aW9uKGV2KSB7XHJcbiAgICBDYXJ0RmFjdG9yeS5mZXRjaENhcnQoKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihfY2FydCkge1xyXG4gICAgICAgICRzY29wZS5jYXJ0ID0gX2NhcnQ7XHJcbiAgICAgICAgJHNjb3BlLmNhcnRJbmZvID0gQ2FydEZhY3RvcnkuZ2V0SW5mbygpO1xyXG4gICAgICAgICRzY29wZS5pc0luQ2FydCA9IENhcnRGYWN0b3J5LmlzSW5DYXJ0OyAgICBcclxuICAgICAgfSlcclxuICB9KVxyXG5cclxuICAkc2NvcGUudXBkYXRlT25lID0gZnVuY3Rpb24obGluZUl0ZW0sIGRpcikge1xyXG4gICAgdmFyIHF0eSA9IE51bWJlcihsaW5lSXRlbS5xdWFudGl0eSk7XHJcbiAgICBpZiAocXR5ID09PSAwKSB7XHJcbiAgICAgIHJldHVybiBDYXJ0RmFjdG9yeS5yZW1vdmVJdGVtKGxpbmVJdGVtLl9pZCk7XHJcbiAgICB9XHJcbiAgICBxdHkgKz0gTnVtYmVyKGRpcik7XHJcbiAgICByZXR1cm4gQ2FydEZhY3RvcnkudXBkYXRlUXR5KGxpbmVJdGVtLl9pZCwgcXR5KTtcclxuICB9O1xyXG5cclxuXHJcbn0pO1xyXG5cclxuXHJcbmFwcC5mYWN0b3J5KCdDYXJ0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCAkcm9vdFNjb3BlKSB7XHJcbiAgdmFyIF9jYXJ0Q2FjaGUgPSBbXTtcclxuICB2YXIgX2NhcnRJbmZvID0ge1xyXG4gICAgc3VidG90YWw6IDAsXHJcbiAgICBudW1iZXJPZkl0ZW1zOiAwXHJcbiAgfTtcclxuICB2YXIgX2NhcnRJZCA9IG51bGw7XHJcblxyXG4gIGZ1bmN0aW9uIF91cGRhdGVJbmZvKCkge1xyXG4gICAgX2NhcnRJbmZvLm51bWJlck9mSXRlbXMgPSAwO1xyXG4gICAgX2NhcnRJbmZvLnN1YnRvdGFsID0gMDtcclxuICAgIF9jYXJ0Q2FjaGUuZm9yRWFjaChmdW5jdGlvbihjYXJ0SXRlbSkge1xyXG4gICAgICBfY2FydEluZm8ubnVtYmVyT2ZJdGVtcyArPSArY2FydEl0ZW0ucXVhbnRpdHk7XHJcbiAgICAgIF9jYXJ0SW5mby5zdWJ0b3RhbCArPSAoY2FydEl0ZW0ucXVhbnRpdHkgKiBwYXJzZUludChjYXJ0SXRlbS5wcm9kdWN0SWQucHJpY2UpKTtcclxuICAgIH0pO1xyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIF9maW5kSW5DYXJ0KGlkKSB7XHJcbiAgICB2YXIgZm91bmRJZHggPSAtMTtcclxuICAgIF9jYXJ0Q2FjaGUuZm9yRWFjaChmdW5jdGlvbihsaW5lSXRlbU9iaiwgaWR4KSB7XHJcbiAgICAgIGlmIChsaW5lSXRlbU9iai5faWQgPT09IGlkKSB7XHJcbiAgICAgICAgZm91bmRJZHggPSBpZHg7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGZvdW5kSWR4OyAvLyB3aWxsIG9ubHkgZXZlciByZXR1cm4gbGFzdCBmb3VuZCBtYXRjaGluZyBpdGVtIGluIGNhcnRcclxuICB9XHJcblxyXG4gIHZhciBjYXJ0T2JqID0ge307XHJcblxyXG4gIGNhcnRPYmouZ2V0SW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIF9jYXJ0SW5mbztcclxuICB9O1xyXG5cclxuICBjYXJ0T2JqLmdldExpbmVJdGVtID0gZnVuY3Rpb24ocHJvZHVjdElkKSB7XHJcbiAgICB2YXIgZm91bmRMaW5lSXRlbSA9IG51bGw7XHJcbiAgICBfY2FydENhY2hlLmZvckVhY2goZnVuY3Rpb24obGluZUl0ZW1PYmopIHtcclxuICAgICAgaWYgKGxpbmVJdGVtT2JqLnByb2R1Y3RJZC5faWQgPT09IHByb2R1Y3RJZCkgZm91bmRMaW5lSXRlbSA9IGxpbmVJdGVtT2JqO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZm91bmRMaW5lSXRlbTtcclxuICB9O1xyXG5cclxuICBjYXJ0T2JqLmZldGNoQ2FydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9jYXJ0JylcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICBfY2FydElkID0gcmVzcG9uc2UuZGF0YS5faWQ7XHJcbiAgICAgICAgYW5ndWxhci5jb3B5KHJlc3BvbnNlLmRhdGEuaXRlbXMsIF9jYXJ0Q2FjaGUpO1xyXG4gICAgICAgIF91cGRhdGVJbmZvKCk7XHJcbiAgICAgICAgcmV0dXJuIF9jYXJ0Q2FjaGU7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGNhcnRPYmouYWRkVG9DYXJ0ID0gZnVuY3Rpb24ocHJvZHVjdCkge1xyXG5cclxuICAgIHZhciBzZWFyY2ggPSBfY2FydENhY2hlLmZpbmQoZnVuY3Rpb24oY2FydEl0ZW0pIHtcclxuICAgICAgcmV0dXJuIGNhcnRJdGVtLnByb2R1Y3RJZC5faWQgPT09IHByb2R1Y3QuX2lkXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoc2VhcmNoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVF0eShzZWFyY2guX2lkLCBzZWFyY2gucXVhbnRpdHkrMSlcclxuICAgIH1cclxuICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2NhcnQvJywgcHJvZHVjdClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xyXG4gICAgICAgIF9jYXJ0Q2FjaGUucHVzaChyZXNwLmRhdGEpO1xyXG4gICAgICAgIF91cGRhdGVJbmZvKCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3AuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgY2FydE9iai51cGRhdGVRdHkgPSBmdW5jdGlvbihsaW5lSXRlbUlkLCBxdHkpIHtcclxuICAgIGlmIChxdHkgPT0gMCkgcmV0dXJuIGNhcnRPYmoucmVtb3ZlSXRlbShsaW5lSXRlbUlkKTtcclxuICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvY2FydC8nICsgbGluZUl0ZW1JZCwge1xyXG4gICAgICAgIHF1YW50aXR5OiBxdHlcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xyXG4gICAgICAgIF9jYXJ0Q2FjaGVbX2ZpbmRJbkNhcnQobGluZUl0ZW1JZCldLnF1YW50aXR5ID0gcXR5O1xyXG4gICAgICAgIF91cGRhdGVJbmZvKCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3AuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgY2FydE9iai5yZW1vdmVJdGVtID0gZnVuY3Rpb24obGluZUl0ZW1JZCkge1xyXG4gICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9jYXJ0LycgKyBsaW5lSXRlbUlkKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XHJcbiAgICAgICAgX2NhcnRDYWNoZS5zcGxpY2UoX2ZpbmRJbkNhcnQobGluZUl0ZW1JZCksIDEpO1xyXG4gICAgICAgIF91cGRhdGVJbmZvKCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3AuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgY2FydE9iai5jbGVhciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9jYXJ0L3JlbW92ZS8nICsgX2NhcnRJZClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24oZGVsZXRlZF9jYXJ0KSB7XHJcbiAgICAgICAgX2NhcnRDYWNoZSA9IFtdO1xyXG4gICAgICAgIF9jYXJ0SW5mby5zdWJ0b3RhbCA9IDAsXHJcbiAgICAgICAgX2NhcnRJbmZvLm51bWJlck9mSXRlbXMgPSAwXHJcbiAgICAgICAgY29uc29sZS5sb2coZGVsZXRlZF9jYXJ0KTtcclxuICAgICAgICByZXR1cm4gZGVsZXRlZF9jYXJ0O1xyXG4gICAgICB9KVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBjYXJ0T2JqO1xyXG59KTsiLCJcclxuXHJcbmFwcC5mYWN0b3J5KCdDYXRlZ29yeUZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gIHZhciBjYXRPYmogPSB7fTtcclxuXHJcbiAgY2F0T2JqLmdldEFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2F0ZWdvcmllcy8nKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICBjYXRPYmouZ2V0T25lID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2F0ZWdvcmllcy8nICsgaWQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGNhdE9iai5nZXRQcm9kdWN0cyA9IGZ1bmN0aW9uKGlkKXtcclxuXHJcbiAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2NhdGVnb3JpZXMvJyArIGlkKycvcHJvZHVjdHMnKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIHJldHVybiBjYXRPYmo7XHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjaGVja291dCcsIHtcclxuXHRcdFx0YWJzdHJhY3Q6IHRydWUsXHJcblx0XHRcdHVybDogJy9jaGVja291dCcsXHJcblx0XHRcdGNvbnRyb2xsZXI6ICdjaGVja091dEN0cmwnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2pzL2NoZWNrb3V0L2NoZWNrb3V0Lmh0bWwnXHJcblx0XHR9KVxyXG5cdFx0LnN0YXRlKCdjaGVja291dC5hZGRyZXNzJywge1xyXG5cdFx0XHR1cmw6ICcvYWRkcmVzcycsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnanMvY2hlY2tvdXQvYWRkcmVzc0Zvcm0uaHRtbCcsXHJcblx0XHRcdGNvbnRyb2xsZXI6ICdhZGRyZXNzQ3RybCcsXHJcblx0XHRcdHJlc29sdmU6IHtcclxuXHRcdFx0XHRjdXJyZW50OiBmdW5jdGlvbihDaGVja291dEZhY3RvcnkpIHtcclxuXHRcdFx0XHRcdHJldHVybiBDaGVja291dEZhY3RvcnkuZ2V0U3RhdGUoKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdC8vIG9yZGVyOiBmdW5jdGlvbihDaGVja291dEZhY3RvcnkpIHtcclxuXHRcdFx0XHQvLyBcdHJldHVybiBDaGVja291dEZhY3RvcnkuY3JlYXRlT3JkZXIoKTtcclxuXHRcdFx0XHQvLyB9XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0XHQuc3RhdGUoJ2NoZWNrb3V0LnBheW1lbnQnLCB7XHJcblx0XHRcdHVybDogJy9wYXltZW50JyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdqcy9jaGVja291dC9wYXltZW50Rm9ybS5odG1sJ1xyXG5cdFx0fSlcclxuXHRcdC5zdGF0ZSgnY2hlY2tvdXQucmV2aWV3Jywge1xyXG5cdFx0XHR1cmw6ICcvcmV2aWV3JyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdqcy9jaGVja291dC9yZXZpZXcuaHRtbCdcclxuXHRcdH0pXHJcblx0XHQuc3RhdGUoJ2NoZWNrb3V0LmNvbXBsZXRlJywge1xyXG5cdFx0dXJsOiAnL2NvbXBsZXRlJyxcclxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY2hlY2tvdXQvY29tcGxldGUuaHRtbCdcclxuXHRcdH0pXHJcblx0JHVybFJvdXRlclByb3ZpZGVyLndoZW4oJy9jaGVja291dCcsICcvY2hlY2tvdXQvYWRkcmVzcycpLm90aGVyd2lzZSgnL2NoZWNrb3V0L2FkZHJlc3MnKTtcclxufSkucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICR1cmxSb3V0ZXIsICRsb2NhdGlvbiwgJHN0YXRlKSB7XHJcblx0Ly8gaW50ZXJjZXB0IGVhY2ggc3RhdGUgY2hhbmdlXHJcblx0JHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihlLCB0b1N0YXRlLCB0b1BhcmFtcykge1xyXG5cdFx0aWYgKCRsb2NhdGlvbi51cmwoKSA9PT0gJy9jaGVja291dC9hZGRyZXNzJyAmJiB0b1BhcmFtcy5pbmRleE9mKCdhZGRyZXNzJykgPT09IC0xKSB7XHJcblx0XHRcdCRzdGF0ZS5yZWxvYWQodHJ1ZSkgLy8gaWYgYWJvdmUgaXMgdHJ1ZSwgcmVsb2FkIHN0YXRlLlxyXG5cdFx0XHQkdXJsUm91dGVyLnN5bmMoKTtcclxuXHRcdH1cclxuXHR9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignYWRkcmVzc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGN1cnJlbnQpIHtcclxuXHQkc2NvcGUuY3VycmVudFN0YXRlID0gY3VycmVudDtcclxufSlcclxuXHJcbmFwcC5jb250cm9sbGVyKCdjaGVja091dEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgQ2hlY2tvdXRGYWN0b3J5LCBDYXJ0RmFjdG9yeSkge1xyXG5cdHZhciBzdGF0ZUlkeCA9IDA7XHJcblx0dmFyIGN1cnJlbnRPcmRlcjtcclxuXHQkc2NvcGUuY3VycmVudFN0YXRlID0gQ2hlY2tvdXRGYWN0b3J5LmdldFN0YXRlKCk7XHJcblx0XHJcblx0aWYgKCRzY29wZS5jdXJyZW50U3RhdGUuc3RhdGUgIT0gJHN0YXRlLmN1cnJlbnQubmFtZSkge1xyXG5cdFx0JHN0YXRlLmdvKCRzY29wZS5jdXJyZW50U3RhdGUuc3RhdGUpO1x0XHJcblx0fVxyXG5cdFxyXG5cdCRzY29wZS5uZXh0ID0gZnVuY3Rpb24oaW5mbywgZm9ybSkge1xyXG5cdFx0aWYgKGluZm8gJiYgZm9ybS4kdmFsaWQpIHtcclxuXHRcdFx0Y3VycmVudE9yZGVyID0gQ2hlY2tvdXRGYWN0b3J5LmdldE9yZGVyKCk7XHJcblx0XHRcdENoZWNrb3V0RmFjdG9yeS5zYXZlU3RhdGUoaW5mbywgJHNjb3BlLmNhcnQsICRzY29wZS5jYXJ0SW5mbyk7XHJcblx0XHRcdENoZWNrb3V0RmFjdG9yeS5zZXRJZHgoKytzdGF0ZUlkeCk7XHJcblx0XHRcdCRzY29wZS5jdXJyZW50U3RhdGUgPSBDaGVja291dEZhY3RvcnkuZ2V0U3RhdGUoKTtcclxuXHRcdFx0JHN0YXRlLmdvKCRzY29wZS5jdXJyZW50U3RhdGUuc3RhdGUpXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0JHNjb3BlLnByZXZpb3VzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRDaGVja291dEZhY3Rvcnkuc2V0SWR4KC0tc3RhdGVJZHgpO1xyXG5cdFx0JHNjb3BlLmN1cnJlbnRTdGF0ZSA9IENoZWNrb3V0RmFjdG9yeS5nZXRTdGF0ZSgpO1xyXG5cdFx0JHN0YXRlLmdvKCRzY29wZS5jdXJyZW50U3RhdGUuc3RhdGUpO1xyXG5cdH1cclxuXHJcblx0JHNjb3BlLnBsYWNlT3JkZXIgPSBmdW5jdGlvbigpIHtcclxuXHQgXHRDaGVja291dEZhY3RvcnkucGxhY2VPcmRlcigpXHJcblx0IFx0XHQudGhlbihmdW5jdGlvbihvcmRlcikge1xyXG5cdCBcdFx0XHQkc2NvcGUuY2FydCA9IFtdO1xyXG5cdCBcdFx0XHRDYXJ0RmFjdG9yeS5jbGVhcigpXHJcblx0IFx0XHR9KVxyXG5cdH1cclxufSk7XHJcblxyXG5hcHAuZmFjdG9yeSgnQ2hlY2tvdXRGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApIHtcclxuXHR2YXIgX3N0YXRlcyA9IFt7XHJcblx0XHRzdGF0ZTogJ2NoZWNrb3V0LmFkZHJlc3MnLFxyXG5cdFx0dGl0bGU6ICdTaGlwcGluZyBJbmZvJyxcclxuXHRcdHByb2dyZXNzOiAxMCxcclxuXHRcdGZvcm06IHt9LFxyXG5cdFx0bGluZUl0ZW1zOiBbXSxcclxuXHRcdGNhcnRJbmZvOiB7fVxyXG5cdH0sIHtcclxuXHRcdHN0YXRlOiAnY2hlY2tvdXQucGF5bWVudCcsXHJcblx0XHR0aXRsZTogJ1BheW1lbnQgSW5mbycsXHJcblx0XHRwcm9ncmVzczogNjAsXHJcblx0XHRmb3JtOiB7fSxcclxuXHRcdGxpbmVJdGVtczogW10sXHJcblx0XHRjYXJ0SW5mbzoge31cclxuXHR9LCB7XHJcblx0XHRzdGF0ZTogJ2NoZWNrb3V0LnJldmlldycsXHJcblx0XHR0aXRsZTogJ1JldmlldyBPcmRlcicsXHJcblx0XHRwcm9ncmVzczogOTAsXHJcblx0XHRmb3JtOiB7fVxyXG5cdH0sIHtcclxuXHRcdHN0YXRlOiAnY2hlY2tvdXQuY29tcGxldGUnLFxyXG5cdFx0dGl0bGU6ICdPcmRlciBQbGFjZWQnLFxyXG5cdFx0cHJvZ3Jlc3M6IDEwMCxcclxuXHRcdGZvcm06IHt9XHJcblx0fV07XHJcblx0dmFyIF9zdGF0ZUlkeCA9IDA7XHJcblx0dmFyIF9vcmRlcjtcclxuXHR2YXJcdF91cGRhdGVPYmogPSB7XHJcblx0XHRsaW5lSXRlbXM6IFtdLFxyXG5cdFx0c3VidG90YWw6IDAsXHJcblx0XHR0b3RhbDogMCxcclxuXHRcdGJpbGxpbmdBZGRyZXNzOiBudWxsLFxyXG5cdFx0c2hpcHBpbmdBZGRyZXNzOiBudWxsLFxyXG5cdFx0c3RhdHVzOiBudWxsXHJcblx0fTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdHBsYWNlT3JkZXI6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRfdXBkYXRlT2JqLnN0YXR1cyA9ICdjb21wbGV0ZSc7XHJcblx0XHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL29yZGVycy8nLCBfdXBkYXRlT2JqKVxyXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKG9yZGVyKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhvcmRlcilcclxuXHRcdFx0XHRcdHJldHVybiBvcmRlci5kYXRhO1xyXG5cdFx0XHRcdH0pXHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHRnZXRTdGF0ZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBfc3RhdGVzW19zdGF0ZUlkeF07XHJcblx0XHR9LFxyXG5cclxuXHRcdHNhdmVTdGF0ZTogZnVuY3Rpb24oZm9ybSwgbGluZUl0ZW1zLCBjYXJ0SW5mbykge1xyXG5cdFx0XHR2YXIgYWRkck9iaiA9IHtcclxuXHRcdFx0XHRuYW1lOiBmb3JtLmZpcnN0TmFtZSArICcgJyArIGZvcm0ubGFzdE5hbWUsXHJcblx0XHRcdFx0c3RyZWV0OiBmb3JtLmFkZHJlc3MsXHJcblx0XHRcdFx0Y2l0eTogZm9ybS5jaXR5LFxyXG5cdFx0XHRcdHN0YXRlOiBmb3JtLnN0YXRlLFxyXG5cdFx0XHRcdGNvdW50cnk6IGZvcm0uY291bnRyeSxcclxuXHRcdFx0XHRwb3N0YWw6IGZvcm0uemlwLFxyXG5cdFx0XHRcdGVtYWlsOiBmb3JtLmVtYWlsXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChjYXJ0SW5mby5zdWJ0b3RhbCAhPT0gX3VwZGF0ZU9iai5zdWJ0b3RhbCkge1xyXG5cdFx0XHRcdGxpbmVJdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHRcdFx0XHRcdF91cGRhdGVPYmoubGluZUl0ZW1zLnB1c2goe1xyXG5cdFx0XHRcdFx0XHRwcm9kdWN0SWQ6IGl0ZW0ucHJvZHVjdElkLl9pZCxcclxuXHRcdFx0XHRcdFx0cXVhbnRpdHk6IGl0ZW0ucXVhbnRpdHksXHJcblx0XHRcdFx0XHRcdG5hbWU6IGl0ZW0ucHJvZHVjdElkLm5hbWUsXHJcblx0XHRcdFx0XHRcdHByaWNlOiBpdGVtLnByb2R1Y3RJZC5wcmljZVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0X3VwZGF0ZU9iai5zdWJ0b3RhbCA9IGNhcnRJbmZvLnN1YnRvdGFsO1xyXG5cdFx0XHRcdF91cGRhdGVPYmoudG90YWwgPSBjYXJ0SW5mby5zdWJ0b3RhbCArIDU7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRpZiAoX3N0YXRlSWR4ID09PSAwKSB7XHJcblx0XHRcdFx0YWRkck9iai50eXBlID0gJ3NoaXBwaW5nJztcclxuXHRcdFx0XHRfdXBkYXRlT2JqLnNoaXBwaW5nQWRkcmVzcyA9IGFkZHJPYmo7XHJcblx0XHRcdH0gZWxzZSBpZiAoX3N0YXRlSWR4ID09PSAxICYmICFmb3JtLmJpbGxpbmdBZGRyZXNzTm90TmVlZGVkKSB7XHJcblx0XHRcdFx0YWRkck9iai50eXBlID0gJ2JpbGxpbmcnO1xyXG5cdFx0XHRcdF91cGRhdGVPYmouYmlsbGluZ0FkZHJlc3MgPSBhZGRyT2JqO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRfc3RhdGVzW19zdGF0ZUlkeF0uZm9ybSA9IGZvcm07XHJcblx0XHRcdGlmIChfc3RhdGVJZHggPT09IDApIHtcclxuXHRcdFx0XHRfc3RhdGVzWzJdLmZvcm0gPSBfc3RhdGVzWzBdLmZvcm1cclxuXHRcdFx0fVxyXG5cdFx0XHRfc3RhdGVJZHgrKztcclxuXHRcdH0sXHJcblx0XHRnZXRPcmRlcjogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBfb3JkZXI7XHJcblx0XHR9LFxyXG5cdFx0c2V0SWR4OiBmdW5jdGlvbihpZHgpIHtcclxuXHRcdFx0X3N0YXRlSWR4ID0gaWR4O1xyXG5cdFx0XHRyZXR1cm4gX3N0YXRlSWR4O1xyXG5cdFx0fSxcclxuXHRcdGNyZWF0ZU9yZGVyOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYgKCFfb3JkZXIgfHwgX29yZGVyLnN0YXR1cyA9PT0gJ2NvbXBsZXRlJykge1xyXG5cdFx0XHRcdC8vIGNyZWF0ZSBhIG5ldyBvcmRlclxyXG5cdFx0XHRcdCRodHRwLnBvc3QoJy9hcGkvb3JkZXJzJylcclxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKG9yZGVyKSB7XHJcblx0XHRcdFx0XHRcdF9vcmRlciA9IG9yZGVyLmRhdGE7XHJcblx0XHRcdFx0XHRcdHJldHVybiBvcmRlci5kYXRhO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIF9vcmRlcjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufSlcclxuXHJcbmFwcC5kaXJlY3RpdmUoJ2NoZWNrb3V0Q2FydERldGFpbHMnLCBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4ge1xyXG5cdFx0cmVzdHJpY3Q6ICdFJyxcclxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY2hlY2tvdXQvY2hlY2tvdXREZXRhaWwuaHRtbCcsXHJcblx0XHRjb250cm9sbGVyOiAnQ2FydEN0cmwnXHJcblx0fVxyXG59KVxyXG5cclxuYXBwLmRpcmVjdGl2ZSgnY2hlY2tvdXRGb3JtJywgZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdHJlc3RyaWN0OiAnRScsXHJcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2NoZWNrb3V0L2NoZWNrb3V0Rm9ybS5odG1sJyxcclxuXHRcdGNvbnRyb2xsZXI6ICdjaGVja091dEN0cmwnXHJcblx0fVxyXG59KVxyXG5cclxuYXBwLmRpcmVjdGl2ZSgnYWRkcmVzc0Zvcm0nLCBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4ge1xyXG5cdFx0cmVzdHJpY3Q6ICdFJyxcclxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY2hlY2tvdXQvYWRkcmVzc0Zvcm0uaHRtbCdcclxuXHR9XHJcbn0pXHJcblxyXG5hcHAuZGlyZWN0aXZlKCdiaWxsaW5nQWRkcmVzc0Zvcm0nLCBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4ge1xyXG5cdFx0cmVzdHJpY3Q6ICdFJyxcclxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY2hlY2tvdXQvYmlsbGluZ0FkZHJlc3NGb3JtLmh0bWwnXHJcblx0fVxyXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG9jcycsIHtcclxuICAgICAgICB1cmw6ICcvZG9jcycsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kb2NzL2RvY3MuaHRtbCdcclxuICAgIH0pO1xyXG59KTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxyXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xyXG5cclxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XHJcblxyXG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIXdpbmRvdy5pbykgdGhyb3cgbmV3IEVycm9yKCdzb2NrZXQuaW8gbm90IGZvdW5kIScpO1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xyXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcclxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXHJcbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xyXG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXHJcbiAgICAgICAgLy9uZWVkc1Bhc3NSZXNldDonYXV0aC1uZWVkcy1wYXNzLXJlc2V0JyxcclxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcclxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXHJcbiAgICAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXHJcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxyXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcclxuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcclxuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxyXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXHJcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXHJcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuXHJcbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XHJcbiAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXHJcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnQXV0aEludGVyY2VwdG9yJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmdW5jdGlvbiBjaGVja1BSKHVzZXIpe1xyXG4gICAgICAgIC8vICAgICBpZih1c2VyLnJlc2V0cGFzcyl7XHJcbiAgICAgICAgLy8gICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubmVlZHNQYXNzUmVzZXQpO1xyXG4gICAgICAgIC8vICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcclxuICAgICAgICAvLyAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xyXG4gICAgICAgIC8vICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxyXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cclxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5pc0FkbWluID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZihTZXNzaW9uLnVzZXIpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyLmFkbWluO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKGZyb21TZXJ2ZXIpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiBleGlzdHMsIHdlXHJcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cclxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxyXG4gICAgICAgICAgICAvLyBhbHdheXMgaW50ZXJmYWNlIHdpdGggdGhpcyBtZXRob2QgYXN5bmNocm9ub3VzbHkuXHJcblxyXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcclxuICAgICAgICAgICAgLy8gdGhlbiB0aGlzIGNhY2hlZCB2YWx1ZSB3aWxsIG5vdCBiZSB1c2VkLlxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cclxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXHJcbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXHJcbiAgICAgICAgICAgICAgICAvLyAudGhlbihjaGVja1BSKVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBfbWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICBpZihlcnIuZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tZXNzYWdlPWVyci5kYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHsgbWVzc2FnZTogX21lc3NhZ2UgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9nb3V0U3VjY2Vzcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcclxuXHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbiAoc2Vzc2lvbklkLCB1c2VyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XHJcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmlkID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcclxuICAgICAgICB9O1xyXG5cclxuICAgIH0pO1xyXG5cclxufSkoKTtcclxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcclxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xyXG4gICAgICAgIHVybDogJy8nLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL3Byb2R1Y3RzL3Byb2R1Y3RzLmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQcm9kdWN0Q3RybCcsXHJcbiAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgcHJvZHVjdHM6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5nZXRBbGwoKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBjYXRlZ29yaWVzOiBmdW5jdGlvbihDYXRlZ29yeUZhY3Rvcnkpe1xyXG4gICAgICAgICAgICAgIHJldHVybiBDYXRlZ29yeUZhY3RvcnkuZ2V0QWxsKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0pO1xyXG59KTtcclxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcclxuXHJcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XHJcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcclxuXHJcbiAgICAkc2NvcGUubG9naW4gPSB7fTtcclxuICAgICRzY29wZS5lcnJvciA9IG51bGw7XHJcblxyXG4gICAgJHNjb3BlLnNlbmRMb2dpbiA9IGZ1bmN0aW9uIChsb2dpbkluZm8pIHtcclxuXHJcbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcclxuXHJcbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XHJcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBlcnIubWVzc2FnZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9O1xyXG5cclxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcclxuXHJcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbWVtYmVyc09ubHknLCB7XHJcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXHJcbiAgICAgICAgdGVtcGxhdGU6ICc8aW1nIG5nLXJlcGVhdD1cIml0ZW0gaW4gc3Rhc2hcIiB3aWR0aD1cIjMwMFwiIG5nLXNyYz1cInt7IGl0ZW0gfX1cIiAvPicsXHJcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgU2VjcmV0U3Rhc2gpIHtcclxuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXNoID0gc3Rhc2g7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXHJcbiAgICAgICAgLy8gdGhhdCBjb250cm9scyBhY2Nlc3MgdG8gdGhpcyBzdGF0ZS4gUmVmZXIgdG8gYXBwLmpzLlxyXG4gICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KTtcclxuXHJcbmFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xyXG5cclxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXHJcbiAgICB9O1xyXG5cclxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAuc3RhdGUoJ29yZGVycycsIHtcclxuICAgICAgdXJsOiAnL29yZGVycycsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL29yZGVycy9vcmRlcnMuaGlzdG9yeS5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ09yZGVyc0N0cmwnLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgaXNMb2dnZWRJbjogZnVuY3Rpb24oQXV0aFNlcnZpY2UpIHtcclxuICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9yZGVyczogZnVuY3Rpb24oT3JkZXJGYWN0b3J5KSB7XHJcbiAgICAgICAgICByZXR1cm4gT3JkZXJGYWN0b3J5LmZldGNoQWxsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgLnN0YXRlKCdvcmRlcicsIHtcclxuICAgICAgdXJsOiAnL29yZGVyLzpvcmRlcklkJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICcvanMvb3JkZXJzL29yZGVycy5kZXRhaWwuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdPcmRlckRldGFpbEN0cmwnLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgb3JkZXI6IGZ1bmN0aW9uKE9yZGVyRmFjdG9yeSwgJHN0YXRlUGFyYW1zKSB7XHJcbiAgICAgICAgICByZXR1cm4gT3JkZXJGYWN0b3J5LmZldGNoT25lKCRzdGF0ZVBhcmFtcy5vcmRlcklkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTG9nZ2VkSW46IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG59KVxyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ09yZGVyc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIG9yZGVycywgaXNMb2dnZWRJbiwgQ2FydEZhY3RvcnkpIHtcclxuICAkc2NvcGUub3JkZXJzID0gb3JkZXJzO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdPcmRlckRldGFpbEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIG9yZGVyLCBpc0xvZ2dlZEluLCBDYXJ0RmFjdG9yeSkge1xyXG4gICRzY29wZS5vcmRlciA9IG9yZGVyO1xyXG59KTtcclxuXHJcblxyXG5hcHAuZmFjdG9yeSgnT3JkZXJGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApIHtcclxuICB2YXIgb3JkZXJPYmogPSB7fTtcclxuXHJcbiAgb3JkZXJPYmouZmV0Y2hBbGwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvb3JkZXJzLycpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIG9yZGVyT2JqLmdldEFkbWluQWxsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL29yZGVycy9hbGwnKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICBvcmRlck9iai5nZXRCeVR5cGUgPSBmdW5jdGlvbihzdGF0dXMpIHtcclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvb3JkZXJzL2FsbCcpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblxyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihvcmRlcnMpe1xyXG4gICAgICAgIHZhciBmaWx0ZXJlZE9yZGVycz1vcmRlcnMuZmlsdGVyKGZ1bmN0aW9uKG9yZGVyKXtcclxuXHJcbiAgICAgICAgICBpZiAob3JkZXIuc3RhdHVzPT1zdGF0dXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gZmlsdGVyZWRPcmRlcnM7XHJcbiAgICAgIH0pXHJcbiAgfTtcclxuXHJcbiAgb3JkZXJPYmouZmV0Y2hPbmUgPSBmdW5jdGlvbihvcmRlcklkKSB7XHJcbiAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL29yZGVycy8nICsgb3JkZXJJZClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgb3JkZXJPYmoudXBkYXRlID0gZnVuY3Rpb24ob3JkZXIpIHtcclxuICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL29yZGVycy8nICsgb3JkZXIuX2lkLCB7XCJzdGF0dXNcIjpvcmRlci5zdGF0dXN9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKF9vcmRlcikge1xyXG4gICAgICAgICAgcmV0dXJuIF9vcmRlci5kYXRhO1xyXG4gICAgICAgIH0pO1xyXG4gIH07XHJcblxyXG5cclxuICByZXR1cm4gb3JkZXJPYmo7XHJcbn0pO1xyXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xyXG5cclxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwYXNzcmVzZXQnLCB7XHJcbiAgICAgICAgdXJsOiAnL3Bhc3NyZXNldCcsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9wYXNzd29yZHJlc2V0L3Bhc3N3b3JkcmVzZXQuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ3Bhc3NDdHJsJyxcclxuICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgIHVzZXI6IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdwYXNzQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFVzZXJGYWN0b3J5LCAkc3RhdGUsICRzdGF0ZVBhcmFtcykge1xyXG5cclxuXHJcbiAgICAkc2NvcGUuc2VuZFBhc3MgPSBmdW5jdGlvbiAocGFzcykge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygkc3RhdGVQYXJhbXMudXNlcik7XHJcbiAgICAgICAgY29uc29sZS5sb2cocGFzcy5uZXcpO1xyXG4gICAgICAgIHZhciBfdXNlcj0kc3RhdGVQYXJhbXMudXNlcjtcclxuICAgICAgICBfdXNlci5wYXNzd29yZHJlc2V0PWZhbHNlO1xyXG4gICAgICAgIF91c2VyLnBhc3N3b3JkPXBhc3MubmV3O1xyXG5cclxuICAgICAgICByZXR1cm4gVXNlckZhY3RvcnkudXBkYXRlKF91c2VyKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcil7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3JldHVybmVkIHVzZXI6Jyx1c2VyKVxyXG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwcm9kdWN0cycsIHtcclxuICAgIHVybDogJy9wcm9kdWN0cycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJy9qcy9wcm9kdWN0cy9wcm9kdWN0cy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdQcm9kdWN0Q3RybCcsXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIHByb2R1Y3RzOiBmdW5jdGlvbihQcm9kdWN0RmFjdG9yeSkge1xyXG4gICAgICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5nZXRBbGwoKTtcclxuICAgICAgfSxcclxuICAgICAgY2F0ZWdvcmllczogZnVuY3Rpb24oQ2F0ZWdvcnlGYWN0b3J5KXtcclxuICAgICAgICAgIHJldHVybiBDYXRlZ29yeUZhY3RvcnkuZ2V0QWxsKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2R1Y3QnLCB7XHJcbiAgICB1cmw6ICcvcHJvZHVjdC86aWQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvcHJvZHVjdHMvcHJvZHVjdC5kZXRhaWwuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOidQcm9kdWN0RGV0YWlsQ3RybCcsXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIHByb2R1Y3Q6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5LCRzdGF0ZVBhcmFtcykge1xyXG4gICAgICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5nZXRPbmUoJHN0YXRlUGFyYW1zLmlkKTtcclxuICAgICAgfSxcclxuICAgICAgcmV2aWV3czogZnVuY3Rpb24oUHJvZHVjdEZhY3RvcnksICRzdGF0ZVBhcmFtcykge1xyXG4gICAgICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5nZXRSZXZpZXdzKCRzdGF0ZVBhcmFtcy5pZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2R1Y3QucmV2aWV3cycsIHtcclxuICAgIHVybDogJy9yZXZpZXdzJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnL2pzL3Byb2R1Y3RzL3Byb2R1Y3QucmV2aWV3cy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdQcm9kdWN0RGV0YWlsQ3RybCdcclxuICB9KTtcclxuXHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2R1Y3RzQnlDYXRlZ29yeScsIHtcclxuICAgIHVybDogJy9jYXRlZ29yeS86aWQvcHJvZHVjdHMnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvcHJvZHVjdHMvcHJvZHVjdHMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnUHJvZHVjdHNDYXRDdHJsJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgcHJvZHVjdHM6IGZ1bmN0aW9uKENhdGVnb3J5RmFjdG9yeSwkc3RhdGVQYXJhbXMpIHtcclxuICAgICAgICByZXR1cm4gQ2F0ZWdvcnlGYWN0b3J5LmdldFByb2R1Y3RzKCRzdGF0ZVBhcmFtcy5pZCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGNhdGVnb3JpZXM6IGZ1bmN0aW9uKENhdGVnb3J5RmFjdG9yeSl7XHJcbiAgICAgICAgICByZXR1cm4gQ2F0ZWdvcnlGYWN0b3J5LmdldEFsbCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG59KTtcclxuXHJcblxyXG5hcHAuY29udHJvbGxlcignUHJvZHVjdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICR1aWJNb2RhbCwgJGZpbHRlciwgJHN0YXRlLCBwcm9kdWN0cyxjYXRlZ29yaWVzLENhdGVnb3J5RmFjdG9yeSxQcm9kdWN0RmFjdG9yeSkge1xyXG4gICRzY29wZS5wcm9kdWN0cyA9IHByb2R1Y3RzO1xyXG4gICRzY29wZS5jYXRlZ29yaWVzID0gY2F0ZWdvcmllcztcclxuICAkc2NvcGUuc3RhdGUgPSAkc3RhdGU7XHJcbiAgJHNjb3BlLnNlYXJjaFByb2R1Y3QgPSAnJztcclxuICBcclxuICAkc2NvcGUuc2VhcmNoRm9yID0gZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gJHNjb3BlLmlucHV0O1xyXG4gICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkc2NvcGUuZmlsdGVyZWRQcm9kdWN0cyA9ICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5wcm9kdWN0cywgJHNjb3BlLnNlYXJjaFZhbHVlKTtcclxuICAgIH0pO1xyXG4gIH07XHJcbiAgXHJcbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvcHJvZHVjdHMvcHJvZHVjdC5kZXRhaWwuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdQcm9kdWN0RGV0YWlsQ3RybCcsXHJcbiAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICBwcm9kdWN0OiBmdW5jdGlvbihQcm9kdWN0RmFjdG9yeSkge1xyXG4gICAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldE9uZShpZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXZpZXdzOiBmdW5jdGlvbihQcm9kdWN0RmFjdG9yeSkge1xyXG4gICAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldFJldmlld3MoaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1Byb2R1Y3RzQ2F0Q3RybCcsIGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywkc2NvcGUsIHByb2R1Y3RzLCBjYXRlZ29yaWVzLCAkdWliTW9kYWwsQ2F0ZWdvcnlGYWN0b3J5LFByb2R1Y3RGYWN0b3J5KSB7XHJcblxyXG4gICRzY29wZS5wcm9kdWN0cz1wcm9kdWN0cztcclxuICAkc2NvcGUuY2F0ZWdvcmllcz1jYXRlZ29yaWVzO1xyXG5cclxuICAkc2NvcGUub3Blbk1vZGFsID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9wcm9kdWN0cy9wcm9kdWN0LmRldGFpbC5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ1Byb2R1Y3REZXRhaWxDdHJsJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIHByb2R1Y3Q6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0T25lKGlkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJldmlld3M6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0UmV2aWV3cyhpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdQcm9kdWN0RGV0YWlsQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgcHJvZHVjdCwgcmV2aWV3cywgQ2FydEZhY3RvcnksIFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgJHNjb3BlLnByb2R1Y3QgPSBwcm9kdWN0O1xyXG4gICRzY29wZS5zaG93UmV2aWV3Rm9ybSA9IGZhbHNlO1xyXG4gICRzY29wZS5uZXdSZXZpZXcgPSB7fTtcclxuICAkc2NvcGUubmV3UmV2aWV3LnByb2R1Y3RJZCA9ICRzY29wZS5wcm9kdWN0Ll9pZDtcclxuICAkc2NvcGUucmV2aWV3TGltaXQgPSAzO1xyXG4gICRzY29wZS5yZXZpZXdzID0gcmV2aWV3cztcclxuXHJcbiAgJHNjb3BlLnRvZ2dsZVJldmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnNob3dSZXZpZXdGb3JtID0gISRzY29wZS5zaG93UmV2aWV3Rm9ybTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUudG9nZ2xlUmV2aWV3TGltaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmKCRzY29wZS5yZXZpZXdMaW1pdCA9PT0gMykgJHNjb3BlLnJldmlld0xpbWl0ID0gJHNjb3BlLnJldmlld3MubGVuZ3RoO1xyXG4gICAgZWxzZSAkc2NvcGUucmV2aWV3TGltaXQgPSAzO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5hZGRSZXZpZXcgPSBmdW5jdGlvbihwcm9kdWN0LCByZXZpZXcpIHtcclxuICAgIFByb2R1Y3RGYWN0b3J5LmFkZFJldmlldyhwcm9kdWN0LCByZXZpZXcpXHJcbiAgICAudGhlbihmdW5jdGlvbihuZXdSZXZpZXcpIHtcclxuICAgICAgJHNjb3BlLnJldmlld3MudW5zaGlmdChuZXdSZXZpZXcpO1xyXG4gICAgICAkc2NvcGUuYXZnUmV2aWV3ID0gZ2V0QXZnUmV2aWV3KCk7XHJcbiAgICAgICRzY29wZS5uZXdSZXZpZXcgPSB7fTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5udW1SZXZpZXdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJHNjb3BlLnJldmlld3MubGVuZ3RoO1xyXG4gIH07XHJcblxyXG4gIHZhciBnZXRBdmdSZXZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLnJldmlld3MubGVuZ3RoKSByZXR1cm4gMDtcclxuXHJcbiAgICB2YXIgcmF0aW5nVG90YWwgPSAwO1xyXG4gICAgJHNjb3BlLnJldmlld3MuZm9yRWFjaChmdW5jdGlvbihyZXZpZXcpIHtcclxuICAgICAgcmF0aW5nVG90YWwgKz0gcmV2aWV3LnN0YXJzO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcmF0aW5nVG90YWwvJHNjb3BlLnJldmlld3MubGVuZ3RoO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5hdmdSZXZpZXcgPSBnZXRBdmdSZXZpZXcoKTtcclxuXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1Byb2R1Y3REZXRhaWxNb2RhbEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIHByb2R1Y3QsIENhcnRGYWN0b3J5LCBQcm9kdWN0RmFjdG9yeSwkc3RhdGUsJHVpYk1vZGFsSW5zdGFuY2UsY2F0ZWdvcmllcykge1xyXG4gICRzY29wZS5wcm9kdWN0ID0gcHJvZHVjdDtcclxuICAkc2NvcGUuY2F0ZWdvcmllcz1jYXRlZ29yaWVzO1xyXG5cclxuICAkc2NvcGUuZWRpdFByb2R1Y3QgPSBmdW5jdGlvbihwcm9kdWN0KXtcclxuICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS51cGRhdGUocHJvZHVjdClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXBkYXRlZFByb2R1Y3Qpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZWQgcHJvZHVjdCBpcycsIHVwZGF0ZWRQcm9kdWN0KTtcclxuICAgICAgICAgICAgICAgICAkdWliTW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygncHJvZHVjdCcse2lkOnVwZGF0ZWRQcm9kdWN0Ll9pZH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuYWRkQ2F0ZWdvcnkgPSBmdW5jdGlvbihjYXQpe1xyXG4gICAgJHNjb3BlLnByb2R1Y3QuY2F0ZWdvcnkucHVzaChjYXQpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5yZW1vdmVDYXRlZ29yeSA9IGZ1bmN0aW9uKGNhdCl7XHJcbiAgICB2YXIgaSA9ICRzY29wZS5wcm9kdWN0LmNhdGVnb3J5LmluZGV4T2YoY2F0KTtcclxuICAgICRzY29wZS5wcm9kdWN0LmNhdGVnb3J5LnNwbGljZShpLCAxKTtcclxuXHJcbiAgfTtcclxuXHJcbn0pO1xyXG5cclxuYXBwLmZhY3RvcnkoJ1Byb2R1Y3RGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApIHtcclxuICB2YXIgcHJvZHVjdE9iajtcclxuICB2YXIgX3Byb2R1Y3RDYWNoZSA9IFtdO1xyXG5cclxuICBwcm9kdWN0T2JqID0ge1xyXG4gICAgZ2V0QWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9wcm9kdWN0cycpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocHJvZHVjdHMpIHtcclxuICAgICAgICAgIGFuZ3VsYXIuY29weShwcm9kdWN0cy5kYXRhLCBfcHJvZHVjdENhY2hlKTtcclxuICAgICAgICAgIHJldHVybiBfcHJvZHVjdENhY2hlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRPbmU6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvcHJvZHVjdHMvJyArIGlkKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHByb2R1Y3QpIHtcclxuICAgICAgICAgIHJldHVybiBwcm9kdWN0LmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGFkZDogZnVuY3Rpb24ocHJvZHVjdCkge1xyXG4gICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBpL3Byb2R1Y3RzLycsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHByb2R1Y3RcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihfcHJvZHVjdCkge1xyXG4gICAgICAgICAgcmV0dXJuIF9wcm9kdWN0LmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGRlbGV0ZTogZnVuY3Rpb24oaWQpe1xyXG4gICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL3Byb2R1Y3RzLycgKyBpZClcclxuICAgICAgICAudGhlbihmdW5jdGlvbihwcm9kdWN0KSB7XHJcbiAgICAgICAgICByZXR1cm4gcHJvZHVjdC5kYXRhO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBzb2Z0RGVsZXRlOiBmdW5jdGlvbihpZCl7XHJcbiAgICAgIC8vbm90ZSAtIHNvZnQgZGVsZXRlIGFsc28gc2V0cyBhdmFpbGFibGUgdG8gZmFsc2VcclxuICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS9wcm9kdWN0cy8nICsgaWQsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcclxuICAgICAgICAgICAgZGF0YToge2RlbGV0ZWQ6dHJ1ZX1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHByb2R1Y3QpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKHByb2R1Y3QpXHJcbiAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBpL3Byb2R1Y3RzLycgKyBwcm9kdWN0LmRhdGEuX2lkLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUFVUXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHthdmFpbGFibGU6ZmFsc2V9XHJcbiAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHByb2R1Y3QpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKHByb2R1Y3QpXHJcbiAgICAgICAgICByZXR1cm4gcHJvZHVjdC5kYXRhO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICB0b2dnbGU6IGZ1bmN0aW9uKGlkLGF2YWlsYWJsZSl7XHJcbiAgICAgIGlmKGF2YWlsYWJsZSl7XHJcbiAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS9wcm9kdWN0cy8nICsgaWQsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcclxuICAgICAgICAgICAgZGF0YToge2F2YWlsYWJsZTpmYWxzZX1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHByb2R1Y3QpIHtcclxuICAgICAgICAgIHJldHVybiBwcm9kdWN0LmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS9wcm9kdWN0cy8nICsgaWQsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcclxuICAgICAgICAgICAgZGF0YToge2F2YWlsYWJsZTp0cnVlfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocHJvZHVjdCkge1xyXG4gICAgICAgICAgcmV0dXJuIHByb2R1Y3QuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbihwcm9kdWN0KSB7XHJcbiAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIHVybDogJy9hcGkvcHJvZHVjdHMvJyArIHByb2R1Y3QuX2lkLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUFVUXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHByb2R1Y3RcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihfcHJvZHVjdCkge1xyXG4gICAgICAgICAgcmV0dXJuIF9wcm9kdWN0LmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFJldmlld3M6IGZ1bmN0aW9uKHByb2R1Y3RJZCkge1xyXG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Byb2R1Y3RzLycgKyBwcm9kdWN0SWQgKyAnL3Jldmlld3MnKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXZpZXdzKSB7XHJcbiAgICAgICAgcmV0dXJuIHJldmlld3MuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGFkZFJldmlldzogZnVuY3Rpb24ocHJvZHVjdCwgcmV2aWV3KSB7XHJcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3Byb2R1Y3RzLycgKyBwcm9kdWN0Ll9pZCArICcvcmV2aWV3cycsIHJldmlldylcclxuICAgICAgLnRoZW4oZnVuY3Rpb24oX3Jldmlldykge1xyXG4gICAgICAgIHJldHVybiBfcmV2aWV3LmRhdGE7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICByZXR1cm4gcHJvZHVjdE9iajtcclxufSk7XHJcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XHJcblxyXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3VzZXJDcmVhdGUnLCB7XHJcbiAgICAgICAgdXJsOiAnL3VzZXIvY3JlYXRlJyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3VzZXIvY3JlYXRldXNlci5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiAnVXNlckN0cmwnXHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1VzZXJDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xyXG4gICAgJHNjb3BlLmNyZWF0ZVVzZXIgPSB7fTtcclxuICAgICRzY29wZS5lcnJvciA9IG51bGw7XHJcblxyXG4gICAgJHNjb3BlLnNlbmRDcmVhdGVVc2VyID0gZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgIGlmICh1c2VyLnBhc3N3b3JkMSAhPSB1c2VyLnBhc3N3b3JkMikgIHtcclxuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gXCJQYXNzd29yZHMgZG8gbm90IG1hdGNoXCI7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVzZXIuZW1haWwgJiYgdXNlci5wYXNzd29yZDEgJiYgdXNlci5wYXNzd29yZDIpIHtcclxuICAgICAgICAgICAgdmFyIHVzZXJPYmogPSB7XHJcbiAgICAgICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcclxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB1c2VyLnBhc3N3b3JkMVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgVXNlckZhY3RvcnkuY3JlYXRlVXNlcih1c2VyT2JqKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLnN0YXR1cyA9PT0gNDA5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdFbWFpbCBhbHJlYWR5IGV4aXN0cy4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIFVzZXIgY3JlZGVudGlhbHMuJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdQbGVhc2UgZmlsbCBpbiBhbGwgdGhlIGZpZWxkcy4nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pO1xyXG5cclxuYXBwLmZhY3RvcnkoJ1VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApIHtcclxuICAgIHZhciBVc2VyRmFjdG9yeSA9IHt9O1xyXG5cclxuICAgIFVzZXJGYWN0b3J5LmNyZWF0ZVVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvdXNlci8nLCB1c2VyKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9O1xyXG5cclxuICAgIFVzZXJGYWN0b3J5LmdldEFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coJ2dldHRpbmcgYWxsIGNhdHMnKTtcclxuXHJcbiAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXIvJylcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXNwb25zZSlcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgVXNlckZhY3RvcnkuZ2V0T25lID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdXNlci8nICsgaWQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIFVzZXJGYWN0b3J5LnVwZGF0ZSA9IGZ1bmN0aW9uKHVzZXIpe1xyXG4gICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBpL3VzZXIvJyArIHVzZXIuX2lkLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUFVUXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihfdXNlcikge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZSBwdXQgb24gdXNlciByZXNwb25zZTonLCBfdXNlcik7XHJcbiAgICAgICAgICByZXR1cm4gX3VzZXIuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gIFVzZXJGYWN0b3J5LnNvZnREZWxldGUgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIHVybDogJy9hcGkvdXNlci8nICsgaWQsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcclxuICAgICAgICAgICAgZGF0YToge1wiZGVsZXRlZFwiOlwidHJ1ZVwifVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oX3VzZXIpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCd1c2VyIHJldHVybmVkJywgX3VzZXIpXHJcbiAgICAgICAgICByZXR1cm4gX3VzZXIuZGF0YTtcclxuICAgICAgICB9KTtcclxuICB9O1xyXG5cclxuICBVc2VyRmFjdG9yeS5wYXNzUmVzZXQgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIHVybDogJy9hcGkvdXNlci8nICsgaWQsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcclxuICAgICAgICAgICAgZGF0YToge1wicmVzZXRwYXNzXCI6XCJ0cnVlXCJ9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihfdXNlcikge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ3VzZXIgcmV0dXJuZWQnLCBfdXNlcilcclxuICAgICAgICAgIHJldHVybiBfdXNlci5kYXRhO1xyXG4gICAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICAgcmV0dXJuIFVzZXJGYWN0b3J5O1xyXG59KTsiLCJhcHAuZmFjdG9yeSgnRnVsbHN0YWNrUGljcycsIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CN2dCWHVsQ0FBQVhRY0UuanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLUxLVXNoSWdBRXk5U0suanBnJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3OS1YN29DTUFBa3c3eS5qcGcnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNnlJeUZpQ0VBQXFsMTIuanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFLVQ3NWxXQUFBbXFxSi5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0V2WkFnLVZBQUFrOTMyLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRWdOTWVPWElBSWZEaEsuanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFUXlJRE5XZ0FBdTYwQi5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0NGM1Q1UVc4QUUybEdKLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWVWdzVTV29BQUFMc2ouanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBYUpJUDdVa0FBbElHcy5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FRT3c5bFdFQUFZOUZsLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLU9RYlZyQ01BQU53SU0uanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I5Yl9lcndDWUFBd1JjSi5wbmc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjVQVGR2bkNjQUVBbDR4LmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNHF3QzBpQ1lBQWxQR2guanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0IyYjMzdlJJVUFBOW8xRC5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQndwSXdyMUlVQUF2TzJfLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cc1NzZUFOQ1lBRU9oTHcuanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NKNHZMZnVVd0FBZGE0TC5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0k3d3pqRVZFQUFPUHBTLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSWRIdlQyVXNBQW5uSFYuanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NHQ2lQX1lXWUFBbzc1Vi5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lTNEpQSVdJQUkzN3F1LmpwZzpsYXJnZSdcclxuICAgIF07XHJcbn0pO1xyXG4iLCJhcHAuZmFjdG9yeSgnUmFuZG9tR3JlZXRpbmdzJywgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciBnZXRSYW5kb21Gcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XHJcbiAgICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV07XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBncmVldGluZ3MgPSBbXHJcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxyXG4gICAgICAgICdBdCBsb25nIGxhc3QsIEkgbGl2ZSEnLFxyXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLicsXHJcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXHJcbiAgICAgICAgJ0lcXCdtIGxpa2UgYW55IG90aGVyIHByb2plY3QsIGV4Y2VwdCB0aGF0IEkgYW0geW91cnMuIDopJyxcclxuICAgICAgICAnVGhpcyBlbXB0eSBzdHJpbmcgaXMgZm9yIExpbmRzYXkgTGV2aW5lLicsXHJcbiAgICAgICAgJ+OBk+OCk+OBq+OBoeOBr+OAgeODpuODvOOCtuODvOanmOOAgicsXHJcbiAgICAgICAgJ1dlbGNvbWUuIFRvLiBXRUJTSVRFLicsXHJcbiAgICAgICAgJzpEJyxcclxuICAgICAgICAnWWVzLCBJIHRoaW5rIHdlXFwndmUgbWV0IGJlZm9yZS4nLFxyXG4gICAgICAgICdHaW1tZSAzIG1pbnMuLi4gSSBqdXN0IGdyYWJiZWQgdGhpcyByZWFsbHkgZG9wZSBmcml0dGF0YScsXHJcbiAgICAgICAgJ0lmIENvb3BlciBjb3VsZCBvZmZlciBvbmx5IG9uZSBwaWVjZSBvZiBhZHZpY2UsIGl0IHdvdWxkIGJlIHRvIG5ldlNRVUlSUkVMIScsXHJcbiAgICBdO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXHJcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbUZyb21BcnJheShncmVldGluZ3MpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59KTtcclxuIiwiYXBwLmZpbHRlcignYWJicicsIGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiBmdW5jdGlvbiAoaW5wdXQpIHtcclxuXHRcdHZhciBtYXggPSAxMztcclxuXHRcdGlmIChpbnB1dC5sZW5ndGggPiBtYXgpIHtcclxuXHRcdFx0cmV0dXJuIGlucHV0LnNsaWNlKDAsIG1heCkgKyAnLi4nXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gaW5wdXQ7XHJcblx0fVxyXG59KSIsImFwcC5kaXJlY3RpdmUoJ2FkZFRvQ2FydCcsIGZ1bmN0aW9uKEF1dGhTZXJ2aWNlLCBDYXJ0RmFjdG9yeSkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvY29tbW9uL2RpcmVjdGl2ZXMvYWRkLXRvLWNhcnQvYWRkLnRvLmNhcnQuaHRtbCcsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBwcm9kdWN0OiAnPScsXHJcbiAgICAgIGxpbmVJdGVtOiAnPScsXHJcbiAgICAgIGxhYmVsOiAnQCcsXHJcbiAgICAgIGRldGFpbDogJz0nXHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBsaW5rLCBhdHRyKSB7XHJcbiAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQ7XHJcbiAgICAgIHNjb3BlLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3QsIGV2LCBkZXRhaWwpIHtcclxuICAgICAgICBDYXJ0RmFjdG9yeS5hZGRUb0NhcnQocHJvZHVjdCkudGhlbihmdW5jdGlvbihjYXJ0KSB7XHJcbiAgICAgICAgICBpZiAoZGV0YWlsKSB7XHJcbiAgICAgICAgICAgIGV2LnRhcmdldC5pbm5lckhUTUwgPSBcIkFkZGVkIHRvIGNhcnQgKFwiICsgY2FydC5xdWFudGl0eSArIFwiKVwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH07XHJcbiAgICAgIHNjb3BlLnVwZGF0ZVF0eSA9IENhcnRGYWN0b3J5LnVwZGF0ZVF0eTtcclxuICAgICAgc2NvcGUucmVtb3ZlSXRlbSA9IENhcnRGYWN0b3J5LnJlbW92ZUl0ZW07XHJcbiAgICAgIHNjb3BlLmdldExpbmVJdGVtID0gQ2FydEZhY3RvcnkuZ2V0TGluZUl0ZW07XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcbiIsImFwcC5kaXJlY3RpdmUoJ2NhcnRTdGF0dXMnLCBmdW5jdGlvbiAoQ2FydEZhY3RvcnkpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvY29tbW9uL2RpcmVjdGl2ZXMvY2FydC1zdGF0dXMvY2FydC5zdGF0dXMuaHRtbCcsXHJcbiAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgY29udHJvbGxlcjogJ0NhcnRDdHJsJ1xyXG4gIH07XHJcbn0pO1xyXG4iLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcclxuICAgIH07XHJcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICBzY29wZToge30sXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXHJcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSG9tZScsIHN0YXRlOiAnaG9tZScgfSxcclxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBYm91dCcsIHN0YXRlOiAnYWJvdXQnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnUHJvZHVjdHMnLCBzdGF0ZTogJ3Byb2R1Y3RzJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ09yZGVycycsIHN0YXRlOiAnb3JkZXJzJywgYXV0aDogdHJ1ZX1cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLmFkbWluQWNjZXNzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQWRtaW4oKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgncmVmcmVzaENhcnQnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NldCB1c2VyOicsIHVzZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHVzZXIucmVzZXRwYXNzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFzc1Jlc2V0KHVzZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIHBhc3NSZXNldCA9IGZ1bmN0aW9uIChfdXNlcikge1xyXG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdwYXNzcmVzZXQnLHt1c2VyOl91c2VyfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBzZXRVc2VyKCk7XHJcblxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xyXG4gICAgICAgICAgICAvLyRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5lZWRzUGFzc1Jlc2V0LCBwYXNzUmVzZXQpO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbn0pO1xyXG4iLCJhcHAuZGlyZWN0aXZlKCdyYW5kb0dyZWV0aW5nJywgZnVuY3Rpb24gKFJhbmRvbUdyZWV0aW5ncykge1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmh0bWwnLFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xyXG4gICAgICAgICAgICBzY29wZS5ncmVldGluZyA9IFJhbmRvbUdyZWV0aW5ncy5nZXRSYW5kb21HcmVldGluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
