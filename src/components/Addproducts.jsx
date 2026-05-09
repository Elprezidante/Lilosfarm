import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const API           = "https://elprezidante.alwaysdata.net/api";
const IMG           = `${API.replace("/api", "")}/static/images/`;
const ADMIN_PASSWORD = "1234";
const fmt           = (n) => `Ksh ${Number(n).toLocaleString()}`;
const getToken      = () => localStorage.getItem("token") || "";

export default function Addproducts() {

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [password,      setPassword]      = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("pos"); // pos | products | orders | analytics

  // ── Toasts ────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  // ── POS ───────────────────────────────────────────────────────────────────
  const [posCart,   setPosCart]   = useState([]);
  const [posSearch, setPosSearch] = useState("");
  const [receipt,   setReceipt]   = useState(null);
  const [posLoading, setPosLoading] = useState(false);

  // ── Product form ──────────────────────────────────────────────────────────
  const [form,         setForm]         = useState({ product_name:"", product_description:"", product_cost:"", product_photo:null });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formMsg,      setFormMsg]      = useState({ type:"", text:"" });
  const [formLoading,  setFormLoading]  = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);

  // Use ref to track previous order count — avoids Vercel ESLint error
  const prevOrderCountRef = useRef(0);

  // ── Auth persist ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem("admin_access") === "true") setAccessGranted(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAccessGranted(true);
      sessionStorage.setItem("admin_access", "true");
      setPasswordError("");
    } else {
      setPasswordError("❌ Incorrect password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_access");
    setAccessGranted(false);
    setPassword("");
  };

  // ── Toast helper ──────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  // ── Fetch — stable ref via useCallback so useEffect deps are clean ─────────
  const fetchData = useCallback(async () => {
    try {
      const token   = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [r1, r2] = await Promise.all([
        axios.get(`${API}/get_products`),
        axios.get(`${API}/get_orders`, { headers }),
      ]);
      setProducts(r1.data);
      setOrders(r2.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  // Fetch on access granted + auto-refresh every 6s
  useEffect(() => {
    if (!accessGranted) return;
    fetchData();
    const iv = setInterval(fetchData, 6000);
    return () => clearInterval(iv);
  }, [accessGranted, fetchData]);

  // New order notification using ref (avoids exhaustive-deps ESLint error)
  useEffect(() => {
    if (orders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
      toast("🆕 New order received!", "info");
    }
    prevOrderCountRef.current = orders.length;
  }, [orders, toast]);

  // ── POS logic ─────────────────────────────────────────────────────────────
  const addToPos = (product) => {
    setPosCart(prev => {
      const ex = prev.find(i => i.product_name === product.product_name);
      if (ex) return prev.map(i => i.product_name === product.product_name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const posQty = (name, delta) => {
    setPosCart(prev =>
      prev.map(i => i.product_name === name ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    );
  };

  const posTotal = posCart.reduce((s, i) => s + i.product_cost * i.qty, 0);

  const chargeOrder = async () => {
    if (!posCart.length) return;
    setPosLoading(true);
    try {
      const token   = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await Promise.all(posCart.map(item =>
        axios.post(`${API}/add_order`, {
          product_name: item.product_name,
          product_cost: item.product_cost,
          quantity:     item.qty,
          total:        item.product_cost * item.qty,
        }, { headers })
      ));
      setReceipt({ items: [...posCart], total: posTotal, time: new Date() });
      setPosCart([]);
      fetchData();
      toast("✅ Sale recorded!", "success");
    } catch (err) {
      console.error("Charge error:", err);
      toast("❌ Checkout failed", "error");
    } finally {
      setPosLoading(false);
    }
  };

  // ── Product management ────────────────────────────────────────────────────
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg({ type:"", text:"" });
    try {
      const token = getToken();
      const fd    = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await axios.post(`${API}/add_products`, fd, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setFormMsg({ type:"success", text:"✅ Product added to inventory!" });
      setForm({ product_name:"", product_description:"", product_cost:"", product_photo:null });
      setPhotoPreview(null);
      fetchData();
    } catch (err) {
      console.error("Add product error:", err);
      setFormMsg({ type:"error", text:"❌ Failed to add product" });
    } finally {
      setFormLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Remove this item from the POS?")) return;
    try {
      const token = getToken();
      await axios.delete(`${API}/delete_product/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast("Item removed", "info");
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      toast("Delete failed", "error");
    }
  };

  // ── Analytics ─────────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const totalSold    = orders.reduce((s, o) => s + Number(o.quantity), 0);

  const chartData = products.map(p => {
    const po = orders.filter(o => o.product_name === p.product_name);
    return {
      name:    p.product_name.length > 10 ? p.product_name.slice(0, 9) + "…" : p.product_name,
      Revenue: po.reduce((s, o) => s + Number(o.total), 0),
      Sold:    po.reduce((s, o) => s + Number(o.quantity), 0),
    };
  }).filter(d => d.Revenue > 0).sort((a, b) => b.Revenue - a.Revenue);

  const COLORS = ["#3d7a25","#5aaa38","#7acc4a","#a8d87a","#c8e8a0","#2d5a1b"];

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(posSearch.toLowerCase())
  );

  // ── STYLES ────────────────────────────────────────────────────────────────
  const S = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#1e3314;border-radius:4px;}

    .pr{min-height:100vh;background:#0f1a0a;font-family:'DM Sans',sans-serif;color:#e8f5d8;overflow-x:hidden;}

    /* LOGIN */
    .pr-login{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0a120a,#1a2e0f);}
    .pr-login-card{background:#141f0e;border:1px solid #2a4a1a;border-radius:22px;padding:44px 40px;width:360px;text-align:center;box-shadow:0 28px 70px rgba(0,0,0,0.55);}
    .pr-logo{font-family:'Playfair Display',serif;font-size:26px;color:#a8d87a;margin-bottom:6px;}
    .pr-sub{color:#3a5a2a;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:'DM Mono',monospace;margin-bottom:28px;}
    .pr-pw-input{width:100%;padding:13px 16px;background:#0f1a0a;border:1.5px solid #2a4a1a;border-radius:11px;color:#e8f5d8;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;margin-bottom:14px;transition:border-color 0.2s;}
    .pr-pw-input:focus{border-color:#5aaa38;}
    .pr-pw-btn{width:100%;padding:13px;background:linear-gradient(135deg,#3d7a25,#5aaa38);border:none;border-radius:11px;color:white;font-size:14px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:opacity 0.2s,transform 0.1s;}
    .pr-pw-btn:hover{opacity:0.9;transform:translateY(-1px);}
    .pr-pw-err{color:#f87171;font-size:12px;margin-top:8px;font-family:'DM Mono',monospace;}

    /* TOPBAR */
    .pr-topbar{height:62px;background:#141f0e;border-bottom:1px solid #1e3314;display:flex;align-items:center;justify-content:space-between;padding:0 22px;position:sticky;top:0;z-index:100;}
    .pr-brand{font-family:'Playfair Display',serif;font-size:19px;color:#a8d87a;display:flex;align-items:center;gap:8px;}
    .pr-brand-dot{width:7px;height:7px;border-radius:50%;background:#5aaa38;animation:prPulse 2s infinite;}
    @keyframes prPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.4);}}
    .pr-tabs{display:flex;gap:3px;}
    .pr-tab{padding:7px 15px;border:none;background:none;color:#5a7a4a;cursor:pointer;font-weight:600;font-size:13px;font-family:'DM Sans',sans-serif;border-radius:7px;transition:all 0.15s;}
    .pr-tab.active{color:#a8d87a;background:#1e3314;}
    .pr-tab:hover:not(.active){color:#7acc4a;}
    .pr-logout{background:none;border:1px solid #2a4a1a;border-radius:7px;color:#5a7a4a;font-size:11px;padding:6px 13px;cursor:pointer;font-family:'DM Mono',monospace;transition:all 0.15s;letter-spacing:0.5px;}
    .pr-logout:hover{border-color:#f87171;color:#f87171;}

    /* STAT BAR */
    .pr-statbar{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#1e3314;border-bottom:1px solid #1e3314;}
    .pr-stat{background:#0f1a0a;padding:13px 22px;}
    .pr-stat-lbl{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#3a5a2a;font-family:'DM Mono',monospace;margin-bottom:3px;}
    .pr-stat-val{font-size:19px;font-weight:700;color:#e8f5d8;}
    .pr-stat-val.green{color:#5aaa38;}

    /* BODY */
    .pr-body{display:flex;height:calc(100vh - 62px - 55px);}
    .pr-left{flex:1;overflow-y:auto;padding:20px;}
    .pr-right{width:330px;flex-shrink:0;background:#141f0e;border-left:1px solid #1e3314;display:flex;flex-direction:column;}

    /* POS SEARCH */
    .pr-search{width:100%;padding:10px 14px;background:#141f0e;border:1.5px solid #1e3314;border-radius:9px;color:#e8f5d8;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;margin-bottom:18px;transition:border-color 0.2s;}
    .pr-search:focus{border-color:#3d7a25;}

    /* PRODUCT GRID */
    .pr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(152px,1fr));gap:12px;}
    .pr-product{background:#141f0e;border:1px solid #1e3314;border-radius:13px;overflow:hidden;cursor:pointer;transition:all 0.2s;position:relative;}
    .pr-product:hover{border-color:#5aaa38;transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,0.35);}
    .pr-product:active{transform:scale(0.97);}
    .pr-pimg{width:100%;height:100px;object-fit:cover;background:#0a120a;display:block;}
    .pr-pimg-ph{width:100%;height:100px;display:flex;align-items:center;justify-content:center;font-size:28px;background:#1a2e0f;}
    .pr-pbody{padding:9px 11px;}
    .pr-pname{font-size:12.5px;font-weight:700;color:#c8e8a0;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .pr-pprice{font-size:11.5px;color:#5aaa38;font-family:'DM Mono',monospace;}
    .pr-pbadge{position:absolute;top:7px;right:7px;background:rgba(90,170,56,0.9);color:white;font-size:10px;font-weight:700;border-radius:16px;padding:2px 7px;font-family:'DM Mono',monospace;}
    .pr-plus-hint{position:absolute;inset:0;background:rgba(45,90,27,0.65);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;font-size:26px;}
    .pr-product:hover .pr-plus-hint{opacity:1;}

    /* CART (right panel) */
    .pr-cart-head{padding:16px 18px 12px;border-bottom:1px solid #1e3314;display:flex;align-items:center;justify-content:space-between;}
    .pr-cart-title{font-size:11px;font-weight:700;color:#a8d87a;letter-spacing:1.5px;text-transform:uppercase;font-family:'DM Mono',monospace;}
    .pr-cart-clear{background:none;border:none;color:#3a5a2a;font-size:11px;cursor:pointer;font-family:'DM Mono',monospace;transition:color 0.15s;}
    .pr-cart-clear:hover{color:#f87171;}
    .pr-cart-items{flex:1;overflow-y:auto;padding:10px 14px;display:flex;flex-direction:column;gap:7px;}
    .pr-cart-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#2a4a1a;font-family:'DM Mono',monospace;font-size:11.5px;text-align:center;}
    .pr-citem{background:#0f1a0a;border:1px solid #1e3314;border-radius:9px;padding:9px 11px;display:flex;gap:9px;align-items:center;}
    .pr-citem-info{flex:1;min-width:0;}
    .pr-citem-name{font-size:12px;font-weight:600;color:#c8e8a0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .pr-citem-price{font-size:10.5px;color:#5a7a4a;font-family:'DM Mono',monospace;margin-top:1px;}
    .pr-qty-ctrl{display:flex;align-items:center;gap:3px;flex-shrink:0;}
    .pr-qty-btn{background:#1e3314;border:none;color:#a8d87a;width:22px;height:22px;border-radius:5px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:background 0.15s;}
    .pr-qty-btn:hover{background:#3d7a25;}
    .pr-qty-num{font-size:12px;font-weight:700;color:#e8f5d8;min-width:18px;text-align:center;font-family:'DM Mono',monospace;}
    .pr-citem-total{font-size:11px;font-weight:700;color:#5aaa38;font-family:'DM Mono',monospace;flex-shrink:0;}

    /* CHECKOUT PANEL */
    .pr-checkout{border-top:1px solid #1e3314;padding:14px 18px 18px;flex-shrink:0;}
    .pr-subtotals{display:flex;flex-direction:column;gap:3px;margin-bottom:10px;}
    .pr-sub-row{display:flex;justify-content:space-between;font-size:11px;color:#3a5a2a;font-family:'DM Mono',monospace;}
    .pr-grand{display:flex;justify-content:space-between;align-items:center;background:#1e3314;border-radius:9px;padding:10px 13px;margin-bottom:12px;}
    .pr-grand-lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5a7a4a;font-family:'DM Mono',monospace;}
    .pr-grand-val{font-size:21px;font-weight:700;color:#a8d87a;font-family:'DM Mono',monospace;}
    .pr-charge-btn{width:100%;padding:13px;background:linear-gradient(135deg,#3d7a25,#5aaa38);border:none;border-radius:10px;color:white;font-size:14px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:opacity 0.2s,transform 0.1s;display:flex;align-items:center;justify-content:center;gap:7px;}
    .pr-charge-btn:hover:not(:disabled){opacity:0.9;transform:translateY(-1px);}
    .pr-charge-btn:disabled{opacity:0.4;cursor:not-allowed;}

    /* RECEIPT MODAL */
    .pr-rcpt-ov{position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);}
    .pr-rcpt-card{background:#141f0e;width:320px;padding:36px 28px;border-radius:20px;font-family:'DM Mono',monospace;border:1px solid #2a4a1a;box-shadow:0 20px 50px rgba(0,0,0,0.6);}
    .pr-rcpt-logo{text-align:center;font-family:'Playfair Display',serif;font-size:20px;color:#a8d87a;margin-bottom:3px;}
    .pr-rcpt-time{text-align:center;font-size:10px;color:#3a5a2a;margin-bottom:18px;}
    .pr-dash{border:none;border-top:1px dashed #2a4a1a;margin:12px 0;}
    .pr-rcpt-row{display:flex;justify-content:space-between;font-size:11.5px;color:#c8e8a0;margin-bottom:6px;}
    .pr-rcpt-total{display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:#a8d87a;margin-top:6px;}
    .pr-rcpt-thanks{text-align:center;font-size:10px;color:#3a5a2a;margin-top:14px;letter-spacing:1px;}
    .pr-rcpt-close{width:100%;margin-top:18px;padding:11px;background:#1e3314;border:none;border-radius:9px;color:#a8d87a;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background 0.15s;}
    .pr-rcpt-close:hover{background:#2a4a1a;}

    /* ADD PRODUCT TAB */
    .pr-ap-body{max-width:880px;margin:0 auto;padding:24px 20px;display:grid;grid-template-columns:1fr 1fr;gap:20px;overflow-y:auto;height:calc(100vh - 62px - 55px);}
    .pr-ap-card{background:#141f0e;border:1px solid #1e3314;border-radius:15px;padding:22px;}
    .pr-ap-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#3a5a2a;font-family:'DM Mono',monospace;margin-bottom:18px;}
    .pr-ap-input{width:100%;padding:11px 13px;background:#0f1a0a;border:1.5px solid #1e3314;border-radius:8px;color:#e8f5d8;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;margin-bottom:10px;transition:border-color 0.2s;}
    .pr-ap-input:focus{border-color:#3d7a25;}
    .pr-ap-ta{min-height:72px;resize:vertical;}
    .pr-ap-file-lbl{display:block;width:100%;padding:11px 13px;text-align:center;background:#0f1a0a;border:1.5px dashed #2a4a1a;border-radius:8px;color:#5a7a4a;font-size:12px;cursor:pointer;margin-bottom:10px;transition:border-color 0.2s;font-family:'DM Sans',sans-serif;}
    .pr-ap-file-lbl:hover{border-color:#3d7a25;color:#a8d87a;}
    .pr-ap-preview{width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:10px;border:1px solid #1e3314;}
    .pr-ap-submit{width:100%;padding:12px;background:linear-gradient(135deg,#3d7a25,#5aaa38);border:none;border-radius:9px;color:white;font-size:13.5px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:opacity 0.2s;}
    .pr-ap-submit:hover:not(:disabled){opacity:0.9;}
    .pr-ap-submit:disabled{opacity:0.55;cursor:not-allowed;}
    .pr-ap-msg{font-size:12px;font-family:'DM Mono',monospace;padding:9px 12px;border-radius:7px;margin-bottom:10px;}
    .pr-ap-msg.success{background:rgba(90,170,56,0.15);color:#7acc4a;border:1px solid #2a4a1a;}
    .pr-ap-msg.error{background:rgba(248,113,113,0.1);color:#f87171;border:1px solid rgba(248,113,113,0.25);}

    /* INVENTORY LIST */
    .pr-inv-item{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #0f1a0a;}
    .pr-inv-name{font-size:13px;font-weight:600;color:#c8e8a0;}
    .pr-inv-price{font-size:11px;color:#5aaa38;font-family:'DM Mono',monospace;margin-top:2px;}
    .pr-inv-del{background:rgba(248,113,113,0.1);border:1px solid #3a1a1a;color:#f87171;padding:5px 11px;border-radius:6px;font-size:11px;cursor:pointer;transition:all 0.15s;font-family:'DM Mono',monospace;}
    .pr-inv-del:hover{background:rgba(248,113,113,0.2);}

    /* ORDERS TABLE */
    .pr-or-body{padding:18px 22px;overflow-y:auto;height:calc(100vh - 62px - 55px);}
    .pr-or-table{width:100%;border-collapse:collapse;}
    .pr-or-th{text-align:left;font-size:9.5px;letter-spacing:2px;text-transform:uppercase;color:#3a5a2a;font-family:'DM Mono',monospace;padding:10px 13px;border-bottom:1px solid #1e3314;}
    .pr-or-td{padding:11px 13px;font-size:13px;color:#c8e8a0;border-bottom:1px solid #0f1a0a;}
    .pr-or-td.mono{font-family:'DM Mono',monospace;color:#5aaa38;}
    .pr-or-tr:hover .pr-or-td{background:#141f0e;}

    /* ANALYTICS */
    .pr-an-body{padding:18px 22px;overflow-y:auto;height:calc(100vh - 62px - 55px);}
    .pr-an-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
    .pr-an-card{background:#141f0e;border:1px solid #1e3314;border-radius:13px;padding:18px;}
    .pr-an-lbl{font-size:9.5px;letter-spacing:2px;text-transform:uppercase;color:#3a5a2a;font-family:'DM Mono',monospace;margin-bottom:7px;}
    .pr-an-val{font-size:26px;font-weight:700;color:#a8d87a;font-family:'DM Mono',monospace;}
    .pr-an-sub{font-size:10px;color:#3a5a2a;margin-top:3px;}
    .pr-an-chart{background:#141f0e;border:1px solid #1e3314;border-radius:13px;padding:18px;}
    .pr-an-chart-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#3a5a2a;font-family:'DM Mono',monospace;margin-bottom:16px;}

    /* TOASTS */
    .pr-toasts{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:8px;z-index:9999;align-items:center;pointer-events:none;}
    .pr-toast{padding:10px 20px;border-radius:11px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:prTIn 0.3s cubic-bezier(0.34,1.56,0.64,1);}
    .pr-toast.success{background:#1e3314;color:#a8d87a;border:1px solid #2a4a1a;}
    .pr-toast.error{background:#2a0f0f;color:#f87171;border:1px solid rgba(248,113,113,0.25);}
    .pr-toast.info{background:#0f1a2a;color:#93c5fd;border:1px solid rgba(147,197,253,0.25);}
    @keyframes prTIn{from{opacity:0;transform:translateY(12px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
  `;

  // ── LOGIN SCREEN ───────────────────────────────────────────────────────────
  if (!accessGranted) return (
    <div className="pr">
      <style>{S}</style>
      <div className="pr-login">
        <form className="pr-login-card" onSubmit={handleLogin}>
          <div className="pr-logo">🌿 Lilo's Farm</div>
          <div className="pr-sub">Point of Sale · Admin</div>
          <input className="pr-pw-input" type="password" placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          {passwordError && <div className="pr-pw-err">{passwordError}</div>}
          <button className="pr-pw-btn" type="submit">Access Dashboard →</button>
        </form>
      </div>
    </div>
  );

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div className="pr">
      <style>{S}</style>

      {/* TOASTS */}
      <div className="pr-toasts">
        {toasts.map(t => <div key={t.id} className={`pr-toast ${t.type}`}>{t.msg}</div>)}
      </div>

      {/* RECEIPT MODAL */}
      {receipt && (
        <div className="pr-rcpt-ov" onClick={() => setReceipt(null)}>
          <div className="pr-rcpt-card" onClick={e => e.stopPropagation()}>
            <div className="pr-rcpt-logo">🌿 Lilo's Farm</div>
            <div className="pr-rcpt-time">{receipt.time.toLocaleString()}</div>
            <hr className="pr-dash"/>
            {receipt.items.map((i, idx) => (
              <div key={idx} className="pr-rcpt-row">
                <span>{i.product_name} ×{i.qty}</span>
                <span>{fmt(i.product_cost * i.qty)}</span>
              </div>
            ))}
            <hr className="pr-dash"/>
            <div className="pr-rcpt-total"><span>TOTAL</span><span>{fmt(receipt.total)}</span></div>
            <div className="pr-rcpt-thanks">✦ THANK YOU ✦</div>
            <button className="pr-rcpt-close" onClick={() => setReceipt(null)}>Close Receipt</button>
          </div>
        </div>
      )}

      {/* TOPBAR */}
      <div className="pr-topbar">
        <div className="pr-brand"><span className="pr-brand-dot"/>Lilo's Farm POS</div>
        <div className="pr-tabs">
          {[["pos","🖥 Sell"],["products","📦 Inventory"],["orders","🧾 Orders"],["analytics","📊 Analytics"]].map(([id, lbl]) => (
            <button key={id} className={`pr-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{lbl}</button>
          ))}
        </div>
        <button className="pr-logout" onClick={handleLogout}>LOGOUT</button>
      </div>

      {/* STAT BAR */}
      <div className="pr-statbar">
        <div className="pr-stat"><div className="pr-stat-lbl">Products</div><div className="pr-stat-val">{products.length}</div></div>
        <div className="pr-stat"><div className="pr-stat-lbl">Total Orders</div><div className="pr-stat-val">{orders.length}</div></div>
        <div className="pr-stat"><div className="pr-stat-lbl">Units Sold</div><div className="pr-stat-val">{totalSold}</div></div>
        <div className="pr-stat"><div className="pr-stat-lbl">Revenue</div><div className="pr-stat-val green">{fmt(totalRevenue)}</div></div>
      </div>

      {/* ── POS TAB ── */}
      {tab === "pos" && (
        <div className="pr-body">
          {/* Left — product grid */}
          <div className="pr-left">
            <input className="pr-search" placeholder="🔍 Search inventory..." value={posSearch} onChange={e => setPosSearch(e.target.value)} />
            <div className="pr-grid">
              {filteredProducts.map(p => {
                const inCart = posCart.find(i => i.product_name === p.product_name);
                return (
                  <div key={p.product_name} className="pr-product" onClick={() => addToPos(p)}>
                    {inCart && <div className="pr-pbadge">×{inCart.qty}</div>}
                    {p.product_photo
                      ? <img src={IMG + p.product_photo} className="pr-pimg" alt="" onError={e=>e.target.style.display="none"}/>
                      : <div className="pr-pimg-ph">🌿</div>
                    }
                    <div className="pr-plus-hint">＋</div>
                    <div className="pr-pbody">
                      <div className="pr-pname">{p.product_name}</div>
                      <div className="pr-pprice">{fmt(p.product_cost)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — cart */}
          <div className="pr-right">
            <div className="pr-cart-head">
              <span className="pr-cart-title">Current Sale</span>
              {posCart.length > 0 && <button className="pr-cart-clear" onClick={() => setPosCart([])}>CLEAR</button>}
            </div>
            <div className="pr-cart-items">
              {posCart.length === 0
                ? <div className="pr-cart-empty"><div style={{fontSize:30}}>🛒</div><div>Basket is empty<br/>Click a product to add</div></div>
                : posCart.map(item => (
                  <div key={item.product_name} className="pr-citem">
                    <div className="pr-citem-info">
                      <div className="pr-citem-name">{item.product_name}</div>
                      <div className="pr-citem-price">{fmt(item.product_cost)} ea.</div>
                    </div>
                    <div className="pr-qty-ctrl">
                      <button className="pr-qty-btn" onClick={() => posQty(item.product_name, -1)}>−</button>
                      <span className="pr-qty-num">{item.qty}</span>
                      <button className="pr-qty-btn" onClick={() => posQty(item.product_name, +1)}>+</button>
                    </div>
                    <span className="pr-citem-total">{fmt(item.product_cost * item.qty)}</span>
                  </div>
                ))
              }
            </div>
            <div className="pr-checkout">
              <div className="pr-subtotals">
                {posCart.map(i => (
                  <div key={i.product_name} className="pr-sub-row">
                    <span>{i.product_name} ×{i.qty}</span>
                    <span>{fmt(i.product_cost * i.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="pr-grand">
                <span className="pr-grand-lbl">Total</span>
                <span className="pr-grand-val">{fmt(posTotal)}</span>
              </div>
              <button className="pr-charge-btn" onClick={chargeOrder} disabled={posLoading || !posCart.length}>
                {posLoading
                  ? "Processing..."
                  : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Charge {posCart.length > 0 ? fmt(posTotal) : ""}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVENTORY TAB ── */}
      {tab === "products" && (
        <div className="pr-ap-body">
          {/* Add form */}
          <div className="pr-ap-card">
            <div className="pr-ap-title">Add New Product</div>
            {formMsg.text && <div className={`pr-ap-msg ${formMsg.type}`}>{formMsg.text}</div>}
            <form onSubmit={handleProductSubmit}>
              <input className="pr-ap-input" placeholder="Product name" value={form.product_name} onChange={e => setForm(f => ({...f, product_name: e.target.value}))} required />
              <textarea className="pr-ap-input pr-ap-ta" placeholder="Description" value={form.product_description} onChange={e => setForm(f => ({...f, product_description: e.target.value}))} />
              <input className="pr-ap-input" type="number" placeholder="Price (Ksh)" value={form.product_cost} onChange={e => setForm(f => ({...f, product_cost: e.target.value}))} required />
              <label className="pr-ap-file-lbl">
                {form.product_photo ? `📎 ${form.product_photo.name}` : "📷 Click to upload photo"}
                <input type="file" style={{display:"none"}} accept="image/*" onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setForm(f => ({...f, product_photo: file}));
                  setPhotoPreview(URL.createObjectURL(file));
                }}/>
              </label>
              {photoPreview && <img src={photoPreview} className="pr-ap-preview" alt="preview"/>}
              <button className="pr-ap-submit" type="submit" disabled={formLoading}>
                {formLoading ? "Saving..." : "+ Add to POS"}
              </button>
            </form>
          </div>

          {/* Inventory list */}
          <div className="pr-ap-card" style={{overflowY:"auto"}}>
            <div className="pr-ap-title">All Products ({products.length})</div>
            {products.map(p => (
              <div key={p.id} className="pr-inv-item">
                <div>
                  <div className="pr-inv-name">{p.product_name}</div>
                  <div className="pr-inv-price">{fmt(p.product_cost)}</div>
                </div>
                <button className="pr-inv-del" onClick={() => deleteProduct(p.id)}>🗑 Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {tab === "orders" && (
        <div className="pr-or-body">
          <table className="pr-or-table">
            <thead>
              <tr>
                <th className="pr-or-th">#</th>
                <th className="pr-or-th">Product</th>
                <th className="pr-or-th">Qty</th>
                <th className="pr-or-th">Unit Price</th>
                <th className="pr-or-th">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice().reverse().map((o, i) => (
                <tr key={o.id || i} className="pr-or-tr">
                  <td className="pr-or-td mono">{String(orders.length - i).padStart(3,"0")}</td>
                  <td className="pr-or-td">{o.product_name}</td>
                  <td className="pr-or-td mono">×{o.quantity}</td>
                  <td className="pr-or-td mono">{fmt(o.product_cost)}</td>
                  <td className="pr-or-td mono" style={{color:"#a8d87a"}}>{fmt(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div style={{textAlign:"center",padding:"50px",color:"#3a5a2a",fontFamily:"DM Mono,monospace",fontSize:13}}>No orders yet</div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === "analytics" && (
        <div className="pr-an-body">
          <div className="pr-an-grid">
            <div className="pr-an-card">
              <div className="pr-an-lbl">Total Revenue</div>
              <div className="pr-an-val">{fmt(totalRevenue)}</div>
              <div className="pr-an-sub">All time</div>
            </div>
            <div className="pr-an-card">
              <div className="pr-an-lbl">Orders</div>
              <div className="pr-an-val">{orders.length}</div>
              <div className="pr-an-sub">Recorded transactions</div>
            </div>
            <div className="pr-an-card">
              <div className="pr-an-lbl">Units Sold</div>
              <div className="pr-an-val">{totalSold}</div>
              <div className="pr-an-sub">Across all products</div>
            </div>
          </div>
          {chartData.length > 0 && (
            <div className="pr-an-chart">
              <div className="pr-an-chart-title">Revenue by Product</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{fill:"#3a5a2a",fontSize:11,fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip
                    contentStyle={{background:"#1e3314",border:"1px solid #2a4a1a",borderRadius:8,fontFamily:"DM Mono",fontSize:12}}
                    labelStyle={{color:"#a8d87a"}} itemStyle={{color:"#5aaa38"}}
                    formatter={v => fmt(v)}
                  />
                  <Bar dataKey="Revenue" radius={[6,6,0,0]} barSize={38}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartData.length > 0 && (
            <div className="pr-an-chart" style={{marginTop:14}}>
              <div className="pr-an-chart-title">Units Sold by Product</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{fill:"#3a5a2a",fontSize:11,fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip
                    contentStyle={{background:"#1e3314",border:"1px solid #2a4a1a",borderRadius:8,fontFamily:"DM Mono",fontSize:12}}
                    labelStyle={{color:"#a8d87a"}} itemStyle={{color:"#5aaa38"}}
                  />
                  <Bar dataKey="Sold" radius={[6,6,0,0]} barSize={38}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[(i+2) % COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

    </div>
  );
}