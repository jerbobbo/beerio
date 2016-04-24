var expect = require('chai').expect;
var request = require('supertest');
var mongoose = require('mongoose');
require('../../../server/db/models');


// var dbURI = 'mongodb://localhost:27017/testingDB';
// var clearDB = require('mocha-mongoose')(dbURI);

var app = require('../../../server/app');

describe('Order-cart routes', function(){

  describe('get orders', function(done){
    request(app)
      .get('/api/orders')
      .expect(200)
      .end(function(err, res) {
        console.log(res);
          if (err) return done(err);
          //expect(err).to.equal(null);
          console.log(res);
          //expect(res.body.success).to.equal(true);
          done();
        });
  });
});