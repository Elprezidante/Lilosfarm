import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import "../css/Getproducts.css";
import Footer from './FarmFooter';
import HeroCarousel from "./HeroCarousel";
import FarmChatbot from "./FarmChatbot";

const API = "https://elprezidante.alwaysdata.net/api";
const IMG = "https://elprezidante.alwaysdata.net/static/images/";

// ── Helper: get the JWT token saved at login ────────────────────────────────
const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access") ||
  sessionStorage.getItem("token") ||
  null;

const Getproducts = () => {

  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [cart,         setCart]         = useState([]);   // { ...product, _key, quantity }
  const [addedMap,     setAddedMap]     = useState({});
  const [cartOpen,     setCartOpen]     = useState(false);
  const [toasts,       setToasts]       = useState([]);
  const [orderingKey,  setOrderingKey]  = useState(null);

  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice,         setMinPrice]          = useState("");
  const [maxPrice,         setMaxPrice]          = useState("");

  const navigate = useNavigate();

  // ── TOAST ────────────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── FETCH PRODUCTS — no token required (public endpoint) ─────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/get_products`);
      setProducts(res.data);
    } catch (err) {
      setError("Failed to load products. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  // ── CART ACTIONS ─────────────────────────────────────────────────────────
  const addToCart = (product) => {
    const key = product.product_name;
    setCart(prev => {
      const exists = prev.find(i => i._key === key);
      if (exists) return prev.map(i => i._key === key ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, _key: key, quantity: 1 }];
    });
    setAddedMap(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [key]: false })), 1400);
  };

  const changeQty  = (key, delta) => setCart(prev =>
    prev.map(i => i._key === key ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0)
  );
  const removeItem = (key) => setCart(prev => prev.filter(i => i._key !== key));
  const clearCart  = ()    => setCart([]);

  const handleCheckout = () => {
    if (!cart.length) return;
    const total = cart.reduce((s, i) => s + i.product_cost * i.quantity, 0);
    setCartOpen(false);
    navigate("/makepayments", { state: { cartItems: cart, total } });
  };

  // ── PLACE ORDER — sends JWT token so backend records it in the DB ─────────
  const placeOrder = async (product) => {
    const key   = product.product_name;
    const token = getToken();

    // User must be logged in for orders to be tracked in the admin dashboard
    if (!token) {
      toast("⚠️ Please log in first to place an order.", "error");
      navigate("/login"); // adjust this path to match your login route
      return;
    }

    setOrderingKey(key);

    const payload = {
      product_name: product.product_name,
      product_cost: product.product_cost,
      quantity:     1,
      total:        product.product_cost * 1,
    };

    try {
      const res = await axios.post(`${API}/add_order`, payload, {
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("✅ Order response:", res.data);
      toast(`✅ Order for "${product.product_name}" placed! Check the admin dashboard.`, "success");

    } catch (err) {
      const status  = err.response?.status;
      const detail  = err.response?.data;

      // Log the exact server error so you can debug
      console.error("❌ Order failed | Status:", status, "| Response:", detail);

      let msg = "Failed to place order.";
      if (status === 401) msg = "Session expired — please log in again.";
      else if (status === 403) msg = "Not authorised to place orders.";
      else if (status === 400) msg = `Bad request: ${JSON.stringify(detail)}`;
      else if (status === 500) msg = "Server error — check your backend logs.";
      else if (!status)        msg = "Network error — is the server running?";

      toast(`❌ ${msg}`, "error");
    } finally {
      setOrderingKey(null);
    }
  };

  // ── FILTER ───────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const name = p.product_name.toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" || name.includes(selectedCategory.toLowerCase())) &&
      (minPrice === "" || p.product_cost >= Number(minPrice)) &&
      (maxPrice === "" || p.product_cost <= Number(maxPrice))
    );
  });

  const totalQty  = cart.reduce((s, i) => s + i.quantity, 0);
  const totalCost = cart.reduce((s, i) => s + i.product_cost * i.quantity, 0);

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="farm-container">
      <style>{`
        /* TOASTS */
        .toast-stack{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:10px;z-index:9999;pointer-events:none;align-items:center;}
        .toast{padding:13px 22px;border-radius:14px;font-size:14px;font-weight:600;font-family:'Segoe UI',sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.2);animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);max-width:90vw;text-align:center;}
        .toast.success{background:#2d5a1b;color:white;}
        .toast.error{background:#b91c1c;color:white;}
        @keyframes toastIn{from{opacity:0;transform:translateY(16px) scale(0.94);}to{opacity:1;transform:translateY(0) scale(1);}}

        /* OVERLAY */
        .cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:2000;opacity:0;pointer-events:none;transition:opacity 0.28s ease;}
        .cart-overlay.open{opacity:1;pointer-events:auto;}

        /* DRAWER */
        .cart-drawer{position:fixed;top:0;right:0;height:100vh;width:400px;max-width:95vw;background:#fff;z-index:2001;display:flex;flex-direction:column;transform:translateX(100%);transition:transform 0.32s cubic-bezier(0.4,0,0.2,1);box-shadow:-8px 0 48px rgba(0,0,0,0.14);}
        .cart-drawer.open{transform:translateX(0);}
        .cd-header{background:linear-gradient(135deg,#2d5a1b,#4a8f2e);padding:20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .cd-header-left{display:flex;align-items:center;gap:10px;}
        .cd-title{color:white;font-size:17px;font-weight:700;font-family:'Segoe UI',sans-serif;}
        .cd-count{background:rgba(255,255,255,0.22);color:white;font-size:12px;font-weight:700;padding:2px 10px;border-radius:20px;font-family:sans-serif;}
        .cd-close{background:rgba(255,255,255,0.18);border:none;border-radius:8px;color:white;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:background 0.15s;flex-shrink:0;}
        .cd-close:hover{background:rgba(255,255,255,0.3);}
        .cd-body{flex:1;overflow-y:auto;padding:14px;background:#f7faf3;display:flex;flex-direction:column;gap:10px;}
        .cd-body::-webkit-scrollbar{width:4px;}
        .cd-body::-webkit-scrollbar-thumb{background:#c8e8a0;border-radius:4px;}
        .cd-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:3rem 1rem;text-align:center;}
        .cd-empty-icon{width:70px;height:70px;border-radius:50%;background:#eaf5d4;display:flex;align-items:center;justify-content:center;}
        .cd-empty h3{color:#2d5a1b;font-size:16px;margin:0;font-family:'Segoe UI',sans-serif;}
        .cd-empty p{color:#7a9a5a;font-size:13px;margin:0;font-family:sans-serif;line-height:1.7;}
        .cd-item{background:white;border-radius:14px;padding:12px;display:flex;gap:11px;align-items:flex-start;border:1px solid #e8f0dc;position:relative;transition:box-shadow 0.2s;}
        .cd-item:hover{box-shadow:0 4px 16px rgba(45,90,27,0.1);}
        .cd-item-img{width:60px;height:60px;border-radius:10px;object-fit:cover;flex-shrink:0;border:1px solid #e8f0dc;}
        .cd-item-img-ph{width:60px;height:60px;border-radius:10px;background:linear-gradient(135deg,#e8f5d8,#c8e8a0);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px;}
        .cd-item-info{flex:1;min-width:0;padding-right:22px;}
        .cd-item-name{font-weight:700;font-size:13.5px;color:#2d3a1e;font-family:'Segoe UI',sans-serif;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .cd-item-unit{font-size:11.5px;color:#7a9a5a;font-family:sans-serif;margin-bottom:9px;}
        .cd-item-bottom{display:flex;align-items:center;justify-content:space-between;}
        .cd-qty{display:flex;align-items:center;background:#f0f8e8;border-radius:20px;border:1px solid #c8e8a0;overflow:hidden;}
        .cd-qty-btn{background:none;border:none;width:30px;height:30px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#3d7a25;font-size:17px;font-weight:700;transition:background 0.15s;}
        .cd-qty-btn:hover{background:#c8e8a0;}
        .cd-qty-num{min-width:28px;text-align:center;font-size:13px;font-weight:700;color:#2d5a1b;font-family:sans-serif;}
        .cd-item-subtotal{font-size:14px;font-weight:700;color:#2d5a1b;font-family:'Segoe UI',sans-serif;}
        .cd-remove{position:absolute;top:9px;right:9px;background:none;border:none;cursor:pointer;color:#d0b0b0;padding:2px;border-radius:4px;display:flex;align-items:center;transition:color 0.15s;}
        .cd-remove:hover{color:#e74c3c;}
        .cd-footer{background:white;border-top:1.5px solid #e8f0dc;padding:14px 18px;flex-shrink:0;}
        .cd-breakdown{display:flex;flex-direction:column;gap:5px;margin-bottom:10px;}
        .cd-row{display:flex;justify-content:space-between;align-items:center;font-family:'Segoe UI',sans-serif;}
        .cd-row-label{font-size:12.5px;color:#7a9a5a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;}
        .cd-row-val{font-size:12.5px;color:#2d3a1e;font-weight:600;flex-shrink:0;margin-left:8px;}
        .cd-divider{height:1px;background:#e8f0dc;margin:8px 0;}
        .cd-total-row{display:flex;justify-content:space-between;align-items:center;font-family:'Segoe UI',sans-serif;margin-bottom:12px;}
        .cd-total-label{font-size:15px;font-weight:700;color:#2d3a1e;}
        .cd-total-val{font-size:19px;font-weight:700;color:#2d5a1b;}
        .cd-actions{display:flex;gap:8px;}
        .cd-btn-clear{padding:12px 14px;border-radius:12px;border:1.5px solid #e0e8d0;background:white;color:#7a9a5a;font-size:13px;font-family:'Segoe UI',sans-serif;cursor:pointer;transition:background 0.15s;white-space:nowrap;}
        .cd-btn-clear:hover{background:#f0f8e8;border-color:#b0d890;}
        .cd-btn-checkout{flex:1;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#2d5a1b,#4a8f2e);color:white;font-size:14px;font-weight:700;font-family:'Segoe UI',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:opacity 0.2s;}
        .cd-btn-checkout:hover{opacity:0.9;}

        /* FLOATING CART BUTTON */
        .cart-fab{position:fixed;top:18px;right:22px;background:linear-gradient(135deg,#2d5a1b,#4a8f2e);color:white;border:none;border-radius:50px;padding:11px 20px;font-size:14px;font-weight:600;font-family:'Segoe UI',sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 22px rgba(45,90,27,0.42);z-index:1000;transition:transform 0.18s,box-shadow 0.18s;}
        .cart-fab:hover{transform:scale(1.06);box-shadow:0 7px 28px rgba(45,90,27,0.55);}
        .cart-fab-badge{background:#ef4444;color:white;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white;font-family:sans-serif;animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        @keyframes popIn{from{transform:scale(0.3);}to{transform:scale(1);}}

        /* PRODUCT HOVER OVERLAY */
        .img-wrapper{position:relative;overflow:hidden;border-radius:12px 12px 0 0;}
        .float-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(20,50,5,0.9) 0%,rgba(20,50,5,0.15) 55%,transparent 100%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:16px;gap:7px;opacity:0;transition:opacity 0.25s ease;pointer-events:none;}
        .product-card:hover .float-overlay,.product-card:focus-within .float-overlay{opacity:1;pointer-events:auto;}
        .float-btn{background:linear-gradient(135deg,#3d7a25,#5aaa38);color:white;border:none;border-radius:28px;padding:10px 24px;font-size:13px;font-weight:700;font-family:'Segoe UI',sans-serif;cursor:pointer;display:flex;align-items:center;gap:7px;box-shadow:0 4px 18px rgba(45,90,27,0.5);transform:translateY(10px);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),background 0.2s;min-width:140px;justify-content:center;}
        .product-card:hover .float-btn{transform:translateY(0);}
        .float-btn:hover{background:linear-gradient(135deg,#2d5a1b,#4a8f2e);transform:translateY(-2px)!important;}
        .float-btn.added{background:linear-gradient(135deg,#16a34a,#22c55e);pointer-events:none;}
        .float-in-cart{background:rgba(255,255,255,0.18);color:white;font-size:11px;font-weight:600;font-family:sans-serif;border-radius:20px;padding:3px 12px;border:1px solid rgba(255,255,255,0.3);transform:translateY(10px);transition:transform 0.32s cubic-bezier(0.34,1.56,0.64,1) 0.04s;}
        .product-card:hover .float-in-cart{transform:translateY(0);}
        .product-card .product_img{transition:transform 0.38s ease;width:100%;display:block;}
        .product-card:hover .product_img{transform:scale(1.07);}

        /* PLACE ORDER BUTTON STATES */
        .farm-btn.ordering{opacity:0.65;cursor:not-allowed;pointer-events:none;}
        .spin{display:inline-block;animation:spin 0.8s linear infinite;margin-right:4px;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* TOASTS */}
      <div className="toast-stack">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>

      {/* BACKDROP */}
      <div className={`cart-overlay ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />

      {/* CART DRAWER */}
      <div className={`cart-drawer ${cartOpen ? "open" : ""}`}>
        <div className="cd-header">
          <div className="cd-header-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="cd-title">My Cart</span>
            {totalQty > 0 && <span className="cd-count">{totalQty} item{totalQty !== 1 ? "s" : ""}</span>}
          </div>
          <button className="cd-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        <div className="cd-body">
          {cart.length === 0 ? (
            <div className="cd-empty">
              <div className="cd-empty-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#5aaa38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6" stroke="#5aaa38" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M16 10a4 4 0 01-8 0" stroke="#5aaa38" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Your cart is empty</h3>
              <p>Hover over any product and click<br/>"Add to Cart" to get started!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._key} className="cd-item">
                <button className="cd-remove" onClick={() => removeItem(item._key)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </button>
                {item.product_photo
                  ? <img src={`${IMG}${item.product_photo}`} alt={item.product_name} className="cd-item-img" onError={e => { e.target.style.display="none"; }}/>
                  : <div className="cd-item-img-ph">🌿</div>
                }
                <div className="cd-item-info">
                  <div className="cd-item-name">{item.product_name}</div>
                  <div className="cd-item-unit">Ksh {item.product_cost.toLocaleString()} / unit</div>
                  <div className="cd-item-bottom">
                    <div className="cd-qty">
                      <button className="cd-qty-btn" onClick={() => changeQty(item._key, -1)}>−</button>
                      <span className="cd-qty-num">{item.quantity}</span>
                      <button className="cd-qty-btn" onClick={() => changeQty(item._key, +1)}>+</button>
                    </div>
                    <span className="cd-item-subtotal">Ksh {(item.product_cost * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cd-footer">
            <div className="cd-breakdown">
              {cart.map(item => (
                <div key={item._key} className="cd-row">
                  <span className="cd-row-label">{item.product_name} × {item.quantity}</span>
                  <span className="cd-row-val">Ksh {(item.product_cost * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="cd-divider"/>
            <div className="cd-total-row">
              <span className="cd-total-label">Total</span>
              <span className="cd-total-val">Ksh {totalCost.toLocaleString()}</span>
            </div>
            <div className="cd-actions">
              <button className="cd-btn-clear" onClick={clearCart}>Clear all</button>
              <button className="cd-btn-checkout" onClick={handleCheckout}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Checkout · Ksh {totalCost.toLocaleString()}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING CART BUTTON */}
      <button className="cart-fab" onClick={() => setCartOpen(true)}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        My Cart
        {totalQty > 0 && <span key={totalQty} className="cart-fab-badge">{totalQty}</span>}
      </button>

      <h2 className="farm-title">🌿 Available Farm Products 🌿</h2>

      <div className="filters-container">
        <input type="text" placeholder="🔍 Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select onChange={e => setSelectedCategory(e.target.value)}>
          <option>All</option>
          <option>Chicken meat</option>
          <option>Chicken eggs</option>
          <option>Coriander</option>
          <option>Dairy</option>
        </select>
        <input type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
        <input type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
      </div>

      <HeroCarousel />
      {loading && <Loader />}
      {error && <h4 className="text-danger text-center">{error}</h4>}
      {filtered.length === 0 && !loading && <h3 className="no-results">❌ No products found</h3>}

      <div className="products-grid">
        {filtered.map(product => {
          const key        = product.product_name;
          const inCart     = cart.find(i => i._key === key);
          const isAdded    = addedMap[key];
          const isOrdering = orderingKey === key;

          return (
            <div key={key}>
              <div className="card product-card shadow">
                <div className="img-wrapper">
                  <img src={IMG + product.product_photo} alt={product.product_name} className="product_img" />
                  <div className="float-overlay">
                    {inCart && <div className="float-in-cart">✓ {inCart.quantity} in cart</div>}
                    <button className={`float-btn ${isAdded ? "added" : ""}`} onClick={() => addToCart(product)}>
                      {isAdded
                        ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Added!</>
                        : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>Add to Cart</>
                      }
                    </button>
                  </div>
                </div>

                <div className="card-body text-center">
                  <h5>{product.product_name}</h5>
                  <p>{product.product_description.slice(0, 80)}...</p>
                  <h4>Ksh {product.product_cost}</h4>

                  <button
                    className="farm-btn secondary-btn mt-2"
                    onClick={() => navigate("/makepayments", {
                      state: { cartItems: [{ ...product, quantity: 1 }], total: product.product_cost }
                    })}
                  >
                    💳 Buy Now
                  </button>

                  {/* PLACE ORDER — requires login, records in admin dashboard */}
                  <button
                    className={`farm-btn mt-2 ${isOrdering ? "ordering" : ""}`}
                    onClick={() => placeOrder(product)}
                    disabled={isOrdering}
                  >
                    {isOrdering
                      ? <><span className="spin">⏳</span> Placing...</>
                      : "📦 Place Order"
                    }
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
      <FarmChatbot />
    </div>
  );
};

export default Getproducts;