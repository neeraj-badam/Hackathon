const express = require("express");
const { verifyAdmin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// ✅ User Management
router.get("/users", verifyAdmin, adminController.getAllUsers);
router.put("/users/:id", verifyAdmin, adminController.updateUserRole);
router.delete("/users/:id", verifyAdmin, adminController.deleteUser);

// ✅ Product Management
router.get("/products", verifyAdmin, adminController.getAllProducts);
router.post("/products", verifyAdmin, adminController.addProduct);
router.put("/products/:id", verifyAdmin, adminController.updateProduct);
router.delete("/products/:id", verifyAdmin, adminController.deleteProduct);

// ✅ Order Management
router.get("/orders", verifyAdmin, adminController.getAllOrders);
router.put("/orders/:id", verifyAdmin, adminController.updateOrderStatus);
router.delete("/orders/:id", verifyAdmin, adminController.deleteOrder);

// ✅ Admin Authentication
router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.adminLogin);

module.exports = router;