describe('Product factory', function() {
  beforeEach(module('fsaPreBuilt'));

  var $httpBackend;
  var $rootScope;
  beforeEach('Get tools', inject(function (_$httpBackend_, _$rootScope_) {
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
  }));

  var Product;
  beforeEach('Get factories', inject(function (_Product_) {
    Product = _Product_;
  }));

  fakeResProduct = {
    _id: 'xyz1231123',
    name: 'Cerveza',
    category: 'IPA',
    price: 10,
    reviews: ['123xz']
  };

  it('should be an object', function() {
    expect(Product).to.be.an('object');
  });

  it('`.getOne` fetches a backend product by id', function(done) {
    $httpBackend
      .expect('GET', '/api/products/' + fakeResProduct._id)
      .respond(200, fakeResProduct);
    Product.getOne(fakeResProduct._id)
      .then(function(product) {
        expect(product).to.deep.equal(fakeResProduct);
      })
      .catch(done);
    $httpBackend.flush();
    done();
  });

});
