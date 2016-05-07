'use strict';
var mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');

var lineItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    autopopulate: true
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
lineItemSchema.plugin(autopopulate);

var orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: true
  },
  lineItems: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'LineItem',
    price: Number, autopopulate: true
  }],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Address', autopopulate: true
  },
  billingAddress: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Address', autopopulate: true
  },
  status: {
    type: String,
    required: true,
    default: 'cart'
  },
  subtotal: {
    type: Number
  },
  total: {
    type: Number
  }
},
{
  timestamps: true
}
);
orderSchema.plugin(autopopulate);

orderSchema.pre('save', function(next) {
  var subtotal  = this.lineItems
                    .map(function(lineitem) {
                      return lineitem.price;
                    })
                    .reduce(function(prev, curr) {
                      return prev + curr
                    }, 0);
  subtotal      = subtotal.toFixed(2);
  var total     = (subtotal * 1.08875);
  total         = total.toFixed(2);
  this.subtotal = subtotal;
  this.total    = total;
  next();
});


mongoose.model('LineItem', lineItemSchema);
mongoose.model('Order', orderSchema);