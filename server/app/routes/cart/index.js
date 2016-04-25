'use strict';
var router = require('express').Router();
var Order = require('mongoose').model('Order');
var Lineitem = require('mongoose').model('Lineitem');

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
      console.log('new item: ', newItem);
      cart.lineitems.push(newItem._id);
      res.send(newItem);
    })
    .catch(res.json);
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
