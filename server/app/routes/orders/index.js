'use strict';
var router = require('express').Router();
var Order = require('mongoose').model('Order');
var Lineitem = require('mongoose').model('Lineitem');

// find All  - probably not needed but helping with figuring out testing
router.get('/', function(req, res) {

  Order.find()
    .then(function(orders) {
      res.json(orders);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//find by user
router.get('user', function(req, res) {

  Order.find({user:req.params.user})
    .then(function(orders) {
      res.json(orders);
    })
    .catch(function(err) {
      res.json(err);
    });
});


// find orders by user
router.get('/', function(req, res) {

  Order.find({user:req.params.user})
    .then(function(orders) {
      res.json(orders);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//find by Id
router.get('/:id', function(req, res) {
  Order.findById(req.params.id)
    .then(function(product) {
      res.json(product);
    })
    .catch(function(err) {
      res.json(err);
    });
});

module.exports = router;