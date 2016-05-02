'use strict';
var mongoose = require('mongoose');

var lineItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Product'
  },
  quantity: {
    type: Number,
    default: 1
  },
  name: {
    type: String
  },
  price: {
    type: Number
  }
});

var orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  lineItems: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'LineItem',
    price: Number
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
}
);


mongoose.model('LineItem', lineItemSchema);
mongoose.model('Order', orderSchema);