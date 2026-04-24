import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/Signin.css";
import Footer from "./FarmFooter";

const Signin = () => {
  const navigate = useNavigate();

  // 🌱 Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 👁️ UI State
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 🚦 Status State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // 🚀 Auto Redirect if Already Logged In
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  // 🔐 Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    // 📧 Basic Validation
    if (!email.includes("@")) {
      setLoading(false);
      setError("Please enter a valid email.");
      return;
    }

    try {
      const formdata = new FormData();
      formdata.append("email", email);
      formdata.append("password", password);

      const response = await axios.post(
        "https://elprezidante.alwaysdata.net/api/login",
        formdata
      );

      // 🪙 Save Token + User
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      // 💾 Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setSuccess("Login successful 🎉");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      setError("Login failed. Check email or password.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Google Login
  const handleGoogleLogin = () => {
    window.location.href = "https://yourbackend.com/auth/google";
  };

  // 🍎 Apple Login Placeholder
  const handleAppleLogin = () => {
    alert("Apple login coming soon 🍎");
  };

  // 📥 Load Remembered Email
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <div className="container">
        <form className="form" onSubmit={handleSubmit}>
          <h2 className="title">Sign In</h2>

          {loading && <p className="text-info">Logging you in...</p>}
          {success && <p className="text-success">{success}</p>}
          {error && <p className="text-danger">{error}</p>}

          {/* EMAIL */}
          <div className="flex-column">
            <label>Email</label>
          </div>

          <div className="inputForm">
            <input
              type="email"
              className="input"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="flex-column">
            <label>Password</label>
          </div>

          <div className="inputForm password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* OPTIONS */}
          <div className="flex-row">
            <div>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label> Remember me </label>
            </div>

            <Link to="/forgotpassword" className="span">
              Forgot password?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            className="button-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="p">
            Don't have an account?{" "}
            <Link to="/signup" className="span">
              Sign Up
            </Link>
          </p>

          <p className="p line">Or With</p>

          {/* SOCIAL LOGIN */}
          <div className="flex-row">
            <button
              type="button"
              className="btn"
              onClick={handleGoogleLogin}
            >
              Google
            </button>

            <button
              type="button"
              className="btn"
              onClick={handleAppleLogin}
            >
              Apple
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default Signin;