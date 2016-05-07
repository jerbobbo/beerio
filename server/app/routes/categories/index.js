'use strict';
var router = require('express').Router();
var Category = require('mongoose').model('Category');
var Product = require('mongoose').model('Product');


router.get('/', function(req, res, next) {
  Category.find({})
    .then(function(cats) {
      res.json(cats);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});

router.get('/:id', function(req, res, next) {
  Category.findById(req.params.id)
    .then(function(cat) {
      console.log('cat: ', cat);
      res.json(cat);
    })
    .catch(function(err) {
      res.send(404).send(err);
    }, next);
});

router.get('/:id/products', function(req, res, next) {
  var _cat;
  Category.findById(req.params.id)
    .then(function(cat) {
      console.log(cat)
      _cat=cat;
      return Product.find({category:cat}).populate('category')
    })
    .then(function(matches){
      console.log(matches);
      res.json(matches);
    })
    .catch(function(err) {
      res.send(404).send(err);
    }, next);
});

router.post('/', function(req, res, next) {
  Category.create(req.body)
    .then(function(cat) {
      res.json(cat);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});


router.delete('/:id', function(req, res, next) {
  Category.findByIdAndRemove(req.params.id)
    .then(function(cat) {
      res.json(cat);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});


module.exports = router;
