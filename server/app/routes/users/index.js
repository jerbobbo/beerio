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
    .then(function(user) {
      console.log('user: ', user);
      res.json(user);
    })
    .catch(function(err) {
      res.send(404).send(err);
    }, next);
});

router.post('/', function(req, res, next) {
  console.log(req.body);
  User.create(req.body)
    .then(function(data) {
      console.log(data)
      res.json(data);
    })
    .catch(function(err) {
      res.json(err);
    }, next);
});

router.put('/:id', function(req, res) {
  console.log(req);
  User.findByIdAndUpdate(req.params.id,{$set:req.body})
    .then(function(user) {
      console.log('this is the user returned in the put route',user);
      res.json(user);
    })
    .catch(function(err) {
      res.json(err);
    });
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
