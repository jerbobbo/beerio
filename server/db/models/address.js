'use strict';
var mongoose = require('mongoose');


var addressSchema = new mongoose.Schema({
  type: { type: String, enum: ['shipping', 'billing']},
  street: { type: String, required: true},
  city: {type: String, required: true},
  state: String,
  country: String,
  postal: { type: String, required: true}
});

mongoose.model('Address', addressSchema);