import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPanel.css";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [editProduct, setEditProduct] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);


  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      alert("Access Denied! Admins only.");
      window.location.href = "/admin-login";
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios.get("http://localhost:5000/api/admin/users", config)
      .then(res => setUsers(res.data))
      .catch(err => console.error("Unauthorized:", err));

    axios.get("http://localhost:5000/api/admin/orders", config)
      .then(res => setOrders(res.data))
      .catch(err => console.error("Unauthorized:", err));

    axios.get("http://localhost:5000/api/admin/products", config)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Unauthorized:", err));
  }, [token]);

  // ✅ Handle Product Addition
  const handleAddProduct = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post("http://localhost:5000/api/admin/products", newProduct, config);
      setProducts([...products, res.data]);
      setNewProduct({ name: "", price: "" });
      setShowAddModal(false);
    } catch (error) {
      alert("Failed to add product");
    }
  };

  // ✅ Handle Product Deletion
  const handleDeleteProduct = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`, config);
      setProducts(products.filter(product => product._id !== id));
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  // ✅ Handle User Deletion
  const handleDeleteUser = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
      setProducts(users.filter(user => user._id !== id));
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  // ✅ Open Edit Product Modal
  const openEditModal = (product) => {
    setEditProduct({ ...product });
    setShowEditModal(true);
  };

  // ✅ Handle Product Update (Save Changes)
  const handleUpdateProduct = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`http://localhost:5000/api/admin/products/${editProduct._id}`, editProduct, config);
      setProducts(products.map(product => (product._id === editProduct._id ? res.data : product)));
      setEditProduct(editProduct);
      setShowEditModal(false);
    } catch (error) {
      alert("Failed to update product");
    }
  };

  // ✅ Handle Order Status Change (Save Only on Click)
  const handleStatusChange = (id, status) => {
    setUpdatedStatus({ ...updatedStatus, [id]: status });
  };

  // ✅ Save Updated Order Status
  const handleUpdateOrderStatus = async (id) => {
    if (!updatedStatus[id]) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/admin/orders/${id}`, { status: updatedStatus[id] }, config);
      setOrders(orders.map(order => (order._id === id ? { ...order, status: updatedStatus[id] } : order)));
    } catch (error) {
      alert("Failed to update order status");
    }
  };

  // ✅ Handle Order Deletion
  const handleDeleteOrder = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/admin/orders/${id}`, config);
      setOrders(orders.filter(order => order._id !== id));
    } catch (error) {
      alert("Failed to delete order");
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <div className="section">
        <h3>Users</h3>
        <ul>
          {users.map(user => (
            <li key={user._id} className="list-item">
              <span> {user.name} - {user.email} </span>
              <button onClick={() => handleDeleteUser(user._id)} className="delete-btn">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h3>Orders</h3>
        <ul>
          {orders.map(order => (
            <li key={order._id} className="list-item">
              Order ID: {order._id} - {order.status}
              <select onChange={(e) => handleStatusChange(order._id, e.target.value)} defaultValue={order.status}>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
              <button onClick={() => handleUpdateOrderStatus(order._id)} className="update-btn">Update Status</button>
              <button onClick={() => handleDeleteOrder(order._id)} className="delete-btn">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h3>Products 
        <button onClick={() => setShowAddModal(true)} className="add-product-btn" style={{float: "right", marginRight:"5px"}}>+</button></h3>
        <ul>
          {products.map(product => (
            <li key={product._id} className="list-item">
              <span>{product.name} - ${product.price}</span>
              <button onClick={() => openEditModal(product)} className="edit-btn">Modify</button>
              <button onClick={() => handleDeleteProduct(product._id)} className="delete-btn">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Product</h3>
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <button onClick={handleAddProduct} className="save-btn">Add Product</button>
            <button onClick={() => setShowAddModal(false)} className="close-btn">Cancel</button>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Product</h3>
            <input
              type="text"
              value={editProduct.name}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
            />
            <input
              type="number"
              value={editProduct.price}
              onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
            />
            <button onClick={handleUpdateProduct} className="save-btn">Save Changes</button>
            <button onClick={() => setShowEditModal(false)} className="close-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

}

export default AdminPanel;
