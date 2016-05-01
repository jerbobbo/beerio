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
  ratings:{type: Number},//? plural name but only storing a number? number of Ratings?
  scoreOverall:{type: Number},
  scoreCategory:{type: Number},
  reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],//I don't see a review.js under models folder
  imageUrl: {type: String}
});

mongoose.model('Product', productSchema);
