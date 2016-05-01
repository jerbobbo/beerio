'use strict';
var router = require('express').Router();
var Product = require('mongoose').model('Product');

router.get('/', function(req, res, next) {
  Product.find({})
    .then(function(products) {
      res.json(products);
    }, next);
});

router.get('/:id', function(req, res, next) {
  Product.findById(req.params.id)
    .then(function(product) {
      res.json(product);
    }, next);
});

router.post('/', function(req, res, next) {
  Product.create(req.body)
    .then(function(product) {
      res.json(product);
    }, next);
});

module.exports = router;
