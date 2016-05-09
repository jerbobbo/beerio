// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var User = mongoose.model('User');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var supertest = require('supertest-as-promised');
var app = require('../../../server/app');
var agent = supertest(app);

describe('Create User Route', function () {

  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  var newUserInfo = {
    email: 'newuser@user.com',
    password: 'password'
  };

  it('create a new user', function (done) {
    agent.post('/api/user')
      .send(newUserInfo)
      .expect(200)
      .then(function(response) {
        expect(response.body.email).to.equal('newuser@user.com');
        expect(response.body._id).to.exist;
        done();
      })
      .catch(done);
  });
});