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
var LineItem = mongoose.model('LineItem');
var Product  = mongoose.model('Product');
var Promise  = require('bluebird');

describe('Orders API', function() {
  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  

  describe('orders routes', function () {
    var _orderToBeCreated, _emptyorder, _user, _product, _lineItem, 
        _address, _data, _createdOrder;
    beforeEach(function (done) {
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
      })])
      .spread(function(user, product, address) {
        _user = user;
        _product = product;
        _address = address;
        return LineItem.create({
          productId: _product._id,
          quantity: 2
        })
      })
      .then(function(lineItem) {
        _lineItem = lineItem

        return Order.create({
          status: 'cart'
        })
      })
      .then(function(emptyOrder) {
        _emptyorder = emptyOrder;
        _orderToBeCreated = {
          user: _user._id,
          lineItems: [_lineItem._id],
          shippingAddress: _address._id,
          billingAddress: _address._id,
          status: 'cart' 
        }
        return Order.create(_orderToBeCreated);
      })
      .then(function(createdOrder) {
        _createdOrder = createdOrder
        done();
      })
    });
    afterEach(function (done) {
      return Promise.all(
        [
          Order.remove(), User.remove(),
          Product.remove(), Order.remove(),
          Address.remove()
        ])
      .then(function(){
        done();
      })
    });
    // create an order with a user and a fake address
    it('POST /api/orders route creates a fake order', function(done) {
      agent
        .post('/api/orders/').send(_orderToBeCreated)
        .expect(200)
        .end(function(err,res) {
          if (err)return done(err);
          expect(res.body.user.email).to.equal('testing123@test.com');
          done();
        });
    });

    it('PUT /api/orders/:orderId adding a lineItem', function (done) {
      agent
        .put('/api/orders/' + _emptyorder._id).send({
          lineItems: [
            {
              productId: _product._id,
              quantity: 4    
            }
          ]
        })
        .expect(200)
        .end(function(err,res) {
          if (err) return done(err);
          expect(res.body.lineItems).to.exist;
          done();
        })
    });


    it('PUT /api/orders/:orderId modifying a lineItem', function (done) {
      agent
        .put('/api/orders/' + _createdOrder._id).send({
          lineItems: [
            {
              productId: _product._id,
              quantity: 4    
            }
          ]
        })
        .expect(200)
        .end(function(err,res) {
          if (err) return done(err);
          expect(res.body.lineItems).to.exist;
          done();
        })
    });

    it('PUT /api/orders/:orderId adding a shipping or billing address', function (done) {
      agent
        .put('/api/orders/' + _emptyorder._id).send({
          billingAddress: {
            type: 'billing',
            street: '500 9th ave',
            city: 'new york',
            state: 'NY',
            country:'USA',
            postal: '10019'
          },
          shippingAddress: {
            type: 'shipping',
            street: '500 9th ave',
            city: 'new york',
            state: 'NY',
            country:'USA',
            postal: '10019'
          }
        })
        .expect(200)
        .end(function(err,res) {
          if (err) return done(err);
          expect(res.body.billingAddress).to.exist;
          expect(res.body.shippingAddress).to.exist;
          done();
        })
    });

    it('PUT /api/orders/:orderId modifying an existing shipping or billing address', function (done) {
      agent
        .put('/api/orders/' + _createdOrder._id).send({
          billingAddress: {
            type: 'billing',
            street: '500 8th ave',
            city: 'new york',
            state: 'NY',
            country:'USA',
            postal: '10019'
          },
          shippingAddress: {
            type: 'shipping',
            street: '500 8th ave',
            city: 'new york',
            state: 'NY',
            country:'USA',
            postal: '10019'
          }
        })
        .expect(200)
        .end(function(err,res) {
          if (err) return done(err);
          expect(res.body.billingAddress).to.exist;
          expect(res.body.billingAddress.street).to.equal('500 8th ave');
          expect(res.body.shippingAddress).to.exist;
          expect(res.body.shippingAddress.street).to.equal('500 8th ave');
          done();
        })
    });

  });
});
