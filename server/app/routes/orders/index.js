'use strict';
var router = require('express').Router();
var Order = require('mongoose').model('Order');
var LineItem = require('mongoose').model('LineItem');
var Address = require('mongoose').model('Address');
var _ = require('lodash');
var sendgrid = require('../../../sendgrid');
var Promise = require('bluebird');
var createLineItem = function(product) {
  return LineItem.create(product);
}


router.use('/', function(req, res, next) {
  if (!req.user) {
    res.sendStatus(401);
  } else {
    next();
  }
});

// modified this route to return all orders made by a particular user
router.get('/', function(req, res) {
  Order.find({
    user: req.user._id
  }).populate({
    path: 'lineItems',
    populate: {
      path: 'productId',
      model: 'Product'
    }
  })
    .then(function(orders) {
      res.json(orders);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// return specific order made by user. if unauth, return 401
router.get('/:order_id', function(req, res) {
  Order.findById(req.params.order_id)
    .then(function(order) {
      res.json(order);
    })
    .catch(function(err) {
      res.json(err);
    });
});

router.post('/', function(req, res, next) {
  Order.create(req.body)
    .then(function(order) {
      return Order.findById(order._id)
        .populate('user')
        .populate('lineItems')
        .populate('shippingAddress')
        .populate('billingAddress');
    })
    .then(function(populatedOrder) {
      res.json(populatedOrder);
    })
    .catch(console.error);
});

router.put('/:orderId', function(req, res, next) {
  var lineItems = req.body.lineItems,
    shippingAddress = req.body.shippingAddress,
    billingAddress = req.body.billingAddress,
    subtotal = req.body.subtotal,
    total = req.body.total,
    status = req.body.status;
  var updateObj = {
    lineItems: [],
    subtotal: subtotal,
    total: total,
    user: req.user._id,
    status: status
  };
  Promise.map(lineItems, function(item) {
    return LineItem.create(item)
  })
    .then(function(items) {
      items.forEach(function(item) {
        updateObj.lineItems.push(item._id);
      });
      return items;
    })
    .then(function() {
      return Order.findByIdAndUpdate(req.params.orderId, updateObj, {
          new: true
        })
        .then(function(order) {
          // console.log(order)
          return order;
        })
    })
    .then(function(savedOrder) {
      if (req.user.email && savedOrder.status === 'complete') {
        console.log('sending email.. ', req.user.email)
        sendgrid.mailTo(req.user.email)
      }
      res.json(savedOrder);
    })
    .catch(console.error);
});

module.exports = router;