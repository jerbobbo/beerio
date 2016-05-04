'use strict';
var router = require('express').Router();
var Product = require('mongoose').model('Product');
var Review = require('mongoose').model('Review');

router.get('/', function(req, res, next) {
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

router.post('/:id/reviews', function(req, res, next) {
  Review.create(req.body)
  .then(function(review){
    res.json(review);
  })
  .catch(function(err) {
    res.json(err);
  }, next);
});

router.get('/:id/reviews/:reviewId', function(req, res, next) {
  Review.findById(req.params.reviewId)
  .then(function(review) {
    res.json(review);
  })
  .catch(function(err) {
    res.json(err);
  }, next);
});

router.put('/:id/reviews/:reviewId', function(req, res, next) {
  Review.findById(req.params.reviewId)
  .then(function(review) {
    review.body = req.body.body;
    review.stars = req.body.stars;
    return review.save();
  })
  .then(function(review) {
    res.json(review);
  })
  .catch(function(err) {
    res.json(err);
  }, next);
});

router.delete('/:id/reviews/:reviewId', function(req, res, next) {
  Review.findByIdAndRemove(req.params.reviewId)
  .then(function(review) {
    if (review === null) res.status(404).send();
    res.json(review);
  })
  .catch(function(err) {
    res.json(err);
  }, next);


module.exports = router;
