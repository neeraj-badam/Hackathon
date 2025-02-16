const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// ✅ **Middleware: Verify Admin**
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    console.log( token );
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log( decoded );
    const user = await User.findById(decoded.id);
    console.log( user );
    if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

    req.user = user;
    next();
  } catch (error) {
    console.log( error );
    res.status(401).json({ error: "Invalid token" });
  }
};

// ✅ **Middleware: Verify Driver**
const verifyDriver = async (req, res, next) => {
  try {
    console.log("entering verify driver");
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const driver = await User.findById(decoded.id);
    if (!driver || driver.role !== "driver") return res.status(403).json({ error: "Driver access required" });
    console.log('HAS DRIVER');
    req.user = driver;
    next();
  } catch (error) {
    console.log( error );
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = {
  authMiddleware,
  verifyAdmin,
  verifyDriver
};
