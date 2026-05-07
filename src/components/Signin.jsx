import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/Signin.css";
import Footer from "./FarmFooter";

const Signin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // 🔁 AUTO REDIRECT IF ALREADY LOGGED IN
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

  // 📩 Remember email
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
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "https://elprezidante.alwaysdata.net/api/login",
        { email, password }
      );

      const { token, user } = res.data;

      // 💾 Save auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setSuccess("Login successful 🎉");

      // 🧼 Clear form
      setEmail("");
      setPassword("");

      // 🔁 CLEAN NAVIGATION (NO RELOAD)
      setTimeout(() => {
        if (user.role === "admin") {
          navigate("/addproducts");
        } else {
          navigate("/getproducts");
        }
      }, 800);

    } catch (err) {
      setError(err.response?.data?.error || "Invalid login details");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">

        <form className="form" onSubmit={handleSubmit}>
          <h2>Welcome Back 🌿</h2>

          {loading && <p>Signing in...</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Remember me
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p>
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>

      </div>

      <Footer />
    </>
  );
};

export default Signin;