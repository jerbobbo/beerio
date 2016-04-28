'use strict';
var mongoose = require('mongoose');
// creating separate models so we can address saving 
// for price variability
var cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Product'
  },
  quantity: {
    type: Number,
    default: 1
  }
})

var cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  cartItems: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'CartItem'
  }]
})

mongoose.model('CartItem', cartItemSchema);
mongoose.model('Cart', cartSchema);