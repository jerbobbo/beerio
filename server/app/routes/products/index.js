'use strict';
var router = require('express').Router();
var Product = require('mongoose').model('Product');

router.get('/', function(req, res) {
  Product.find({})
    .then(function(products) {
      res.json(products);
    })
    .catch(function(err) {
      res.json(err);
    });
});

router.get('/:id', function(req, res) {
  Product.findById(req.params.id)
    .then(function(product) {
      res.json(product);
    })
    .catch(function(err) {
      res.json(err);
    });
});

router.post('/', function(req, res) {
  Product.create(req.body)
    .then(function(product) {
      res.json(product);
    })
    .catch(function(err) {
      res.json(err);
    });
});

router.delete('/:id', function(req, res) {
  Product.findByIdAndRemove(req.params.id)
    .then(function(product) {
      res.json(product);
    })
    .catch(function(err) {
      res.json(err);
    });
});

module.exports = router;
