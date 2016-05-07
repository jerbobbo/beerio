'use strict';
var router = require('express').Router();
var User = require('mongoose').model('User');


router.get('/', function(req, res, next) {
  User.find({})
    .then(function(cats) {
      res.json(cats);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});

router.get('/:id', function(req, res, next) {
  User.findById(req.params.id)
    .then(function(cat) {
      console.log('cat: ', cat);
      res.json(cat);
    })
    .catch(function(err) {
      res.send(404).send(err);
    }, next);
});

router.post('/', function(req, res, next) {
  User.create(req.body)
    .then(function(cat) {
      res.json(cat);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});


router.delete('/:id', function(req, res, next) {
  User.findByIdAndRemove(req.params.id)
    .then(function(cat) {
      res.json(cat);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});


module.exports = router;
