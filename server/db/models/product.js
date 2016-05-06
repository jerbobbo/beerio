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
  imageUrl: {type: String},
  available:{type: Boolean, default: true},
  deleted:{type: Boolean, default: false}
});

mongoose.model('Product', productSchema);
