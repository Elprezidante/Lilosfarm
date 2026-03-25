import axios from 'axios';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from './Loader';
import "../css/Makepayments.css";
import Footer from './Footer';

const Makepayments = () => {

  const location = useLocation();
  const product = location.state;

  const navigate = useNavigate();

  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const formdata = new FormData();

      formdata.append("phone", number);
      formdata.append("amount", product.product_cost);

      const response = await axios.post(
        "https://kbenkamotho.alwaysdata.net/api/mpesa_payment",
        formdata
      );

      setLoading(false);
      setSuccess("✅ Payment request sent! Check your phone 📱");

    } catch (error) {
      setLoading(false);
      setError("❌ Payment failed. Try again.");
    }
  };

return (
  <>
    <div className="payment-container">

      <div className="payment-card">

        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>

        <h2 className="payment-title">💳 Lipa Na M-Pesa</h2>

        {product ? (
          <>
            <img
              src={`https://elprezidante.alwaysdata.net/static/images/${product.product_photo}`}
              alt={product.product_name}
              className="payment-img"
            />

            <h4 className="product-name">{product.product_name}</h4>

            <p className="product-desc">
              {product.product_description}
            </p>

            <h3 className="product-price">
              Ksh {product.product_cost}
            </h3>

            <form onSubmit={handleSubmit}>
              {loading && <Loader />}

              <p className="success-msg">{success}</p>
              <p className="error-msg">{error}</p>

              <input
                type="tel"
                className="phone-input"
                placeholder="📱 2547XXXXXXXX"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />

              <button
                type="submit"
                className="pay-btn"
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>
            </form>
          </>
        ) : (
          <p className="error-msg">No product selected 😬</p>
        )}

      </div>  
    </div>

    
  </>
)
};

export default Makepayments;