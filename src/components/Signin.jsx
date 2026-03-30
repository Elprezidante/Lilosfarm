import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/Signin.css";
import Footer from "./FarmFooter";

const Signin = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handlesubmit = async (e) => {
    e.preventDefault();

    setLoading("Logging you in...");
    setError("");
    setSuccess("");

    try {
      const formdata = new FormData();
      formdata.append("email", email);
      formdata.append("password", password);

      const response = await axios.post(
        "http://elprezidante.alwaysdata.net/api/login",
        formdata
      );

      // 🔐 Save user (optional but powerful)
      localStorage.setItem("user", JSON.stringify(response.data));

      setLoading("");
      setSuccess("Login successful 🎉");

      // 🚀 Redirect after 1 second
      setTimeout(() => {
        navigate("/getproducts");
      }, 1000);

    } catch (err) {
      setLoading("");
      setError("Login failed. Check email or password.");
    }
  };

  // 🔵 Google login (basic redirect)
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="container">

      <form className="form" onSubmit={handlesubmit}>

        <h2 className="title">Sign In</h2>

        <p className="text-info">{loading}</p>
        <p className="text-success">{success}</p>
        <p className="text-danger">{error}</p>

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

        <div className="inputForm">
          <input
            type={showPassword ? "text" : "password"}
            className="input"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* 👁️ TOGGLE */}
          <span
            className="eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* OPTIONS */}
        <div className="flex-row">
          <div>
            <input type="checkbox" />
            <label> Remember me </label>
          </div>
          <span className="span">Forgot password?</span>
        </div>

        {/* BUTTON */}
        <button className="button-submit" type="submit">
          Sign In
        </button>

        <p className="p">
          Don't have an account?{" "}
          <Link to="/signup" className="span">Sign Up</Link>
        </p>

        <p className="p line">Or With</p>

        {/* GOOGLE LOGIN */}
        <div className="flex-row">
          <button type="button" className="btn" onClick={handleGoogleLogin}>
            Google
          </button>

          <button className="btn">
            Apple
          </button>
        </div>

      </form>
      
    </div>
  );
};

export default Signin;