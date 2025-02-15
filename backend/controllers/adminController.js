const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  console.log(' test ');
  try {
    const users = await User.find({ role: { $ne: "admin" }}).select("-password");
    console.log(users);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ✅ Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// ✅ Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ✅ Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};


// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

// ✅ Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// ✅ Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ✅ Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order" });
  }
};

// ✅ Delete order
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
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


// ✅ Register Admin
exports.registerAdmin = async (req, res) => {
  console.log("Registering admin...");
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      // ✅ If an admin already exists, require authentication
      return verifyAdmin(req, res, async () => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({ name, email, password: hashedPassword, role: "admin" });

        await newAdmin.save();
        res.json({ message: "Admin created successfully", admin: newAdmin });
      });
    }

    // ✅ If no admin exists, allow open registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({ name, email, password: hashedPassword, role: "admin" });

    await newAdmin.save();
    res.json({ message: "Super Admin created successfully. Now, log in." });

  } catch (error) {
    res.status(500).json({ error: "Admin registration failed" });
  }
};

// ✅ Admin Login
exports.adminLogin = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("Admin logged in");

    res.json({ token, adminId: admin._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
};