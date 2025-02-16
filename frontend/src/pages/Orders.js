import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Orders() {
  const { user } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:5000/api/orders?userId=${user.uid}`)
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
