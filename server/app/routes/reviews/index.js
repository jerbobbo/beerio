'use strict';
var router = require('express').Router();
var Review = require('mongoose').model('Review');

router.get('/', function(req, res, next) {
  Review.find({})
  .then(function(reviews) {
    //console.log('reviews: ', reviews);
    res.json(reviews);
  })
  .catch(res.json);
});
