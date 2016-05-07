var supertest = require('supertest');
var expect = require('chai').expect;

// load in all models needed
var mongoose = require('mongoose');
require('../../../server/db/models');
var User = mongoose.model('User');
var Order = mongoose.model('Order');

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB  = require('mocha-mongoose')(dbURI);
var app = require('../../../server/app');
var agent = supertest(app);

describe('Order routes', function(){
  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  describe('Unauthenticated Request', function() {

    it('will not retrieve orders if unauthorized', function(done){
      agent
        .get('/api/orders')
        .expect(401)
        .end(done);
    });

  });

  describe('Authenticated Request', function() {

    var loggedInAgent;

    var userInfo = {
      email: 'joe@gmail.com',
      password: 'shoopdawoop'
    };

    beforeEach('Create a user', function (done) {
      User.create(userInfo, done);
    });

    beforeEach('Create loggedIn user agent and authenticate', function (done) {
      loggedInAgent = supertest.agent(app);
      loggedInAgent.post('/login').send(userInfo).end(done);
    });

    xit('should get with 200 response and with an array as the body', function (done) {
      loggedInAgent.get('/api/orders').expect(200).end(function (err, response) {
        if (err) return done(err);
        expect(response.body).to.be.an('array');
        done();
      });
    });


  })

});