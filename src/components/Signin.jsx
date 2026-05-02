import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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

  // Redirect if already logged in
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

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await axios.post(
        "https://elprezidante.alwaysdata.net/api/login",
        formData
      );

      if (!response.data.token || !response.data.user) {
        setError("Invalid login response from server.");
        setLoading(false);
        return;
      }

      // Save token + user
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Remember me logic
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setSuccess("Login successful 🎉 Redirecting...");

      // Clear password only
      setPassword("");

      setTimeout(() => {
        if (response.data.user.role === "admin") {
          navigate("/addproducts");
        } else {
          navigate("/getproducts");
        }
      }, 1000);
    } catch (err) {
      console.log(err);
      setError("Incorrect email or password.");
      setPassword("");

      setTimeout(() => {
        navigate("/signup");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://yourbackend.com/auth/google";
  };

  const handleAppleLogin = () => {
    alert("Apple login coming soon 🍎");
  };

  return (
    <>
      <div className="container">
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

            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="flex-row">
            <div>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label> Remember me</label>
            </div>

            <Link to="/forgotpassword" className="span">
              Forgot password?
            </Link>
          </div>

          <button
            className="button-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="p">
            Don’t have an account?{" "}
            <Link to="/signup" className="span">
              Sign Up
            </Link>
          </p>

          <p className="p line">Or continue with</p>

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
