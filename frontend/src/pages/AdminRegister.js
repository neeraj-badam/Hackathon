import { useState } from "react";
import axios from "axios";

function AdminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Access Denied! Only Admins can create new admins.");
        return;
      }

      const res = await axios.post("http://localhost:8000/api/admin/register", 
        { name, email, password }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Admin Created Successfully!");
      window.location.href = "/admin";
    } catch (error) {
      alert("Admin Registration Failed!");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register New Admin</h2>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default AdminRegister;