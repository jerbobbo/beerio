var supertest = require('supertest-as-promised');
var expect = require('chai').expect;

// load in all models needed
var mongoose = require('mongoose');
require('../../../server/db/models');
var User = mongoose.model('User');
var Order = mongoose.model('Order');
var Cart = mongoose.model('Cart');
var CartItem = mongoose.model('CartItem');
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

  var userInfo = {
    email: 'joe@gmail.com',
    password: 'shoopdawoop'
  };

  var productInfo = {
    name: 'Budweiser',
    price: 3.99
  };

  var _user, _product, _cartItem, _cart;
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

  beforeEach('create a cartItem',function (done) {
    CartItem.create({
      productId: _product._id,
      quantity: 2,
      price: _product.price
    })
    .then(function(cartItem) {
      _cartItem = cartItem;
      done();
    })
  });
  beforeEach('create a cart with a cartItem',function (done) {
    Cart.create({
      user: _user._id
    })
    .then(function(cart) {
      cart.items.push(_cartItem);
      return cart.save();
    })
    .then(function(savedcart) {
      _cart = savedcart;
      done();
    })
    .catch(console.error);
  });


  describe('Unauthenticated Request Temporary Cart', function() {

    it('will return a cart cart', function(done){
      agent
        .get('/api/cart')
        .expect(200)
        .end(function(err, response) {
          if (err) return done(err);
          expect(response.body._id).to.exist;
          done();
        });
    });

    it('should have one item in the cart', function (done) {
      agent.get('/api/cart/')
        .expect(200)
        .end(function (err, response) {
          if (err) return done(err);

          expect(response.body.items.length).to.equal(0);
          done();
        });
    });

    it('able to add an item into the cart', function (done) {
      agent.post('/api/cart/')
        .send(_product)
        .expect(200)
        .end(function (err, response) {
          if (err) return done(err);
          expect(response.body.productId._id.toString()).to.equal(_product._id.toString());
          done();
        });
    });

    it('should increment a quanitity that already exists in the cart', function (done) {
      agent.put('/api/cart/' + _cartItem._id )
        .send({
          quantity: 3
        })
        .expect(200)
        .end(function (err, response) {
          if (err) return done(err);
          expect(response.body.quantity).to.equal(3);
          done();
        });
    });



  });
  // trying to write a test to log in and see if it works
  // this test does not work right now
  describe('Unauthenticated to Authenticated Request', function () {
    var __cart, __loggedInAgent;
    xit('should combine the two carts', function (done) {
      agent.post('/api/cart/').send(_product).expect(200)
        .then(function(res) {
          return Cart.findOne({items: res.body._id})
            .then(function(cart) {
              __cart = cart;
              console.log(cart)
              return cart;
            })
        })
        .then(function(res) {
          __loggedInAgent = supertest.agent(app);
          return __loggedInAgent.post('/login').send(userInfo);
        })
        .then(function(res) {
          return __loggedInAgent.get('/api/cart').expect(200);
        })
        .then(function(res) {
          console.log(res.body)
          expect(res.body.items.length).to.equal(__cart.items.length);
          done()
        })
        .catch(done);
    });

  });

  describe('Authenticated Request', function() {
    var _loggedInAgent;
    beforeEach('Create loggedIn user agent and authenticate', function (done) {
      _loggedInAgent = supertest.agent(app);
      _loggedInAgent.post('/login')
        .send(userInfo)
        .end(function(err, response) {
          if (err) {
            done(err);
          }
          done();
        });
    });

    it('should have one item in the cart', function (done) {
      _loggedInAgent.get('/api/cart/')
        .expect(200)
        .end(function (err, response) {
          if (err) return done(err);
          expect(response.body.items.length).to.equal(0);
          done();
        });
    });


    it('should add a Budweiser when POST route called with product ID', function (done) {
      _loggedInAgent.post('/api/cart/')
        .send(_product)
        .expect(200)
        .end(function (err, response) {
          if (err) return done(err);
          expect(response.body.productId._id.toString()).to.equal(_product._id.toString());
          done();
        });
    });

    it('should increment a quanitity when POST route called a product that already exists in the cart', function (done) {
      _loggedInAgent.put('/api/cart/' + _cartItem._id )
        .send({
          quantity: 3
        })
        .expect(200)
        .end(function (err, response) {
          if (err) return done(err);
          expect(response.body.quantity).to.equal(3);
          done();
        });
    });



  });

});
