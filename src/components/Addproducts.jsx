import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import "../css/Addproducts.css";

const Addproducts = () => {

  const [product_name, setProductName] = useState("");
  const [product_description, setProductDescription] = useState("");
  const [product_cost, setProductCost] = useState("");
  const [product_photo, setProductPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prevOrders, setPrevOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  // 🔐 LOCK SCROLL
  useEffect(() => {
    document.body.style.overflow = accessGranted ? "auto" : "hidden";
  }, [accessGranted]);

  // 🔄 FETCH DATA
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [res1, res2] = await Promise.all([
        axios.get("https://elprezidante.alwaysdata.net/api/get_products", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("https://elprezidante.alwaysdata.net/api/get_orders", {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      setProducts(res1.data);
      setOrders(res2.data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (accessGranted) fetchData();
  }, [accessGranted]);

  // 🔔 LIVE ORDER DETECTION
  useEffect(() => {
    if (orders.length > prevOrders.length) {
      alert("🆕 New order received!");
    }
    setPrevOrders(orders);
  }, [orders]);

  // 🔁 AUTO REFRESH
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🔐 LOGIN (JWT)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://your-api-url/api/login",
        { password }
      );

      localStorage.setItem("token", res.data.token);
      setAccessGranted(true);

    } catch {
      setPasswordError("❌ Incorrect password");
    }
  };

  // 📸 IMAGE PREVIEW
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setProductPhoto(file);

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  // ➕ ADD PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const formdata = new FormData();
      formdata.append("product_name", product_name);
      formdata.append("product_description", product_description);
      formdata.append("product_cost", product_cost);
      formdata.append("product_photo", product_photo);

      await axios.post(
        "https://elprezidante.alwaysdata.net/api/add_products",
        formdata
      );

      setSuccess("✅ Product added!");
      setProductName("");
      setProductDescription("");
      setProductCost("");
      setPhotoPreview(null);

      fetchData();

    } catch (err) {
      setError("❌ Failed to add product");
    }

    setLoading(false);
  };

  // ❌ DELETE PRODUCT
  const deleteProduct = async (id) => {
    try {
      await axios.delete(
        `https://elprezidante.alwaysdata.net/api/delete_product/${id}`
      );
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // 📦 PLACE ORDER
  const placeOrder = async (product) => {
    try {
      await axios.post(
        "https://elprezidante.alwaysdata.net/api/add_order",
        {
          product_name: product.product_name,
          product_cost: product.product_cost,
          quantity: 1,
          total: product.product_cost,
        }
      );
      alert("✅ Order placed!");
      fetchData();
    } catch {
      alert("❌ Failed to place order");
    }
  };

  // 📊 CHART DATA
  const chartData = orders.map((o, i) => ({
    name: o.product_name,
    revenue: o.total
  }));

  return (
    <>
      {/* 🔒 POPUP */}
      {!accessGranted && (
        <div className="popup-overlay">
          <form className="password-popup" onSubmit={handlePasswordSubmit}>
            <h2>🌾 Farm Admin</h2>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer"
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {passwordError && <p className="error-msg">{passwordError}</p>}

            <button>Enter</button>
          </form>
        </div>
      )}

      {/* 🌿 DASHBOARD */}
      {accessGranted && (
        <div className="add-container">

          <div className="stats-bar">
            <div className="stat">🌿 Products: {products.length}</div>
            <div className="stat">📦 Orders: {orders.length}</div>
            <div className="stat">
              💰 Revenue: Ksh {orders.reduce((a, b) => a + b.total, 0)}
            </div>
          </div>

          <div className="dashboard-row">

            {/* ADD PRODUCT */}
            <div className="card">
              <h2>Add Product</h2>

              {loading && <Loader />}
              {success && <p className="success-msg">{success}</p>}
              {error && <p className="error-msg">{error}</p>}

              <form onSubmit={handleSubmit} className="add-form">
                <input placeholder="Name" value={product_name} onChange={e => setProductName(e.target.value)} />
                <textarea placeholder="Description" value={product_description} onChange={e => setProductDescription(e.target.value)} />
                <input type="number" placeholder="Price" value={product_cost} onChange={e => setProductCost(e.target.value)} />
                <input type="file" onChange={handlePhotoChange} />

                {photoPreview && <img src={photoPreview} className="preview-img" alt="preview" />}

                <button className="btn add-btn">Add</button>
              </form>
            </div>

            {/* PRODUCTS */}
            <div className="card">
              <h2>Products</h2>

              {products.map(p => (
                <div key={p.id} className="list-item">
                  {p.product_name}
                  <span className="remove-btn" onClick={() => deleteProduct(p.id)}>❌</span>
                  <button onClick={() => placeOrder(p)}>📦</button>
                </div>
              ))}
            </div>

            {/* ORDERS + CHART */}
            <div className="card">
              <h2>Orders</h2>

              {orders.map(o => (
                <div key={o.id} className="list-item">
                  {o.product_name} (x{o.quantity}) - Ksh {o.total}
                </div>
              ))}

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Addproducts;