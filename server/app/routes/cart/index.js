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
      //   if (!cart) {
      //     return Cart.create( {user: req.user._id });
      //   }
      //   return cart;
      // })
      // .then(function(cart) {
      //   var found;
      //   cart.items.forEach(function(item) {
      //     if (req.body._id == item.productId._id) {
      //       found = true;
      //       CartItem.findByIdAndUpdate(item._id, { $inc: { quantity: 1 }}).populate('productId')
      //         .then(function(cartItem) {
      //           res.json(cartItem);
      //         });
      //     }
      //   });

        // if (!found) {
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

        // }
      });


  }
});

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
