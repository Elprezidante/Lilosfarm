import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import Footer from './FarmFooter';
import HeroCarousel from "./HeroCarousel";
import FarmChatbot from "./FarmChatbot";
import "../css/Getproducts.css";

const API = "https://elprezidante.alwaysdata.net/api";
const IMG = "https://elprezidante.alwaysdata.net/static/images/";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access") ||
  sessionStorage.getItem("token") ||
  null;

const Getproducts = () => {
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [cart,        setCart]        = useState([]);
  const [addedMap,    setAddedMap]    = useState({});
  const [cartOpen,    setCartOpen]    = useState(false);
  const [toasts,      setToasts]      = useState([]);

  // Per-product button loading states
  const [buyingKey,    setBuyingKey]    = useState(null); // "Buy Now" in progress
  const [orderingKey,  setOrderingKey]  = useState(null); // "Place Order" in progress

  // Order tracking (local history)
  const [myOrders,     setMyOrders]     = useState([]);
  const [orderModal,   setOrderModal]   = useState(null); // { product, qty }
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [ordersOpen,   setOrdersOpen]   = useState(false);

  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice,         setMinPrice]          = useState("");
  const [maxPrice,         setMaxPrice]          = useState("");

  const navigate = useNavigate();
  const STATUS_STEPS = ["Placed", "Confirmed", "Preparing", "Ready", "Delivered"];

  // ── Load saved orders ────────────────────────────────────────────────────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("myOrders") || "[]");
    setMyOrders(saved);
  }, []);

  const saveOrders = (orders) => {
    setMyOrders(orders);
    localStorage.setItem("myOrders", JSON.stringify(orders));
  };

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/get_products`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  // ── Record order on backend (used by both Buy Now AND Place Order) ─────────
  const recordOrder = async (product, qty = 1) => {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    await axios.post(`${API}/add_order`, {
      product_name: product.product_name,
      product_cost: product.product_cost,
      quantity:     qty,
      total:        product.product_cost * qty,
    }, { headers });

    // Save to local order history so user can track
    const orderId  = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id:            orderId,
      product_name:  product.product_name,
      product_photo: product.product_photo,
      product_cost:  product.product_cost,
      quantity:      qty,
      total:         product.product_cost * qty,
      status:        "Placed",
      placed_at:     new Date().toISOString(),
    };
    saveOrders([newOrder, ...myOrders]);
    return orderId;
  };

  // ── BUY NOW — records in admin dashboard THEN goes to payment ─────────────
  const handleBuyNow = async (product) => {
    const key = product.product_name;
    setBuyingKey(key);
    try {
      // Record in admin dashboard first
      await recordOrder(product, 1);
      toast(`✅ "${product.product_name}" recorded! Proceeding to payment...`, "success");
      // Then navigate to payment
      setTimeout(() => {
        navigate("/makepayments", {
          state: {
            cartItems: [{ ...product, quantity: 1 }],
            total: product.product_cost,
          },
        });
      }, 800);
    } catch (err) {
      console.error("Buy now error:", err);
      // Even if recording fails, still go to payment
      navigate("/makepayments", {
        state: {
          cartItems: [{ ...product, quantity: 1 }],
          total: product.product_cost,
        },
      });
    } finally {
      setBuyingKey(null);
    }
  };

  // ── PLACE ORDER — opens qty modal then records in admin dashboard ──────────
  const openOrderModal = (product) => setOrderModal({ product, qty: 1 });

  const submitOrder = async () => {
    if (!orderModal) return;
    const { product, qty } = orderModal;
    setOrderingKey(product.product_name);
    try {
      const orderId = await recordOrder(product, qty);
      setOrderModal(null);
      setOrderSuccess({ product, orderId, qty, total: product.product_cost * qty });
      toast(`✅ Order placed! Visible in admin dashboard.`, "success");
    } catch (err) {
      console.error("Place order error:", err);
      const status = err.response?.status;
      let msg = "Failed to place order.";
      if (status === 401 || status === 403) msg = "Please log in to place orders.";
      else if (status === 400) msg = `Missing fields: ${JSON.stringify(err.response?.data)}`;
      toast(`❌ ${msg}`, "error");
    } finally {
      setOrderingKey(null);
    }
  };

  // ── Cart actions ──────────────────────────────────────────────────────────
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
 

  const handleCheckout = () => {
    if (!cart.length) return;
    const total = cart.reduce((s, i) => s + i.product_cost * i.quantity, 0);
    setCartOpen(false);
    navigate("/makepayments", { state: { cartItems: cart, total } });
  };

  // ── Filter ────────────────────────────────────────────────────────────────
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
  // const fmt = (n) => `Ksh ${Number(n).toLocaleString()}`;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#e8f5e2", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        /* ── TOASTS ── */
        .gp-toasts{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:10px;z-index:9999;pointer-events:none;align-items:center;}
        .gp-toast{padding:12px 22px;border-radius:12px;font-size:14px;font-weight:600;font-family:'Segoe UI',sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.18);animation:gpToastIn 0.3s ease;max-width:90vw;text-align:center;}
        .gp-toast.success{background:#1a7a28;color:white;}
        .gp-toast.error{background:#b91c1c;color:white;}
        .gp-toast.info{background:#1a4a7a;color:white;}
        @keyframes gpToastIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

        /* ── NAVBAR ── */
        .gp-navbar{background:linear-gradient(90deg,#22c55e,#16a34a);padding:12px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:500;box-shadow:0 2px 12px rgba(22,163,74,0.3);}
        .gp-nav-brand{color:white;font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;}
    
        .gp-nav-link{color:rgba(255,255,255,0.9);font-size:13px;font-weight:500;padding:6px 14px;border-radius:20px;text-decoration:none;border:none;background:none;cursor:pointer;transition:background 0.15s;font-family:'Segoe UI',sans-serif;}
        .gp-nav-link:hover{background:rgba(255,255,255,0.18);}
        .gp-nav-btn{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:white;font-size:12px;font-weight:600;padding:7px 18px;border-radius:20px;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:'Segoe UI',sans-serif;transition:background 0.15s;}
        .gp-nav-btn:hover{background:rgba(255,255,255,0.3);}
        .gp-nav-badge{background:#f97316;color:white;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;margin-left:4px;}

        /* ── PAGE TITLE ── */
        .gp-title{text-align:center;padding:28px 16px 8px;font-size:clamp(26px,4vw,40px);font-weight:800;color:#15803d;display:flex;align-items:center;justify-content:center;gap:10px;}

        /* ── FILTERS ── */
        .gp-filters{display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 20px 20px;flex-wrap:wrap;}
        .gp-search-wrap{position:relative;}
        .gp-search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#888;font-size:13px;pointer-events:none;}
        .gp-filter-input{padding:9px 14px 9px 34px;border:1.5px solid #d1fae5;border-radius:8px;font-size:13px;background:white;color:#333;outline:none;transition:border-color 0.2s;font-family:'Segoe UI',sans-serif;}
        .gp-filter-input:focus{border-color:#22c55e;}
        .gp-filter-select{padding:9px 12px;border:1.5px solid #d1fae5;border-radius:8px;font-size:13px;background:white;color:#333;outline:none;font-family:'Segoe UI',sans-serif;}
        .gp-filter-select:focus{border-color:#22c55e;}
        .gp-price-input{padding:9px 12px;border:1.5px solid #d1fae5;border-radius:8px;font-size:13px;width:90px;background:white;outline:none;font-family:'Segoe UI',sans-serif;}
        .gp-price-input:focus{border-color:#22c55e;}

        /* ── GRID ── */
        .gp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:20px;padding:16px 28px 40px;max-width:1280px;margin:0 auto;}

        /* ── PRODUCT CARD — matches screenshot exactly ── */
        .gp-card{background:white;border-radius:18px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);transition:transform 0.2s,box-shadow 0.2s;}
        .gp-card:hover{transform:translateY(-4px);box-shadow:0 8px 28px rgba(0,0,0,0.13);}
        .gp-img-wrap{position:relative;overflow:hidden;height:170px;}
        .gp-product-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.35s ease;}
        .gp-card:hover .gp-product-img{transform:scale(1.06);}
        .gp-img-ph{width:100%;height:100%;background:linear-gradient(135deg,#dcfce7,#a7f3d0);display:flex;align-items:center;justify-content:center;font-size:44px;}

        /* hover add to cart overlay */
        .gp-hover-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.22s;}
        .gp-card:hover .gp-hover-overlay{opacity:1;}
        .gp-add-cart-btn{background:white;color:#16a34a;font-size:13px;font-weight:700;border:none;border-radius:24px;padding:9px 22px;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(0,0,0,0.2);transition:background 0.15s,transform 0.1s;font-family:'Segoe UI',sans-serif;}
        .gp-add-cart-btn:hover{background:#f0fdf4;transform:scale(1.04);}
        .gp-add-cart-btn.added{background:#16a34a;color:white;}
        .gp-in-cart{position:absolute;top:10px;right:10px;background:#16a34a;color:white;font-size:11px;font-weight:700;border-radius:20px;padding:3px 10px;font-family:'Segoe UI',sans-serif;}

        /* card body — matches screenshot */
        .gp-card-body{padding:14px 16px 18px;text-align:center;}
        .gp-product-name{font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:6px;font-family:'Segoe UI',sans-serif;}
        .gp-product-desc{font-size:12.5px;color:#666;margin-bottom:12px;line-height:1.5;font-family:'Segoe UI',sans-serif;}
        .gp-product-price{font-size:22px;font-weight:800;color:#15803d;margin-bottom:14px;font-family:'Segoe UI',sans-serif;}

        /* BUY NOW — blue pill (matches screenshot) */
        .gp-buy-btn{width:100%;padding:11px;border-radius:28px;border:none;background:linear-gradient(90deg,#3b82f6,#2563eb);color:white;font-size:14px;font-weight:700;font-family:'Segoe UI',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:8px;transition:opacity 0.2s,transform 0.1s;box-shadow:0 3px 10px rgba(37,99,235,0.35);}
        .gp-buy-btn:hover:not(:disabled){opacity:0.92;transform:translateY(-1px);}
        .gp-buy-btn:disabled{opacity:0.55;cursor:not-allowed;transform:none;}

        /* PLACE ORDER — green pill (matches screenshot) */
        .gp-order-btn{width:100%;padding:11px;border-radius:28px;border:none;background:linear-gradient(90deg,#22c55e,#16a34a);color:white;font-size:14px;font-weight:700;font-family:'Segoe UI',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:opacity 0.2s,transform 0.1s;box-shadow:0 3px 10px rgba(22,163,74,0.35);}
        .gp-order-btn:hover:not(:disabled){opacity:0.92;transform:translateY(-1px);}
        .gp-order-btn:disabled{opacity:0.55;cursor:not-allowed;transform:none;}

        /* ── CART DRAWER ── */
        .gp-cart-ov{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:2000;opacity:0;pointer-events:none;transition:opacity 0.25s;}
        .gp-cart-ov.open{opacity:1;pointer-events:auto;}
        .gp-cart-drawer{position:fixed;top:0;right:0;height:100vh;width:380px;max-width:95vw;background:white;z-index:2001;display:flex;flex-direction:column;transform:translateX(100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);box-shadow:-6px 0 40px rgba(0,0,0,0.14);}
        .gp-cart-drawer.open{transform:translateX(0);}
        .gp-cd-head{background:linear-gradient(135deg,#16a34a,#22c55e);padding:18px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .gp-cd-title{color:white;font-size:16px;font-weight:700;}
        .gp-cd-close{background:rgba(255,255,255,0.2);border:none;color:white;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:17px;display:flex;align-items:center;justify-content:center;}
        .gp-cd-body{flex:1;overflow-y:auto;padding:14px;background:#f0fdf4;display:flex;flex-direction:column;gap:10px;}
        .gp-cd-item{background:white;border-radius:12px;padding:12px;display:flex;gap:10px;border:1px solid #dcfce7;align-items:center;}
        .gp-cd-item-img{width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0;}
        .gp-cd-item-name{font-size:13px;font-weight:700;color:#1a1a1a;}
        .gp-cd-item-price{font-size:12px;color:#16a34a;font-weight:600;}
        .gp-cd-qty{display:flex;align-items:center;gap:6px;margin-top:4px;}
        .gp-cd-qty-btn{background:#dcfce7;border:none;border-radius:6px;width:24px;height:24px;cursor:pointer;color:#16a34a;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;}
        .gp-cd-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#86efac;font-size:13px;}
        .gp-cd-foot{padding:14px 18px;border-top:1px solid #dcfce7;background:white;flex-shrink:0;}
        .gp-cd-total{font-size:17px;font-weight:700;color:#15803d;margin-bottom:10px;display:flex;justify-content:space-between;}
        .gp-cd-checkout{width:100%;padding:12px;border-radius:24px;border:none;background:linear-gradient(90deg,#22c55e,#16a34a);color:white;font-size:14px;font-weight:700;cursor:pointer;font-family:'Segoe UI',sans-serif;}

        /* ── MY ORDERS DRAWER ── */
        .gp-mo-ov{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:2000;opacity:0;pointer-events:none;transition:opacity 0.25s;}
        .gp-mo-ov.open{opacity:1;pointer-events:auto;}
        .gp-mo-drawer{position:fixed;top:0;right:0;height:100vh;width:400px;max-width:95vw;background:white;z-index:2001;display:flex;flex-direction:column;transform:translateX(100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);box-shadow:-6px 0 40px rgba(0,0,0,0.14);}
        .gp-mo-drawer.open{transform:translateX(0);}
        .gp-mo-body{flex:1;overflow-y:auto;padding:14px;background:#f0fdf4;display:flex;flex-direction:column;gap:12px;}
        .gp-oc{background:white;border-radius:14px;border:1px solid #dcfce7;overflow:hidden;}
        .gp-oc-top{display:flex;gap:12px;padding:14px;align-items:center;}
        .gp-oc-img{width:52px;height:52px;border-radius:10px;object-fit:cover;flex-shrink:0;}
        .gp-oc-steps{display:flex;align-items:flex-start;padding:0 14px 14px;}
        .gp-oc-step{display:flex;flex-direction:column;align-items:center;flex:1;position:relative;}
        .gp-oc-line{position:absolute;top:5px;left:50%;width:100%;height:2px;background:#dcfce7;z-index:0;}
        .gp-oc-line.done{background:#22c55e;}
        .gp-oc-dot{width:12px;height:12px;border-radius:50%;border:2px solid #dcfce7;background:white;z-index:1;}
        .gp-oc-dot.done{background:#22c55e;border-color:#22c55e;}
        .gp-oc-dot.active{background:#16a34a;border-color:#16a34a;box-shadow:0 0 0 3px rgba(34,197,94,0.25);}
        .gp-oc-label{font-size:9px;color:#999;margin-top:5px;text-align:center;}
        .gp-oc-label.active{color:#16a34a;font-weight:700;}

        /* ── ORDER MODAL ── */
        .gp-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;}
        .gp-modal{background:white;border-radius:20px;width:400px;max-width:94vw;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.22);animation:gpMdIn 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        @keyframes gpMdIn{from{opacity:0;transform:scale(0.93);}to{opacity:1;transform:scale(1);}}
        .gp-modal-img{width:100%;height:150px;object-fit:cover;}
        .gp-modal-body{padding:22px;}
        .gp-modal-name{font-size:19px;font-weight:700;color:#1a1a1a;margin-bottom:4px;}
        .gp-modal-price{font-size:13px;color:#666;margin-bottom:18px;}
        .gp-modal-qty-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
        .gp-modal-qty-ctrl{display:flex;align-items:center;background:#f0fdf4;border-radius:24px;border:1.5px solid #bbf7d0;overflow:hidden;}
        .gp-modal-qty-btn{background:none;border:none;width:34px;height:34px;cursor:pointer;color:#16a34a;font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .gp-modal-qty-btn:hover{background:#bbf7d0;}
        .gp-modal-qty-num{min-width:32px;text-align:center;font-weight:700;color:#15803d;}
        .gp-modal-total{background:#f0fdf4;border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;margin-bottom:16px;border:1px solid #dcfce7;}
        .gp-modal-actions{display:flex;gap:10px;}
        .gp-modal-cancel{padding:12px 18px;border-radius:24px;border:1.5px solid #e5e7eb;background:white;color:#666;font-size:14px;cursor:pointer;font-family:'Segoe UI',sans-serif;}
        .gp-modal-confirm{flex:1;padding:12px;border-radius:24px;border:none;background:linear-gradient(90deg,#22c55e,#16a34a);color:white;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-family:'Segoe UI',sans-serif;}
        .gp-modal-confirm:hover{opacity:0.9;}
        .gp-modal-confirm:disabled{opacity:0.5;cursor:not-allowed;}

        /* ── SUCCESS MODAL ── */
        .gp-success{background:white;border-radius:20px;width:360px;max-width:94vw;padding:32px 24px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.22);animation:gpMdIn 0.3s cubic-bezier(0.34,1.56,0.64,1);}
        .gp-success-icon{width:64px;height:64px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
        .spin{display:inline-block;animation:gpSpin 0.8s linear infinite;}
        @keyframes gpSpin{to{transform:rotate(360deg);}}
      `}
      </style>

      {/* TOASTS */}
      <div className="gp-toasts">
        {toasts.map(t => <div key={t.id} className={`gp-toast ${t.type}`}>{t.msg}</div>)}
      </div>

      {/* ── ORDER QTY MODAL ── */}
      {orderModal && (
        <div className="gp-modal-bg" onClick={() => setOrderModal(null)}>
          <div className="gp-modal" onClick={e => e.stopPropagation()}>
            {orderModal.product.product_photo
              ? <img src={IMG + orderModal.product.product_photo} alt="" className="gp-modal-img" onError={e=>e.target.style.display="none"}/>
              : <div style={{height:150,background:"linear-gradient(135deg,#dcfce7,#bbf7d0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🌿</div>
            }
            <div className="gp-modal-body">
              <div className="gp-modal-name">{orderModal.product.product_name}</div>
              <div className="gp-modal-price">Ksh {orderModal.product.product_cost} per unit</div>
              <div className="gp-modal-qty-row">
                <span style={{fontWeight:600,fontSize:14}}>Quantity</span>
                <div className="gp-modal-qty-ctrl">
                  <button className="gp-modal-qty-btn" onClick={() => setOrderModal(m => ({...m, qty: Math.max(1, m.qty-1)}))}>−</button>
                  <span className="gp-modal-qty-num">{orderModal.qty}</span>
                  <button className="gp-modal-qty-btn" onClick={() => setOrderModal(m => ({...m, qty: m.qty+1}))}>+</button>
                </div>
              </div>
              <div className="gp-modal-total">
                <span style={{fontSize:13,color:"#666"}}>Total</span>
                <span style={{fontSize:18,fontWeight:800,color:"#15803d"}}>Ksh {(orderModal.product.product_cost * orderModal.qty).toLocaleString()}</span>
              </div>
              <div className="gp-modal-actions">
                <button className="gp-modal-cancel" onClick={() => setOrderModal(null)}>Cancel</button>
                <button
                  className="gp-modal-confirm"
                  onClick={submitOrder}
                  disabled={orderingKey === orderModal.product.product_name}
                >
                  {orderingKey === orderModal.product.product_name
                    ? <><span className="spin">⏳</span> Placing...</>
                    : <>✅ Confirm Order</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL ── */}
      {orderSuccess && (
        <div className="gp-modal-bg" onClick={() => setOrderSuccess(null)}>
          <div className="gp-success" onClick={e => e.stopPropagation()}>
            <div className="gp-success-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{fontSize:19,fontWeight:700,color:"#15803d",marginBottom:8}}>Order Placed! 🌿</div>
            <div style={{fontSize:13,color:"#666",marginBottom:4}}><strong>{orderSuccess.product.product_name}</strong> × {orderSuccess.qty}</div>
            <div style={{fontSize:16,fontWeight:700,color:"#22c55e",marginBottom:4}}>Ksh {orderSuccess.total.toLocaleString()}</div>
            <div style={{fontFamily:"monospace",fontSize:12,background:"#f0fdf4",borderRadius:8,padding:"6px 14px",display:"inline-block",margin:"8px 0 18px",color:"#16a34a"}}>{orderSuccess.orderId}</div>
            <div style={{fontSize:12,color:"#888",marginBottom:18}}>✅ Recorded in admin dashboard</div>
            <button onClick={() => { setOrderSuccess(null); setOrdersOpen(true); }} style={{width:"100%",padding:12,borderRadius:24,border:"none",background:"linear-gradient(90deg,#22c55e,#16a34a)",color:"white",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:8,fontFamily:"'Segoe UI',sans-serif"}}>
              📦 Track My Order
            </button>
            <button onClick={() => setOrderSuccess(null)} style={{width:"100%",padding:11,borderRadius:24,border:"1.5px solid #e5e7eb",background:"white",color:"#666",fontSize:14,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif"}}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* ── MY ORDERS DRAWER ── */}
      <div className={`gp-mo-ov ${ordersOpen ? "open" : ""}`} onClick={() => setOrdersOpen(false)} />
      <div className={`gp-mo-drawer ${ordersOpen ? "open" : ""}`}>
        <div style={{background:"linear-gradient(135deg,#16a34a,#22c55e)",padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <span style={{color:"white",fontWeight:700,fontSize:16}}>📦 My Orders ({myOrders.length})</span>
          <button style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:17}} onClick={() => setOrdersOpen(false)}>✕</button>
        </div>
        <div className="gp-mo-body">
          {myOrders.length === 0 ? (
            <div style={{textAlign:"center",padding:"3rem",color:"#86efac"}}>
              <div style={{fontSize:48,marginBottom:12}}>📦</div>
              <div style={{fontWeight:600,color:"#15803d"}}>No orders yet</div>
              <div style={{fontSize:13,marginTop:6,color:"#666"}}>Orders appear here and in the admin dashboard</div>
            </div>
          ) : myOrders.map(order => {
            const si = STATUS_STEPS.indexOf(order.status);
            const sc = { Placed:{bg:"#fef3c7",color:"#92400e",dot:"#f59e0b"}, Confirmed:{bg:"#dbeafe",color:"#1e40af",dot:"#3b82f6"}, Preparing:{bg:"#ede9fe",color:"#5b21b6",dot:"#8b5cf6"}, Ready:{bg:"#dcfce7",color:"#166534",dot:"#22c55e"}, Delivered:{bg:"#f0fdf4",color:"#15803d",dot:"#16a34a"} }[order.status] || {bg:"#fef3c7",color:"#92400e",dot:"#f59e0b"};
            return (
              <div key={order.id} className="gp-oc">
                <div className="gp-oc-top">
                  {order.product_photo
                    ? <img src={IMG+order.product_photo} alt="" className="gp-oc-img" onError={e=>e.target.style.display="none"}/>
                    : <div style={{width:52,height:52,borderRadius:10,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🌿</div>
                  }
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#1a1a1a"}}>{order.product_name}</div>
                    <div style={{fontSize:12,color:"#666",marginTop:2}}>Ksh {order.product_cost} × {order.quantity}</div>
                    <div style={{fontFamily:"monospace",fontSize:10,color:"#a3e635",marginTop:2}}>{order.id}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:700,color:"#16a34a"}}>Ksh {order.total.toLocaleString()}</div>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,background:sc.bg,color:sc.color,marginTop:4}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:sc.dot,display:"inline-block"}}/>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="gp-oc-steps">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="gp-oc-step">
                      {i < STATUS_STEPS.length-1 && <div className={`gp-oc-line ${i < si ? "done" : ""}`}/>}
                      <div className={`gp-oc-dot ${i < si ? "done" : ""} ${i === si ? "active" : ""}`}/>
                      <div className={`gp-oc-label ${i === si ? "active" : ""}`}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CART OVERLAY + DRAWER ── */}
      <div className={`gp-cart-ov ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />
      <div className={`gp-cart-drawer ${cartOpen ? "open" : ""}`}>
        <div className="gp-cd-head">
          <span className="gp-cd-title">🛒 My Cart ({totalQty})</span>
          <button className="gp-cd-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="gp-cd-body">
          {cart.length === 0
            ? <div className="gp-cd-empty"><div style={{fontSize:38}}>🛒</div><div>Cart is empty</div></div>
            : cart.map(item => (
              <div key={item._key} className="gp-cd-item">
                {item.product_photo
                  ? <img src={`${IMG}${item.product_photo}`} alt="" className="gp-cd-item-img" onError={e=>e.target.style.display="none"}/>
                  : <div style={{width:48,height:48,borderRadius:8,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🌿</div>
                }
                <div style={{flex:1}}>
                  <div className="gp-cd-item-name">{item.product_name}</div>
                  <div className="gp-cd-item-price">Ksh {(item.product_cost * item.quantity).toLocaleString()}</div>
                  <div className="gp-cd-qty">
                    <button className="gp-cd-qty-btn" onClick={() => changeQty(item._key, -1)}>−</button>
                    <span style={{fontSize:13,fontWeight:700,minWidth:20,textAlign:"center"}}>{item.quantity}</span>
                    <button className="gp-cd-qty-btn" onClick={() => changeQty(item._key, +1)}>+</button>
                  </div>
                </div>
                <button onClick={() => removeItem(item._key)} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:12,padding:"2px 6px",borderRadius:6}}>✕</button>
              </div>
            ))
          }
        </div>
        {cart.length > 0 && (
          <div className="gp-cd-foot">
            <div className="gp-cd-total"><span>Total</span><span>Ksh {totalCost.toLocaleString()}</span></div>
            <button className="gp-cd-checkout" onClick={handleCheckout}>Checkout →</button>
          </div>
        )}
      </div>

      {/* ── NAVBAR ── */}
      <nav className="gp-navbar">
        <div className="gp-nav-brand">🌿 Welcome to Lilos Farm</div>
        <div className="gp-nav-links">
 
 
        </div>
        <button className="gp-nav-btn" onClick={() => setCartOpen(true)}>
          🛒 My Cart {totalQty > 0 && <span className="gp-nav-badge">{totalQty}</span>}
        </button>
      </nav>

      {/* PAGE TITLE */}
      <div className="gp-title">
        <span>🍃</span> Available Farm Products <span>🍃</span>
      </div>

      {/* FILTERS */}
      <div className="gp-filters">
        <div className="gp-search-wrap">
          <span className="gp-search-icon">🔍</span>
          <input className="gp-filter-input" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="gp-filter-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option>All</option>
          <option>Chicken meat</option>
          <option>Chicken eggs</option>
          <option>Coriander</option>
          <option>Dairy</option>
        </select>
        <input className="gp-price-input" type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
        <input className="gp-price-input" type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
      </div>

      {/* HERO */}
      <div style={{maxWidth:1280,margin:"0 auto 8px",padding:"0 28px"}}>
        <HeroCarousel />
      </div>

      {loading && <Loader />}
      {error && <div style={{textAlign:"center",color:"#b91c1c",padding:16}}>{error}</div>}
      {filtered.length === 0 && !loading && (
        <div style={{textAlign:"center",padding:40,color:"#666",fontSize:15}}>❌ No products found</div>
      )}

      {/* ── PRODUCTS GRID ── */}
      <div className="gp-grid">
        {filtered.map(product => {
          const key      = product.product_name;
          const inCart   = cart.find(i => i._key === key);
          const isAdded  = addedMap[key];
          const isBuying = buyingKey === key;
          const isOrdering = orderingKey === key;

          return (
            <div key={key} className="gp-card">
              {/* Image + hover Add to Cart */}
              <div className="gp-img-wrap">
                {product.product_photo
                  ? <img src={IMG + product.product_photo} alt={product.product_name} className="gp-product-img" onError={e=>e.target.style.display="none"}/>
                  : <div className="gp-img-ph">🌿</div>
                }
                {inCart && <div className="gp-in-cart">✓ {inCart.quantity} in cart</div>}
                <div className="gp-hover-overlay">
                  <button className={`gp-add-cart-btn ${isAdded ? "added" : ""}`} onClick={() => addToCart(product)}>
                    {isAdded ? <>✓ Added!</> : <>+ Add to Cart</>}
                  </button>
                </div>
              </div>

              {/* Card body — matches screenshot */}
              <div className="gp-card-body">
                <div className="gp-product-name">{product.product_name}</div>
                <div className="gp-product-desc">
                  {product.product_description?.slice(0, 80)}...
                </div>
                <div className="gp-product-price">Ksh {product.product_cost}</div>

                {/* 💳 BUY NOW — BLUE — records order in admin dashboard */}
                <button
                  className="gp-buy-btn"
                  onClick={() => handleBuyNow(product)}
                  disabled={isBuying}
                >
                  {isBuying
                    ? <><span className="spin">⏳</span> Processing...</>
                    : <>💳 Buy Now</>
                  }
                </button>

                {/* 📦 PLACE ORDER — GREEN — opens qty modal, records in admin */}
                <button
                  className="gp-order-btn"
                  onClick={() => openOrderModal(product)}
                  disabled={isOrdering}
                >
                  {isOrdering
                    ? <><span className="spin">⏳</span> Placing...</>
                    : <>📦 Place Order</>
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* My Orders FAB */}
      <button
        onClick={() => setOrdersOpen(true)}
        style={{position:"fixed",bottom:90,right:24,background:"linear-gradient(135deg,#16a34a,#22c55e)",color:"white",border:"none",borderRadius:"50px",padding:"10px 18px",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:"0 4px 16px rgba(22,163,74,0.4)",zIndex:999,display:"flex",alignItems:"center",gap:7,fontFamily:"'Segoe UI',sans-serif"}}
      >
        📦 My Orders
        {myOrders.length > 0 && (
          <span style={{background:"#ef4444",color:"white",fontSize:10,fontWeight:700,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid white"}}>
            {myOrders.length}
          </span>
        )}
      </button>

      <Footer />
      <FarmChatbot />
    </div>
  );
};

export default Getproducts;