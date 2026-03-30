import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../css/Signup.css";
import Footer from './FarmFooter';

const Signup = () => {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading("Please wait...");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);

      const response = await axios.post(
        "http://elprezidante.alwaysdata.net/api/signup",
        formData
      );

      setLoading("");
      setSuccess(response.data.message);
      setError("");

      setUsername("");
      setEmail("");
      setPassword("");
      setPhone("");

    } catch (err) {
      setLoading("");
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container">

      <div className="form-wrapper">

        <div className="form_area">
          <p className="title">SIGN UP</p>

          <h5 className="text-warning">{loading}</h5>
          <h3 className="text-success">{success}</h3>
          <h4 className="text-danger">{error}</h4>

          <form onSubmit={handleSubmit}>

            <div className="form_group">
              <label className="sub_title">Name</label>
              <input
                className="form_style"
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form_group">
              <label className="sub_title">Email</label>
              <input
                className="form_style"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form_group">
              <label className="sub_title">Password</label>
              <input
                className="form_style"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form_group">
              <label className="sub_title">Phone</label>
              <input
                className="form_style"
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button className="btn" type="submit">
              SIGN UP
            </button>

            <p>
              Have an account?{" "}
              <Link className="link" to="/signin">Login</Link>
            </p>

          </form>
        </div>

      </div>

    

    </div>
  );
};

export default Signup;