var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
  userId: { type : mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type : mongoose.Schema.Types.ObjectId, ref: 'Product' },
  body: String,
  stars: { type: Number, min: 1, max: 5}
});

var Review = mongoose.model('Review', reviewSchema);
