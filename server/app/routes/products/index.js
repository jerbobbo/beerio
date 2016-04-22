'use strict';
var router = require('express').Router();
var Product = require('../../../db/models/product');
// var Product = {};
router.get('/', function(req, res) {
  Product.find({})
    .then(function(products) {
      res.json(products);
    });
});

router.get('/products/:id', function(req, res) {
  Product.findById(req.params.id)
    .then(function(product) {
      res.json(product);
    });
});

module.exports = router;
