'use strict';
var router = require('express').Router();
var Cart = require('mongoose').model('Cart');
var CartItem = require('mongoose').model('CartItem');

router.get('/', function(req, res, next) {
  if (req.user) {
    Cart.findOne( {user: req.user._id} ).populate( { path: 'cartItems', populate: {
      path: 'productId'
    }})
    .then(function(cart) {
      console.log('FOUND CART', cart)
      res.send(cart);
    })
    .catch(res.json);
  } else {
    res.sendStatus(401);
  }
});

router.post('/', function(req, res, next) {
  var cart, newCartItem;
  // need to send back quantity
  if (req.user) {
    Cart.findOne( {user: req.user._id} ).populate( { path: 'cartItems'})
    .then(function(_cart) {
      if (!_cart) return Cart.create( {user: req.user._id} );
      return _cart;
    })
    .then(function(_cart) {
      cart = _cart;
      var exists = false,
          index;

      cart.cartItems.forEach(function(cartItem, idx){
        if (cartItem.productId.toString() === req.body._id.toString()) {
          exists = true;
          index  = idx;
          return;
        }
      });

      if (exists) {
        // if it exists then we increment
        cart.cartItems[index].quantity++;
      } else {
        // create a new cart item
        newCartItem = new CartItem({
          productId: req.body._id,
          quantity: req.body.quantity
        });
        cart.cartItems.push(newCartItem);
      }
      return cart.populate('lineItems').save();
    })
    .then(function(_cart) {
      console.log('NEW CART', _cart)
      res.json(_cart);
    })
    .catch(res.json);
  } else {
    res.sendStatus(401);
  }
});

router.put('/:cartItemId', function(req, res, next) {
  if (req.user) {
    CartItem.findById(req.params.cartItemId)
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
