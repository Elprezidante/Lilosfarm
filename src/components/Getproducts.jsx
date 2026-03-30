import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import "../css/Getproducts.css";
import Footer from './FarmFooter';
import HeroCarousel from "./HeroCarousel";

const Getproducts = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);

  // 🔍 Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const navigate = useNavigate();
  const img_url = "https://elprezidante.alwaysdata.net/static/images/";

  // =========================
  // 📦 FETCH PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://elprezidante.alwaysdata.net/api/get_products"
      );
      setProducts(res.data);
    } catch (err) {
      setError("❌ Failed to load products");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // 🛒 Load cart from storage
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  // =========================
  // 🛒 ADD TO CART
  // =========================
  const addToCart = (product) => {
    let updatedCart;

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      updatedCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // =========================
  // 💳 GO TO PAYMENT
  // =========================
  const handleCartClick = () => {
    if (cart.length === 0) {
      alert("🛒 Your cart is empty");
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.product_cost * item.quantity,
      0
    );

    navigate("/makepayments", {
      state: {
        cartItems: cart,
        total: total
      }
    });
  };

  // =========================
  // 📦 PLACE ORDER
  // =========================
  const placeOrder = async (product) => {
    try {
      await axios.post(
        "https://elprezidante.alwaysdata.net/api/add_order",
        {
          product_name: product.product_name,
          product_cost: product.product_cost,
          quantity: 1,
          total: product.product_cost
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      alert("✅ Order placed successfully!");
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      alert("❌ Failed to place order");
    }
  };

  // =========================
  // 🔥 FILTER LOGIC
  // =========================
  const filteredProducts = products.filter((product) => {

    const matchesSearch =
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      product.product_name.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesMin =
      minPrice === "" || product.product_cost >= Number(minPrice);

    const matchesMax =
      maxPrice === "" || product.product_cost <= Number(maxPrice);

    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div className="farm-container">

      {/* 🛒 CART */}
      <div
        className="cart-indicator"
        onClick={handleCartClick}
        style={{ cursor: "pointer" }}
      >
        🛒 {cart.reduce((sum, item) => sum + item.quantity, 0)}
      </div>

      <h2 className="farm-title">🌿 Available Farm Products 🌿</h2>

      {/* 🔍 FILTERS */}
      <div className="filters-container">

        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select onChange={(e) => setSelectedCategory(e.target.value)}>
          <option>All</option>
          <option>Chicken meat</option>
          <option>Chicken eggs</option>
          <option>Coriander</option>
          <option>Dairy</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      <HeroCarousel />

      {loading && <Loader />}
      {error && <h4 className="text-danger text-center">{error}</h4>}

      {filteredProducts.length === 0 && !loading && (
        <h3 className="no-results">❌ No products found</h3>
      )}

      {/* 🧺 PRODUCTS */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id}>
            <div className="card product-card shadow">

              <div className="img-wrapper">
                <img
                  src={img_url + product.product_photo}
                  alt={product.product_name}
                  className="product_img"
                />
              </div>

              <div className="card-body text-center">

                <h5>{product.product_name}</h5>

                <p>
                  {product.product_description.slice(0, 80)}...
                </p>

                <h4>Ksh {product.product_cost}</h4>

                {/* 🛒 ADD TO CART */}
                <button
                  className="farm-btn"
                  onClick={() => addToCart(product)}
                >
                  🛒 Add to Cart
                </button>

                {/* 💳 BUY NOW */}
                <button
                  className="farm-btn secondary-btn mt-2"
                  onClick={() => navigate("/makepayments", {
                    state: {
                      cartItems: [{ ...product, quantity: 1 }],
                      total: product.product_cost
                    }
                  })}
                >
                  💳 Buy Now
                </button>

                {/* 📦 PLACE ORDER */}
                <button
                  className="farm-btn mt-2"
                  onClick={() => placeOrder(product)}
                >
                  📦 Place Order
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Getproducts;