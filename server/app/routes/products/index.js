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
      if (!product) {
        return false;
      }
      res.json(product);
    })
    .catch(function(err) {
      res.send(404).send(err);
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
  Product.findById(req.params.id).populate('reviews')
  .then(function(product) {
    res.json(product.reviews);
  })
  .catch(function(err) {
    res.json(err);
  }, next);
});

router.post('/:id/reviews', function(req, res, next) {
  var newReview;
  Review.create(req.body)
  .then(function(review) {
    newReview = review;
    return Product.findById(req.params.id);
  })
  .then(function(product) {
    product.reviews.push(newReview);
    res.json(newReview);
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
});


module.exports = router;
