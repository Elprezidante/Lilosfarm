import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../css/Signup.css";
// import Footer from './FarmFooter';

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
   <div className="signup-page">
  <form className="form" onSubmit={handleSubmit}>
    <p className="title">Register</p>
    <p className="message">Signup now and get full access to our app.</p>

    <h5 className="text-warning">{loading}</h5>
    <h3 className="text-success">{success}</h3>
    <h4 className="text-danger">{error}</h4>

    <div className="flex">
      <label>
        <input
          className="input"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <span>Full Name</span>
      </label>
    </div>

    <label>
      <input
        className="input"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <span>Email</span>
    </label>

    <label>
      <input
        className="input"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <span>Password</span>
    </label>

    <label>
      <input
        className="input"
        type="text"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <span>Phone</span>
    </label>

    <button className="submit" type="submit">
      Submit
    </button>

    <p className="signin">
      Already have an account? <Link to="/signin">Signin</Link>
    </p>
  </form>
</div>

  );
};

export default Signup;