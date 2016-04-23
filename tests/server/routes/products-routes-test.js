// var expect = require('chai').expect;
var supertest = require('supertest');
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);
var app = require('../../../server/app');
var agent = supertest(app);

describe('products route', function() {
  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  it('responds with 404 if route does not exixst on api.products', function(done) {
    agent
      .get('/api/products/kljasd')
      .expect(404, done);
  });

  it('responds with 200 when retriving api.products', function(done) {
    agent
      .get('/api/products')
      .expect(200, done);
  });
});
