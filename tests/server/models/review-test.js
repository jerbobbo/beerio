var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var Promise = require('bluebird');

// Require in all models.
require('../../../server/db/models');

var User = mongoose.model('User');
var Product = mongoose.model('Product');
var Review = mongoose.model('Review');

describe('Review Model', function () {

  beforeEach('Establish DB connection', function (done) {
      if (mongoose.connection.db) return done();
      mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
      clearDB(done);
  });

  describe('testing model', function() {
    var _review;
    var _user, _product;
    beforeEach('create review', function(done) {
      var seedPromises = [
        User.create( {email: 'test@test.com'} ),
        Product.create( {name: 'Budweiser', price: 2.99})
      ];
      Promise.all(seedPromises, function(result) {
        return result;
      })
      .then(function(results) {
        _user = results[0];
        _product = results[1];
        return Review.create({
          userId: _user._id,
          productId: _product._id,
          stars: 3,
          body: 'This beer is truly the king'
        });
      })
      .then(function(review) {
          _review = review;
          done();
      });
    });

    it('Review should exist and be an object', function(done) {
      expect(_review).to.exist;
      expect(_review).to.be.an('object');
      done();
    });

    it('Review user should have correct id', function(done) {
      expect(_review.userId).to.equal(_user._id);
      done();
    });

    it('Review product should be Budweiser', function(done) {
      expect(_review.productId).to.equal(_product._id);
      done();
    });

    it('Review body should be correct', function(done) {
      expect(_review.body).to.equal('This beer is truly the king');
      done();
    });

    it('Review should have 3 stars', function(done) {
      expect(_review.stars).to.equal(3);
      done();
    });
  });
});
