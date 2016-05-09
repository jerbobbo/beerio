var dbURI    = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);

var sinon    = require('sinon');
var expect   = require('chai').expect;
var mongoose = require('mongoose');

// Require in all models.
require('../../../server/db/models');

var Address    = mongoose.model('Address');
var Promise  = require('bluebird');

describe('Address Model', function () {

  beforeEach('Establish DB connection', function (done) {
      if (mongoose.connection.db) return done();
      mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
      clearDB(done);
  });

  describe('verify it works', function () {
    // populate a fake address
    var _address;
    before(function (done) {
      _address = new Address({
        type: 'shipping',
        street: '500 9th ave',
        city: 'new york',
        state: 'NY',
        country:'USA',
        postal: '10019'
      })
      done();
    });

    it('the fake address was created', function () {
      expect(_address).to.exist;
    });
  });


});
