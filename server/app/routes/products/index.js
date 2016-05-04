'use strict';
var router = require('express').Router();
var Product = require('mongoose').model('Product');
var Review = require('mongoose').model('Review');

router.get('/', function(req, res, next) {
  console.log(req.user)
  Product.find({})
    .then(function(products) {
      res.json(products);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});

router.get('/:id', function(req, res, next) {
  Product.findById(req.params.id)
    .then(function(product) {
      res.json(product);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});

router.post('/', function(req, res, next) {
  Product.create(req.body)
    .then(function(product) {
      res.json(product);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});

router.delete('/:id', function(req, res, next) {
  Product.findByIdAndRemove(req.params.id)
    .then(function(product) {
      res.json(product);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});

router.get('/:id/reviews', function(req, res, next) {
  Review.find({})
  .then(function(reviews) {
    res.json(reviews);
  })
  .catch(function(err) {
    res.json(err);
  }, next);
});

router.put('/:id', function(req, res) {
  console.log(req.body);
  console.log(req.params.id);
  Product.findByIdAndUpdate(req.params.id,{$set:req.body})
    .then(function(product) {
      res.json(product);
    })
    .catch(function(err) {
      res.json(err);
    });
});

module.exports = router;
