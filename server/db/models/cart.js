'use strict';
var mongoose = require('mongoose');
// creating separate models so we can address saving 
// for price variability
var cartitemSchema = new mongoose.Schema({
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
  cartitems: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Cartitem'
  }]
})

mongoose.model('Cartitem', cartitemSchema);
mongoose.model('Cart', cartSchema);