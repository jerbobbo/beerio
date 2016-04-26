'use strict';
var mongoose = require('mongoose');

var lineitemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Product'
  },
  quantity: {
    type: Number,
    default: 1
  }
});

var orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  lineitems: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Lineitem'
  }],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Address'
  },
  billingAddress: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Address'
  },
  status: {
    type: String,
    required: true,
    default: 'cart'
  }
},
{
  timestamps: true
});

mongoose.model('Lineitem', lineitemSchema);
mongoose.model('Order', orderSchema);