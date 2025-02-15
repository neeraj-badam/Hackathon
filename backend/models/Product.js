const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: String,
  description: String,
  ratings: [{ type: Number }],
  reviews: [{ rating: Number, comment: String }],
  averageRating: { type: Number, default: 0 },
  stock: Number
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);