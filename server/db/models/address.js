'use strict';
var mongoose = require('mongoose');


var addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['shipping', 'billing']},
  street: { type: String, required: true},
  city: {type: String, required: true},
  state: {
    type: String,
    enum: ['AL', 'AK', 'AR', 'AZ', 'CA', "CO", "CT", "DC", "DE", "FL", 
          "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", 
          "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", 
          "NH", "NJ", "NM", "NV", "NY", "OK", "OH", "OR", "PA", "RI", 
          "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV",
          "WY"],
    maxlength: 2
  },
  country: String,
  postal: { type: String, required: true}
});

mongoose.model('Address', addressSchema);