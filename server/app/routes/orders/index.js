'use strict';
var router = require('express').Router();
var Order = require('mongoose').model('Order');
var Lineitem = require('mongoose').model('Lineitem');

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

router.post('/', function(req, res, next) {
  Order.create(req.body)
    .then(function(order){
      return Order.findById(order._id)
        .populate('user')
        .populate('lineitems')
        .populate('shippingAddress')
        .populate('billingAddress');
    })
    .then(function(populatedOrder) {
      res.json(populatedOrder);
    })
    .catch(console.error);
  
});

module.exports = router;
