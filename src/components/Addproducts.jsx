import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "../css/Addproducts.css";

const Addproducts = () => {
  // 🔐 SIMPLE FRONTEND PASSWORD
  const ADMIN_PASSWORD = "1234";

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);

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

  const navigate = useNavigate();

  // 🔓 KEEP LOGIN IF ALREADY OPENED
  useEffect(() => {
    if (localStorage.getItem("adminAccess") === "true") {
      setAccessGranted(true);
    }
  }, []);

  // 🔐 LOGIN FUNCTION
  const handleLogin = (e) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setAccessGranted(true);
      localStorage.setItem("adminAccess", "true");
      setPasswordError("");
    } else {
      setPasswordError("❌ Wrong password");
    }
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("adminAccess");
    setAccessGranted(false);
    setPassword("");
  };

  // 🔄 FETCH DATA
  const fetchData = async () => {
    try {
      const [res1, res2] = await Promise.all([
        axios.get("https://elprezidante.alwaysdata.net/api/get_products"),
        axios.get("https://elprezidante.alwaysdata.net/api/get_orders")
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
    if (orders.length > prevOrders.length && prevOrders.length > 0) {
      alert("🆕 New order received!");
    }
    setPrevOrders(orders);
  }, [orders]);

  // 🔁 AUTO REFRESH
  useEffect(() => {
    if (!accessGranted) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [accessGranted]);

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
      setProductPhoto(null);
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
          total: product.product_cost
        }
      );

      alert("✅ Order placed!");
      fetchData();
    } catch {
      alert("❌ Failed to place order");
    }
  };

  // 📊 CHART DATA
 const groupedData = orders.reduce((acc, order) => {
  const existing = acc.find(
    (item) => item.name === order.product_name
  );

  if (existing) {
    existing.quantity += Number(order.quantity);
  } else {
    acc.push({
      name: order.product_name,
      quantity: Number(order.quantity)
    });
  }

  return acc;
}, []);

const chartData = groupedData;

  return (
    <>
      {/* 🔒 LOGIN POPUP */}
      {!accessGranted && (
        <div className="popup-overlay">
          <form className="password-popup" onSubmit={handleLogin}>
            <h2>🌿 Admin Access</h2>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {passwordError && (
              <p className="error-msg">{passwordError}</p>
            )}

            <button className="btn add-btn">Enter</button>
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
              💰 Revenue: Ksh{" "}
              {orders.reduce((a, b) => a + Number(b.total), 0)}
            </div>

            <button
              onClick={handleLogout}
              className="btn add-btn"
            >
              Logout
            </button>
          </div>

          <div className="dashboard-row">
            {/* ADD PRODUCT */}
            <div className="card">
              <h2>Add Product</h2>

              {loading && <Loader />}
              {success && <p className="success-msg">{success}</p>}
              {error && <p className="error-msg">{error}</p>}

              <form
                onSubmit={handleSubmit}
                className="add-form"
              >
                <input
                  placeholder="Name"
                  value={product_name}
                  onChange={(e) =>
                    setProductName(e.target.value)
                  }
                />

                <textarea
                  placeholder="Description"
                  value={product_description}
                  onChange={(e) =>
                    setProductDescription(e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={product_cost}
                  onChange={(e) =>
                    setProductCost(e.target.value)
                  }
                />

                <input
                  type="file"
                  onChange={handlePhotoChange}
                />

                {photoPreview && (
                  <img
                    src={photoPreview}
                    className="preview-img"
                    alt="preview"
                  />
                )}

                <button className="btn add-btn">
                  Add Product
                </button>
              </form>
            </div>

            {/* PRODUCTS */}
            <div className="card">
              <h2>Products</h2>

              {products.map((p) => (
                <div key={p.id} className="list-item">
                  {p.product_name}

                  <span
                    className="remove-btn"
                    onClick={() => deleteProduct(p.id)}
                  >
                    ❌
                  </span>

                  <button
                    onClick={() => placeOrder(p)}
                  >
                    📦
                  </button>
                </div>
              ))}
            </div>

            {/* ORDERS + CHART */}
            <div className="card">
              <h2>Orders</h2>

              {orders.map((o) => (
                <div key={o.id} className="list-item">
                  {o.product_name} (x{o.quantity}) - Ksh{" "}
                  {o.total}
                </div>
              ))}

              <ResponsiveContainer
                width="100%"
                height={200}
              >
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                <Bar dataKey="quantity" />
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