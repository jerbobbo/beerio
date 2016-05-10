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

  $urlRouterProvider.when('/', '/products');
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
      CheckoutFactory.setIdx(++stateIdx);
      $scope.currentState = CheckoutFactory.getState();
      CartFactory.clear();
      $state.go($scope.currentState.state);
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

      scope.items = [{ label: 'Beers', state: 'products' }, { label: 'About', state: 'about' }, { label: 'Orders', state: 'orders', auth: true }];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYWRtaW4vQWRtaW4uanMiLCJjYXJ0L2NhcnQuanMiLCJjYXRlZ29yaWVzL0NhdGVnb3JpZXMuanMiLCJjaGVja291dC9jaGVja291dC5qcyIsImRvY3MvZG9jcy5qcyIsImZzYS9mc2EtcHJlLWJ1aWx0LmpzIiwiaG9tZS9ob21lLmpzIiwibG9naW4vbG9naW4uanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwib3JkZXJzL29yZGVycy5qcyIsInBhc3N3b3JkcmVzZXQvcGFzc3dvcmRyZXNldC5qcyIsInByb2R1Y3RzL1Byb2R1Y3RzLmpzIiwidXNlci91c2VyLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZmlsdGVycy9hYmJyZXZpYXRlLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYWRkLXRvLWNhcnQvYWRkLnRvLmNhcnQuanMiLCJjb21tb24vZGlyZWN0aXZlcy9jYXJ0LXN0YXR1cy9jYXJ0LnN0YXR1cy5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQUNBLE9BQUEsR0FBQSxHQUFBLFFBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBOztBQUVBLElBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBO0FBQ0EsTUFBQSxPQUFBLFNBQUEsS0FBQSxXQUFBLEVBQUE7O0FBRUEs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QkFBQTtBQUhBLEdBQUE7O0FBTUEsaUJBQUEsS0FBQSxDQUFBLGNBQUEsRUFBQTtBQUNBLFNBQUEsU0FEQTtBQUVBLGlCQUFBLDZCQUZBO0FBR0EsZ0JBQUE7QUFIQSxHQUFBO0FBTUEsQ0E1REE7O0FBOERBLElBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxjQUFBLEVBQUE7QUFDQSxTQUFBLFFBQUEsR0FBQSxRQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsVUFBQTtBQUNBLFNBQUEsVUFBQSxHQUFBLFVBQUE7O0FBRUEsU0FBQSxLQUFBLEdBQUEsS0FBQTtBQUlBLENBVEE7O0FBV0EsSUFBQSxVQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxVQUFBO0FBQ0EsU0FBQSxVQUFBLEdBQUEsVUFBQTtBQUNBLFNBQUEsWUFBQSxHQUFBLENBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxDQUFBO0FBQ0EsU0FBQSxNQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLFFBQUEsR0FBQSxJQUFBO0FBQ0EsR0FGQTs7QUFJQSxTQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBLEtBQUE7QUFDQSxRQUFBLE9BQUEsUUFBQSxJQUFBLE9BQUEsRUFBQTtBQUNBLGVBQUEsSUFBQTtBQUNBOztBQUVBLFdBQUEsWUFBQSxVQUFBLENBQUE7QUFDQSxhQUFBLE9BQUEsS0FEQTtBQUVBLGdCQUFBLE9BQUEsUUFGQTtBQUdBLGFBQUE7QUFIQSxLQUFBLEVBS0EsSUFMQSxDQUtBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsY0FBQSxHQUFBLENBQUEsT0FBQTtBQUNBLGNBQUEsS0FBQSxHQUFBLE1BQUE7QUFDQSxjQUFBLE9BQUEsR0FBQSxLQUFBO0FBQ0EsY0FBQSxTQUFBLEdBQUEsS0FBQTs7QUFFQSxhQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsZ0JBQUE7QUFDQSxLQWZBLENBQUE7QUFnQkEsR0F0QkE7O0FBd0JBLFNBQUEsY0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBOztBQUVBLFFBQUEsQ0FBQSxLQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsSUFBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBO0FBQ0E7QUFDQSxTQUFBLEtBQUEsR0FBQSxNQUFBOztBQUVBLFdBQUEsWUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsR0FYQTs7QUFhQSxTQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsWUFBQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxhQUFBLE1BQUE7QUFDQSxLQUhBLENBQUE7QUFJQSxHQUxBOztBQU9BLFNBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxZQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsRUFDQSxJQURBLENBQ0EsWUFBQTtBQUNBLGFBQUEsTUFBQTtBQUNBLEtBSEEsQ0FBQTtBQUlBLEdBTEE7QUFPQSxDQTVEQTs7QUE4REEsSUFBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsWUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUE7O0FBRUEsU0FBQSxNQUFBLEdBQUEsTUFBQTtBQUNBLFNBQUEsWUFBQSxHQUFBLENBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxDQUFBOztBQUVBLFNBQUEsWUFBQSxHQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxhQUFBLFNBQUEsQ0FBQSxN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QSxTQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0EsR0FGQTs7QUFJQSxTQUFBLFVBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLFdBQUEsWUFBQSxVQUFBLENBQUEsU0FBQSxHQUFBLENBQUE7QUFDQSxHQUZBOztBQUtBLFNBQUEsR0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLFNBQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsR0FBQSxLQUFBO0FBQ0EsYUFBQSxRQUFBLEdBQUEsWUFBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLFFBQUEsR0FBQSxZQUFBLFFBQUE7QUFDQSxLQUxBO0FBTUEsR0FQQTs7QUFTQSxTQUFBLFNBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsT0FBQSxTQUFBLFFBQUEsQ0FBQTtBQUNBLFFBQUEsUUFBQSxDQUFBLEVBQUE7QUFDQSxhQUFBLFlBQUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBO0FBQ0E7QUFDQSxXQUFBLE9BQUEsR0FBQSxDQUFBO0FBQ0EsV0FBQSxZQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxHQUFBLENBQUE7QUFDQSxHQVBBO0FBVUEsQ0FyREE7O0FBd0RBLElBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxNQUFBLGFBQUEsRUFBQTtBQUNBLE1BQUEsWUFBQTtBQUNBLGNBQUEsQ0FEQTtBQUVBLG1CQUFBO0FBRkEsR0FBQTtBQUlBLE1BQUEsVUFBQSxJQUFBOztBQUVBLFdBQUEsV0FBQSxHQUFBO0FBQ0EsY0FBQSxhQUFBLEdBQUEsQ0FBQTtBQUNBLGNBQUEsUUFBQSxHQUFBLENBQUE7QUFDQSxlQUFBLE9BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLGFBQUEsSUFBQSxDQUFBLFNBQUEsUUFBQTtBQUNBLGdCQUFBLFFBQUEsSUFBQSxTQUFBLFFBQUEsR0FBQSxTQUFBLFNBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLEtBSEE7QUFLQTs7QUFFQSxXQUFBLFdBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxPQUFBLENBQUEsVUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxZQUFBLEdBQUEsS0FBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxHQUFBO0FBQ0E7QUFDQSxLQUpBO0FBS0EsV0FBQSxRQUFBLEM7QUFDQTs7QUFFQSxNQUFBLFVBQUEsRUFBQTs7QUFFQSxVQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsV0FBQSxTQUFBO0FBQ0EsR0FGQTs7QUFJQSxVQUFBLFdBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTtBQUNBLFFBQUEsZ0JBQUEsSUFBQTtBQUNBLGVBQUEsT0FBQSxDQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsVUFBQSxZQUFBLFNBQUEsQ0FBQSxHQUFBLEtBQUEsU0FBQSxFQUFBLGdCQUFBLFdBQUE7QUFDQSxLQUZBO0FBR0EsV0FBQSxhQUFBO0FBQ0EsR0FOQTs7QUFRQSxVQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsV0FBQSxNQUFBLEdBQUEsQ0FBQSxXQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsU0FBQSxJQUFBLENBQUEsR0FBQTtBQUNBLGNBQUEsSUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxVQUFBO0FBQ0E7QUFDQSxhQUFBLFVBQUE7QUFDQSxLQU5BLENBQUE7QUFPQSxHQVJBOztBQVVBLFVBQUEsU0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBOztBQUVBLFFBQUEsU0FBQSxXQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGFBQUEsU0FBQSxTQUFBLENBQUEsR0FBQSxLQUFBLFFBQUEsR0FBQTtBQUNBLEtBRkEsQ0FBQTs7QUFJQSxRQUFBLE1BQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsT0FBQSxRQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxXQUFBLE1BQUEsSUFBQSxDQUFBLFlBQUEsRUFBQSxPQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLEtBQUEsSUFBQTtBQUNBO0FBQ0EsYUFBQSxLQUFBLElBQUE7QUFDQSxLQUxBLENBQUE7QUFNQSxHQWZBOztBQWlCQSxVQUFBLFNBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE9BQUEsQ0FBQSxFQUFBLE9BQUEsUUFBQSxVQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsV0FBQSxNQUFBLEdBQUEsQ0FBQSxlQUFBLFVBQUEsRUFBQTtBQUNBLGdCQUFBO0FBREEsS0FBQSxFQUdBLElBSEEsQ0FHQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLFlBQUEsVUFBQSxDQUFBLEVBQUEsUUFBQSxHQUFBLEdBQUE7QUFDQTtBQUNBLGFBQUEsS0FBQSxJQUFBO0FBQ0EsS0FQQSxDQUFBO0FBUUEsR0FWQTs7QUFZQSxVQUFBLFVBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFdBQUEsTUFBQSxNQUFBLENBQUEsZUFBQSxVQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsaUJBQUEsTUFBQSxDQUFBLFlBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBO0FBQ0EsYUFBQSxLQUFBLElBQUE7QUFDQSxLQUxBLENBQUE7QUFNQSxHQVBBOztBQVNBLFVBQUEsS0FBQSxHQUFBLFlBQUE7QUFDQSxXQUFBLE1BQUEsTUFBQSxDQUFBLHNCQUFBLE9BQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxZQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxHQUFBLENBQUEsRUFDQSxVQUFBLGFBQUEsR0FBQSxDQURBO0FBRUEsY0FBQSxHQUFBLENBQUEsWUFBQTtBQUNBLGFBQUEsWUFBQTtBQUNBLEtBUEEsQ0FBQTtBQVFBLEdBVEE7O0FBV0EsU0FBQSxPQUFBO0FBQ0EsQ0F0R0E7O0FDOURBLElBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxNQUFBLFNBQUEsRUFBQTs7QUFFQSxTQUFBLE1BQUEsR0FBQSxZQUFBOztBQUVBLFdBQUEsTUFBQSxHQUFBLENBQUEsa0JBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxRQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsSUFBQTtBQUNBLEtBSEEsQ0FBQTtBQUlBLEdBTkE7O0FBUUEsU0FBQSxNQUFBLEdBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLE1BQUEsR0FBQSxDQUFBLHFCQUFBLEVBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxRQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsSUFBQTtBQUNBLEtBSEEsQ0FBQTtBQUlBLEdBTEE7O0FBT0EsU0FBQSxXQUFBLEdBQUEsVUFBQSxFQUFBLEVBQUE7O0FBRUEsV0FBQSxNQUFBLEdBQUEsQ0FBQSxxQkFBQSxFQUFBLEdBQUEsV0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGFBQUEsU0FBQSxJQUFBO0FBQ0EsS0FIQSxDQUFBO0FBSUEsR0FOQTs7QUFRQSxTQUFBLE1BQUE7QUFDQSxDQTNCQTtBQ0ZBLElBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBLGtCQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsY0FBQSxJQURBO0FBRUEsU0FBQSxXQUZBO0FBR0EsZ0JBQUEsY0FIQTtBQUlBLGlCQUFBO0FBSkEsR0FBQSxFQU1BLEtBTkEsQ0FNQSxrQkFOQSxFQU1BO0FBQ0EsU0FBQSxVQURBO0FBRUEsaUJBQUEsOEJBRkE7QUFHQSxnQkFBQSxhQUhBO0FBSUEsYUFBQTtBQUNBLGVBQUEsaUJBQUEsZUFBQSxFQUFBO0FBQ0EsZUFBQSxnQkFBQSxRQUFBLEVBQUE7QUFDQTtBQUhBO0FBSkEsR0FOQSxFOzs7QUFtQkEsT0FuQkEsQ0FtQkEsa0JBbkJBLEVBbUJBO0FB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QUFBLFNBQUEsQ0FBQSxHQURBO0FBRUEsc0JBQUEsS0FBQSxRQUZBO0FBR0Esa0JBQUEsS0FBQSxTQUFBLENBQUEsSUFIQTtBQUlBLG1CQUFBLEtBQUEsU0FBQSxDQUFBO0FBSkEsV0FBQTtBQU1BLFNBUEE7QUFRQSxtQkFBQSxRQUFBLEdBQUEsU0FBQSxRQUFBO0FBQ0EsbUJBQUEsS0FBQSxHQUFBLFNBQUEsUUFBQSxHQUFBLENBQUE7QUFDQTs7QUFFQSxVQUFBLGNBQUEsQ0FBQSxFQUFBO0FBQ0EsZ0JBQUEsSUFBQSxHQUFBLFVBQUE7QUFDQSxtQkFBQSxlQUFBLEdBQUEsT0FBQTtBQUNBLE9BSEEsTUFHQSxJQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSx1QkFBQSxFQUFBO0FBQ0EsZ0JBQUEsSUFBQSxHQUFBLFNBQUE7QUFDQSxtQkFBQSxjQUFBLEdBQUEsT0FBQTtBQUNBO0FBQ0EsY0FBQSxTQUFBLEVBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxVQUFBLGNBQUEsQ0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsRUFBQSxJQUFBO0FBQ0E7QUFDQTtBQUNBLEtBbERBO0FBbURBLGNBQUEsb0JBQUE7QUFDQSxhQUFBLE1BQUE7QUFDQSxLQXJEQTtBQXNEQSxZQUFBLGdCQUFBLEdBQUEsRUFBQTtBQUNBLGtCQUFBLEdBQUE7QUFDQSxhQUFBLFNBQUE7QUFDQSxLQXpEQTtBQTBEQSxpQkFBQSx1QkFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLElBQUEsT0FBQSxNQUFBLEtBQUEsVUFBQSxFQUFBOztBQUVBLGNBQUEsSUFBQSxDQUFBLGFBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxNQUFBLElBQUE7QUFDQSxpQkFBQSxNQUFBLElBQUE7QUFDQSxTQUpBO0FBS0EsT0FQQSxNQVFBO0FBQ0EsZUFBQSxNQUFBO0FBQ0E7QUFDQTtBQXRFQSxHQUFBO0FBd0VBLENBN0dBOztBQStHQSxJQUFBLFNBQUEsQ0FBQSxxQkFBQSxFQUFBLFlBQUE7QUFDQSxTQUFBO0FBQ0EsY0FBQSxHQURBO0FBRUEsaUJBQUEsaUNBRkE7QUFHQSxnQkFBQTtBQUhBLEdBQUE7QUFLQSxDQU5BOztBQVFBLElBQUEsU0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsU0FBQTtBQUNBLGNBQUEsR0FEQTtBQUVBLGlCQUFBLCtCQUZBO0FBR0EsZ0JBQUE7QUFIQSxHQUFBO0FBS0EsQ0FOQTs7QUFRQSxJQUFBLFNBQUEsQ0FBQSxhQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUE7QUFDQSxjQUFBLEdBREE7QUFFQSxpQkFBQTtBQUZBLEdBQUE7QUFJQSxDQUxBOztBQU9BLElBQUEsU0FBQSxDQUFBLG9CQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUE7QUFDQSxjQUFBLEdBREE7QUFFQSxpQkFBQTtBQUZBLEdBQUE7QUFJQSxDQUxBO0FDMU5BLElBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFNBQUEsT0FEQTtBQUVBLGlCQUFBO0FBRkEsR0FBQTtBQUlBLENBTEE7O0FDQUEsQ0FBQSxZQUFBOztBQUVBOzs7O0FBR0EsTUFBQSxDQUFBLE9BQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsUUFBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQTs7QUFFQSxNQUFBLE9BQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUE7QUFDQSxXQUFBLE9BQUEsRUFBQSxDQUFBLE9BQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLEdBSEE7Ozs7O0FBUUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0Esa0JBQUEsb0JBREE7O0FBR0EsaUJBQUEsbUJBSEE7QUFJQSxtQkFBQSxxQkFKQTtBQUtBLG9CQUFBLHNCQUxBO0FBTUEsc0JBQUEsd0JBTkE7QUFPQSxtQkFBQTtBQVBBLEdBQUE7O0FBVUEsTUFBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxFQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsUUFBQSxhQUFBO0FBQ0EsV0FBQSxZQUFBLGdCQURBO0FBRUEsV0FBQSxZQUFBLGFBRkE7QUFHQSxXQUFBLFlBQUEsY0FIQTtBQUlBLFdBQUEsWUFBQTtBQUpBLEtBQUE7QUFNQSxXQUFBO0FBQ0EscUJBQUEsdUJBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsVUFBQSxDQUFBLFdBQUEsU0FBQSxNQUFBLENBQUEsRUFBQSxRQUFBO0FBQ0EsZUFBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUE7QUFDQTtBQUpBLEtBQUE7QUFNQSxHQWJBOztBQWVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0Esa0JBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLFdBREEsRUFFQSxVQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsVUFBQSxHQUFBLENBQUEsaUJBQUEsQ0FBQTtBQUNBLEtBSkEsQ0FBQTtBQU1BLEdBUEE7O0FBU0EsTUFBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQTs7QUFFQSxhQUFBLGlCQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsVUFBQSxPQUFBLFNBQUEsSUFBQTtBQUNBLGNBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxFQUFBLEtBQUEsSUFBQTtBQUNBLGlCQUFBLFVBQUEsQ0FBQSxZQUFBLFlBQUE7QUFDQSxhQUFBLEtBQUEsSUFBQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQWNBLFNBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLENBQUEsQ0FBQSxRQUFBLElBQUE7QUFDQSxLQUZBO0FBR0EsU0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsUUFBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsQ0FBQSxRQUFBLElBQUEsQ0FB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QSxlQUFBLGFBQUEsUUFBQSxFQUFBO0FBQ0E7QUFOQTtBQUpBLEdBREEsRUFjQSxLQWRBLENBY0EsT0FkQSxFQWNBO0FBQ0EsU0FBQSxpQkFEQTtBQUVBLGlCQUFBLCtCQUZBO0FBR0EsZ0JBQUEsaUJBSEE7QUFJQSxhQUFBO0FBQ0EsYUFBQSxlQUFBLFlBQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxlQUFBLGFBQUEsUUFBQSxDQUFBLGFBQUEsT0FBQSxDQUFBO0FBQ0EsT0FIQTtBQUlBLGtCQUFBLG9CQUFBLFdBQUEsRUFBQTtBQUNBLGVBQUEsWUFBQSxlQUFBLEVBQUE7QUFDQTtBQU5BO0FBSkEsR0FkQTtBQTJCQSxDQTVCQTs7QUE4QkEsSUFBQSxVQUFBLENBQUEsWUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsU0FBQSxNQUFBLEdBQUEsTUFBQTtBQUNBLENBRkE7O0FBSUEsSUFBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxDQUZBOztBQUtBLElBQUEsT0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLE1BQUEsV0FBQSxFQUFBOztBQUVBLFdBQUEsUUFBQSxHQUFBLFlBQUE7QUFDQSxXQUFBLE1BQUEsR0FBQSxDQUFBLGNBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxRQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsSUFBQTtBQUNBLEtBSEEsQ0FBQTtBQUlBLEdBTEE7O0FBT0EsV0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFdBQUEsTUFBQSxHQUFBLENBQUEsaUJBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxRQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsSUFBQTtBQUNBLEtBSEEsQ0FBQTtBQUlBLEdBTEE7O0FBT0EsV0FBQSxTQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLE1BQUEs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LEdBQUEsT0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQ0EsT0FBQSxXQUFBLEdBQUEsQ0FBQTtBQUNBLEdBSEE7O0FBS0EsU0FBQSxTQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsYUFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFNBQUE7QUFDQSxhQUFBLFNBQUEsR0FBQSxjQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsRUFBQTtBQUNBLEtBTEE7QUFNQSxHQVBBOztBQVNBLFNBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxXQUFBLE9BQUEsT0FBQSxDQUFBLE1BQUE7QUFDQSxHQUZBOztBQUlBLE1BQUEsZUFBQSxTQUFBLFlBQUEsR0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsT0FBQSxDQUFBOztBQUVBLFFBQUEsY0FBQSxDQUFBO0FBQ0EsV0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EscUJBQUEsT0FBQSxLQUFBO0FBQ0EsS0FGQTtBQUdBLFdBQUEsY0FBQSxPQUFBLE9BQUEsQ0FBQSxNQUFBO0FBQ0EsR0FSQTs7QUFVQSxTQUFBLFNBQUEsR0FBQSxjQUFBO0FBRUEsQ0ExQ0E7O0FBNENBLElBQUEsVUFBQSxDQUFBLHdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsTUFBQSxFQUFBLGlCQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsU0FBQSxPQUFBLEdBQUEsT0FBQTtBQUNBLFNBQUEsVUFBQSxHQUFBLFVBQUE7O0FBRUEsU0FBQSxXQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLGVBQUEsTUFBQSxDQUFBLE9BQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxjQUFBLEVBQUE7QUFDQSxjQUFBLEdBQUEsQ0FBQSxvQkFBQSxFQUFBLGNBQUE7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QSxLQUFBLFNBQUEsSUFBQSxLQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLHdCQUFBO0FBQ0E7QUFDQTtBQUNBLFFBQUEsS0FBQSxLQUFBLElBQUEsS0FBQSxTQUFBLElBQUEsS0FBQSxTQUFBLEVBQUE7QUFDQSxVQUFBLFVBQUE7QUFDQSxlQUFBLEtBQUEsS0FEQTtBQUVBLGtCQUFBLEtBQUE7QUFGQSxPQUFBOztBQUtBLGtCQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsTUFBQTtBQUNBLE9BSEEsRUFJQSxLQUpBLENBSUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLElBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSx1QkFBQTtBQUNBO0FBQ0E7QUFDQSxlQUFBLEtBQUEsR0FBQSwyQkFBQTtBQUNBLE9BVkE7QUFXQSxLQWpCQSxNQWlCQTtBQUNBLGFBQUEsS0FBQSxHQUFBLGdDQUFBO0FBQ0E7QUFDQSxHQXpCQTtBQTJCQSxDQS9CQTs7QUFpQ0EsSUFBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsTUFBQSxjQUFBLEVBQUE7O0FBRUEsY0FBQSxVQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLE1BQUEsSUFBQSxDQUFBLFlBQUEsRUFBQSxJQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsYUFBQSxTQUFBLElBQUE7QUFDQSxLQUhBLENBQUE7QUFJQSxHQUxBOztBQU9BLGNBQUEsTUFBQSxHQUFBLFlBQUE7OztBQUdBLFdBQUEsTUFBQSxHQUFBLENBQUEsWUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTs7QUFFQSxhQUFBLFNBQUEsSUFBQTtBQUNBLEtBSkEsQ0FBQTtBQUtBLEdBUkE7O0FBVUEsY0FBQSxNQUFBLEdBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLE1BQUEsR0FBQSxDQUFBLGVBQUEsRUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGFBQUEsU0FBQSxJQUFBO0FBQ0EsS0FIQSxDQUFBO0FBSUEsR0FMQTs7QUFPQSxjQUFBLE1BQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsTUFBQTtBQUNBLFdBQUEsZUFBQSxLQUFBLEdBREE7QUFFQSxjQUFBLEtBRkE7QUFHQSxZQUFBO0FBSEEsS0FBQSxFQUtBLElBTEEsQ0FLQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGNBQUEsR0FBQSxDQUFBLDhCQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsTUFBQSxJQUFBO0FBQ0EsS0FSQSxDQUFBO0FBU0EsR0FWQTs7QUFZQSxjQUFBLFVBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsTUFBQTtBQUNBLFdBQUEsZUFBQSxFQURBO0FBRUEsY0FBQSxLQUZBO0FBR0EsWUFBQSxFQUFBLFdBQUEsTUFBQTtBQUhBLEtBQUEsRUFLQSxJQUxBLENBS0EsVUFBQSxLQUFBLEVBQUE7QUFDQSxjQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsTUFBQSxJQUFBO0FBQ0EsS0FSQSxDQUFBO0FBU0EsR0FWQTs7QUFZQSxjQUFBLFNBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsTUFBQTtBQUNBLFdBQUEsZUFBQSxFQURBO0FBRUEsY0FBQSxLQUZBO0FBR0EsWUFBQSxFQUFBLGFBQUEsTUFBQTtBQUhBLEtBQUEsRUFLQSxJQUxBLENBS0EsVUFBQSxLQUFBLEVBQUE7QUFDQSxjQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsTUFBQSxJQUFBO0FBQ0EsS0FSQSxDQUFBO0FBU0EsR0FWQTs7QUFZQSxTQUFBLFdBQUE7QUFDQSxDQWhFQTtBQzNDQSxJQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUEsQ0FDQSx1REFEQSxFQUVBLHFIQUZBLEVBR0EsaURBSEEsRUFJQSxpREFKQSxFQUtBLHVEQUxBLEVBTUEs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QUEsY0FBQSxLQUFBLEVBQUE7O0FBRUEsWUFBQSxLQUFBLEdBQUEsQ0FDQSxFQUFBLE9BQUEsT0FBQSxFQUFBLE9BQUEsVUFBQSxFQURBLEVBRUEsRUFBQSxPQUFBLE9BQUEsRUFBQSxPQUFBLE9BQUEsRUFGQSxFQUdBLEVBQUEsT0FBQSxRQUFBLEVBQUEsT0FBQSxRQUFBLEVBQUEsTUFBQSxJQUFBLEVBSEEsQ0FBQTs7QUFNQSxZQUFBLElBQUEsR0FBQSxJQUFBOztBQUVBLFlBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLFlBQUEsZUFBQSxFQUFBO0FBQ0EsT0FGQTs7QUFJQSxZQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxZQUFBLE9BQUEsRUFBQTtBQUNBLE9BRkE7O0FBSUEsWUFBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLG9CQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGlCQUFBLEVBQUEsQ0FBQSxNQUFBO0FBQ0EscUJBQUEsVUFBQSxDQUFBLGFBQUE7QUFDQSxTQUhBO0FBSUEsT0FMQTs7QUFPQSxVQUFBLFVBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSxvQkFBQSxlQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0Esa0JBQUEsR0FBQSxDQUFBLFdBQUEsRUFBQSxJQUFBO0FBQ0EsZ0JBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxjQUFBLEtBQUEsU0FBQSxFQUFBO0FBQ0Esc0JBQUEsSUFBQTtBQUNBO0FBQ0EsU0FOQTtBQU9BLE9BUkE7O0FBVUEsVUFBQSxhQUFBLFNBQUEsVUFBQSxHQUFBO0FBQ0EsY0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLE9BRkE7O0FBSUEsVUFBQSxZQUFBLFNBQUEsU0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxFQUFBLE1BQUEsS0FBQSxFQUFBO0FBQ0EsT0FGQTs7QUFJQTs7QUFFQSxpQkFBQSxHQUFBLENBQUEsWUFBQSxZQUFBLEVBQUEsT0FBQTs7QUFFQSxpQkFBQSxHQUFBLENBQUEsWUFBQSxhQUFBLEVBQUEsVUFBQTtBQUNBLGlCQUFBLEdBQUEsQ0FBQSxZQUFBLGNBQUEsRUFBQSxVQUFBO0FBRUE7O0FBdERBLEdBQUE7QUEwREEsQ0E1REE7O0FDQUEsSUFBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsZUFBQSxFQUFBOztBQUVBLFNBQUE7QUFDQSxjQUFBLEdBREE7QUFFQSxpQkFBQSx5REFGQTtBQUdBLFVBQUEsY0FBQSxLQUFBLEVBQUE7QUFDQSxZQUFBLFFBQUEsR0FBQSxnQkFBQSxpQkFBQSxFQUFBO0FBQ0E7QUFMQSxHQUFBO0FBUUEsQ0FWQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCduZ01hdGVyaWFsJywnbmdBcmlhJ10pO1xyXG5cclxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xyXG4gICAgaWYgKHR5cGVvZiBURVNUX01PREUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxyXG4gICAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcclxuICAgICAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cclxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcbiAgICB9XHJcbiAgICAvLyBUcmlnZ2VyIHBhZ2UgcmVmcmVzaCB3aGVuIGFjY2Vzc2luZyBhbiBPQXV0aCByb3V0ZVxyXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLndoZW4oJy9hdXRoLzpwcm92aWRlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignLycsICcvcHJvZHVjdHMnKTtcclxufSk7XHJcblxyXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXHJcbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcclxuXHJcbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxyXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcclxuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcclxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxyXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xyXG5cclxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcclxuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cclxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXHJcbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XHJcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cclxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXHJcbiAgICAgICAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xyXG5cclxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxyXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xyXG4gICAgICAgIHVybDogJy9hYm91dCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBGdWxsc3RhY2tQaWNzKSB7XHJcblxyXG4gICAgLy8gSW1hZ2VzIG9mIGJlYXV0aWZ1bCBGdWxsc3RhY2sgcGVvcGxlLlxyXG4gICAgJHNjb3BlLmltYWdlcyA9IF8uc2h1ZmZsZShGdWxsc3RhY2tQaWNzKTtcclxuXHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4nLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4nLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvYWRtaW4vYWRtaW4uaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5DdHJsJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgcHJvZHVjdHM6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldEFsbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBjYXRlZ29yaWVzOiBmdW5jdGlvbihDYXRlZ29yeUZhY3Rvcnkpe1xyXG4gICAgICAgIHJldHVybiBDYXRlZ29yeUZhY3RvcnkuZ2V0QWxsKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVzZXJzOiBmdW5jdGlvbihVc2VyRmFjdG9yeSl7XHJcbiAgICAgICAgcmV0dXJuIFVzZXJGYWN0b3J5LmdldEFsbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBvcmRlcnM6IGZ1bmN0aW9uKE9yZGVyRmFjdG9yeSl7XHJcbiAgICAgICAgcmV0dXJuIE9yZGVyRmFjdG9yeS5nZXRBZG1pbkFsbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBpc0xvZ2dlZEluOiBmdW5jdGlvbihBdXRoU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbi5wcm9kdWN0QWRkJywge1xyXG4gICAgdXJsOiAnL3Byb2R1Y3RBZGQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvYWRtaW4vYWRtaW4ucHJvZHVjdEFkZC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBZG1pblByb2R1Y3RDdHJsJ1xyXG4gIH0pXHJcblxyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbi5wcm9kdWN0RGVsZXRlJywge1xyXG4gICAgdXJsOiAnL3Byb2R1Y3RFZGl0JyxcclxuICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLnByb2R1Y3REZWxldGUuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Qcm9kdWN0Q3RybCdcclxuICB9KVxyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4ucHJvZHVjdEVkaXQnLCB7XHJcbiAgICB1cmw6ICcvcHJvZHVjdEVkaXQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvYWRtaW4vYWRtaW4ucHJvZHVjdEVkaXQuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Qcm9kdWN0Q3RybCdcclxuICB9KVxyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4udXNlckFkZCcsIHtcclxuICAgIHVybDogJy91c2VyQWRkJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLnVzZXJBZGQuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Vc2VyQ3RybCdcclxuICB9KVxyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4udXNlckVkaXQnLCB7XHJcbiAgICB1cmw6ICcvdXNlckVkaXQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvYWRtaW4vYWRtaW4udXNlckVkaXQuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Vc2VyQ3RybCdcclxuICB9KVxyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4ub3JkZXJzJywge1xyXG4gICAgdXJsOiAnL29yZGVycycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJy9qcy9hZG1pbi9hZG1pbi5vcmRlcnMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5PcmRlckN0cmwnXHJcbiAgfSlcclxuXHJcbn0pXHJcblxyXG5hcHAuY29udHJvbGxlcignQWRtaW5DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBwcm9kdWN0cywgdXNlcnMsIGlzTG9nZ2VkSW4sIFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgJHNjb3BlLnByb2R1Y3RzID0gcHJvZHVjdHM7XHJcbiAgY29uc29sZS5sb2coaXNMb2dnZWRJbik7XHJcbiAgJHNjb3BlLmlzTG9nZ2VkSW4gPSBpc0xvZ2dlZEluO1xyXG5cclxuICAkc2NvcGUudXNlcnM9dXNlcnM7XHJcblxyXG5cclxuXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0FkbWluVXNlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsJHN0YXRlLCB1c2VycywgaXNMb2dnZWRJbiwgVXNlckZhY3RvcnkpIHtcclxuICAkc2NvcGUudXNlcnMgPSB1c2VycztcclxuICBjb25zb2xlLmxvZyhpc0xvZ2dlZEluKTtcclxuICAkc2NvcGUuaXNMb2dnZWRJbiA9IGlzTG9nZ2VkSW47XHJcbiAgJHNjb3BlLmFkbWluQ29sdW1ucz1bJ2VtYWlsJywncmVzZXRwYXNzJywnYWRtaW4nLCdkZWxldGVkJ107XHJcbiAgJHNjb3BlLnNlbGVjdD0gZnVuY3Rpb24odHlwZSl7XHJcbiAgICAkc2NvcGUudXNlclR5cGU9dHlwZTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuYWRkVXNlcj0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBfYWRtaW49ZmFsc2U7XHJcbiAgICBpZigkc2NvcGUudXNlclR5cGU9PSdBZG1pbicpe1xyXG4gICAgICBfYWRtaW49dHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gVXNlckZhY3RvcnkuY3JlYXRlVXNlcih7XHJcbiAgICAgICAgICAgIGVtYWlsOiRzY29wZS5lbWFpbCxcclxuICAgICAgICAgICAgcGFzc3dvcmQ6JHNjb3BlLnBhc3N3b3JkLFxyXG4gICAgICAgICAgICBhZG1pbjpfYWRtaW5cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihuZXdVc2VyKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobmV3VXNlcilcclxuICAgICAgICAgICAgbmV3VXNlci5hZG1pbj1fYWRtaW47XHJcbiAgICAgICAgICAgIG5ld1VzZXIuZGVsZXRlZD1mYWxzZTtcclxuICAgICAgICAgICAgbmV3VXNlci5yZXNldHBhc3M9ZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUubmV3VXNlcj1uZXdVc2VyO1xyXG4gICAgICAgICAgICAkc2NvcGUudXNlcnMucHVzaChuZXdVc2VyKTtcclxuICAgICAgICAgICAgJHNjb3BlLnN1Y2Nlc3M9dHJ1ZTtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdhZG1pbi51c2VyRWRpdCcpXHJcbiAgICAgICAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUudG9nZ2xlVXNlclR5cGU9IGZ1bmN0aW9uKHVzZXIpe1xyXG4gICAgdmFyIF9hZG1pbjtcclxuXHJcbiAgICBpZighdXNlci5hZG1pbil7XHJcbiAgICAgIF9hZG1pbj10cnVlO1xyXG4gICAgfSBlbHNlIGlmICh1c2VyLmFkbWluKXtcclxuICAgICAgX2FkbWluPWZhbHNlO1xyXG4gICAgfVxyXG4gICAgdXNlci5hZG1pbj1fYWRtaW47XHJcblxyXG4gICAgcmV0dXJuIFVzZXJGYWN0b3J5LnVwZGF0ZSh1c2VyKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuYmxvY2tVc2VyPWZ1bmN0aW9uKHVzZXIpe1xyXG4gICAgcmV0dXJuIFVzZXJGYWN0b3J5LnNvZnREZWxldGUodXNlci5faWQpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgJHN0YXRlLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5wYXNzUmVzZXQ9ZnVuY3Rpb24odXNlcil7XHJcbiAgICByZXR1cm4gVXNlckZhY3RvcnkucGFzc1Jlc2V0KHVzZXIuX2lkKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICRzdGF0ZS5yZWxvYWQoKTtcclxuICAgICAgICAgICAgfSlcclxuICB9O1xyXG5cclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignQWRtaW5PcmRlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsaXNMb2dnZWRJbixPcmRlckZhY3Rvcnksb3JkZXJzLCAkdWliTW9kYWwpIHtcclxuXHJcbiAgJHNjb3BlLm9yZGVycz1vcmRlcnM7XHJcbiAgJHNjb3BlLmFkbWluQ29sdW1ucz1bJ19pZCcsJ3VzZXInLCdzdGF0dXMnLCd0b3RhbCddO1xyXG5cclxuICAkc2NvcGUuZmlsdGVyT3JkZXJzPSBmdW5jdGlvbihzdGF0dXMpe1xyXG4gICAgcmV0dXJuIE9yZGVyRmFjdG9yeS5nZXRCeVR5cGUoc3RhdHVzKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihvcmRlcnMpe1xyXG4gICAgICAgICAgICAgICRzY29wZS5vcmRlcnM9b3JkZXJzO1xyXG4gICAgICAgICAgICB9KVxyXG4gIH07XHJcblxyXG4gICRzY29wZS52aWV3QWxsID0gZnVuY3Rpb24oKXtcclxuICAgICRzY29wZS5vcmRlcnM9b3JkZXJzO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS50b2dnbGVTdGF0dXMgPSBmdW5jdGlvbihvcmRlcil7XHJcbiAgICAgIHZhciBfc3RhdHVzO1xyXG5cclxuICAgICAgaWYoIW9yZGVyLnN0YXR1cyB8fCBvcmRlci5zdGF0dXM9PSdjYW5jZWxsZWQnKXtcclxuICAgICAgICBjb25zb2xlLmxvZygneW91IGNhbnQgdW5jYW5jZWwgYW4gb3JkZXInKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgfSBlbHNlIGlmKG9yZGVyLnN0YXR1cz09J2NhcnQnKXtcclxuICAgICAgICBfc3RhdHVzPSdjb21wbGV0ZSc7XHJcbiAgICAgIH0gZWxzZSBpZiggb3JkZXIuc3RhdHVzPT0nY29tcGxldGUnKXtcclxuICAgICAgICBfc3RhdHVzPSdjYXJ0JztcclxuICAgICAgfVxyXG4gICAgICBvcmRlci5zdGF0dXM9X3N0YXR1cztcclxuXHJcbiAgICAgIHJldHVybiBPcmRlckZhY3RvcnkudXBkYXRlKG9yZGVyKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuY2FuY2VsT3JkZXIgPSBmdW5jdGlvbihvcmRlcil7XHJcblxyXG4gICAgICBvcmRlci5zdGF0dXM9J2NhbmNlbGxlZCc7XHJcblxyXG4gICAgICByZXR1cm4gT3JkZXJGYWN0b3J5LnVwZGF0ZShvcmRlcik7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IGZ1bmN0aW9uKG9yZGVyKSB7XHJcbiAgICBjb25zb2xlLmxvZyhvcmRlcik7XHJcbiAgICAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL29yZGVycy9vcmRlcnMuZGV0YWlsLmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnT3JkZXJEZXRhaWxDdHJsJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIG9yZGVyOiBmdW5jdGlvbihPcmRlckZhY3RvcnkpIHtcclxuICAgICAgICAgIHJldHVybiBPcmRlckZhY3RvcnkuZmV0Y2hPbmUob3JkZXIuX2lkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTG9nZ2VkSW46IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlKSB7XHJcbiAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgfVxyXG4gICAgIH0pXHJcbiAgfTtcclxuXHJcblxyXG59KTtcclxuXHJcblxyXG5hcHAuY29udHJvbGxlcignQWRtaW5Qcm9kdWN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkdWliTW9kYWwsIGlzTG9nZ2VkSW4sIFByb2R1Y3RGYWN0b3J5LGNhdGVnb3JpZXMpIHtcclxuXHJcbiAgJHNjb3BlLmFkbWluQ29sdW1ucz1bJ25hbWUnLCdhdmFpbGFibGUnLCdkZWxldGVkJ107XHJcblxyXG4gICRzY29wZS5jYXRlZ29yaWVzID0gY2F0ZWdvcmllcztcclxuXHJcbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLnByb2R1Y3RFZGl0Lmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnUHJvZHVjdERldGFpbE1vZGFsQ3RybCcsXHJcbiAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICBwcm9kdWN0OiBmdW5jdGlvbihQcm9kdWN0RmFjdG9yeSkge1xyXG4gICAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldE9uZShpZCk7XHJcbiAgICAgICAgIH0sXHJcbiAgICAgICAgY2F0ZWdvcmllczogZnVuY3Rpb24oQ2F0ZWdvcnlGYWN0b3J5KXtcclxuICAgICAgICAgIHJldHVybiBDYXRlZ29yeUZhY3RvcnkuZ2V0QWxsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgfVxyXG4gICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5hZGRQcm9kdWN0ID0gZnVuY3Rpb24ocHJvZHVjdCl7XHJcbiAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuYWRkKHtcclxuICAgICAgbmFtZTokc2NvcGUucHJvZHVjdE5hbWUsXHJcbiAgICAgIGJyZXdlcjokc2NvcGUucHJvZHVjdEJyZXdlcixcclxuICAgICAgZGVzY3JpcHRpb246JHNjb3BlLnByb2R1Y3REZXNjLFxyXG4gICAgICBzdHlsZTokc2NvcGUucHJvZHVjdFN0eWxlLFxyXG4gICAgICBwcmljZTokc2NvcGUucHJvZHVjdFByaWNlLFxyXG4gICAgICBhYnY6JHNjb3BlLnByb2R1Y3RBQlYsXHJcbiAgICAgIHJhdGluZ3M6JHNjb3BlLnByb2R1Y3RSYXRpbmdzLFxyXG4gICAgICBzY29yZU92ZXJhbGw6JHNjb3BlLnByb2R1Y3RTY29yZU92ZXJhbGwsXHJcbiAgICAgIHNjb3JlQ2F0ZWdvcnk6JHNjb3BlLnByb2R1Y3RTY29yZUNhdGVnb3J5LFxyXG4gICAgICBpbWFnZVVybDokc2NvcGUucHJvZHVjdEltYWdlVXJsXHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uKG5ld1Byb2R1Y3Qpe1xyXG4gICAgICBjb25zb2xlLmxvZyhuZXdQcm9kdWN0Ll9pZCk7XHJcbiAgICAgICRzdGF0ZS5nbygncHJvZHVjdCcse2lkOm5ld1Byb2R1Y3QuX2lkfSk7XHJcbiAgICB9KVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5yZW1vdmVQcm9kdWN0PWZ1bmN0aW9uKGlkKXtcclxuICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5zb2Z0RGVsZXRlKGlkKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICRzdGF0ZS5yZWxvYWQoKTtcclxuICAgICAgICAgICAgfSlcclxuICB9O1xyXG5cclxuICAkc2NvcGUudG9nZ2xlQXZhaWxhYmlsaXR5PSBmdW5jdGlvbihpZCxhdmFpbGFibGUpe1xyXG4gICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LnRvZ2dsZShpZCxhdmFpbGFibGUpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgJHN0YXRlLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gIH07XHJcblxyXG59KTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjYXJ0Jywge1xyXG4gICAgdXJsOiAnL2NhcnQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvY2FydC9jYXJ0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0NhcnRDdHJsJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdDYXJ0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHVpYk1vZGFsLCBDYXJ0RmFjdG9yeSwgUHJvZHVjdEZhY3RvcnkpIHtcclxuXHJcbiAgJHNjb3BlLmNhcnRJbmZvID0gQ2FydEZhY3RvcnkuZ2V0SW5mbygpO1xyXG4gICRzY29wZS5pc0luQ2FydCA9IENhcnRGYWN0b3J5LmlzSW5DYXJ0O1xyXG5cclxuICBDYXJ0RmFjdG9yeS5mZXRjaENhcnQoKVxyXG4gICAgLnRoZW4oZnVuY3Rpb24oX2NhcnQpIHtcclxuICAgICAgJHNjb3BlLmNhcnQgPSBfY2FydDtcclxuICAgIH0pO1xyXG5cclxuICAkc2NvcGUub3Blbk1vZGFsID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9wcm9kdWN0cy9wcm9kdWN0LmRldGFpbC5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ1Byb2R1Y3REZXRhaWxDdHJsJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIHByb2R1Y3Q6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0T25lKGlkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJldmlld3M6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0UmV2aWV3cyhpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucXVhbnRpdHlDaGFuZ2UgPSBmdW5jdGlvbihsaW5lSXRlbSwgcXR5KSB7XHJcbiAgICByZXR1cm4gQ2FydEZhY3RvcnkudXBkYXRlUXR5KGxpbmVJdGVtLl9pZCwgcXR5KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucmVtb3ZlSXRlbSA9IGZ1bmN0aW9uKGxpbmVJdGVtKSB7XHJcbiAgICByZXR1cm4gQ2FydEZhY3RvcnkucmVtb3ZlSXRlbShsaW5lSXRlbS5faWQpO1xyXG4gIH07XHJcblxyXG5cclxuICAkc2NvcGUuJG9uKCdyZWZyZXNoQ2FydCcsIGZ1bmN0aW9uKGV2KSB7XHJcbiAgICBDYXJ0RmFjdG9yeS5mZXRjaENhcnQoKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihfY2FydCkge1xyXG4gICAgICAgICRzY29wZS5jYXJ0ID0gX2NhcnQ7XHJcbiAgICAgICAgJHNjb3BlLmNhcnRJbmZvID0gQ2FydEZhY3RvcnkuZ2V0SW5mbygpO1xyXG4gICAgICAgICRzY29wZS5pc0luQ2FydCA9IENhcnRGYWN0b3J5LmlzSW5DYXJ0OyAgICBcclxuICAgICAgfSlcclxuICB9KVxyXG5cclxuICAkc2NvcGUudXBkYXRlT25lID0gZnVuY3Rpb24obGluZUl0ZW0sIGRpcikge1xyXG4gICAgdmFyIHF0eSA9IE51bWJlcihsaW5lSXRlbS5xdWFudGl0eSk7XHJcbiAgICBpZiAocXR5ID09PSAwKSB7XHJcbiAgICAgIHJldHVybiBDYXJ0RmFjdG9yeS5yZW1vdmVJdGVtKGxpbmVJdGVtLl9pZCk7XHJcbiAgICB9XHJcbiAgICBxdHkgKz0gTnVtYmVyKGRpcik7XHJcbiAgICByZXR1cm4gQ2FydEZhY3RvcnkudXBkYXRlUXR5KGxpbmVJdGVtLl9pZCwgcXR5KTtcclxuICB9O1xyXG5cclxuXHJcbn0pO1xyXG5cclxuXHJcbmFwcC5mYWN0b3J5KCdDYXJ0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCAkcm9vdFNjb3BlKSB7XHJcbiAgdmFyIF9jYXJ0Q2FjaGUgPSBbXTtcclxuICB2YXIgX2NhcnRJbmZvID0ge1xyXG4gICAgc3VidG90YWw6IDAsXHJcbiAgICBudW1iZXJPZkl0ZW1zOiAwXHJcbiAgfTtcclxuICB2YXIgX2NhcnRJZCA9IG51bGw7XHJcblxyXG4gIGZ1bmN0aW9uIF91cGRhdGVJbmZvKCkge1xyXG4gICAgX2NhcnRJbmZvLm51bWJlck9mSXRlbXMgPSAwO1xyXG4gICAgX2NhcnRJbmZvLnN1YnRvdGFsID0gMDtcclxuICAgIF9jYXJ0Q2FjaGUuZm9yRWFjaChmdW5jdGlvbihjYXJ0SXRlbSkge1xyXG4gICAgICBfY2FydEluZm8ubnVtYmVyT2ZJdGVtcyArPSArY2FydEl0ZW0ucXVhbnRpdHk7XHJcbiAgICAgIF9jYXJ0SW5mby5zdWJ0b3RhbCArPSAoY2FydEl0ZW0ucXVhbnRpdHkgKiBwYXJzZUludChjYXJ0SXRlbS5wcm9kdWN0SWQucHJpY2UpKTtcclxuICAgIH0pO1xyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIF9maW5kSW5DYXJ0KGlkKSB7XHJcbiAgICB2YXIgZm91bmRJZHggPSAtMTtcclxuICAgIF9jYXJ0Q2FjaGUuZm9yRWFjaChmdW5jdGlvbihsaW5lSXRlbU9iaiwgaWR4KSB7XHJcbiAgICAgIGlmIChsaW5lSXRlbU9iai5faWQgPT09IGlkKSB7XHJcbiAgICAgICAgZm91bmRJZHggPSBpZHg7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGZvdW5kSWR4OyAvLyB3aWxsIG9ubHkgZXZlciByZXR1cm4gbGFzdCBmb3VuZCBtYXRjaGluZyBpdGVtIGluIGNhcnRcclxuICB9XHJcblxyXG4gIHZhciBjYXJ0T2JqID0ge307XHJcblxyXG4gIGNhcnRPYmouZ2V0SW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIF9jYXJ0SW5mbztcclxuICB9O1xyXG5cclxuICBjYXJ0T2JqLmdldExpbmVJdGVtID0gZnVuY3Rpb24ocHJvZHVjdElkKSB7XHJcbiAgICB2YXIgZm91bmRMaW5lSXRlbSA9IG51bGw7XHJcbiAgICBfY2FydENhY2hlLmZvckVhY2goZnVuY3Rpb24obGluZUl0ZW1PYmopIHtcclxuICAgICAgaWYgKGxpbmVJdGVtT2JqLnByb2R1Y3RJZC5faWQgPT09IHByb2R1Y3RJZCkgZm91bmRMaW5lSXRlbSA9IGxpbmVJdGVtT2JqO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZm91bmRMaW5lSXRlbTtcclxuICB9O1xyXG5cclxuICBjYXJ0T2JqLmZldGNoQ2FydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9jYXJ0JylcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICBfY2FydElkID0gcmVzcG9uc2UuZGF0YS5faWQ7XHJcbiAgICAgICAgYW5ndWxhci5jb3B5KHJlc3BvbnNlLmRhdGEuaXRlbXMsIF9jYXJ0Q2FjaGUpO1xyXG4gICAgICAgIF91cGRhdGVJbmZvKCk7XHJcbiAgICAgICAgcmV0dXJuIF9jYXJ0Q2FjaGU7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGNhcnRPYmouYWRkVG9DYXJ0ID0gZnVuY3Rpb24ocHJvZHVjdCkge1xyXG5cclxuICAgIHZhciBzZWFyY2ggPSBfY2FydENhY2hlLmZpbmQoZnVuY3Rpb24oY2FydEl0ZW0pIHtcclxuICAgICAgcmV0dXJuIGNhcnRJdGVtLnByb2R1Y3RJZC5faWQgPT09IHByb2R1Y3QuX2lkXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoc2VhcmNoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVF0eShzZWFyY2guX2lkLCBzZWFyY2gucXVhbnRpdHkrMSlcclxuICAgIH1cclxuICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2NhcnQvJywgcHJvZHVjdClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xyXG4gICAgICAgIF9jYXJ0Q2FjaGUucHVzaChyZXNwLmRhdGEpO1xyXG4gICAgICAgIF91cGRhdGVJbmZvKCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3AuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgY2FydE9iai51cGRhdGVRdHkgPSBmdW5jdGlvbihsaW5lSXRlbUlkLCBxdHkpIHtcclxuICAgIGlmIChxdHkgPT0gMCkgcmV0dXJuIGNhcnRPYmoucmVtb3ZlSXRlbShsaW5lSXRlbUlkKTtcclxuICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvY2FydC8nICsgbGluZUl0ZW1JZCwge1xyXG4gICAgICAgIHF1YW50aXR5OiBxdHlcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xyXG4gICAgICAgIF9jYXJ0Q2FjaGVbX2ZpbmRJbkNhcnQobGluZUl0ZW1JZCldLnF1YW50aXR5ID0gcXR5O1xyXG4gICAgICAgIF91cGRhdGVJbmZvKCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3AuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgY2FydE9iai5yZW1vdmVJdGVtID0gZnVuY3Rpb24obGluZUl0ZW1JZCkge1xyXG4gICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9jYXJ0LycgKyBsaW5lSXRlbUlkKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwKSB7XHJcbiAgICAgICAgX2NhcnRDYWNoZS5zcGxpY2UoX2ZpbmRJbkNhcnQobGluZUl0ZW1JZCksIDEpO1xyXG4gICAgICAgIF91cGRhdGVJbmZvKCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3AuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgY2FydE9iai5jbGVhciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9jYXJ0L3JlbW92ZS8nICsgX2NhcnRJZClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24oZGVsZXRlZF9jYXJ0KSB7XHJcbiAgICAgICAgX2NhcnRDYWNoZSA9IFtdO1xyXG4gICAgICAgIF9jYXJ0SW5mby5zdWJ0b3RhbCA9IDAsXHJcbiAgICAgICAgX2NhcnRJbmZvLm51bWJlck9mSXRlbXMgPSAwXHJcbiAgICAgICAgY29uc29sZS5sb2coZGVsZXRlZF9jYXJ0KTtcclxuICAgICAgICByZXR1cm4gZGVsZXRlZF9jYXJ0O1xyXG4gICAgICB9KVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBjYXJ0T2JqO1xyXG59KTsiLCJcclxuXHJcbmFwcC5mYWN0b3J5KCdDYXRlZ29yeUZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gIHZhciBjYXRPYmogPSB7fTtcclxuXHJcbiAgY2F0T2JqLmdldEFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2F0ZWdvcmllcy8nKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICBjYXRPYmouZ2V0T25lID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2F0ZWdvcmllcy8nICsgaWQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGNhdE9iai5nZXRQcm9kdWN0cyA9IGZ1bmN0aW9uKGlkKXtcclxuXHJcbiAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2NhdGVnb3JpZXMvJyArIGlkKycvcHJvZHVjdHMnKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIHJldHVybiBjYXRPYmo7XHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjaGVja291dCcsIHtcclxuXHRcdFx0YWJzdHJhY3Q6IHRydWUsXHJcblx0XHRcdHVybDogJy9jaGVja291dCcsXHJcblx0XHRcdGNvbnRyb2xsZXI6ICdjaGVja091dEN0cmwnLFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ2pzL2NoZWNrb3V0L2NoZWNrb3V0Lmh0bWwnXHJcblx0XHR9KVxyXG5cdFx0LnN0YXRlKCdjaGVja291dC5hZGRyZXNzJywge1xyXG5cdFx0XHR1cmw6ICcvYWRkcmVzcycsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnanMvY2hlY2tvdXQvYWRkcmVzc0Zvcm0uaHRtbCcsXHJcblx0XHRcdGNvbnRyb2xsZXI6ICdhZGRyZXNzQ3RybCcsXHJcblx0XHRcdHJlc29sdmU6IHtcclxuXHRcdFx0XHRjdXJyZW50OiBmdW5jdGlvbihDaGVja291dEZhY3RvcnkpIHtcclxuXHRcdFx0XHRcdHJldHVybiBDaGVja291dEZhY3RvcnkuZ2V0U3RhdGUoKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdC8vIG9yZGVyOiBmdW5jdGlvbihDaGVja291dEZhY3RvcnkpIHtcclxuXHRcdFx0XHQvLyBcdHJldHVybiBDaGVja291dEZhY3RvcnkuY3JlYXRlT3JkZXIoKTtcclxuXHRcdFx0XHQvLyB9XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0XHQuc3RhdGUoJ2NoZWNrb3V0LnBheW1lbnQnLCB7XHJcblx0XHRcdHVybDogJy9wYXltZW50JyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdqcy9jaGVja291dC9wYXltZW50Rm9ybS5odG1sJ1xyXG5cdFx0fSlcclxuXHRcdC5zdGF0ZSgnY2hlY2tvdXQucmV2aWV3Jywge1xyXG5cdFx0XHR1cmw6ICcvcmV2aWV3JyxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdqcy9jaGVja291dC9yZXZpZXcuaHRtbCdcclxuXHRcdH0pXHJcblx0XHQuc3RhdGUoJ2NoZWNrb3V0LmNvbXBsZXRlJywge1xyXG5cdFx0dXJsOiAnL2NvbXBsZXRlJyxcclxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY2hlY2tvdXQvY29tcGxldGUuaHRtbCdcclxuXHRcdH0pXHJcblx0JHVybFJvdXRlclByb3ZpZGVyLndoZW4oJy9jaGVja291dCcsICcvY2hlY2tvdXQvYWRkcmVzcycpLm90aGVyd2lzZSgnL2NoZWNrb3V0L2FkZHJlc3MnKTtcclxufSkucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICR1cmxSb3V0ZXIsICRsb2NhdGlvbiwgJHN0YXRlKSB7XHJcblx0Ly8gaW50ZXJjZXB0IGVhY2ggc3RhdGUgY2hhbmdlXHJcblx0JHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihlLCB0b1N0YXRlLCB0b1BhcmFtcykge1xyXG5cdFx0aWYgKCRsb2NhdGlvbi51cmwoKSA9PT0gJy9jaGVja291dC9hZGRyZXNzJyAmJiB0b1BhcmFtcy5pbmRleE9mKCdhZGRyZXNzJykgPT09IC0xKSB7XHJcblx0XHRcdCRzdGF0ZS5yZWxvYWQodHJ1ZSkgLy8gaWYgYWJvdmUgaXMgdHJ1ZSwgcmVsb2FkIHN0YXRlLlxyXG5cdFx0XHQkdXJsUm91dGVyLnN5bmMoKTtcclxuXHRcdH1cclxuXHR9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignYWRkcmVzc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGN1cnJlbnQpIHtcclxuXHQkc2NvcGUuY3VycmVudFN0YXRlID0gY3VycmVudDtcclxufSlcclxuXHJcbmFwcC5jb250cm9sbGVyKCdjaGVja091dEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgQ2hlY2tvdXRGYWN0b3J5LCBDYXJ0RmFjdG9yeSkge1xyXG5cdHZhciBzdGF0ZUlkeCA9IDA7XHJcblx0dmFyIGN1cnJlbnRPcmRlcjtcclxuXHQkc2NvcGUuY3VycmVudFN0YXRlID0gQ2hlY2tvdXRGYWN0b3J5LmdldFN0YXRlKCk7XHJcblx0XHJcblx0aWYgKCRzY29wZS5jdXJyZW50U3RhdGUuc3RhdGUgIT0gJHN0YXRlLmN1cnJlbnQubmFtZSkge1xyXG5cdFx0JHN0YXRlLmdvKCRzY29wZS5jdXJyZW50U3RhdGUuc3RhdGUpO1x0XHJcblx0fVxyXG5cdFxyXG5cdCRzY29wZS5uZXh0ID0gZnVuY3Rpb24oaW5mbywgZm9ybSkge1xyXG5cdFx0aWYgKGluZm8gJiYgZm9ybS4kdmFsaWQpIHtcclxuXHRcdFx0Y3VycmVudE9yZGVyID0gQ2hlY2tvdXRGYWN0b3J5LmdldE9yZGVyKCk7XHJcblx0XHRcdENoZWNrb3V0RmFjdG9yeS5zYXZlU3RhdGUoaW5mbywgJHNjb3BlLmNhcnQsICRzY29wZS5jYXJ0SW5mbyk7XHJcblx0XHRcdENoZWNrb3V0RmFjdG9yeS5zZXRJZHgoKytzdGF0ZUlkeCk7XHJcblx0XHRcdCRzY29wZS5jdXJyZW50U3RhdGUgPSBDaGVja291dEZhY3RvcnkuZ2V0U3RhdGUoKTtcclxuXHRcdFx0JHN0YXRlLmdvKCRzY29wZS5jdXJyZW50U3RhdGUuc3RhdGUpXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0JHNjb3BlLnByZXZpb3VzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRDaGVja291dEZhY3Rvcnkuc2V0SWR4KC0tc3RhdGVJZHgpO1xyXG5cdFx0JHNjb3BlLmN1cnJlbnRTdGF0ZSA9IENoZWNrb3V0RmFjdG9yeS5nZXRTdGF0ZSgpO1xyXG5cdFx0JHN0YXRlLmdvKCRzY29wZS5jdXJyZW50U3RhdGUuc3RhdGUpO1xyXG5cdH1cclxuXHJcblx0JHNjb3BlLnBsYWNlT3JkZXIgPSBmdW5jdGlvbigpIHtcclxuXHQgXHRDaGVja291dEZhY3RvcnkucGxhY2VPcmRlcigpXHJcblx0IFx0XHQudGhlbihmdW5jdGlvbihvcmRlcikge1xyXG5cdCBcdFx0XHQkc2NvcGUuY2FydCA9IFtdO1xyXG5cdCBcdFx0XHRDaGVja291dEZhY3Rvcnkuc2V0SWR4KCsrc3RhdGVJZHgpO1xyXG5cdFx0XHRcdCRzY29wZS5jdXJyZW50U3RhdGUgPSBDaGVja291dEZhY3RvcnkuZ2V0U3RhdGUoKTtcclxuXHQgXHRcdFx0Q2FydEZhY3RvcnkuY2xlYXIoKVxyXG5cdCBcdFx0XHQkc3RhdGUuZ28oJHNjb3BlLmN1cnJlbnRTdGF0ZS5zdGF0ZSlcclxuXHQgXHRcdH0pXHJcblx0fVxyXG59KTtcclxuXHJcbmFwcC5mYWN0b3J5KCdDaGVja291dEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xyXG5cdHZhciBfc3RhdGVzID0gW3tcclxuXHRcdHN0YXRlOiAnY2hlY2tvdXQuYWRkcmVzcycsXHJcblx0XHR0aXRsZTogJ1NoaXBwaW5nIEluZm8nLFxyXG5cdFx0cHJvZ3Jlc3M6IDEwLFxyXG5cdFx0Zm9ybToge30sXHJcblx0XHRsaW5lSXRlbXM6IFtdLFxyXG5cdFx0Y2FydEluZm86IHt9XHJcblx0fSwge1xyXG5cdFx0c3RhdGU6ICdjaGVja291dC5wYXltZW50JyxcclxuXHRcdHRpdGxlOiAnUGF5bWVudCBJbmZvJyxcclxuXHRcdHByb2dyZXNzOiA2MCxcclxuXHRcdGZvcm06IHt9LFxyXG5cdFx0bGluZUl0ZW1zOiBbXSxcclxuXHRcdGNhcnRJbmZvOiB7fVxyXG5cdH0sIHtcclxuXHRcdHN0YXRlOiAnY2hlY2tvdXQucmV2aWV3JyxcclxuXHRcdHRpdGxlOiAnUmV2aWV3IE9yZGVyJyxcclxuXHRcdHByb2dyZXNzOiA5MCxcclxuXHRcdGZvcm06IHt9XHJcblx0fSwge1xyXG5cdFx0c3RhdGU6ICdjaGVja291dC5jb21wbGV0ZScsXHJcblx0XHR0aXRsZTogJ09yZGVyIFBsYWNlZCcsXHJcblx0XHRwcm9ncmVzczogMTAwLFxyXG5cdFx0Zm9ybToge31cclxuXHR9XTtcclxuXHR2YXIgX3N0YXRlSWR4ID0gMDtcclxuXHR2YXIgX29yZGVyO1xyXG5cdHZhclx0X3VwZGF0ZU9iaiA9IHtcclxuXHRcdGxpbmVJdGVtczogW10sXHJcblx0XHRzdWJ0b3RhbDogMCxcclxuXHRcdHRvdGFsOiAwLFxyXG5cdFx0YmlsbGluZ0FkZHJlc3M6IG51bGwsXHJcblx0XHRzaGlwcGluZ0FkZHJlc3M6IG51bGwsXHJcblx0XHRzdGF0dXM6IG51bGxcclxuXHR9O1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0cGxhY2VPcmRlcjogZnVuY3Rpb24oKSB7XHJcblx0XHRcdF91cGRhdGVPYmouc3RhdHVzID0gJ2NvbXBsZXRlJztcclxuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvb3JkZXJzLycsIF91cGRhdGVPYmopXHJcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ob3JkZXIpIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKG9yZGVyKVxyXG5cdFx0XHRcdFx0cmV0dXJuIG9yZGVyLmRhdGE7XHJcblx0XHRcdFx0fSlcclxuXHRcdH0sXHJcblx0XHRcclxuXHRcdGdldFN0YXRlOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIF9zdGF0ZXNbX3N0YXRlSWR4XTtcclxuXHRcdH0sXHJcblxyXG5cdFx0c2F2ZVN0YXRlOiBmdW5jdGlvbihmb3JtLCBsaW5lSXRlbXMsIGNhcnRJbmZvKSB7XHJcblx0XHRcdHZhciBhZGRyT2JqID0ge1xyXG5cdFx0XHRcdG5hbWU6IGZvcm0uZmlyc3ROYW1lICsgJyAnICsgZm9ybS5sYXN0TmFtZSxcclxuXHRcdFx0XHRzdHJlZXQ6IGZvcm0uYWRkcmVzcyxcclxuXHRcdFx0XHRjaXR5OiBmb3JtLmNpdHksXHJcblx0XHRcdFx0c3RhdGU6IGZvcm0uc3RhdGUsXHJcblx0XHRcdFx0Y291bnRyeTogZm9ybS5jb3VudHJ5LFxyXG5cdFx0XHRcdHBvc3RhbDogZm9ybS56aXAsXHJcblx0XHRcdFx0ZW1haWw6IGZvcm0uZW1haWxcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGNhcnRJbmZvLnN1YnRvdGFsICE9PSBfdXBkYXRlT2JqLnN1YnRvdGFsKSB7XHJcblx0XHRcdFx0bGluZUl0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG5cdFx0XHRcdFx0X3VwZGF0ZU9iai5saW5lSXRlbXMucHVzaCh7XHJcblx0XHRcdFx0XHRcdHByb2R1Y3RJZDogaXRlbS5wcm9kdWN0SWQuX2lkLFxyXG5cdFx0XHRcdFx0XHRxdWFudGl0eTogaXRlbS5xdWFudGl0eSxcclxuXHRcdFx0XHRcdFx0bmFtZTogaXRlbS5wcm9kdWN0SWQubmFtZSxcclxuXHRcdFx0XHRcdFx0cHJpY2U6IGl0ZW0ucHJvZHVjdElkLnByaWNlXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRfdXBkYXRlT2JqLnN1YnRvdGFsID0gY2FydEluZm8uc3VidG90YWw7XHJcblx0XHRcdFx0X3VwZGF0ZU9iai50b3RhbCA9IGNhcnRJbmZvLnN1YnRvdGFsICsgNTtcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGlmIChfc3RhdGVJZHggPT09IDApIHtcclxuXHRcdFx0XHRhZGRyT2JqLnR5cGUgPSAnc2hpcHBpbmcnO1xyXG5cdFx0XHRcdF91cGRhdGVPYmouc2hpcHBpbmdBZGRyZXNzID0gYWRkck9iajtcclxuXHRcdFx0fSBlbHNlIGlmIChfc3RhdGVJZHggPT09IDEgJiYgIWZvcm0uYmlsbGluZ0FkZHJlc3NOb3ROZWVkZWQpIHtcclxuXHRcdFx0XHRhZGRyT2JqLnR5cGUgPSAnYmlsbGluZyc7XHJcblx0XHRcdFx0X3VwZGF0ZU9iai5iaWxsaW5nQWRkcmVzcyA9IGFkZHJPYmo7XHJcblx0XHRcdH07XHJcblx0XHRcdF9zdGF0ZXNbX3N0YXRlSWR4XS5mb3JtID0gZm9ybTtcclxuXHRcdFx0aWYgKF9zdGF0ZUlkeCA9PT0gMCkge1xyXG5cdFx0XHRcdF9zdGF0ZXNbMl0uZm9ybSA9IF9zdGF0ZXNbMF0uZm9ybVxyXG5cdFx0XHR9XHJcblx0XHRcdF9zdGF0ZUlkeCsrO1xyXG5cdFx0fSxcclxuXHRcdGdldE9yZGVyOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIF9vcmRlcjtcclxuXHRcdH0sXHJcblx0XHRzZXRJZHg6IGZ1bmN0aW9uKGlkeCkge1xyXG5cdFx0XHRfc3RhdGVJZHggPSBpZHg7XHJcblx0XHRcdHJldHVybiBfc3RhdGVJZHg7XHJcblx0XHR9LFxyXG5cdFx0Y3JlYXRlT3JkZXI6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZiAoIV9vcmRlciB8fCBfb3JkZXIuc3RhdHVzID09PSAnY29tcGxldGUnKSB7XHJcblx0XHRcdFx0Ly8gY3JlYXRlIGEgbmV3IG9yZGVyXHJcblx0XHRcdFx0JGh0dHAucG9zdCgnL2FwaS9vcmRlcnMnKVxyXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ob3JkZXIpIHtcclxuXHRcdFx0XHRcdFx0X29yZGVyID0gb3JkZXIuZGF0YTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIG9yZGVyLmRhdGE7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gX29yZGVyO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59KVxyXG5cclxuYXBwLmRpcmVjdGl2ZSgnY2hlY2tvdXRDYXJ0RGV0YWlscycsIGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB7XHJcblx0XHRyZXN0cmljdDogJ0UnLFxyXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9jaGVja291dC9jaGVja291dERldGFpbC5odG1sJyxcclxuXHRcdGNvbnRyb2xsZXI6ICdDYXJ0Q3RybCdcclxuXHR9XHJcbn0pXHJcblxyXG5hcHAuZGlyZWN0aXZlKCdjaGVja291dEZvcm0nLCBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4ge1xyXG5cdFx0cmVzdHJpY3Q6ICdFJyxcclxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY2hlY2tvdXQvY2hlY2tvdXRGb3JtLmh0bWwnLFxyXG5cdFx0Y29udHJvbGxlcjogJ2NoZWNrT3V0Q3RybCdcclxuXHR9XHJcbn0pXHJcblxyXG5hcHAuZGlyZWN0aXZlKCdhZGRyZXNzRm9ybScsIGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB7XHJcblx0XHRyZXN0cmljdDogJ0UnLFxyXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9jaGVja291dC9hZGRyZXNzRm9ybS5odG1sJ1xyXG5cdH1cclxufSlcclxuXHJcbmFwcC5kaXJlY3RpdmUoJ2JpbGxpbmdBZGRyZXNzRm9ybScsIGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB7XHJcblx0XHRyZXN0cmljdDogJ0UnLFxyXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9jaGVja291dC9iaWxsaW5nQWRkcmVzc0Zvcm0uaHRtbCdcclxuXHR9XHJcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcclxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xyXG4gICAgICAgIHVybDogJy9kb2NzJyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2RvY3MvZG9jcy5odG1sJ1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXHJcbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XHJcblxyXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcclxuXHJcbiAgICBhcHAuZmFjdG9yeSgnU29ja2V0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXHJcbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxyXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cclxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XHJcbiAgICAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcclxuICAgICAgICAvL25lZWRzUGFzc1Jlc2V0OidhdXRoLW5lZWRzLXBhc3MtcmVzZXQnLFxyXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxyXG4gICAgICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcclxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcclxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXHJcbiAgICAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXHJcbiAgICB9KTtcclxuXHJcbiAgICBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xyXG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xyXG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXHJcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcclxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcclxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3Qoc3RhdHVzRGljdFtyZXNwb25zZS5zdGF0dXNdLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIGFwcC5jb25maWcoZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHtcclxuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcclxuICAgICAgICAgICAgJyRpbmplY3RvcicsXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgkaW5qZWN0b3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24gKCRodHRwLCBTZXNzaW9uLCAkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUywgJHEpIHtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZ1bmN0aW9uIGNoZWNrUFIodXNlcil7XHJcbiAgICAgICAgLy8gICAgIGlmKHVzZXIucmVzZXRwYXNzKXtcclxuICAgICAgICAvLyAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5uZWVkc1Bhc3NSZXNldCk7XHJcbiAgICAgICAgLy8gICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xyXG4gICAgICAgIC8vICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XHJcbiAgICAgICAgLy8gICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXHJcbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxyXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmlzQWRtaW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmKFNlc3Npb24udXNlcil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXIuYWRtaW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbiAoZnJvbVNlcnZlcikge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcclxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxyXG4gICAgICAgICAgICAvLyB3aXRoIGEgcHJvbWlzZS4gVGhpcyBlbnN1cmVzIHRoYXQgd2UgY2FuXHJcbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cclxuXHJcbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHksIGlmIHRydWUgaXMgZ2l2ZW4gYXMgdGhlIGZyb21TZXJ2ZXIgcGFyYW1ldGVyLFxyXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBmcm9tU2VydmVyICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxyXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cclxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXHJcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcclxuICAgICAgICAgICAgICAgIC8vIC50aGVuKGNoZWNrUFIpXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9tZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGVyci5kYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX21lc3NhZ2U9ZXJyLmRhdGFcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiBfbWVzc2FnZSB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xyXG5cclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcclxuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcclxuICAgICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgfSk7XHJcblxyXG59KSgpO1xyXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xyXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XHJcbiAgICAgICAgdXJsOiAnLycsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvcHJvZHVjdHMvcHJvZHVjdHMuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ1Byb2R1Y3RDdHJsJyxcclxuICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICBwcm9kdWN0czogZnVuY3Rpb24oUHJvZHVjdEZhY3RvcnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldEFsbCgpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGNhdGVnb3JpZXM6IGZ1bmN0aW9uKENhdGVnb3J5RmFjdG9yeSl7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIENhdGVnb3J5RmFjdG9yeS5nZXRBbGwoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xyXG5cclxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcclxuICAgICAgICB1cmw6ICcvbG9naW4nLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcclxuICAgIH0pO1xyXG5cclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xyXG5cclxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xyXG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcclxuXHJcbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xyXG5cclxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xyXG5cclxuICAgICAgICBBdXRoU2VydmljZS5sb2dpbihsb2dpbkluZm8pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcclxuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9IGVyci5tZXNzYWdlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH07XHJcblxyXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xyXG5cclxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcclxuICAgICAgICB1cmw6ICcvbWVtYmVycy1hcmVhJyxcclxuICAgICAgICB0ZW1wbGF0ZTogJzxpbWcgbmctcmVwZWF0PVwiaXRlbSBpbiBzdGFzaFwiIHdpZHRoPVwiMzAwXCIgbmctc3JjPVwie3sgaXRlbSB9fVwiIC8+JyxcclxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xyXG4gICAgICAgICAgICBTZWNyZXRTdGFzaC5nZXRTdGFzaCgpLnRoZW4oZnVuY3Rpb24gKHN0YXNoKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3Rhc2ggPSBzdGFzaDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRhdGEuYXV0aGVudGljYXRlIGlzIHJlYWQgYnkgYW4gZXZlbnQgbGlzdGVuZXJcclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG5cclxuYXBwLmZhY3RvcnkoJ1NlY3JldFN0YXNoJywgZnVuY3Rpb24gKCRodHRwKSB7XHJcblxyXG4gICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9zZWNyZXQtc3Rhc2gnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRTdGFzaDogZ2V0U3Rhc2hcclxuICAgIH07XHJcblxyXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXJcclxuICAgIC5zdGF0ZSgnb3JkZXJzJywge1xyXG4gICAgICB1cmw6ICcvb3JkZXJzJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICcvanMvb3JkZXJzL29yZGVycy5oaXN0b3J5Lmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnT3JkZXJzQ3RybCcsXHJcbiAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICBpc0xvZ2dlZEluOiBmdW5jdGlvbihBdXRoU2VydmljZSkge1xyXG4gICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3JkZXJzOiBmdW5jdGlvbihPcmRlckZhY3RvcnkpIHtcclxuICAgICAgICAgIHJldHVybiBPcmRlckZhY3RvcnkuZmV0Y2hBbGwoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ29yZGVyJywge1xyXG4gICAgICB1cmw6ICcvb3JkZXIvOm9yZGVySWQnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJy9qcy9vcmRlcnMvb3JkZXJzLmRldGFpbC5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ09yZGVyRGV0YWlsQ3RybCcsXHJcbiAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICBvcmRlcjogZnVuY3Rpb24oT3JkZXJGYWN0b3J5LCAkc3RhdGVQYXJhbXMpIHtcclxuICAgICAgICAgIHJldHVybiBPcmRlckZhY3RvcnkuZmV0Y2hPbmUoJHN0YXRlUGFyYW1zLm9yZGVySWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNMb2dnZWRJbjogZnVuY3Rpb24oQXV0aFNlcnZpY2UpIHtcclxuICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbn0pXHJcblxyXG5hcHAuY29udHJvbGxlcignT3JkZXJzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgb3JkZXJzLCBpc0xvZ2dlZEluLCBDYXJ0RmFjdG9yeSkge1xyXG4gICRzY29wZS5vcmRlcnMgPSBvcmRlcnM7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ09yZGVyRGV0YWlsQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgb3JkZXIsIGlzTG9nZ2VkSW4sIENhcnRGYWN0b3J5KSB7XHJcbiAgJHNjb3BlLm9yZGVyID0gb3JkZXI7XHJcbn0pO1xyXG5cclxuXHJcbmFwcC5mYWN0b3J5KCdPcmRlckZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gIHZhciBvcmRlck9iaiA9IHt9O1xyXG5cclxuICBvcmRlck9iai5mZXRjaEFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9vcmRlcnMvJylcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgb3JkZXJPYmouZ2V0QWRtaW5BbGwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvb3JkZXJzL2FsbCcpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIG9yZGVyT2JqLmdldEJ5VHlwZSA9IGZ1bmN0aW9uKHN0YXR1cykge1xyXG4gICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9vcmRlcnMvYWxsJylcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG9yZGVycyl7XHJcbiAgICAgICAgdmFyIGZpbHRlcmVkT3JkZXJzPW9yZGVycy5maWx0ZXIoZnVuY3Rpb24ob3JkZXIpe1xyXG5cclxuICAgICAgICAgIGlmIChvcmRlci5zdGF0dXM9PXN0YXR1cykge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBmaWx0ZXJlZE9yZGVycztcclxuICAgICAgfSlcclxuICB9O1xyXG5cclxuICBvcmRlck9iai5mZXRjaE9uZSA9IGZ1bmN0aW9uKG9yZGVySWQpIHtcclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvb3JkZXJzLycgKyBvcmRlcklkKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICBvcmRlck9iai51cGRhdGUgPSBmdW5jdGlvbihvcmRlcikge1xyXG4gICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvb3JkZXJzLycgKyBvcmRlci5faWQsIHtcInN0YXR1c1wiOm9yZGVyLnN0YXR1c30pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oX29yZGVyKSB7XHJcbiAgICAgICAgICByZXR1cm4gX29yZGVyLmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIHJldHVybiBvcmRlck9iajtcclxufSk7XHJcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XHJcblxyXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Bhc3NyZXNldCcsIHtcclxuICAgICAgICB1cmw6ICcvcGFzc3Jlc2V0JyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Bhc3N3b3JkcmVzZXQvcGFzc3dvcmRyZXNldC5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiAncGFzc0N0cmwnLFxyXG4gICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgdXNlcjogbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ3Bhc3NDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlckZhY3RvcnksICRzdGF0ZSwgJHN0YXRlUGFyYW1zKSB7XHJcblxyXG5cclxuICAgICRzY29wZS5zZW5kUGFzcyA9IGZ1bmN0aW9uIChwYXNzKSB7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzdGF0ZVBhcmFtcy51c2VyKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhwYXNzLm5ldyk7XHJcbiAgICAgICAgdmFyIF91c2VyPSRzdGF0ZVBhcmFtcy51c2VyO1xyXG4gICAgICAgIF91c2VyLnBhc3N3b3JkcmVzZXQ9ZmFsc2U7XHJcbiAgICAgICAgX3VzZXIucGFzc3dvcmQ9cGFzcy5uZXc7XHJcblxyXG4gICAgICAgIHJldHVybiBVc2VyRmFjdG9yeS51cGRhdGUoX3VzZXIpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmV0dXJuZWQgdXNlcjonLHVzZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2R1Y3RzJywge1xyXG4gICAgdXJsOiAnL3Byb2R1Y3RzJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnL2pzL3Byb2R1Y3RzL3Byb2R1Y3RzLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1Byb2R1Y3RDdHJsJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgcHJvZHVjdHM6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldEFsbCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBjYXRlZ29yaWVzOiBmdW5jdGlvbihDYXRlZ29yeUZhY3Rvcnkpe1xyXG4gICAgICAgICAgcmV0dXJuIENhdGVnb3J5RmFjdG9yeS5nZXRBbGwoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJvZHVjdCcsIHtcclxuICAgIHVybDogJy9wcm9kdWN0LzppZCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJy9qcy9wcm9kdWN0cy9wcm9kdWN0LmRldGFpbC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6J1Byb2R1Y3REZXRhaWxDdHJsJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgcHJvZHVjdDogZnVuY3Rpb24oUHJvZHVjdEZhY3RvcnksJHN0YXRlUGFyYW1zKSB7XHJcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldE9uZSgkc3RhdGVQYXJhbXMuaWQpO1xyXG4gICAgICB9LFxyXG4gICAgICByZXZpZXdzOiBmdW5jdGlvbihQcm9kdWN0RmFjdG9yeSwgJHN0YXRlUGFyYW1zKSB7XHJcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldFJldmlld3MoJHN0YXRlUGFyYW1zLmlkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJvZHVjdC5yZXZpZXdzJywge1xyXG4gICAgdXJsOiAnL3Jldmlld3MnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICcvanMvcHJvZHVjdHMvcHJvZHVjdC5yZXZpZXdzLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1Byb2R1Y3REZXRhaWxDdHJsJ1xyXG4gIH0pO1xyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJvZHVjdHNCeUNhdGVnb3J5Jywge1xyXG4gICAgdXJsOiAnL2NhdGVnb3J5LzppZC9wcm9kdWN0cycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJy9qcy9wcm9kdWN0cy9wcm9kdWN0cy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdQcm9kdWN0c0NhdEN0cmwnLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBwcm9kdWN0czogZnVuY3Rpb24oQ2F0ZWdvcnlGYWN0b3J5LCRzdGF0ZVBhcmFtcykge1xyXG4gICAgICAgIHJldHVybiBDYXRlZ29yeUZhY3RvcnkuZ2V0UHJvZHVjdHMoJHN0YXRlUGFyYW1zLmlkKTtcclxuICAgICAgfSxcclxuICAgICAgY2F0ZWdvcmllczogZnVuY3Rpb24oQ2F0ZWdvcnlGYWN0b3J5KXtcclxuICAgICAgICAgIHJldHVybiBDYXRlZ29yeUZhY3RvcnkuZ2V0QWxsKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbn0pO1xyXG5cclxuXHJcbmFwcC5jb250cm9sbGVyKCdQcm9kdWN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHVpYk1vZGFsLCAkZmlsdGVyLCAkc3RhdGUsIHByb2R1Y3RzLGNhdGVnb3JpZXMsQ2F0ZWdvcnlGYWN0b3J5LFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgJHNjb3BlLnByb2R1Y3RzID0gcHJvZHVjdHM7XHJcbiAgJHNjb3BlLmNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzO1xyXG4gICRzY29wZS5zdGF0ZSA9ICRzdGF0ZTtcclxuICAkc2NvcGUuc2VhcmNoUHJvZHVjdCA9ICcnO1xyXG4gIFxyXG4gICRzY29wZS5zZWFyY2hGb3IgPSBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiAkc2NvcGUuaW5wdXQ7XHJcbiAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICRzY29wZS5maWx0ZXJlZFByb2R1Y3RzID0gJGZpbHRlcignZmlsdGVyJykoJHNjb3BlLnByb2R1Y3RzLCAkc2NvcGUuc2VhcmNoVmFsdWUpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuICBcclxuICAkc2NvcGUub3Blbk1vZGFsID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9wcm9kdWN0cy9wcm9kdWN0LmRldGFpbC5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ1Byb2R1Y3REZXRhaWxDdHJsJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIHByb2R1Y3Q6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0T25lKGlkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJldmlld3M6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5KSB7XHJcbiAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0UmV2aWV3cyhpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignUHJvZHVjdHNDYXRDdHJsJywgZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCRzY29wZSwgcHJvZHVjdHMsIGNhdGVnb3JpZXMsICR1aWJNb2RhbCxDYXRlZ29yeUZhY3RvcnksUHJvZHVjdEZhY3RvcnkpIHtcclxuXHJcbiAgJHNjb3BlLnByb2R1Y3RzPXByb2R1Y3RzO1xyXG4gICRzY29wZS5jYXRlZ29yaWVzPWNhdGVnb3JpZXM7XHJcblxyXG4gICRzY29wZS5vcGVuTW9kYWwgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgJHVpYk1vZGFsLm9wZW4oe1xyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Byb2R1Y3RzL3Byb2R1Y3QuZGV0YWlsLmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnUHJvZHVjdERldGFpbEN0cmwnLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgcHJvZHVjdDogZnVuY3Rpb24oUHJvZHVjdEZhY3RvcnkpIHtcclxuICAgICAgICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5nZXRPbmUoaWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmV2aWV3czogZnVuY3Rpb24oUHJvZHVjdEZhY3RvcnkpIHtcclxuICAgICAgICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5nZXRSZXZpZXdzKGlkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1Byb2R1Y3REZXRhaWxDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBwcm9kdWN0LCByZXZpZXdzLCBDYXJ0RmFjdG9yeSwgUHJvZHVjdEZhY3RvcnkpIHtcclxuICAkc2NvcGUucHJvZHVjdCA9IHByb2R1Y3Q7XHJcbiAgJHNjb3BlLnNob3dSZXZpZXdGb3JtID0gZmFsc2U7XHJcbiAgJHNjb3BlLm5ld1JldmlldyA9IHt9O1xyXG4gICRzY29wZS5uZXdSZXZpZXcucHJvZHVjdElkID0gJHNjb3BlLnByb2R1Y3QuX2lkO1xyXG4gICRzY29wZS5yZXZpZXdMaW1pdCA9IDM7XHJcbiAgJHNjb3BlLnJldmlld3MgPSByZXZpZXdzO1xyXG5cclxuICAkc2NvcGUudG9nZ2xlUmV2aWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUuc2hvd1Jldmlld0Zvcm0gPSAhJHNjb3BlLnNob3dSZXZpZXdGb3JtO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS50b2dnbGVSZXZpZXdMaW1pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYoJHNjb3BlLnJldmlld0xpbWl0ID09PSAzKSAkc2NvcGUucmV2aWV3TGltaXQgPSAkc2NvcGUucmV2aWV3cy5sZW5ndGg7XHJcbiAgICBlbHNlICRzY29wZS5yZXZpZXdMaW1pdCA9IDM7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmFkZFJldmlldyA9IGZ1bmN0aW9uKHByb2R1Y3QsIHJldmlldykge1xyXG4gICAgUHJvZHVjdEZhY3RvcnkuYWRkUmV2aWV3KHByb2R1Y3QsIHJldmlldylcclxuICAgIC50aGVuKGZ1bmN0aW9uKG5ld1Jldmlldykge1xyXG4gICAgICAkc2NvcGUucmV2aWV3cy51bnNoaWZ0KG5ld1Jldmlldyk7XHJcbiAgICAgICRzY29wZS5hdmdSZXZpZXcgPSBnZXRBdmdSZXZpZXcoKTtcclxuICAgICAgJHNjb3BlLm5ld1JldmlldyA9IHt9O1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm51bVJldmlld3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkc2NvcGUucmV2aWV3cy5sZW5ndGg7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGdldEF2Z1JldmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUucmV2aWV3cy5sZW5ndGgpIHJldHVybiAwO1xyXG5cclxuICAgIHZhciByYXRpbmdUb3RhbCA9IDA7XHJcbiAgICAkc2NvcGUucmV2aWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHJldmlldykge1xyXG4gICAgICByYXRpbmdUb3RhbCArPSByZXZpZXcuc3RhcnM7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByYXRpbmdUb3RhbC8kc2NvcGUucmV2aWV3cy5sZW5ndGg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmF2Z1JldmlldyA9IGdldEF2Z1JldmlldygpO1xyXG5cclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignUHJvZHVjdERldGFpbE1vZGFsQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgcHJvZHVjdCwgQ2FydEZhY3RvcnksIFByb2R1Y3RGYWN0b3J5LCRzdGF0ZSwkdWliTW9kYWxJbnN0YW5jZSxjYXRlZ29yaWVzKSB7XHJcbiAgJHNjb3BlLnByb2R1Y3QgPSBwcm9kdWN0O1xyXG4gICRzY29wZS5jYXRlZ29yaWVzPWNhdGVnb3JpZXM7XHJcblxyXG4gICRzY29wZS5lZGl0UHJvZHVjdCA9IGZ1bmN0aW9uKHByb2R1Y3Qpe1xyXG4gICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LnVwZGF0ZShwcm9kdWN0KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbih1cGRhdGVkUHJvZHVjdCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlZCBwcm9kdWN0IGlzJywgdXBkYXRlZFByb2R1Y3QpO1xyXG4gICAgICAgICAgICAgICAgICR1aWJNb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xyXG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdwcm9kdWN0Jyx7aWQ6dXBkYXRlZFByb2R1Y3QuX2lkfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5hZGRDYXRlZ29yeSA9IGZ1bmN0aW9uKGNhdCl7XHJcbiAgICAkc2NvcGUucHJvZHVjdC5jYXRlZ29yeS5wdXNoKGNhdCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnJlbW92ZUNhdGVnb3J5ID0gZnVuY3Rpb24oY2F0KXtcclxuICAgIHZhciBpID0gJHNjb3BlLnByb2R1Y3QuY2F0ZWdvcnkuaW5kZXhPZihjYXQpO1xyXG4gICAgJHNjb3BlLnByb2R1Y3QuY2F0ZWdvcnkuc3BsaWNlKGksIDEpO1xyXG5cclxuICB9O1xyXG5cclxufSk7XHJcblxyXG5hcHAuZmFjdG9yeSgnUHJvZHVjdEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gIHZhciBwcm9kdWN0T2JqO1xyXG4gIHZhciBfcHJvZHVjdENhY2hlID0gW107XHJcblxyXG4gIHByb2R1Y3RPYmogPSB7XHJcbiAgICBnZXRBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Byb2R1Y3RzJylcclxuICAgICAgICAudGhlbihmdW5jdGlvbihwcm9kdWN0cykge1xyXG4gICAgICAgICAgYW5ndWxhci5jb3B5KHByb2R1Y3RzLmRhdGEsIF9wcm9kdWN0Q2FjaGUpO1xyXG4gICAgICAgICAgcmV0dXJuIF9wcm9kdWN0Q2FjaGU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE9uZTogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9wcm9kdWN0cy8nICsgaWQpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocHJvZHVjdCkge1xyXG4gICAgICAgICAgcmV0dXJuIHByb2R1Y3QuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgYWRkOiBmdW5jdGlvbihwcm9kdWN0KSB7XHJcbiAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIHVybDogJy9hcGkvcHJvZHVjdHMvJyxcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgZGF0YTogcHJvZHVjdFxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKF9wcm9kdWN0KSB7XHJcbiAgICAgICAgICByZXR1cm4gX3Byb2R1Y3QuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgZGVsZXRlOiBmdW5jdGlvbihpZCl7XHJcbiAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvcHJvZHVjdHMvJyArIGlkKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHByb2R1Y3QpIHtcclxuICAgICAgICAgIHJldHVybiBwcm9kdWN0LmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNvZnREZWxldGU6IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgLy9ub3RlIC0gc29mdCBkZWxldGUgYWxzbyBzZXRzIGF2YWlsYWJsZSB0byBmYWxzZVxyXG4gICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBpL3Byb2R1Y3RzLycgKyBpZCxcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBVVFwiLFxyXG4gICAgICAgICAgICBkYXRhOiB7ZGVsZXRlZDp0cnVlfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocHJvZHVjdCkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2cocHJvZHVjdClcclxuICAgICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIHVybDogJy9hcGkvcHJvZHVjdHMvJyArIHByb2R1Y3QuZGF0YS5faWQsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcclxuICAgICAgICAgICAgZGF0YToge2F2YWlsYWJsZTpmYWxzZX1cclxuICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocHJvZHVjdCkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2cocHJvZHVjdClcclxuICAgICAgICAgIHJldHVybiBwcm9kdWN0LmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRvZ2dsZTogZnVuY3Rpb24oaWQsYXZhaWxhYmxlKXtcclxuICAgICAgaWYoYXZhaWxhYmxlKXtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBpL3Byb2R1Y3RzLycgKyBpZCxcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBVVFwiLFxyXG4gICAgICAgICAgICBkYXRhOiB7YXZhaWxhYmxlOmZhbHNlfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocHJvZHVjdCkge1xyXG4gICAgICAgICAgcmV0dXJuIHByb2R1Y3QuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICB1cmw6ICcvYXBpL3Byb2R1Y3RzLycgKyBpZCxcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBVVFwiLFxyXG4gICAgICAgICAgICBkYXRhOiB7YXZhaWxhYmxlOnRydWV9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihwcm9kdWN0KSB7XHJcbiAgICAgICAgICByZXR1cm4gcHJvZHVjdC5kYXRhO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKHByb2R1Y3QpIHtcclxuICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS9wcm9kdWN0cy8nICsgcHJvZHVjdC5faWQsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcclxuICAgICAgICAgICAgZGF0YTogcHJvZHVjdFxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKF9wcm9kdWN0KSB7XHJcbiAgICAgICAgICByZXR1cm4gX3Byb2R1Y3QuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0UmV2aWV3czogZnVuY3Rpb24ocHJvZHVjdElkKSB7XHJcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvcHJvZHVjdHMvJyArIHByb2R1Y3RJZCArICcvcmV2aWV3cycpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJldmlld3MpIHtcclxuICAgICAgICByZXR1cm4gcmV2aWV3cy5kYXRhO1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgYWRkUmV2aWV3OiBmdW5jdGlvbihwcm9kdWN0LCByZXZpZXcpIHtcclxuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcHJvZHVjdHMvJyArIHByb2R1Y3QuX2lkICsgJy9yZXZpZXdzJywgcmV2aWV3KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihfcmV2aWV3KSB7XHJcbiAgICAgICAgcmV0dXJuIF9yZXZpZXcuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIHJldHVybiBwcm9kdWN0T2JqO1xyXG59KTtcclxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcclxuXHJcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndXNlckNyZWF0ZScsIHtcclxuICAgICAgICB1cmw6ICcvdXNlci9jcmVhdGUnLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdXNlci9jcmVhdGV1c2VyLmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyQ3RybCdcclxuICAgIH0pO1xyXG5cclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignVXNlckN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XHJcbiAgICAkc2NvcGUuY3JlYXRlVXNlciA9IHt9O1xyXG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcclxuXHJcbiAgICAkc2NvcGUuc2VuZENyZWF0ZVVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgaWYgKHVzZXIucGFzc3dvcmQxICE9IHVzZXIucGFzc3dvcmQyKSAge1xyXG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBcIlBhc3N3b3JkcyBkbyBub3QgbWF0Y2hcIjtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXNlci5lbWFpbCAmJiB1c2VyLnBhc3N3b3JkMSAmJiB1c2VyLnBhc3N3b3JkMikge1xyXG4gICAgICAgICAgICB2YXIgdXNlck9iaiA9IHtcclxuICAgICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHVzZXIucGFzc3dvcmQxXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBVc2VyRmFjdG9yeS5jcmVhdGVVc2VyKHVzZXJPYmopXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIuc3RhdHVzID09PSA0MDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0VtYWlsIGFscmVhZHkgZXhpc3RzLic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgVXNlciBjcmVkZW50aWFscy4nO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ1BsZWFzZSBmaWxsIGluIGFsbCB0aGUgZmllbGRzLic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSk7XHJcblxyXG5hcHAuZmFjdG9yeSgnVXNlckZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gICAgdmFyIFVzZXJGYWN0b3J5ID0ge307XHJcblxyXG4gICAgVXNlckZhY3RvcnkuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKHVzZXIpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2VyLycsIHVzZXIpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgfSlcclxuICAgIH07XHJcblxyXG4gICAgVXNlckZhY3RvcnkuZ2V0QWxsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZygnZ2V0dGluZyBhbGwgY2F0cycpO1xyXG5cclxuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdXNlci8nKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICBVc2VyRmFjdG9yeS5nZXRPbmUgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2VyLycgKyBpZClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgVXNlckZhY3RvcnkudXBkYXRlID0gZnVuY3Rpb24odXNlcil7XHJcbiAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIHVybDogJy9hcGkvdXNlci8nICsgdXNlci5faWQsXHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcclxuICAgICAgICAgICAgZGF0YTogdXNlclxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKF91c2VyKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlIHB1dCBvbiB1c2VyIHJlc3BvbnNlOicsIF91c2VyKTtcclxuICAgICAgICAgIHJldHVybiBfdXNlci5kYXRhO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgVXNlckZhY3Rvcnkuc29mdERlbGV0ZSA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS91c2VyLycgKyBpZCxcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBVVFwiLFxyXG4gICAgICAgICAgICBkYXRhOiB7XCJkZWxldGVkXCI6XCJ0cnVlXCJ9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihfdXNlcikge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ3VzZXIgcmV0dXJuZWQnLCBfdXNlcilcclxuICAgICAgICAgIHJldHVybiBfdXNlci5kYXRhO1xyXG4gICAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIFVzZXJGYWN0b3J5LnBhc3NSZXNldCA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS91c2VyLycgKyBpZCxcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBVVFwiLFxyXG4gICAgICAgICAgICBkYXRhOiB7XCJyZXNldHBhc3NcIjpcInRydWVcIn1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKF91c2VyKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygndXNlciByZXR1cm5lZCcsIF91c2VyKVxyXG4gICAgICAgICAgcmV0dXJuIF91c2VyLmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgICByZXR1cm4gVXNlckZhY3Rvcnk7XHJcbn0pOyIsImFwcC5mYWN0b3J5KCdGdWxsc3RhY2tQaWNzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL2ZiY2RuLXNwaG90b3MtYy1hLmFrYW1haWhkLm5ldC9ocGhvdG9zLWFrLXhhcDEvdDMxLjAtOC8xMDg2MjQ1MV8xMDIwNTYyMjk5MDM1OTI0MV84MDI3MTY4ODQzMzEyODQxMTM3X28uanBnJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItTEtVc2hJZ0FFeTlTSy5qcGcnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLVVqOUNPSUlBSUZBaDAuanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I2eUl5RmlDRUFBcWwxMi5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0UtVDc1bFdBQUFtcXFKLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRXZaQWctVkFBQWs5MzIuanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFZ05NZU9YSUFJZkRoSy5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VReUlETldnQUF1NjBCLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQ0YzVDVRVzhBRTJsR0ouanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBZVZ3NVNXb0FBQUxzai5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FhSklQN1VrQUFsSUdzLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQVFPdzlsV0VBQVk5RmwuanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItT1FiVnJDTUFBTndJTS5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjliX2Vyd0NZQUF3UmNKLnBuZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNVBUZHZuQ2NBRUFsNHguanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I0cXdDMGlDWUFBbFBHaC5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjJiMzN2UklVQUE5bzFELmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cd3BJd3IxSVVBQXZPMl8uanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0JzU3NlQU5DWUFFT2hMdy5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0o0dkxmdVV3QUFkYTRMLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSTd3empFVkVBQU9QcFMuanBnOmxhcmdlJyxcclxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJZEh2VDJVc0FBbm5IVi5qcGc6bGFyZ2UnLFxyXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0dDaVBfWVdZQUFvNzVWLmpwZzpsYXJnZScsXHJcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSVM0SlBJV0lBSTM3cXUuanBnOmxhcmdlJ1xyXG4gICAgXTtcclxufSk7XHJcbiIsImFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgdmFyIGdldFJhbmRvbUZyb21BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcclxuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcclxuICAgICAgICAnSGVsbG8sIHdvcmxkIScsXHJcbiAgICAgICAgJ0F0IGxvbmcgbGFzdCwgSSBsaXZlIScsXHJcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcclxuICAgICAgICAnV2hhdCBhIGJlYXV0aWZ1bCBkYXkhJyxcclxuICAgICAgICAnSVxcJ20gbGlrZSBhbnkgb3RoZXIgcHJvamVjdCwgZXhjZXB0IHRoYXQgSSBhbSB5b3Vycy4gOiknLFxyXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJyxcclxuICAgICAgICAn44GT44KT44Gr44Gh44Gv44CB44Om44O844K244O85qeY44CCJyxcclxuICAgICAgICAnV2VsY29tZS4gVG8uIFdFQlNJVEUuJyxcclxuICAgICAgICAnOkQnLFxyXG4gICAgICAgICdZZXMsIEkgdGhpbmsgd2VcXCd2ZSBtZXQgYmVmb3JlLicsXHJcbiAgICAgICAgJ0dpbW1lIDMgbWlucy4uLiBJIGp1c3QgZ3JhYmJlZCB0aGlzIHJlYWxseSBkb3BlIGZyaXR0YXRhJyxcclxuICAgICAgICAnSWYgQ29vcGVyIGNvdWxkIG9mZmVyIG9ubHkgb25lIHBpZWNlIG9mIGFkdmljZSwgaXQgd291bGQgYmUgdG8gbmV2U1FVSVJSRUwhJyxcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcclxuICAgICAgICBnZXRSYW5kb21HcmVldGluZzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbn0pO1xyXG4iLCJhcHAuZmlsdGVyKCdhYmJyJywgZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIGZ1bmN0aW9uIChpbnB1dCkge1xyXG5cdFx0dmFyIG1heCA9IDEzO1xyXG5cdFx0aWYgKGlucHV0Lmxlbmd0aCA+IG1heCkge1xyXG5cdFx0XHRyZXR1cm4gaW5wdXQuc2xpY2UoMCwgbWF4KSArICcuLidcclxuXHRcdH1cclxuXHRcdHJldHVybiBpbnB1dDtcclxuXHR9XHJcbn0pIiwiYXBwLmRpcmVjdGl2ZSgnYWRkVG9DYXJ0JywgZnVuY3Rpb24oQXV0aFNlcnZpY2UsIENhcnRGYWN0b3J5KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJy9qcy9jb21tb24vZGlyZWN0aXZlcy9hZGQtdG8tY2FydC9hZGQudG8uY2FydC5odG1sJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHByb2R1Y3Q6ICc9JyxcclxuICAgICAgbGluZUl0ZW06ICc9JyxcclxuICAgICAgbGFiZWw6ICdAJyxcclxuICAgICAgZGV0YWlsOiAnPSdcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGxpbmssIGF0dHIpIHtcclxuICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZDtcclxuICAgICAgc2NvcGUuYWRkVG9DYXJ0ID0gZnVuY3Rpb24ocHJvZHVjdCwgZXYsIGRldGFpbCkge1xyXG4gICAgICAgIENhcnRGYWN0b3J5LmFkZFRvQ2FydChwcm9kdWN0KS50aGVuKGZ1bmN0aW9uKGNhcnQpIHtcclxuICAgICAgICAgIGlmIChkZXRhaWwpIHtcclxuICAgICAgICAgICAgZXYudGFyZ2V0LmlubmVySFRNTCA9IFwiQWRkZWQgdG8gY2FydCAoXCIgKyBjYXJ0LnF1YW50aXR5ICsgXCIpXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgfTtcclxuICAgICAgc2NvcGUudXBkYXRlUXR5ID0gQ2FydEZhY3RvcnkudXBkYXRlUXR5O1xyXG4gICAgICBzY29wZS5yZW1vdmVJdGVtID0gQ2FydEZhY3RvcnkucmVtb3ZlSXRlbTtcclxuICAgICAgc2NvcGUuZ2V0TGluZUl0ZW0gPSBDYXJ0RmFjdG9yeS5nZXRMaW5lSXRlbTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuIiwiYXBwLmRpcmVjdGl2ZSgnY2FydFN0YXR1cycsIGZ1bmN0aW9uIChDYXJ0RmFjdG9yeSkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJy9qcy9jb21tb24vZGlyZWN0aXZlcy9jYXJ0LXN0YXR1cy9jYXJ0LnN0YXR1cy5odG1sJyxcclxuICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICBjb250cm9sbGVyOiAnQ2FydEN0cmwnXHJcbiAgfTtcclxufSk7XHJcbiIsImFwcC5kaXJlY3RpdmUoJ2Z1bGxzdGFja0xvZ28nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5odG1sJ1xyXG4gICAgfTtcclxufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHNjb3BlOiB7fSxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XHJcblxyXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFtcclxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdCZWVycycsIHN0YXRlOiAncHJvZHVjdHMnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWJvdXQnLCBzdGF0ZTogJ2Fib3V0JyB9LFxyXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ09yZGVycycsIHN0YXRlOiAnb3JkZXJzJywgYXV0aDogdHJ1ZX1cclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLmFkbWluQWNjZXNzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQWRtaW4oKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgncmVmcmVzaENhcnQnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NldCB1c2VyOicsIHVzZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHVzZXIucmVzZXRwYXNzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFzc1Jlc2V0KHVzZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIHBhc3NSZXNldCA9IGZ1bmN0aW9uIChfdXNlcikge1xyXG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdwYXNzcmVzZXQnLHt1c2VyOl91c2VyfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBzZXRVc2VyKCk7XHJcblxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xyXG4gICAgICAgICAgICAvLyRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5lZWRzUGFzc1Jlc2V0LCBwYXNzUmVzZXQpO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbn0pO1xyXG4iLCJhcHAuZGlyZWN0aXZlKCdyYW5kb0dyZWV0aW5nJywgZnVuY3Rpb24gKFJhbmRvbUdyZWV0aW5ncykge1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmh0bWwnLFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xyXG4gICAgICAgICAgICBzY29wZS5ncmVldGluZyA9IFJhbmRvbUdyZWV0aW5ncy5nZXRSYW5kb21HcmVldGluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
