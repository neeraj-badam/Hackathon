require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');

const Order = require("./models/Order");
const Product = require("./models/Product");
const User = require("./models/User");

// Routes
const authRoutes = require("./routes/authRoutes");

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/auth", authRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));