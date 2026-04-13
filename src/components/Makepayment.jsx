import axios from 'axios';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from './Loader';
import "../css/Makepayments.css";
import Footer from './FarmFooter';

const Makepayments = () => {

  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 SUPPORT BOTH CASES
  const cartItems = location.state?.cartItems || [];
  const singleProduct = location.state?.product || location.state;

  // Decide what to display
  const isCart = cartItems.length > 0;

  const items = isCart
    ? cartItems
    : singleProduct
      ? [{ ...singleProduct, quantity: 1 }]
      : [];

  const totalAmount = isCart
    ? location.state?.total
    : singleProduct?.product_cost;

  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // 💳 PAYMENT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const formdata = new FormData();

      formdata.append("phone", number);
      formdata.append("amount", totalAmount);

      await axios.post(
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

          <h2 className="payment-title">💳 Lipa Na M-Pesa</h2>

          {items.length > 0 ? (
            <>

              {/* 🧾 LIST OF ITEMS */}
              <div className="cart-summary">
                {items.map((item, index) => (
                  <div key={index} className="cart-item">
                    <img
                      src={`https://elprezidante.alwaysdata.net/static/images/${item.product_photo}`}
                      alt={item.product_name}
                      className="payment-img-small"
                    />

                    <div>
                      <h4>{item.product_name}</h4>
                      <p>Ksh {item.product_cost} x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 💰 TOTAL */}
              <h3 className="product-price">
                Total: Ksh {totalAmount}
              </h3>

              {/* 💳 FORM */}
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

              {/* 🔙 BACK BUTTON (NOW PERFECTLY PLACED) */}
              <button
                className="back-btn"
                onClick={() => navigate("/")}
              >
                ← Back
              </button>

            </>
          ) : (
            <p className="error-msg">No items selected 😬</p>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Makepayments;