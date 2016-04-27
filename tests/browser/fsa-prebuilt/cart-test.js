describe('Cart factory', function() {
  beforeEach(module('FullstackGeneratedApp'));
  var $httpBackend, $controller, CartFactory, $controller;
  beforeEach('Get tools', inject(function(_$httpBackend_, _CartFactory_, _$controller_) {
    $httpBackend = _$httpBackend_;
    CartFactory  = _CartFactory_;
  }));

  it('should be an object', function() {
    expect(CartFactory).to.be.an('object');
  });

  describe('fetchCart', function () {
    var cart;
    it('calls GET /api/cart', function () {
      $httpBackend.expectGET('/api/cart')
        .respond([]);
      CartFactory.fetchCart()
        .then(function(_cart) {
          cart = _cart;
        });
      $httpBackend.flush();
      expect(cart).to.exist;
    });
  });

});

describe('Cart Controller', function() {
  beforeEach(module('FullstackGeneratedApp'));
  var $httpBackend, $controller, CartFactory, $controller;
  beforeEach('Get tools', inject(function(_$httpBackend_, _CartFactory_, _$controller_) {
    $httpBackend = _$httpBackend_;
    CartFactory  = _CartFactory_;
    $controller  = _$controller_;
  }));

  it('should expect controller to exist', function (done) {
    expect($controller).to.exist;
    expect($controller).to.not.be.undefined;
    done();
  });
});
