'use strict';
var router = require('express').Router();
var Cart = require('mongoose').model('Cart');
var CartItem = require('mongoose').model('CartItem');

router.get('/', function(req, res, next) {
  if (req.user) {
    Cart.findOne( {user: req.user._id} )
    .then(function(cart) {
      res.send(cart);
    })
    .catch(res.json);
  } else {
    res.sendStatus(401);
  }
});

router.post('/', function(req, res, next) {
  if (req.user) {
    Cart.findOne({ user: req.user._id })
      .then(function(cart) {
        var _item;
        CartItem.create({
          productId: req.body._id,
          quantity: req.body.quantity
        })
        .then(function(item) {
          _item = item;
          cart.items.push(item);
          return cart.save();
        })
        .then(function() {
          return CartItem.findById(_item._id).populate('productId');
        })
        .then(function(_item) {
          res.json(_item);
        });
      });
  }
});

router.put('/:cartItemId', function(req, res, next) {
  if (req.user) {
    if (req.body.quantity < 0) {
      throw('ERROR: No negative quantities')
      res.sendStatus(400);
    };
    CartItem.findById(req.params.cartItemId).populate('productId')
    .then(function(cartItem) {
      cartItem.quantity = req.body.quantity;
      return cartItem.save();
    })
    .then(function(cartItem) {
      res.send(cartItem);
    })
    .catch(res.json);
  } else {
    res.sendStatus(401);
  }
});

router.delete('/:cartItemId', function(req, res, next) {
  if (req.user) {
    CartItem.remove( {_id: req.params.cartItemId} )
    .then(function(cartItem) {
      res.send(cartItem);
    })
    .catch(res.json);
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
