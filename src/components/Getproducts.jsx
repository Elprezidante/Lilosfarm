import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import "../css/Getproducts.css";
import Footer from './FarmFooter';
import HeroCarousel from "./HeroCarousel";
import FarmChatbot from "./FarmChatbot";

const Getproducts = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]); // always starts empty
  const [addedMap, setAddedMap] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const navigate = useNavigate();
  const img_url = "https://elprezidante.alwaysdata.net/static/images/";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://elprezidante.alwaysdata.net/api/get_products");
      setProducts(res.data);
    } catch (err) {
      setError("Failed to load products");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 1400);
  };

  const changeQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
          .filter(i => i.quantity > 0)
    );
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const handleCheckout = () => {
    if (!cart.length) return;
    const total = cart.reduce((s, i) => s + i.product_cost * i.quantity, 0);
    setCartOpen(false);
    navigate("/makepayments", { state: { cartItems: cart, total } });
  };

  const placeOrder = async (product) => {
    try {
      await axios.post(
        "https://elprezidante.alwaysdata.net/api/add_order",
        { product_name: product.product_name, product_cost: product.product_cost, quantity: 1, total: product.product_cost },
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Order placed successfully!");
    } catch (err) {
      alert("Failed to place order");
    }
  };

  const filteredProducts = products.filter(p => {
    const s = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const c = selectedCategory === "All" || p.product_name.toLowerCase().includes(selectedCategory.toLowerCase());
    const mn = minPrice === "" || p.product_cost >= Number(minPrice);
    const mx = maxPrice === "" || p.product_cost <= Number(maxPrice);
    return s && c && mn && mx;
  });

  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const totalCost = cart.reduce((s, i) => s + i.product_cost * i.quantity, 0);

  return (
    <div className="farm-container">
      <style>{`
        .cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:2000;opacity:0;pointer-events:none;transition:opacity 0.28s ease;}
        .cart-overlay.open{opacity:1;pointer-events:auto;}
        .cart-drawer{position:fixed;top:0;right:0;height:100vh;width:400px;max-width:95vw;background:#fff;z-index:2001;display:flex;flex-direction:column;transform:translateX(100%);transition:transform 0.32s cubic-bezier(0.4,0,0.2,1);box-shadow:-8px 0 48px rgba(0,0,0,0.14);}
        .cart-drawer.open{transform:translateX(0);}

        .cd-header{background:linear-gradient(135deg,#2d5a1b,#4a8f2e);padding:20px 20px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .cd-header-left{display:flex;align-items:center;gap:10px;}
        .cd-title{color:white;font-size:17px;font-weight:700;font-family:'Segoe UI',sans-serif;}
        .cd-count{background:rgba(255,255,255,0.22);color:white;font-size:12px;font-weight:700;padding:2px 9px;border-radius:20px;font-family:sans-serif;}
        .cd-close{background:rgba(255,255,255,0.18);border:none;border-radius:8px;color:white;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:background 0.15s;}
        .cd-close:hover{background:rgba(255,255,255,0.3);}

        .cd-body{flex:1;overflow-y:auto;padding:16px;background:#f7faf3;display:flex;flex-direction:column;gap:12px;}
        .cd-body::-webkit-scrollbar{width:4px;}
        .cd-body::-webkit-scrollbar-thumb{background:#c8e8a0;border-radius:4px;}

        .cd-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:3rem 1rem;text-align:center;}
        .cd-empty-icon{width:72px;height:72px;border-radius:50%;background:#eaf5d4;display:flex;align-items:center;justify-content:center;}
        .cd-empty h3{color:#2d5a1b;font-size:16px;margin:0;font-family:'Segoe UI',sans-serif;}
        .cd-empty p{color:#7a9a5a;font-size:13px;margin:0;font-family:sans-serif;line-height:1.6;}

        .cd-item{background:white;border-radius:14px;padding:14px 14px 14px 14px;display:flex;gap:12px;align-items:flex-start;border:1px solid #e8f0dc;position:relative;transition:box-shadow 0.2s;}
        .cd-item:hover{box-shadow:0 4px 16px rgba(45,90,27,0.1);}
        .cd-item-img{width:64px;height:64px;border-radius:10px;object-fit:cover;flex-shrink:0;background:#e8f5d8;}
        .cd-item-img-ph{width:64px;height:64px;border-radius:10px;background:linear-gradient(135deg,#e8f5d8,#c8e8a0);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:26px;}
        .cd-item-info{flex:1;min-width:0;padding-right:20px;}
        .cd-item-name{font-weight:700;font-size:14px;color:#2d3a1e;font-family:'Segoe UI',sans-serif;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .cd-item-unit{font-size:12px;color:#7a9a5a;font-family:sans-serif;margin-bottom:10px;}
        .cd-item-bottom{display:flex;align-items:center;justify-content:space-between;}
        .cd-qty-controls{display:flex;align-items:center;background:#f0f8e8;border-radius:20px;border:1px solid #c8e8a0;overflow:hidden;}
        .cd-qty-btn{background:none;border:none;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#3d7a25;font-size:18px;font-weight:700;transition:background 0.15s;font-family:sans-serif;}
        .cd-qty-btn:hover{background:#c8e8a0;}
        .cd-qty-num{min-width:30px;text-align:center;font-size:14px;font-weight:700;color:#2d5a1b;font-family:sans-serif;}
        .cd-item-price{font-size:15px;font-weight:700;color:#2d5a1b;font-family:'Segoe UI',sans-serif;}
        .cd-item-remove{position:absolute;top:10px;right:10px;background:none;border:none;cursor:pointer;color:#c8a0a0;padding:3px;border-radius:4px;display:flex;align-items:center;transition:color 0.15s;}
        .cd-item-remove:hover{color:#e74c3c;}

        .cd-footer{background:white;border-top:1px solid #e8f0dc;padding:16px 20px;flex-shrink:0;}
        .cd-summary{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
        .cd-summary-row{display:flex;justify-content:space-between;align-items:center;font-family:'Segoe UI',sans-serif;}
        .cd-summary-label{font-size:13px;color:#7a9a5a;}
        .cd-summary-val{font-size:13px;color:#2d3a1e;font-weight:600;}
        .cd-divider{height:1px;background:#e8f0dc;margin:6px 0;}
        .cd-total-label{font-size:15px;font-weight:700;color:#2d3a1e;}
        .cd-total-val{font-size:19px;font-weight:700;color:#2d5a1b;}
        .cd-actions{display:flex;gap:8px;}
        .cd-btn-clear{flex:0 0 auto;padding:12px 14px;border-radius:12px;border:1.5px solid #e0e8d0;background:white;color:#7a9a5a;font-size:13px;font-family:'Segoe UI',sans-serif;cursor:pointer;transition:background 0.15s,border-color 0.15s;}
        .cd-btn-clear:hover{background:#f0f8e8;border-color:#c8e8a0;}
        .cd-btn-checkout{flex:1;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#2d5a1b,#4a8f2e);color:white;font-size:14px;font-weight:700;font-family:'Segoe UI',sans-serif;cursor:pointer;transition:opacity 0.2s,transform 0.1s;display:flex;align-items:center;justify-content:center;gap:7px;}
        .cd-btn-checkout:hover{opacity:0.92;}
        .cd-btn-checkout:active{transform:scale(0.98);}

        .cart-indicator-pro{position:fixed;top:18px;right:22px;background:linear-gradient(135deg,#2d5a1b,#4a8f2e);color:white;border:none;border-radius:50px;padding:11px 20px;font-size:14px;font-weight:600;font-family:'Segoe UI',system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 22px rgba(45,90,27,0.42);z-index:1000;transition:transform 0.18s,box-shadow 0.18s;}
        .cart-indicator-pro:hover{transform:scale(1.06);box-shadow:0 7px 28px rgba(45,90,27,0.55);}
        .cart-badge{background:#ef4444;color:white;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white;font-family:sans-serif;animation:cartPop 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        @keyframes cartPop{from{transform:scale(0.4);}to{transform:scale(1);}}

        .img-wrapper{position:relative;overflow:hidden;border-radius:12px 12px 0 0;}
        .float-cart-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(27,60,10,0.88) 0%,rgba(27,60,10,0.18) 55%,transparent 100%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:16px;gap:7px;opacity:0;transition:opacity 0.26s ease;pointer-events:none;border-radius:12px 12px 0 0;}
        .product-card:hover .float-cart-overlay,.product-card:focus-within .float-cart-overlay{opacity:1;pointer-events:auto;}
        .float-add-btn{background:linear-gradient(135deg,#3d7a25,#5aaa38);color:white;border:none;border-radius:28px;padding:10px 24px;font-size:13.5px;font-weight:700;font-family:'Segoe UI',system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;gap:7px;box-shadow:0 4px 18px rgba(45,90,27,0.55);transform:translateY(10px);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),background 0.2s;min-width:148px;justify-content:center;}
        .product-card:hover .float-add-btn{transform:translateY(0);}
        .float-add-btn:hover{background:linear-gradient(135deg,#2d5a1b,#4a8f2e);transform:translateY(-2px) !important;}
        .float-add-btn.added{background:linear-gradient(135deg,#16a34a,#22c55e);pointer-events:none;}
        .float-qty-badge{background:rgba(255,255,255,0.2);color:white;font-size:11.5px;font-weight:600;font-family:sans-serif;border-radius:20px;padding:3px 13px;border:1px solid rgba(255,255,255,0.3);transform:translateY(10px);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.05s;}
        .product-card:hover .float-qty-badge{transform:translateY(0);}
        .product-card .product_img{transition:transform 0.38s ease;width:100%;display:block;}
        .product-card:hover .product_img{transform:scale(1.07);}
      `}</style>

      {/* Backdrop */}
      <div className={`cart-overlay ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />

      {/* Cart Drawer */}
      <div className={`cart-drawer ${cartOpen ? "open" : ""}`}>
        <div className="cd-header">
          <div className="cd-header-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="cd-title">Your Cart</span>
            {totalQty > 0 && <span className="cd-count">{totalQty} item{totalQty !== 1 ? "s" : ""}</span>}
          </div>
          <button className="cd-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        <div className="cd-body">
          {cart.length === 0 ? (
            <div className="cd-empty">
              <div className="cd-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#5aaa38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6" stroke="#5aaa38" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M16 10a4 4 0 01-8 0" stroke="#5aaa38" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Your cart is empty</h3>
              <p>Hover over any product and tap<br/>"Add to Cart" to get started!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cd-item">
                <button className="cd-item-remove" onClick={() => removeItem(item.id)} title="Remove item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </button>
                {item.product_photo
                  ? <img src={`${img_url}${item.product_photo}`} alt={item.product_name} className="cd-item-img" onError={e => e.target.style.display="none"} />
                  : <div className="cd-item-img-ph">🌿</div>
                }
                <div className="cd-item-info">
                  <div className="cd-item-name">{item.product_name}</div>
                  <div className="cd-item-unit">Ksh {item.product_cost.toLocaleString()} per unit</div>
                  <div className="cd-item-bottom">
                    <div className="cd-qty-controls">
                      <button className="cd-qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                      <span className="cd-qty-num">{item.quantity}</span>
                      <button className="cd-qty-btn" onClick={() => changeQty(item.id, +1)}>+</button>
                    </div>
                    <span className="cd-item-price">Ksh {(item.product_cost * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cd-footer">
            <div className="cd-summary">
              {cart.map(item => (
                <div key={item.id} className="cd-summary-row">
                  <span className="cd-summary-label">{item.product_name} × {item.quantity}</span>
                  <span className="cd-summary-val">Ksh {(item.product_cost * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="cd-divider"/>
              <div className="cd-summary-row">
                <span className="cd-total-label">Total</span>
                <span className="cd-total-val">Ksh {totalCost.toLocaleString()}</span>
              </div>
            </div>
            <div className="cd-actions">
              <button className="cd-btn-clear" onClick={clearCart}>Clear all</button>
              <button className="cd-btn-checkout" onClick={handleCheckout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Checkout · Ksh {totalCost.toLocaleString()}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <button className="cart-indicator-pro" onClick={() => setCartOpen(true)}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        My Cart
        {totalQty > 0 && <span key={totalQty} className="cart-badge">{totalQty}</span>}
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
      {filteredProducts.length === 0 && !loading && <h3 className="no-results">❌ No products found</h3>}

      <div className="products-grid">
        {filteredProducts.map(product => {
          const inCart = cart.find(i => i.id === product.id);
          const isAdded = addedMap[product.id];
          return (
            <div key={product.id}>
              <div className="card product-card shadow">
                <div className="img-wrapper">
                  <img src={img_url + product.product_photo} alt={product.product_name} className="product_img" />
                  <div className="float-cart-overlay">
                    {inCart && <div className="float-qty-badge">✓ {inCart.quantity} in cart</div>}
                    <button className={`float-add-btn ${isAdded ? "added" : ""}`} onClick={() => addToCart(product)}>
                      {isAdded ? (
                        <><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Added!</>
                      ) : (
                        <><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>Add to Cart</>
                      )}
                    </button>
                  </div>
                </div>
                <div className="card-body text-center">
                  <h5>{product.product_name}</h5>
                  <p>{product.product_description.slice(0, 80)}...</p>
                  <h4>Ksh {product.product_cost}</h4>
                  <button className="farm-btn secondary-btn mt-2" onClick={() => navigate("/makepayments", { state: { cartItems: [{ ...product, quantity: 1 }], total: product.product_cost } })}>
                    💳 Buy Now
                  </button>
                  <button className="farm-btn mt-2" onClick={() => placeOrder(product)}>
                    📦 Place Order
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