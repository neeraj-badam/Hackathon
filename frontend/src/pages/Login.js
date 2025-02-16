import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/userSlice";
import { auth, googleProvider, signInWithPopup } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../index.css"; // Import CSS
import { logout } from "../redux/userSlice";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle Email Login
  const handleEmailLogin = async () => {
    try {
      const userCredential = await axios.post("http://localhost:5000/api/auth/login", { email, password })
      console.log( userCredential.data.user )
      dispatch(login({ user: userCredential.data.user }));
      navigate("/home");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  // ✅ Handle Google Login & Redirect to Register if User Doesn't Exist
  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // ✅ Check if user exists in the backend
      const response = await axios.get(`http://localhost:5000/api/auth/check-user?email=${user.email}`);

      if (response.data.exists) {
        // ✅ User exists -> Login & Redirect to Home
        dispatch(login({ user }));
        navigate("/home");
      } else {
        // 🚀 User doesn't exist -> Redirect to Register with Google Data
        navigate("/register", {
          state: {
            email: user.email,
            name: user.displayName
          }
        });
        dispatch(logout());
      }
    } catch (error) {
      alert("Google login failed: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleEmailLogin}>Login</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <Link to="/register" className="auth-link">Don't have an account? Register here</Link>
    </div>
  );
}

export default Login;