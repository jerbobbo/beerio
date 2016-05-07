var dbURI    = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);

var sinon    = require('sinon');
var expect   = require('chai').expect;
var mongoose = require('mongoose');

// Require in all models.
require('../../../server/db/models');

var Category  = mongoose.model('Category');
var Promise  = require('bluebird');

describe('Category Model', function () {

  beforeEach('Establish DB connection', function (done) {
      if (mongoose.connection.db) return done();
      mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
      clearDB(done);
  });

  describe('Cats available', function () {
    var _category;
    beforeEach(function(done) {
      return Category.create({
        name: 'Great Beeerz'
      })
      .then(function(cat) {
        _category = cat;
        done();
      });
    });

    it('should be an object', function () {
      expect(_category).to.exist;
      expect(_category).to.be.an('object');
    });

    afterEach(function (done) {
      Promise.all([Category.findById(_category._id).remove()])
        .then(function(entries) {
          done();
        })
    });
  });
});
