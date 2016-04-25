// var expect = require('chai').expect;
var supertest = require('supertest');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);
var app = require('../../../server/app');
var agent = supertest(app);

var Order    = mongoose.model('Order');
var Address  = mongoose.model('Address');
var User     = mongoose.model('User');
var Lineitem = mongoose.model('Lineitem');
var Product  = mongoose.model('Product');
var Promise  = require('bluebird');

function seedFakeData() {
  var _user, _product, _lineitem, _address;
  return Promise.all([User.create({
    email: 'testing123@test.com',
    password: 'password'
  }), Product.create({
    name: 'Cerveza',
    price: 10
  }), Address.create({
    type: 'shipping',
    street: '500 9th ave',
    city: 'new york',
    state: 'NY',
    country:'USA',
    postal: '10019'
  })]).spread(function(user, product, address) {
    _user = user;
    _product = product;
    _address = address;
    return Lineitem.create({
      productId: _product._id,
      quantity: 2
    })
    .then(function(lineitem) {
      _lineitem = lineitem
      var _data = {
        user: _user._id,
        lineitems: [_lineitem._id],
        shippingAddress: _address._id,
        billingAddress: _address._id,
        status: 'cart'
      }
      return Promise.resolve(_data);
    })
    .catch(console.error);
  });
}

describe('Orders API', function() {
  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  describe('orders routes', function () {
    var _order;
    beforeEach(function (done) {
      seedFakeData()
        .then(function(order) {
          _order = order;
          done();
        });
    });
    // create an order with a user and a fake address
    it('POST /api/orders route equals fake data', function(done) {
      agent
        .post('/api/orders/').send(_order)
        .expect(200)
        .end(function(err,res) {
          if (err)return done(err);
          expect(res.body.user.email).to.equal('testing123@test.com');
          done();
        });
    });
  });
});
