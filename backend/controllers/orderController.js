const Order = require('../models/Order');
const mongoose = require("mongoose");


exports.placeOrder = async (req, res) => {
  const { userId, products, total, deliveryAddress, userName, status } = req.body;

  try {
    const order = new Order({ userId, items: products, total, deliveryAddress, status, userName });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.log( error );
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};