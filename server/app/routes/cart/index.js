'use strict';
var router = require('express').Router();
var Cart = require('mongoose').model('Cart');
var CartItem = require('mongoose').model('CartItem');

router.get('/', function(req, res, next) {
  if (req.user) {
    Cart.findOne( {user: req.user._id} )
    .then(function(cart) {
      console.log(cart)
      res.send(cart);
    })
    .catch(res.json);
  } else {
    Cart.findById(req.session.cart._id).populate('productId')
      .then(function(cart) {
        res.json(cart);
      });
  }
});

router.post('/', function(req, res, next) {
  if (req.user) {
    var _item, _cart;
    Cart.findOne({ user: req.user._id})
      .then(function(cart) {
        console.log('found cart', cart)
        if (cart) return cart;
        if (!cart) return Cart.create( {user: req.user._id, status: 'cart' } );
        return cart;
      })
      .then(function(cart) {
        _cart = cart;
        console.log(cart)
        return CartItem.create({
          productId: req.body._id,
          quantity: req.body.quantity
        });
      })
      .then(function(item) {
        _item = item;
        _cart.items.push(item);
        return _cart.save();
      })
      .then(function() {
        return CartItem.findById(_item._id).populate('productId');
      })
      .then(function(_item) {
        res.json(_item);
      })
      .catch(res.json);
  } else {
    Cart.findById(req.session.cart._id)
      .then(function(unauthorizedCart) {
        _cart = unauthorizedCart;
        return CartItem.create({
          productId: req.body._id,
          quantity: req.body.quantity
        });
      })
      .then(function(item) {
        _item = item;
        _cart.items.push(item);
        req.session.cart = _cart;
        return _cart.save();
      })
      .then(function(cart) {
        return CartItem.findById(_item._id).populate('productId');
      })
      .then(function(item) {
        res.json(item);
      })
      .catch(res.json);
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
      res.json(cartItem);
    }, next)
  } else {
    var _cart, _cartItem;
    Cart.findById(req.session.cart._id)
    .then(function(cart) {
      _cart = cart;
      return CartItem.findById(req.body.cartItemId).populate('productId');
    })
    .then(function(cartItem) {
      _cartItem = cartItem;
      cartItem.quantity = req.body.quantity;
      return cartItem.save();
    })
    .then(function(cartItem) {
      _cart.items.push(cartItem);
      req.session.cart = _cart;
      return _cart.save();
    })
    .then(function(cart) {
      res.json(_cartItem);
    }, next)
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

router.delete('/remove/:cartId', function(req, res, next) {
  if (req.user) {
    Cart.findByIdAndRemove(req.params.cartId)
      .then(function(removed_cart) {
        res.json(removed_cart)
      })
      .catch(res.json);
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
