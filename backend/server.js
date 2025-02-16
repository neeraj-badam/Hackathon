require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-adminsdk.json"); // Firebase service account
const bcrypt = require("bcryptjs");

// Models
const Order = require("./models/Order");
const Product = require("./models/Product");
const User = require("./models/User");

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Middleware
app.use(express.json());
app.use(cors());

const driverRoutes = require("./routes/driverRoutes");
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes(io));
app.use("/api/admin", adminRoutes);
app.use("/api/driver", driverRoutes(io));

// ✅ Attach `io` to `req` BEFORE routes
app.use((req, res, next) => {
  console.log('ENTERED');
  if (!io) {
    console.error("Socket.io not initialized");
    return res.status(500).json({ error: "Socket.io not initialized" });
  }
  console.log("Has IO");
  req.io = io;
  next();
});



// Initialize Firebase Admin SDK
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// ✅ FIX: Ensure Socket.io is properly initialized
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("updateLocation", async (data) => {
    const { orderId, lat, lng } = data;

    if (!orderId || !lat || !lng) return;

    await Order.findByIdAndUpdate(orderId, { location: { lat, lng } });

    io.emit("locationUpdate", { orderId, location: { lat, lng } });
  });

  // ✅ Notify customers when an order status is updated
  socket.on("orderStatusUpdate", async (data) => {
    io.emit("orderUpdate", data);
  });


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Create Order Manually
app.post("/api/orders/create", async (req, res) => {
  try {
    const { userId, items, total, status } = req.body;

    if (!userId || !items || items.length === 0 || !total) {
      return res.status(400).json({ error: "Invalid order details" });
    }

    const newOrder = new Order({
      userId,
      items,
      total,
      status: status || "Pending",
    });

    await newOrder.save();
    res.json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ error: "Failed to create order" });
  }
});


// ✅ Stripe Payment Route: Create Checkout Session
app.post("/api/payment", async (req, res) => {
  try {
    const { items, userId, deliveryAddress, userName } = req.body;
    if (!items || items.length === 0 || !userId) {

      return res.status(400).json({ error: "No items or user ID provided for checkout" });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `http://localhost:3000/orders?success=true`,
      cancel_url: `http://localhost:3000/orders?canceled=true`,
    });


    
    // ✅ Fix: Ensure Order is Created for User
    const newOrder = new Order({
      userId,
      deliveryAddress,
      userName,
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "Pending",
    });

    let order = await newOrder.save();
    
    // ✅ Fetch all product IDs from the order
    const productIds = items.map(item => item._id);
    
    // ✅ Get all products in a single query
    const products = await Product.find({ _id: { $in: productIds } });

    // ✅ Create bulk update operations
    const bulkUpdates = [];
    
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item._id);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}` });
      }

      bulkUpdates.push({
        updateOne: {
          filter: { _id: item._id },
          update: { $inc: { stock: -item.quantity } } // ✅ Decrease stock
        }
      });
    }

    // ✅ Perform bulk update operation in one go
    if (bulkUpdates.length > 0) {
      await Product.bulkWrite(bulkUpdates);
    }
    
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: "Payment failed", details: error.message });
  }
});

// ✅ Get Order Details (Status & Location)
app.get("/api/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    console.log( order ); 

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ status: order.status, location: order.location, deliveryAddress: order.deliveryAddress || null });
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// ✅ Get Order Details (Status & Location)
app.post("/api/driverorder/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    const { orderIds } = req.body;
    if (!orderIds || orderIds.length === 0) {
      return res.status(400).json({ error: "No order IDs provided" });
    }
    const orders = await Order.find({ _id: { $in: orderIds } }); // Fetch all matching orders
    res.json(orders);
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Order Status
app.put("/api/order/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    io.emit("statusUpdate", { orderId, status });

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// ✅ Get Order Location
app.put("/api/order/:orderId/location", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lat, lng } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.location = { lat, lng };
    await order.save();

    io.emit("locationUpdate", { orderId, location: order.location });

    res.json({ message: "Order location updated", location: order.location });
  } catch (error) {
    console.error("Error updating order location:", error.message);
    res.status(500).json({ error: "Failed to update order location" });
  }
});


// ✅ Update Order Location (Driver GPS Tracking)
app.put("/api/order/:orderId/location", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lat, lng } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.location = { lat, lng };
    await order.save();

    io.emit("locationUpdate", { orderId, location: order.location });

    res.json({ message: "Order location updated", location: order.location });
  } catch (error) {
    console.error("Error updating order location:", error.message);
    res.status(500).json({ error: "Failed to update order location" });
  }
});

// ✅ Update Order Delivery Address
app.put("/api/order/:orderId/address", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { address } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.deliveryAddress = address;
    await order.save();

    res.json({ message: "Delivery address updated", order });
  } catch (error) {
    res.status(500).json({ error: "Failed to update delivery address" });
  }
});

// ✅ Send Push Notifications via Firebase
app.post("/api/notify", async (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: { title, body },
    token: token,
  };

  try {
    await admin.messaging().send(message);
    res.json({ success: true });
  } catch (error) {
    console.error("FCM Error:", error);
    res.status(500).json({ error: "Notification failed" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
