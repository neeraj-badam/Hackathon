import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("driverToken");

  useEffect(() => {
    if (!token) {
      alert("Access Denied! Drivers only.");
      window.location.href = "/driver-login";
      return;
    }

    axios.get("http://localhost:5000/api/driver/orders/available", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setOrders(res.data))
      .catch(err => console.error("Unauthorized:", err));
  }, [token]);

  // ✅ Pick Up Order (Assign Driver)
  const handlePickUpOrder = async (orderId) => {
    try {
      // Get driver’s current location
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        await axios.put(
          `http://localhost:5000/api/driver/orders/${orderId}/assign`,
          { lat: latitude, lng: longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Remove the order from available orders
        setOrders(orders.filter(order => order._id !== orderId));

        alert("Order assigned successfully!");
        navigate(`/driver/delivery/${orderId}`);
      }, (error) => {
        alert("Failed to get location: " + error.message);
      });

    } catch (error) {
      alert("Failed to assign order");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Available Orders</h2>
      <ul>
        {orders.map(order => (
          <li key={order._id} className="list-item">
            <span>Order ID: {order._id} - {order.userName}</span>
            <button onClick={() => handlePickUpOrder(order._id)} className="pickup-btn">Pick Up</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DriverDashboard;