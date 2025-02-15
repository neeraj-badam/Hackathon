const express = require('express');
const { getProducts, addProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware').authMiddleware;
const Product = require('../models/Product');

const router = express.Router();

router.get('/', getProducts);
router.post('/add', authMiddleware, addProduct);

router.post("/:productId/review", async (req, res) => {
    try {
      const { rating, review } = req.body;
      const product = await Product.findById(req.params.productId);
      if (!product) return res.status(404).json({ error: "Product not found" });
      product.reviews.push({ rating, comment: review });
      product.ratings.push(rating);
      product.averageRating = product.ratings.reduce((a, b) => a + b, 0) / product.ratings.length;
      await product.save();
      res.json({ message: "Review submitted", averageRating: product.averageRating });
    } catch (error) {
        console.log( error );
      res.status(500).json({ error: "Failed to submit review" });
    }
});

router.get("/:productId/reviews", async (req, res) => {
    try {
        console.log( req.params.productId );
      const product = await Product.findById(req.params.productId);
      if (!product){
        return res.status(404).json({ error: "Product not found" });
      }
      console.log('Product');
      res.json({ message: "Review submitted", product });
    } catch (error) {
        console.log( error );
      res.status(500).json({ error: "Failed to submit review" });
    }
});

module.exports = router;
