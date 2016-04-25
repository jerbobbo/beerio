describe('Product factory', function() {
  beforeEach(module('fsaPreBuilt'));
  var $httpBackend;
  var Product;
  beforeEach('Get tools', inject(function(_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));
  console.log($httpBackend);

  beforeEach('Get factories', inject(function(ProductFactory) {
    ProductFactory = _ProductFactory_;
  }));

  fakeResProduct = {
    _id: 'xyz1231123',
    name: 'Cerveza',
    category: 'IPA',
    price: 10,
    reviews: ['123xz']
  };

  xit('should be an object', function() {
    expect(Product).to.be.an('object');
  });

  xit('.getOne fetches a backend product by id', function(done) {
    $httpBackend
      .expect('GET', '/api/products/' + fakeResProduct._id)
      .respond(200, fakeResProduct);
    ProductFactory.getOne(fakeResProduct._id)
      .then(function(product) {
        expect(product).to.deep.equal(fakeResProduct);
      })
      .catch(done);
    $httpBackend.flush();
    done();
  });

});
