var dbURI    = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);

var sinon    = require('sinon');
var expect   = require('chai').expect;
var mongoose = require('mongoose');

// Require in all models.
require('../../../server/db/models');

var Cart     = mongoose.model('Cart');
var User     = mongoose.model('User');
var Cartitem = mongoose.model('Cartitem');
var Product  = mongoose.model('Product');
var Promise  = require('bluebird');

describe('Cart Model', function () {

  beforeEach('Establish DB connection', function (done) {
      if (mongoose.connection.db) return done();
      mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
      clearDB(done);
  });


  describe('testing model', function () {
    var _cart, _cartitem;
    beforeEach(function (done) {
      Cartitem.create({
        productId: new Product({
          name: 'budweiser',
          description: 'refreshing domestic beer',
          category: null,
          price: 2.99
        }),
        quantity: 2
      })
      .then(function(cartitem) {
        _cartitem = cartitem
        return Cart.create({
          user: null,
          cartitems: [_cartitem]
        });
      })
      .then(function(cart) {
        _cart = cart;
        done();
      })
    });

    it('expects it cart to exist with a cartitem in there', function () {
      expect(_cart).to.exist;
      expect(_cart.cartitems.length).to.equal(1);
    });
  });
});