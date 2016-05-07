// var expect = require('chai').expect;
var supertest = require('supertest');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);
var app = require('../../../server/app');
var agent = supertest(app);

var Order = mongoose.model('Order');
var Address = mongoose.model('Address');
var User = mongoose.model('User');
var LineItem = mongoose.model('LineItem');
var Product = mongoose.model('Product');
var CartItem = mongoose.model('CartItem');
var Promise = require('bluebird');

describe('Orders API', function() {
  beforeEach('Establish DB connection', function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function(done) {
    clearDB(done);
  });



  describe('orders routes', function() {
    var _orderToBeCreated, _emptyorder, _user, _product, _lineItem,
      _address, _data, _createdOrder;


    beforeEach(function(done) {
      User.create({
        email: 'testing123@test.com',
        password: 'password'
      })
        .then(function(user) {
          _user = user;
          return Product.create({
            name: 'Cerveza',
            price: 10
          })
        })
        .then(function(product) {
          // console.log(product)
          _product = product;
          _address = {
            type: 'shipping',
            street: '500 9th ave',
            city: 'new york',
            state: 'NY',
            country: 'USA',
            postal: '10019'
          };
          _lineItem = {
            price: _product.price,
            name: _product.name,
            productId: _product._id,
            quantity: 1
          }
          return Order.create({
            status: 'cart',
            user: _user
          })
        })
        .then(function(emptyOrder) {
          _emptyorder = emptyOrder;
          _orderToBeCreated = {
            user: _user,
            lineItems: [_lineItem],
            shippingAddress: _address,
            billingAddress: _address,
            status: 'cart'
          }
          return Order.create(_orderToBeCreated );
        })
        .then(function(createdOrder) {
          _createdOrder = createdOrder
        })
      done();
    });

    describe('authenticated requests', function() {
      var loggedInAgent;
      var userInfo = {
        email: 'testing123@test.com',
        password: 'password'
      };
      beforeEach(function(done) {
        loggedInAgent = supertest.agent(app);
        loggedInAgent.post('/login').send(userInfo).end(done);
      });

      // create an order with a user and a fake address
      it('POST /api/orders route creates a fake order', function(done) {
        loggedInAgent
          .post('/api/orders/').send(_orderToBeCreated)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.user.email).to.equal('testing123@test.com');
            done();
          });
      });

      it('PUT /api/orders/:orderId change status', function(done) {
        loggedInAgent
          .put('/api/orders/' + _emptyorder._id).send({
            status: 'complete'
          })
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;
            expect(res.body.status).to.equal('complete')
            done()
          })
      });


      xit('PUT /api/orders/:orderId modifying a lineItem', function(done) {
        loggedInAgent
          .put('/api/orders/' + _createdOrder._id).send({
            lineItems: [{
              productId: _product._id,
              quantity: 4
            }]
          })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.lineItems).to.exist;
            done();
          })
      });

      xit('PUT /api/orders/:orderId adding a shipping or billing address', function(done) {
        loggedInAgent
          .put('/api/orders/' + _emptyorder._id).send({
            billingAddress: {
              type: 'billing',
              street: '500 9th ave',
              city: 'new york',
              state: 'NY',
              country: 'USA',
              postal: '10019'
            },
            shippingAddress: {
              type: 'shipping',
              street: '500 9th ave',
              city: 'new york',
              state: 'NY',
              country: 'USA',
              postal: '10019'
            }
          })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.billingAddress).to.exist;
            expect(res.body.shippingAddress).to.exist;
            done();
          })
      });

      xit('PUT /api/orders/:orderId modifying an existing shipping or billing address', function(done) {
        loggedInAgent
          .put('/api/orders/' + _createdOrder._id).send({
            billingAddress: {
              type: 'billing',
              street: '500 8th ave',
              city: 'new york',
              state: 'NY',
              country: 'USA',
              postal: '10019'
            },
            shippingAddress: {
              type: 'shipping',
              street: '500 8th ave',
              city: 'new york',
              state: 'NY',
              country: 'USA',
              postal: '10019'
            }
          })
          .expect(200)
          .end(function(err, res) {
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
});