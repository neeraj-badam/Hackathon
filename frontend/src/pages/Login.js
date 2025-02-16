import { useState } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "../redux/userSlice";
import { auth, googleProvider, signInWithPopup } from "../firebase";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../index.css"; // Import CSS

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // ✅ Returns true if no errors
  };

  // ✅ Handle Email Login
  const handleEmailLogin = async () => {
    if (!validateForm()) return; // ✅ Stop submission if validation fails

    try {
      const userCredential = await axios.post("http://localhost:8000/api/auth/login", { email, password });
      console.log(userCredential.data);
      dispatch(login({ user: userCredential.data.user, token: userCredential.data.token }));
      navigate("/home");
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({ login: "Invalid credentials. Please try again." });
      } else {
        setErrors({ login: "Login failed. Please try again later." });
      }
    }
  };

  // ✅ Handle Google Login & Redirect to Register if User Doesn't Exist
  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // ✅ Check if user exists in the backend
      const response = await axios.get(`http://localhost:8000/api/auth/check-user?email=${user.email}`);
      console.log( response.data );
      if (response.data.existingUser) {
        dispatch(login({ user: response.data.existingUser, token: response.data.token }));
        navigate("/home");
      } else {
        // 🚀 Redirect to Register with Google Data
        navigate("/register", { state: { email: user.email, name: user.displayName } });
        dispatch(logout());
      }
    } catch (error) {
      console.log( error );
      setErrors({ login: "Google login failed. Please try again." });
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {errors.email && <p className="error-text">{errors.email}</p>}

      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {errors.password && <p className="error-text">{errors.password}</p>}

      {errors.login && <p className="error-text">{errors.login}</p>}

      <button onClick={handleEmailLogin}>Login</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>

      <Link to="/register" className="auth-link">Don't have an account? Register here</Link>
    </div>
  );
}

export default Login;
