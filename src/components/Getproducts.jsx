import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import "../css/Getproducts.css";
import Footer from './Footer';

const Getproducts = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);

  const navigate = useNavigate();

  const img_url = "https://elprezidante.alwaysdata.net/static/images/";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://elprezidante.alwaysdata.net/api/get_products"
      );
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="farm-container">


      {/* 🌿 Animated Background */}
      <div className="farm-bg">
        <div className="floating-leaf leaf1"></div>
        <div className="floating-leaf leaf2"></div>
        <div className="floating-leaf leaf3"></div>
      </div>

      {/* 🛒 Cart Indicator */}
      <div className="cart-indicator">
        🛒 {cart.length}
      </div>

      <h2 className="farm-title">🌿 Available Farm Products</h2>
      

      {loading && <Loader />}
      <h4 className="text-danger text-center">{error}</h4>

      {/* ✅ FIXED GRID */}
     <div className="products-grid">
  {products.map((product) => (
    <div key={product.id}>
              <div className="card product-card shadow">

                {/* 💫 Badges */}
                {product.product_cost > 500 && (
                  <span className="badge hot">🔥 Popular</span>
                )}
                {product.product_cost < 200 && (
                  <span className="badge new">🌱 Fresh</span>
                )}

                {/* 🌻 Image */}
                <div className="img-wrapper">
                  <img
                    src={img_url + product.product_photo}
                    alt={product.product_name}
                    className="product_img"
                  />
                </div>

                {/* 🌱 Content */}
                <div className="card-body text-center">

                  {/* 🐔 Icons */}
                  <h5 className="product-title">
                    {product.product_name === "Chicken meat" && "🍗 "}
                    {product.product_name === "Chicken eggs" && "🥚 "}
                    {product.product_name === "coriander" && "🌿 "}
                    {product.product_name === "Dairy" && "🥛 "}
                    {product.product_name}
                  </h5>

                  <p className="product-desc">
                    {product.product_description.slice(0, 80)}...
                  </p>

                  <h4 className="product-price">
                    Ksh{product.product_cost}
                  </h4>

                  {/* 🛍️ Add to Cart */}
                  <button
                    className="farm-btn"
                    onClick={() => addToCart(product)}
                  >
                    🛒 Add to Cart
                  </button>

                  {/* 💳 Buy Now */}
                  <button
                    className="farm-btn secondary-btn mt-2"
                    onClick={() => navigate("/makepayments", { state: product })}
                  >
                    💳 Buy Now
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
        <Footer/>
      </div>

   
  );
};

export default Getproducts;