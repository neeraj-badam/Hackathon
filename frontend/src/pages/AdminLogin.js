import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { adminLogin } from "../redux/adminSlice";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/admin/login", { email, password });

      if (res.data.token) {
        // ✅ Save admin details & token in Redux & localStorage
        dispatch(adminLogin({ admin: { email: res.data.email, role: "admin" }, token: res.data.token }));

        window.location.href = "/admin"; // Redirect to Admin Panel
      } else {
        alert("Invalid Credentials!");
      }
    } catch (error) {
      alert("Invalid Credentials!");
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default AdminLogin;
