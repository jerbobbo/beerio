// var expect = require('chai').expect;
var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var User = mongoose.model('User');
var Review = mongoose.model('Review');
var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);
var app = require('../../../server/app');
var agent = supertest(app);
var Promise = require('bluebird');

describe('Reviews route', function() {
  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  describe('testing routes', function() {
    var _reviewOne, _reviewTwo, _userOne, _userTwo, _product;
    beforeEach('create one product, two users, and a two reviews', function(done) {
      var _seedPromises = [
        User.create( { email: 'john@test.com' }  ),
        User.create( { email: 'bubba@test.com' }),
        Product.create( { name: 'Budweiser' } )
      ];
      Promise.all(_seedPromises, function(result) {
        return result;
      })
      .then(function(results) {
        _userOne = results[0];
        _userTwo = results[1];
        _product = results[2];
        return Review.create( {
          userId: _userOne._id,
          productId: _product._id,
          body: 'This beer is so much better than I remembered',
          stars: 4
        });
      })
      .then(function(review) {
        _reviewOne = review;
        return Review.create( {
          userId: _userTwo._id,
          productId: _product._id,
          body: 'Wish I had ordered a Miller Genuine Draft',
          stars: 1
        });
      })
      .then(function(review) {
        _reviewTwo = review;
        done();
      });
    });

    it('Should respond with status 200 and correct reviews on api/products/:productId/reviews', function(done) {
      agent.get('/api/products/' + _product._id + '/reviews')
      .expect(200)
      .then(function(res) {
        expect(res.body).to.be.an('array');
        expect(res.body[0].userId).to.equal(_userOne._id.toString());
        expect(res.body[0].body).to.equal('This beer is so much better than I remembered');
        expect(res.body[1].userId).to.equal(_userTwo._id.toString());
        expect(res.body[1].body).to.equal('Wish I had ordered a Miller Genuine Draft');
        done();
      });
    });
  });

});
