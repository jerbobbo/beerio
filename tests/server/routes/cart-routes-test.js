var supertest = require('supertest');
var expect = require('chai').expect;

// load in all models needed
var mongoose = require('mongoose');
require('../../../server/db/models');
var User = mongoose.model('User');
var Order = mongoose.model('Order');
var Cart = mongoose.model('Cart');
var Cartitem = mongoose.model('Cartitem');
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

    var _user, _product, _cartitem, _cart;
    beforeEach('Create a user', function (done) {
      User.create(userInfo)
        .then(function(user) {
          _user = user;
          done();
        });
    });

    beforeEach('Create a product', function (done) {
      Product.create(productInfo).then(function(product){
        _product = product;
        done();
      });
    });

    beforeEach('create a cartitem',function (done) {
      Cartitem.create({
        productId: _product._id,
        quantity: 2,
        price: _product.price
      })
      .then(function(cartitem) {
        _cartitem = cartitem;
        done();
      })
    });
    beforeEach('create a cart with a cartitem',function (done) {
      Cart.create({
        user: _user._id
      })
      .then(function(cart) {
        cart.cartitems.push(_cartitem);
        return cart.save();
      })
      .then(function(savedcart) {
        _cart = savedcart;
        done();
      })
      .catch(console.error);
    });
    var _loggedInAgent;
    beforeEach('Create loggedIn user agent and authenticate', function (done) {
      _loggedInAgent = supertest.agent(app);
      _loggedInAgent.post('/login').send(userInfo).end(done);
    });

    it('should add a Budweiser when POST route called with product ID', function (done) {
      _loggedInAgent.post('/api/cart/')
        .send(_product)
        .expect(200)
        .end(function (err, response) {
          if (err) return done(err);
          expect(response.body.cartitems[0].productId.toString()).to.equal(_product._id.toString());
          done();
        });
    });

    it('should increment a quanitity when POST route called a product that already exists in the cart', function (done) {
      _loggedInAgent.post('/api/cart/')
        .send(_product)
        .expect(200)
        .end(function (err, response) {
          if (err) return done(err);
          expect(response.body.cartitems[0].quantity).to.equal(3);
          done();
        });
    });

    it('should have one item in the cart', function() {
      _loggedInAgent.get('/api/cart')
      .expect(200)
      .end(function(err, response) {
        if (err) return err;
        expect(response.body.listitems.length).to.equal(1);
      });
    });


  });

});
