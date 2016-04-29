'use strict';
var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
  name: {type: String},
  brewer:{type: String},
  description: {type: String},
  category: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
  style: {type: String},
  price: {type: Number},
  abv: {type: Number},
  ratings:{type: Number},
  scoreOverall:{type: Number},
  scoreCategory:{type: Number},
  reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
  imageUrl: {type: String}
});

mongoose.model('Product', productSchema);
