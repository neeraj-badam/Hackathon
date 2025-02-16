import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Orders() {
  const { user, token } = useSelector((state) => state.user);
  const storedData = localStorage.getItem('persist:root');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      console.log( token );
        const config = { headers: { Authorization: `Bearer ${token}` } };
        axios.get(`http://localhost:8000/api/orders?userId=${user._id}`, config)
          .then((res) => setOrders(res.data))
          .catch((err) => console.error("Error fetching orders:", err));
    }
  }, [user]);

  if (!user) return <p>Please log in to view your orders.</p>;

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length === 0 ? <p>No orders found.</p> : (
        <ul>
          {orders.map((order) => (
            <li key={order._id} style={{ border: "1px solid #ddd", padding: "10px", margin: "10px 0" }}>
              <h3>Order ID: {order._id}</h3>
              <p>Status: <strong>{order.status}</strong></p>
              <p>Placed on: {new Date(order.createdAt).toLocaleString()}</p>
              <p>Total: ${order.total.toFixed(2)}</p>
              <Link to={`/order/${order._id}/tracking`} style={{ textDecoration: "none", color: "blue" }}>
                Track Order
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Orders;
