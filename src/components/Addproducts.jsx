import React, { useState } from 'react';
import axios from "axios";
import Loader from "./Loader";
import '../css/Addproducts.css';
import Footer from './Footer';

const Addproducts = () => {
  const [product_name, setProductName] = useState("");
  const [product_description, setProductDescription] = useState("");
  const [product_cost, setProductCost] = useState("");
  const [product_photo, setProductPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setProductPhoto(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

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

      const response = await axios.post(
        "http://elprezidante.alwaysdata.net/api/add_products",
        formdata
      );

      setLoading(false);
      setSuccess("🌿 Product added successfully!");

      setProductName("");
      setProductDescription("");
      setProductCost("");
      setProductPhoto(null);
      setPhotoPreview(null);

    } catch (err) {
      setLoading(false);
      setError("❌ Upload failed. Try again.");
    }
  };

  return (
    <div className="add-container">

      <div className="form_area">

        <h2 className="title">🌾 Add New Farm Product</h2>

        {loading && <Loader />}
        <p className="success-msg">{success}</p>
        <p className="error-msg">{error}</p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="🌿 Product name"
            className="form_style"
            value={product_name}
            onChange={(e) => setProductName(e.target.value)}
            required
          />

          <textarea
            placeholder="📝 Product description"
            className="form_style textarea"
            value={product_description}
            onChange={(e) => setProductDescription(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="💰 Price (Ksh)"
            className="form_style"
            value={product_cost}
            onChange={(e) => setProductCost(e.target.value)}
            required
          />

          {/* 📸 Upload */}
          <label className="upload-label">📸 Upload Photo</label>

          <input
            type="file"
            className="form_style file-input"
            onChange={handlePhotoChange}
            required
          />

          {/* 🖼️ Preview */}
          {photoPreview && (
            <div className="preview_container">
              <img src={photoPreview} alt="Preview" className="photo_preview" />
            </div>
          )}

          <button className="btn add_btn" type="submit">
            {loading ? "Uploading..." : "➕ Add Product"}
          </button>

        </form>
      </div>
        
    </div>
  );
};

export default Addproducts;