import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Keep navigate for the initial check
import "../css/Signin.css";
import Footer from "./FarmFooter";

const Signin = () => {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Redirect if already logged in (Initial check remains the same)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      if (user.role === "admin") {
        navigate("/addproducts");
      } else {
        navigate("/getproducts");
      }
    }
  }, [navigate]);

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    // Validation
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://elprezidante.alwaysdata.net/api/login",
        {
          email: email,
          password: password,
        }
      );

      if (!response.data.token || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      // 1. Save auth data to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Remember Me logic
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setSuccess("Login successful 🎉 Redirecting...");

      // 2. CLEAR AND REDIRECT
      setTimeout(() => {
        // Clear state so the form is empty before the jump
        setEmail("");
        setPassword("");

        // Use window.location.href instead of navigate
        // This reloads the App, triggering the header update!
        window.location.href = "/"; 
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || "Incorrect email or password.");
      setPassword(""); 
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component (Google Login, Apple Login, and JSX) remains the same...
  const handleGoogleLogin = () => {
    window.location.href = "https://yourbackend.com/auth/google";
  };

  const handleAppleLogin = () => {
    alert("Apple login coming soon 🍎");
  };

  return (
    <>
      <div className="container">
        {/* Your Form JSX remains exactly as you had it */}
        <form className="form" onSubmit={handleSubmit}>
           <h2 className="title">Welcome Back 🌿</h2>
           <p className="subtitle">Sign in to continue to Lilos Farm</p>

           {loading && <p className="text-info">Signing you in...</p>}
           {success && <p className="text-success">{success}</p>}
           {error && <p className="text-danger">{error}</p>}

           <div className="flex-column">
             <label>Email</label>
           </div>
           <div className="inputForm">
             <input
               type="email"
               className="input"
               placeholder="Enter your email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
             />
           </div>

           <div className="flex-column">
             <label>Password</label>
           </div>
           <div className="inputForm password-wrapper">
             <input
               type={showPassword ? "text" : "password"}
               className="input"
               placeholder="Enter your password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
             />
             <span className="eye" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
               {showPassword ? "🙈" : "👁️"}
             </span>
           </div>

           <div className="flex-row">
             <div>
               <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
               <label> Remember me</label>
             </div>
             <Link to="/forgotpassword" style={{textDecoration: 'none'}} className="span">Forgot password?</Link>
           </div>

           <button className="button-submit" type="submit" disabled={loading}>
             {loading ? "Signing In..." : "Sign In"}
           </button>

           <p className="p">Don’t have an account? <Link to="/signup" className="span">Sign Up</Link></p>
           <p className="p line">Or continue with</p>

           <div className="flex-row">
             <button type="button" className="btn" onClick={handleGoogleLogin}>Google</button>
             <button type="button" className="btn" onClick={handleAppleLogin}>Apple</button>
           </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Signin;