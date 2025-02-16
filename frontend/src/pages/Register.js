import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../index.css"; // Import CSS
import axios from "axios";
import successGif from "../assets/success.gif"; // ✅ Add a success GIF (place inside /src/assets/)


function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false); // ✅ Track success animation
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Prefill Email & Name if redirected from Google Login
  useEffect(() => {
    if (location.state) {
      if (location.state.email) {
        alert("Please Create an account first");
      }
      setEmail(location.state.email || "");
      setName(location.state.name || "");
    }
  }, [location]);

  // ✅ Validation function
  const validateForm = () => {
    let newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
      newErrors.password = "Password must contain letters and numbers";
    }

    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!address) {
      newErrors.address = "Address is required";
    } else if (address.length < 5) {
      newErrors.address = "Address must be at least 5 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // ✅ Returns true if no errors
  };

  const handleRegister = async () => {
    if (!validateForm()) return; // ✅ Stop submission if validation fails

    try {
      await axios.post("http://localhost:8000/api/auth/register", { name, email, password, phone, address });
      
      setIsSuccess(true); // ✅ Show success animation
      setTimeout(() => navigate("/home"), 3000); // ✅ Redirect after 3 seconds
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error === "Email already exists. Please try another email.") {
        alert("Email already exists. Please try another email.");
      } else {
        alert("Registration failed: " + error.message);
      }
    }
  };

  return (
    <div className="auth-container register">
      {isSuccess ? (
        <div className="success-container">
          <img src={successGif} alt="Success" className="success-gif" />
          <p className="success-text">Registered Successfully! Redirecting...</p>
        </div>
      ) : (
        <>
          <h2>Register</h2>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {errors.password && <p className="error-text">{errors.password}</p>}

          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          {errors.name && <p className="error-text">{errors.name}</p>}

          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          {errors.phone && <p className="error-text">{errors.phone}</p>}

          <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          {errors.address && <p className="error-text">{errors.address}</p>}

          <button onClick={handleRegister}>Register</button>
          <Link to="/login" className="auth-link">Already have an account? Login here</Link>
        </>
      )}
    </div>
  );
}

export default Register;
