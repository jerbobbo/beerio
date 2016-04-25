'use strict';
var router = require('express').Router();
var Order = require('mongoose').model('Order');
var Lineitem = require('mongoose').model('Lineitem');

// find All  - probably not needed but helping with figuring out testing
// modified this route to return all orders made by a particular user
router.get('/', function(req, res) {
  if (req.user) {
    Order.find({user: req.user._id})
      .then(function(orders) {
        res.json(orders);
      })
      .catch(function(err) {
        res.json(err);
      });
  } else {
    res.sendStatus(401)
  }
});

// return specific order made by user. if unauth, return 401
router.get('/:order_id', function(req, res) {
  if (req.user) {
    Order.findById(req.params.order_id)
      .then(function(order) {
        res.json(order);
      })
      .catch(function(err) {
        res.json(err);
      });
  } else {
    res.sendStatus(401);
  }
});

// find orders by user
// router.get('/', function(req, res) {

//   Order.find({user:req.params.user})
//     .then(function(orders) {
//       res.json(orders);
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

//find by Id
// router.get('/:id', function(req, res) {
//   Order.findById(req.params.id)
//     .then(function(product) {
//       res.json(product);
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

module.exports = router;