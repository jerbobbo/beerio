'use strict';
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var findOneOrCreate = require('mongoose-find-one-or-create');
//var autopopulate = require('mongoose-autopopulate');


var categorySchema = new mongoose.Schema({
  name:{ type: String, required: true, unique: true }
})

categorySchema.plugin(uniqueValidator);
categorySchema.plugin(findOneOrCreate);

mongoose.model('Category', categorySchema);

