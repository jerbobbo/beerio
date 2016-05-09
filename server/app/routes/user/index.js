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
      res.json(user);
    })
    .catch(function(err) {
      res.send(404).send(err);
    }, next);
});

router.post('/', function(req, res, next) {
  User.findOne({email: req.body.email})
    .then(function(user) {
      if (user) {
        res.status(409).send('already exists')
      }
      return User.create(req.body)
    })
    .then(function(createdUser) {
      console.log('created user here: ', createdUser);
      var response = {
        email: createdUser.email,
        _id: createdUser._id
      }
      res.json(response);
    }, next)
});

router.put('/:id', function(req, res) {
  User.findByIdAndUpdate(req.params.id,{$set:req.body})
    .then(function(user) {
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