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
        return _product.save();
      })
      .then(function() {
        done();
      });
    });

    it('Should respond with status 200 and correct reviews on api/products/:productId/reviews', function(done) {
      agent.get('/api/products/' + _product._id + '/reviews')
      .expect(200)
      .then(function(res) {
        expect(res.body).to.be.an('array');
        expect(res.body[0].userId._id).to.equal(_userOne._id.toString());
        expect(res.body[0].body).to.equal('This beer is so much better than I remembered');
        expect(res.body[1].userId._id).to.equal(_userTwo._id.toString());
        expect(res.body[1].body).to.equal('Wish I had ordered a Miller Genuine Draft');
        done();
      });
    });

    it('Should get a review by ID', function(done) {
      agent.get('/api/products/' + _product._id + '/reviews/' + _reviewOne._id)
      .expect(200)
      .then(function(res) {
        expect(res.body).to.be.an('object');
        expect(res.body.body).to.equal('This beer is so much better than I remembered');
        expect(res.body.stars).to.equal(4);
        done();
      });
    });

    it('Should create a new review with a POST to /api/products/:productId/reviews', function(done) {
      agent.post('/api/products/' + _product._id + '/reviews')
      .send( { productId: _product._id, body: 'This beer has gone downhill', userId: _userTwo._id, stars: 2 })
      .then(function(res) {
        expect(res.body).to.be.an('object');
        expect(res.body.userId._id).to.equal(_userTwo._id.toString());
        expect(res.body.body).to.equal('This beer has gone downhill');
        expect(res.body.stars).to.equal(2);
        done();
      });
    });

    it('Should edit a review with a PUT request to /api/products/:productId/reviews/:reviewId', function(done) {
      agent.put('/api/products/' + _product._id + '/reviews/' + _reviewOne._id)
      .send( { productId: _product._id, body: 'I edited my review', userId: _userOne._id, stars: 1 })
      .then(function(res) {
        expect(res.body).to.be.an('object');
        expect(res.body.body).to.equal('I edited my review');
        expect(res.body.stars).to.equal(1);
        done();
      });
    });

    it('Should delete a review with a DELETE request to /api/products/:productId/reviews/:reviewId', function(done) {
      agent.delete('/api/products/' + _product._id + '/reviews/' + _reviewOne._id)
      .then(function() {
        agent.get('/api/products/' + _product._id + '/reviews/' + _reviewOne._id)
        .expect(404);
        done();
      });
    });


  });

});
