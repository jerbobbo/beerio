'use strict';
var mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate')
// creating separate models so we can address saving 
// for price variability
var cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Product',
    autopopulate: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});
cartItemSchema.plugin(autopopulate);


var cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'CartItem', autopopulate: true
  }]
});
cartSchema.plugin(autopopulate);

mongoose.model('CartItem', cartItemSchema);
mongoose.model('Cart', cartSchema);
