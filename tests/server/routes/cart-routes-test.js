var supertest = require('supertest');
var expect = require('chai').expect;

// load in all models needed
var mongoose = require('mongoose');
require('../../../server/db/models');
var User = mongoose.model('User');
var Order = mongoose.model('Order');
var Product = mongoose.model('Product');


var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);
var app = require('../../../server/app');
var agent = supertest(app);

describe('Cart routes', function(){
  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  describe('Unauthenticated Request', function() {

    it('will not retrieve orders if unauthorized', function(done){
      agent
        .get('/api/orders')
        .expect(401)
        .end(done);
    });

  });

  describe('Authenticated Request', function() {

    var loggedInAgent;

    var userInfo = {
      email: 'joe@gmail.com',
      password: 'shoopdawoop'
    };

    var productInfo = {
      name: 'Budweiser',
      price: 3.99
    };
    var _user, _product;
    beforeEach('Create a user', function (done) {
      User.create(userInfo)
        .then(function(user) {
          _user = userInfo;
          done();
        });
    });

    beforeEach('Create a product', function (done) {
      Product.create(productInfo).then(function(product){
        _product = product;
        done();
      });
    });
    var _loggedInAgent;
    beforeEach('Create loggedIn user agent and authenticate', function (done) {
      _loggedInAgent = supertest.agent(app);
      _loggedInAgent.post('/login').send(_user).end(done);
    });

    it('should add a Budweiser when POST route called with product ID', function (done) {
      _loggedInAgent.post('/api/cart/' + _product._id)
        .expect(200)
        .end(function (err, response) {
          if (err) return done(err);
          expect(response.body.productId).to.equal(_product._id.toString());
          done();
        });
    });

    it('should have one item in the cart', function() {
      _loggedInAgent.get('/api/cart')
      .expect(200)
      .end(function(err, response) {
        if (err) return done(err);
        expect(response.body.listitems.length).to.equal(1);
        done();
      });
    });


  });

});
