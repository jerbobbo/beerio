'use strict';
var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
  name: {type: String},
  description: {type: String},
  category: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
  price: {type: Number},
  reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
  imageUrl: {type: String}
});

mongoose.model('Product', productSchema);
