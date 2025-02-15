const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addProduct = async (req, res) => {
  const { name, price, category, image, description, stock } = req.body;

  try {
    const product = new Product({ name, price, category, image, description, stock });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};