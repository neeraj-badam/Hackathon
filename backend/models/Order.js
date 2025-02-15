const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{ name: String, price: Number, quantity: Number }],
  total: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  location: { lat: Number, lng: Number },
  deliveryAddress: { type: String, required: true },
  userName: { type: String, required: true }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;