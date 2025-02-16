import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  // const { driver, token } = useSelector((state) => state.driver); // ✅ Get driver info from Redux Persist
  const { driver, token } = useSelector((state) => state.driver);

  useEffect(() => {
    console.log( driver );
    console.log( token );
    if (!token) {
      alert("Access Denied! Drivers only.");
      window.location.href = "/driver-login";
      return;
    }
    console.log( token );
    axios.get("http://localhost:8000/api/driver/orders/available", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setOrders(res.data))
      .catch(err => console.error("Unauthorized:", err));
  }, [token]);

  // ✅ Pick Up Order (Assign Driver)
  const handlePickUpOrder = async (orderId) => {
    try {
      console.log('pickup');
      // Get driver’s current location
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        console.log( driver );
        const driverId = driver._id;
        console.log( driverId, latitude, longitude );
        console.log(token);
        await axios.put(
          `http://localhost:8000/api/driver/orders/${orderId}/assign`,
          { driverId: driverId, lat: latitude, lng: longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        );


          // ✅ Store assigned orders in LocalStorage
        const currentOrders = JSON.parse(localStorage.getItem("currentOrders")) || [];
        localStorage.setItem("currentOrders", JSON.stringify([...currentOrders, orderId]));

        // Remove the order from available orders
        setOrders(orders.filter(order => order._id !== orderId));

        alert("Order assigned successfully!");
        navigate(`/driver/delivery/${orderId}`);
      }, (error) => {
        alert("Failed to get location: " + error.message);
      });

    } catch (error) {
      console.log('direct');
      if (error.response && error.response.status === 400) {
          alert("Driver already assigned");
      } else {
          alert("Failed to assign order");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Available Orders</h2>
      <ul>
        {orders.map(order => (
          <li key={order._id} className="list-item">
            <span>Order ID: {order._id} - {order.userName} - {order.deliveryAddress}</span>
            <button onClick={() => handlePickUpOrder(order._id)} className="pickup-btn">Pick Up</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DriverDashboard;