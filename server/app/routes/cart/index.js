'use strict';
var router = require('express').Router();
var Cart = require('mongoose').model('Cart');
var Cartitem = require('mongoose').model('Cartitem');

router.get('/', function(req, res, next) {
  if (req.user) {
    Cart.findOne( {user: req.user._id} ).populate( { path: 'cartitems', populate: {
      path: 'productId'
    }})
    .then(function(cart) {
      res.send(cart);
    })
    .catch(next);
  } else {
    res.sendStatus(401);
  }
});

router.post('/', function(req, res, next) {
  var cart, newCartitem;
  // need to send back quantity
  if (req.user) {
    Cart.findOne( {user: req.user._id} ).populate( { path: 'cartitems'})
    .then(function(_cart) {
      if (!_cart) return Cart.create( {user: req.user._id} );
      return _cart;
    })
    .then(function(_cart) {
      cart = _cart;
      var exists = false,
          index;

      cart.cartitems.forEach(function(cartitem, idx){
        if (cartitem.productId.toString() === req.body._id.toString()) {
          exists = true;
          index  = idx;
          return;
        }
      });

      if (exists) {
        // if it exists then we increment
        cart.cartitems[index].quantity++;
      } else {
        // create a new cart item
        newCartitem = new Cartitem({
          productId: req.body._id,
          quantity: req.body.quantity
        });
        cart.cartitems.push(newCartitem);
      }
      return cart.populate('lineitems').save();
    })
    .then(function(_cart) {
      res.json(_cart);
    })
    .catch(res.json);
  } else {
    res.sendStatus(401);
  }
});

router.put('/:cartitemId', function(req, res, next) {
  if (req.user) {
    Cartitem.findById(req.params.cartitemId)
    .then(function(cartitem) {
      cartitem.quantity = req.body.quantity;
      return cartitem.save();
    })
    .then(function(cartitem) {
      res.send(cartitem);
    })
    .catch(next);
  } else {
    res.sendStatus(401);
  }
});

router.delete('/:cartitemId', function(req, res, next) {
  if (req.user) {
    Cartitem.remove( {_id: req.params.cartitemId} )
    .then(function(cartitem) {
      res.send(cartitem);
    })
    .catch(next);
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
