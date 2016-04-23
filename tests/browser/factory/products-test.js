'use strict';
var expect = chai.expect;

// Name: String
// Description: String
// Category : array of category refIDs
// Price:  Number
// Reviews:  [array of review refIDs]
// imageUrl: String

describe('Product factory', function() {

  beforeEach(module('fsaPreBuilt'));

  var Product;
  var $httpBackend;
  var fakeResProduct;

  beforeEach(inject(function($injector) {

    Product = $injector.get('Product');

    $httpBackend = $injector.get('$httpBackend');

    fakeResProduct = {
      _id: 'xyz1231123',
      name: 'Cerveza',
      category: 'IPA',
      price: 10,
      reviews: ['123xz']
    };

  }));

  afterEach(function() {
    try {
      $httpBackend.verifyNoOutstandingExpectation(false);
      $httpBackend.verifyNoOutstandingRequest();
    } catch (err) {
      this.test.error(err);
    }
  });

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
