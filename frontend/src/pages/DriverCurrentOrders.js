import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function DriverCurrentOrders() {
  const [currentOrders, setCurrentOrders] = useState([]);
  const { driver, token } = useSelector((state) => state.driver); // ✅ Get driver info from Redux Persist

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("currentOrders")) || [];
    if (storedOrders.length > 0) {
      fetchCurrentOrders(storedOrders);
    }
  }, []);

  const fetchCurrentOrders = async (orderIds) => {
    try {
      // const responses = await Promise.all(orderIds.map(orderId => 
      //   axios.get(`http://localhost:8000/api/driverorder/${driver._id}`, {
      //     headers: { Authorization: `Bearer ${token}` },
      //   })
      // ));

      if( orderIds ){
        console.log( orderIds );
      const responses = await 
        axios.post(`http://localhost:8000/api/driverorder/${driver._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          orderIds
        });
        console.log( responses.data );

      setCurrentOrders(responses.data);
      }
    } catch (error) {
      console.log (error )
      console.error("❌ Error fetching current orders:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Current Orders</h2>
      {currentOrders.length === 0 ? (
        <p>No current orders.</p>
      ) : (
        <ul>
        {currentOrders.map((order) => (
          <li key={order._id} className="list-item">
            <span>Order ID: {order._id} - {order.deliveryAddress} </span>
            <Link to={`/driver/delivery/${order._id}`} className="navigate-btn">
              Continue Delivery
            </Link>
          </li>
        ))}
      </ul>
      
      )}
    </div>
  );
}

export default DriverCurrentOrders;