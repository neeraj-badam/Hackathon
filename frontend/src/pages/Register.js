import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../index.css"; // Import CSS
import axios from "axios";


function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const location = useLocation();


  // ✅ Prefill Email & Name if redirected from Google Login
  useEffect(() => {
    if (location.state) {
      if(  location.state.email ){
        alert( "Please Create an account first" );
      }
      setEmail(location.state.email || "");
      setName(location.state.name || "");
    }
  }, [location]);

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", { name, email, password, phone, address });
      alert(res.data);
      navigate("/home");
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input placeholder="Name" type="name" value={name} onChange={(e) => setName(e.target.value)}/>
      <input placeholder="Phone" type="phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>
      <input placeholder="Address" type="address" value={address} onChange={(e) => setAddress(e.target.value)}/>
      <button onClick={handleRegister}>Register</button>
      <Link to="/login" className="auth-link">Already have an account? Login here</Link>
    </div>
  );
}

export default Register;
