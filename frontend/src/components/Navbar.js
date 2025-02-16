import { Link, useNavigate } from "react-router-dom"; 
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { auth } from "../firebase";
import { adminLogout } from "../redux/adminSlice";
import { driverLogout } from "../redux/driverSlice";
import { persistor } from "../redux/store"; // ✅ Import persistor

import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

const socket = io("http://localhost:8000");



function Navbar() {
  const { user } = useSelector((state) => state.user); // ✅ Get user from Redux
  const { admin } = useSelector((state) => state.admin); // ✅ Get admin from Redux
  const { driver } = useSelector((state) => state.driver); // ✅ Get driver from Redux
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const audioRef = useRef(new Audio("/notif.mp3")); // ✅ Reference to audio element
  const [audioEnabled, setAudioEnabled] = useState(false); // ✅ Track if user has interacted



  useEffect(() => {
    if (!user) return;

    socket.on(`orderUpdate:${user._id}`, (data) => {
      console.log( data );
      if (audioEnabled) {
        audioRef.current.play().catch((err) => console.error("🔊 Sound play error:", err));
      }

      // ✅ Add Notification to the List
      setNotifications((prev) => [...prev, `Order ${data.orderId} is now '${data.status}'`]);
    });

    return () => socket.off(`orderUpdate:${user._id}`);
  }, [user, audioEnabled]);
  

  const handleLogout = async () => {
    if(user){
      dispatch(logout());      
      await persistor.purge(); // ✅ Clear Redux Persist storage

        // ✅ Use navigate after state updates
      navigate('/login', { replace: true }); 
    }
    if( admin ){
      dispatch(adminLogout()); 
      persistor.purge(); // ✅ Clear Redux Persist storage

      await persistor.purge(); // ✅ Clear Redux Persist storage

        // ✅ Use navigate after state updates
      navigate('/login', { replace: true }); 
    }
    if(driver){
      dispatch(driverLogout());
      
      await persistor.purge(); // ✅ Clear Redux Persist storage

        // ✅ Use navigate after state updates
      navigate('/login', { replace: true }); 
    }
  };

  const enableAudio = () => setAudioEnabled(true);


  return (
    <nav style={{ padding: "10px", background: "#333", color: "white", display: "flex", justifyContent: "space-between" }} onClick={enableAudio} onMouseEnter={enableAudio}>
      <div>
        {user || admin ?
          admin ?
          <Link to="/admin" style={{ color: "white", marginRight: "15px", textDecoration: "none", fontSize: "18px" }}>Home</Link>
          :
          <Link to="/home" style={{ color: "white", marginRight: "15px", textDecoration: "none", fontSize: "18px" }}>Home</Link>
          :
          <Link to="/driver-dashboard" style={{ color: "white", marginRight: "15px", textDecoration: "none", fontSize: "18px" }}>Dashboard</Link>
        }
        {/* ✅ Show Cart & Orders only if a User is logged in (not Admin) */}
        {user && !admin && (
          <>
            <Link to="/checkout" style={{ color: "white", marginRight: "15px", textDecoration: "none" }}>Cart</Link>
            <Link to="/orders" style={{ color: "white", marginRight: "15px", textDecoration: "none" }}>My Orders</Link>
          </>
        )}

        {driver && (
          <Link to="/driver/current-orders" style={{ color: "white", marginLeft: "15px", textDecoration: "none" }}>
            Current Orders
          </Link>
        )}


        {/* ✅ Show Admin Panel only if an Admin is logged in */}
        {admin && (
          <Link to="/admin" style={{ color: "white", marginRight: "15px", textDecoration: "none" }}>Admin Panel</Link>
        )}
        <div className="notifications">
        {notifications.map((note, index) => (
          <p key={index} style={{ color: "green" }}>🔔 {note}</p>
        ))}
      </div>
      </div>

      <div>
        {/* ✅ Hide Login, Register, and Admin Login if a User OR an Admin is logged in */}
        {!user && !admin  && !driver ?(
          <>
            <Link to="/login" style={{ color: "white", marginRight: "15px", textDecoration: "none" }}>Login</Link>
            <Link to="/register" style={{ color: "white", textDecoration: "none" }}>Register</Link>
            <Link to="/admin-login" style={{ color: "white", marginLeft: "15px", textDecoration: "none" }}>Admin Login</Link>
            <Link to="/driver-login" style={{ color: "white", marginLeft: "15px", textDecoration: "none" }}>Driver Login</Link>
          </>
        ) : (
          <>
            <span style={{ marginRight: "10px" }}>Welcome, {user?.name || driver?.name || admin?.email || "Admin"}</span>
            <button onClick={handleLogout} style={{ background: "red", color: "white", padding: "5px 10px", border: "none", cursor: "pointer" }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
