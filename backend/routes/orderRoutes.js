const express = require('express');
const { placeOrder, getUserOrders } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware').authMiddleware;



module.exports = (io) => {
    const router = express.Router();

    router.post('/place', authMiddleware, placeOrder);
    router.get('/user', authMiddleware, getUserOrders);

    const Order = require("../models/Order");

    // ✅ Get Order Location & Status
    router.get("/:orderId/get-location", async (req, res) => {
      try {
        console.log("Getting location");

        if (!io) {
            console.error("❌ Socket.io not found");
            return res.status(500).json({ error: "Socket.io not initialized" });
          }

        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ error: "Order not found" });
        // ✅ Emit live location update
        const lat = order.location.lat, lng = order.location.lng;
        io.emit("locationGetting", { orderId, location: { lat, lng } });
        res.json({
          status: order.status,
          location: order.location, // Driver's current location
          deliveryAddress: order.deliveryAddress, // Delivery address coordinates
        });

      } catch (error) {
        console.error("Error fetching order location:", error);
        res.status(500).json({ error: "Failed to fetch order location" });
      }
    });

    router.get("/", authMiddleware, async (req, res) => {
      try {
        console.log('ENTER');
          const userId = req.query.userId; // Extract userId from query
          if (!userId) {
              return res.status(400).json({ error: "User ID is required" });
          }

          const orders = await Order.find({ userId }).sort({ createdAt: -1 });
          res.json(orders);
      } catch (error) {
          console.error("Error fetching orders:", error.message);
          res.status(500).json({ error: "Failed to fetch orders" });
      }
  });

    router.get("/:orderId", async (req, res) => {
      try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        console.log( orderID)
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
    
        res.json({ status: order.status, location: order.location, deliveryAddress: order.deliveryAddress || null });
      } catch (error) {
        console.error("Error fetching order:", error.message);
        res.status(500).json({ error: "Failed to fetch order" });
      }
    });
    return router;
}