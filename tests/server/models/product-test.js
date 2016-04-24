var dbURI    = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);

var sinon    = require('sinon');
var expect   = require('chai').expect;
var mongoose = require('mongoose');

// Require in all models.
require('../../../server/db/models');

var Product  = mongoose.model('Product');
var Promise  = require('bluebird');

describe('Product Model', function () {

  beforeEach('Establish DB connection', function (done) {
      if (mongoose.connection.db) return done();
      mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
      clearDB(done);
  });

  describe('Products available', function () {
    var _product;
    beforeEach(function(done) {
      return Product.create({
        name: 'Best beer evar',
        price: 10
      })
      .then(function(product) {
        _product = product;
        done();
      });
    });

    it('should be an object', function () {
      expect(_product).to.exist;
      expect(_product).to.be.an('object');
    });

    afterEach(function (done) {
      Promise.all([Product.findById(_product._id).remove()])
        .then(function(entries) {
          done();
        })
    });
  });
});
