'use strict';
var router = require('express').Router();
var Order = require('mongoose').model('Order');
var Lineitem = require('mongoose').model('Lineitem');

router.get('/', function(req, res, next) {
  if (req.user) {
    Order.findOne( {user: req.user._id, status: 'cart'} )
    .then(function(cart) {
      res.send(cart);
    });
  } else {
    res.sendStatus(401);
  }
});

router.post('/:productId', function(req, res, next) {
  var cart = {};
  if (req.user) {
    Order.findOne( {user: req.user._id, status: 'cart'} )
    .then(function(_cart) {
      if (!_cart) return Order.create( {user: req.user._id} );
      return _cart;
    })
    .then(function(_cart) {
      cart = _cart;
      return Lineitem.create( {productId: req.params.productId} );
    })
    .then(function(newItem) {
      cart.lineitems.push(newItem._id);
      cart.save();
      console.log('cart after saving: ', cart);
      res.send(newItem);
    })
    .catch(res.json);
  } else {
    res.sendStatus(401);
  }
});

router.put('/:lineItemId', function(req, res, next) {
  if (req.user) {
    Lineitem.findById(req.params.lineItemId)
    .then(function(lineItem) {
      lineItem.quantity = req.body.quantity;
      return lineItem.save();
    })
    .then(function(lineItem) {
      res.send(lineItem);
    });
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;