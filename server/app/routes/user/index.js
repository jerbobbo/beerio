'use strict';
var router = require('express').Router();
var User = require('mongoose').model('User');

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

module.exports = router;