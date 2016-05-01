'use strict';
var router = require('express').Router();
var Cart = require('mongoose').model('Cart');
var CartItem = require('mongoose').model('CartItem');

//use middleware if this route is only available to logged in users
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

//what if they are not logged in?
//use middleware see members route
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
          //this is confusing to me..
          //you are creating a cart.. then pushing that cart back to the items property of your cart?
          _item = item;
          cart.items.push(item);
          return cart.save();
        })
        .then(function() {
          //then you're finding it again?
          return CartItem.findById(_item._id).populate('productId');
        })
        .then(function(_item) {
          res.json(_item);
        });
      });
  }
});

//not RESTful.... you are editing a lineItem..
//two ways to do this.. just edit the cart itself..
//or do a nested route...
// PUT /:cartId/lineItems/:lineItemId
// or
// POST /:cartId/lineItems
router.put('/:cartItemId', function(req, res, next) {
  if (req.user) {
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

//again your not deleting a cart.. so two choices
// do a PUT and update the cart
// OR
// DELETE /:cartId/lineItems/:lineItemId
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
