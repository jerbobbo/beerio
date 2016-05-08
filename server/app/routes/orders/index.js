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
// this seems not RESTful?
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

router.get('/all', function(req, res) {

  Order.find().populate('user')
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
  var lineItems = req.body.lineItems,
    shippingAddress = req.body.shippingAddress,
    billingAddress = req.body.billingAddress,
    subtotal = req.body.subtotal,
    total = req.body.total,
    status = req.body.status;
  var updateObj = {
    lineItems: [],
    subtotal: subtotal || 0,
    total: total || 0,
    user: req.user,
    status: status
  };
  if (_.isEmpty(lineItems)) {
    throw "POST: /api/orders requires items in cart";
  }
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
      // create new shipping address item
      if (_.isEmpty(shippingAddress) || !shippingAddress) {
        throw "Address required for post to order"
      }
      if (shippingAddress) {
        return Address.create(shippingAddress);
      }
    })
    .then(function(address) {
      // take returned shipping address, assign to updateObj
      updateObj.shippingAddress = address;
      if (billingAddress !== null && !_.isEmpty(billingAddress)) {
        return Address.create(billingAddress);
      }
      return Address.create(shippingAddress)
    })
    .then(function(address) {
      updateObj.billingAddress = address;
      return Order.create(updateObj);
    })
    .then(function(populatedOrder) {
      res.json(populatedOrder);
    })
    .catch(console.error);
});

// edit status
router.put('/:orderId', function(req, res, next) {
  if (req.body.status) {
    Order.findByIdAndUpdate(req.params.orderId, req.body, {new: true})
      .then(function(order) {
        res.json(order)
      })
  } else {
    res.sendStatus(401)
  }
});

module.exports = router;