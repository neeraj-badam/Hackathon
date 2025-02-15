const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: String,
  description: String,
  stock: Number
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);