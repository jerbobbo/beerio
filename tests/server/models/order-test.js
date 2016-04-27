var dbURI    = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);

var sinon    = require('sinon');
var expect   = require('chai').expect;
var mongoose = require('mongoose');

// Require in all models.
require('../../../server/db/models');

var Order    = mongoose.model('Order');
var User     = mongoose.model('User');
var Lineitem = mongoose.model('Lineitem');
var Promise  = require('bluebird');

describe('Order Model', function () {

  beforeEach('Establish DB connection', function (done) {
      if (mongoose.connection.db) return done();
      mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
      clearDB(done);
  });

  describe('First Test', function () {
    var _order, _user, _lineitem;
    beforeEach(function (done) {
      return Lineitem.create({
        productId: null,
        quantity: 3,
        name: 'budweiser',
        price: 2.99
      })
      .then(function(lineitem) {
        _lineitem = lineitem;
        return User.create({
          email: 'test@test.com',
        })
      })
      .then(function(user) {
        _user = user;
        return Order.create({
          user: user,
          status: 'cart',
          lineitems: [_lineitem]
        })
      })
      .then(function(order) {
        return order.populate('lineitems');
      })
      .then(function(populatedOrder) {
        _order = populatedOrder;
        done();
      })
      .catch(function(err) {
        done();
      })
    });

    it('should be an actual order', function () {
      expect(_order).to.exist;
      expect(_order.lineitems[0].quantity).to.equal(3);
      expect(_order.lineitems[0].price).to.equal(2.99);
    });

    afterEach(function (done) {
      Promise.all([Order.findById(_order._id).remove(), User.findById(_user._id).remove(), Lineitem.findById(_lineitem._id).remove()])
        .then(function(entries) {
          done();
        })
    });
  });
});
