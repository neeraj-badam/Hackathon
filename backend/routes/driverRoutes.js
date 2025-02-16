const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");
const { verifyDriver } = require("../middleware/authMiddleware")
const { authMiddleware } = require('../middleware/authMiddleware');

module.exports = (io) => {

  const router = express.Router();

  // ✅ Update Order Location (Live Tracking)
  router.put("/orders/:orderId/update-location", verifyDriver, async (req, res) => {
    try {
      console.log("Updating location");
      if (!io) {
        console.error("❌ Socket.io not found");
        return res.status(500).json({ error: "Socket.io not initialized" });
      }

      const { orderId, lat, lng } = req.params;
      
      // ✅ Update order location
      const order = await Order.findByIdAndUpdate(orderId, { location: { lat, lng } }, { new: true });

      if (!order) return res.status(404).json({ error: "Order not found" });

      console.log("✅ Emitting location update via WebSockets");

      // ✅ Emit live location update
      io.emit("locationUpdate", { orderId, location: { lat, lng } });

      res.json({ message: "Location updated successfully", location: { lat, lng } });
    } catch (error) {
      console.error("❌ Error updating location:", error);
      res.status(500).json({ error: "Failed to update location" });
    }
  });

  router.get('/orders/:orderId/get-location', authMiddleware, async( req, res) => {

  })

    // ✅ Driver Registration
  router.post("/register", async (req, res) => {
    console.log('Register');
    try {
      console.log('REGISTER');
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });
      console.log('HAVE');
      const existingDriver = await User.findOne({ email, role: "driver" });
      console.log('FIND');
      if (existingDriver) return res.status(400).json({ error: "Driver already registered" });
      console.log("WHAT");
      const hashedPassword = await bcrypt.hash(password, 10);
      const newDriver = new User({ name, email, password: hashedPassword, role: "driver" });

      await newDriver.save();
      res.json({ message: "Driver registered successfully. Please login." });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // ✅ Driver Login
  router.post("/login", async (req, res) => {
    try {
      console.log('Enter Login')
      const { email, password } = req.body;
      const driver = await User.findOne({ email, role: "driver" });
      const isMatch = await bcrypt.compare(password, driver.password);


      if (!driver || !isMatch ) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: driver._id, role: driver.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
      console.log('sending')
      res.json({ token, driver });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

// ✅ Get all unassigned orders (Available for pickup)
router.get("/orders/available", verifyDriver, async (req, res) => {
  try {
    const orders = await Order.find({ status: "Pending", driverId: null })
      .exec(); // Explicitly execute query

    res.json(orders);
  } catch (error) {
    console.log( error );
    res.status(500).json({ error: "Failed to fetch available orders" });
  }
});

// ✅ Assign an order to a driver
router.put("/orders/:orderId/assign", verifyDriver, async (req, res) => {
  try {
    console.log('Enter');
    const { orderId } = req.params;
    const { lat, lng, driverId } = req.body; // Initial Driver Location
    console.log( 'Entered with id ' + orderId);
    // Find and assign order to driver
    const order = await Order.findByIdAndUpdate(
      orderId,
      { driverId, status: "Out for Delivery", location: { lat, lng } },
      { new: true }
    );
    console.log( "Order found" );

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Emit update to frontend via WebSockets
    // req.io.emit("orderAssigned", { orderId, driverId: req.user._id, location: { lat, lng } });
    console.log( "Emitting" );

    res.json({ message: "Order assigned successfully", order });
    console.log( "Sent" );
  } catch (error) {
    console.log( error );
    res.status(500).json({ error: "Failed to assign order" });
  }
});

/*
// ✅ Update Order Location (Live Tracking)
router.put("/orders/:orderId/update-location", verifyDriver, async (req, res) => {
  try {
    console.log('Updating location');
    console.log(req.io);
    const { orderId } = req.params;
    const { lat, lng } = req.body;
    // ✅ Ensure `req.io` is available
    if (!req.io){ 
      console.log('NO REQ IO');
      return res.status(500).json({ error: "Socket.io not initialized" });
    }

    // Update order location
    const order = await Order.findByIdAndUpdate(
      orderId,
      { location: { lat, lng } },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });
    console.log('Now in driver routes');
    // Emit live location update to frontend
    req.io.emit("locationUpdate", { orderId, location: { lat, lng } });
    console.log('emitted')
    res.json({ message: "Location updated successfully", location: { lat, lng } });
    console.log('JSON');
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update location" });
  }
});
*/
// ✅ Mark Order as Delivered
router.put("/orders/:orderId/delivered", verifyDriver, async (req, res) => {
  try {
    console.log(' ENTER DELIVERED ');
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(orderId, { status: "Delivered" }, { new: true });
    const userId = order.userId;

    // Notify customer that order is delivered
    io.emit(`orderUpdate:${order.userId}`, { orderId, status: "Delivered" });

    res.json({ message: "Order marked as delivered", order });
  } catch (error) {
    console.log( error );
    console.log('Found error');
    res.status(500).json({ error: "Failed to update order status" });
  }
});


  return router;
};
