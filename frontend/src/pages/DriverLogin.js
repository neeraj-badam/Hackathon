import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { driverLogin } from "../redux/driverSlice";
import { useNavigate } from "react-router-dom";

function DriverLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState(""); // For registration
  const [isRegistering, setIsRegistering] = useState(false); // Toggle login/register
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Handle Driver Login
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/driver/login", { email, password });
      console.log( res );
      dispatch(driverLogin({ driver: { email: res.data.driver.email, role: "driver", name: res.data.driver.name, _id: res.data.driver._id }, token: res.data.token }));
      navigate("/driver-dashboard"); // Redirect to order tracking
    } catch (error) {
      alert("Invalid Credentials!");
    }
  };

  // ✅ Handle Driver Registration
  const handleRegister = async () => {
    try {
      console.log(' register');
      const res = await axios.post("http://localhost:8000/api/driver/register", { name, email, password });
      console.log( res );
      alert(res.data.message);
      setIsRegistering(false); // Switch to login mode
    } catch (error) {
      alert("Registration failed: " + error.response.data.error);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegistering ? "Driver Registration" : "Driver Login"}</h2>

      {isRegistering && (
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
      )}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {isRegistering && (
      <input placeholder="Phone" type="phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>
      )}

      {isRegistering ? (
        <button onClick={handleRegister}>Register</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}

      <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: "pointer", color: "blue", marginTop: "10px" }}>
        {isRegistering ? "Already have an account? Login here" : "Don't have an account? Register here"}
      </p>
    </div>
  );
}

export default DriverLogin;
