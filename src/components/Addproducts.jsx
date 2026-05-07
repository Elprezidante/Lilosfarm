import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const API = "https://elprezidante.alwaysdata.net/api";
const IMG = `${API.replace("/api", "")}/static/images/`;
const ADMIN_PASSWORD = "1234";

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => `Ksh ${Number(n).toLocaleString()}`;
const getToken = () => localStorage.getItem("token") || "";

export default function AdminDashboard() {
  // ── AUTH STATE ────────────────────────────────────────────────────────────
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);

  // ── UI STATE ──────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("pos"); // pos | products | orders | analytics
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── POS/CART STATE ────────────────────────────────────────────────────────
  const [posCart, setPosCart] = useState([]);
  const [posSearch, setPosSearch] = useState("");
  const [receipt, setReceipt] = useState(null);

  // ── PRODUCT FORM STATE ────────────────────────────────────────────────────
  const [form, setForm] = useState({ product_name: "", product_description: "", product_cost: "", product_photo: null });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formMsg, setFormMsg] = useState({ type: "", text: "" });

  // ── DATA STATE ────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prevOrderCount, setPrevOrderCount] = useState(0);

  // ── AUTH LOGIC ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem("admin_access") === "true") {
      setAccessGranted(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAccessGranted(true);
      sessionStorage.setItem("admin_access", "true");
      setPasswordError("");
      fetchData();
    } else {
      setPasswordError("❌ Incorrect admin password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_access");
    setAccessGranted(false);
    setPassword("");
  };

  // ── DATA FETCHING ─────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const token = getToken();
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
  };

  useEffect(() => {
    if (accessGranted) {
      fetchData();
      const iv = setInterval(fetchData, 6000); // Auto-sync every 6s
      return () => clearInterval(iv);
    }
  }, [accessGranted]);

  // Check for new orders to show notification
  useEffect(() => {
    if (orders.length > prevOrderCount && prevOrderCount > 0) {
      toast("🆕 New order recorded!", "info");
    }
    setPrevOrderCount(orders.length);
  }, [orders.length]);

  // ── POS LOGIC ─────────────────────────────────────────────────────────────
  const addToPos = (product) => {
    setPosCart(prev => {
      const ex = prev.find(i => i.product_name === product.product_name);
      if (ex) return prev.map(i => i.product_name === product.product_name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const posChangeQty = (name, delta) => {
    setPosCart(prev =>
      prev.map(i => i.product_name === name ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    );
  };

  const chargeOrder = async () => {
    if (!posCart.length) return;
    setLoading(true);
    try {
      await Promise.all(posCart.map(item =>
        axios.post(`${API}/add_order`, {
          product_name: item.product_name,
          product_cost: item.product_cost,
          quantity: item.qty,
          total: item.product_cost * item.qty,
        })
      ));
      setReceipt({ 
        items: [...posCart], 
        total: posCart.reduce((s, i) => s + i.product_cost * i.qty, 0), 
        time: new Date() 
      });
      setPosCart([]);
      fetchData();
      toast("✅ Sale recorded!", "success");
    } catch (err) {
      toast("❌ Checkout failed", "error");
    }
    setLoading(false);
  };

  // ── PRODUCT MANAGEMENT LOGIC ──────────────────────────────────────────────
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await axios.post(`${API}/add_product`, fd);
      setFormMsg({ type: "success", text: "Product added to inventory!" });
      setForm({ product_name: "", product_description: "", product_cost: "", product_photo: null });
      setPhotoPreview(null);
      fetchData();
    } catch {
      setFormMsg({ type: "error", text: "Failed to add product" });
    }
    setLoading(false);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure? This will remove the item from the POS.")) return;
    try {
      await axios.delete(`${API}/delete_product/${id}`);
      toast("Item removed", "info");
      fetchData();
    } catch { toast("Delete failed", "error"); }
  };

  // ── TOAST HELPER ──────────────────────────────────────────────────────────
  const toast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  // ── ANALYTICS CALCULATIONS ────────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const chartData = products.map(p => {
    const po = orders.filter(o => o.product_name === p.product_name);
    return {
      name: p.product_name.length > 10 ? p.product_name.slice(0, 8) + ".." : p.product_name,
      Revenue: po.reduce((s, o) => s + Number(o.total), 0),
    };
  }).filter(d => d.Revenue > 0).sort((a, b) => b.Revenue - a.Revenue);

  const COLORS = ["#3d7a25", "#5aaa38", "#7acc4a", "#a8d87a", "#c8e8a0"];

  // ── STYLES ───────────────────────────────────────────────────────────────
  const S = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .pos-root { min-height: 100vh; background: #0f1a0a; font-family: 'DM Sans', sans-serif; color: #e8f5d8; overflow-x: hidden; }
    
    /* Login */
    .pos-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0a120a 0%, #1a2e0f 100%); }
    .pos-login-card { background: #141f0e; border: 1px solid #2a4a1a; border-radius: 24px; padding: 48px; width: 380px; text-align: center; box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
    .pos-login-logo { font-family: 'Playfair Display', serif; font-size: 28px; color: #a8d87a; margin-bottom: 8px; }
    .pos-login-input { width: 100%; padding: 14px; background: #0f1a0a; border: 1.5px solid #2a4a1a; border-radius: 12px; color: #fff; margin-bottom: 16px; outline: none; transition: 0.3s; }
    .pos-login-input:focus { border-color: #5aaa38; }
    .pos-login-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #3d7a25, #5aaa38); border: none; border-radius: 12px; color: white; font-weight: bold; cursor: pointer; transition: 0.3s; }
    .pos-login-btn:hover { opacity: 0.9; transform: translateY(-2px); }
    .pos-login-err { color: #f87171; font-size: 13px; margin-top: 10px; font-family: 'DM Mono', monospace; }

    /* Layout */
    .pos-topbar { height: 65px; background: #141f0e; border-bottom: 1px solid #1e3314; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 100; }
    .pos-tab { padding: 8px 16px; border: none; background: none; color: #5a7a4a; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.2s; }
    .pos-tab.active { color: #a8d87a; background: #1e3314; border-radius: 8px; }
    
    .pos-body { display: flex; height: calc(100vh - 65px); }
    .pos-left { flex: 1; overflow-y: auto; padding: 24px; }
    .pos-right { width: 350px; background: #141f0e; border-left: 1px solid #1e3314; display: flex; flex-direction: column; }
    
    /* POS Grid */
    .pos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
    .pos-product { background: #141f0e; border: 1px solid #1e3314; border-radius: 15px; overflow: hidden; cursor: pointer; transition: 0.2s; }
    .pos-product:hover { border-color: #5aaa38; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
    .pos-product-img { width: 100%; height: 110px; object-fit: cover; background: #0a120a; }
    .pos-product-body { padding: 12px; }
    .pos-product-name { font-size: 14px; font-weight: bold; color: #c8e8a0; }
    .pos-product-price { color: #5aaa38; font-family: 'DM Mono', monospace; font-size: 13px; margin-top: 4px; }

    /* Cart */
    .pos-cart-items { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
    .pos-cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #0f1a0a; border-radius: 10px; border: 1px solid #1e3314; }
    .pos-checkout { padding: 20px; border-top: 1px solid #1e3314; background: #141f0e; }
    .pos-grand-total { font-size: 26px; font-weight: bold; color: #a8d87a; text-align: center; margin-bottom: 15px; font-family: 'DM Mono', monospace; }
    
    /* Tables & Stats */
    .pos-statbar { display: grid; grid-template-columns: repeat(4, 1fr); background: #1e3314; gap: 1px; border-bottom: 1px solid #1e3314; }
    .pos-stat { background: #0f1a0a; padding: 15px 24px; }
    .pos-stat-label { font-size: 10px; color: #3a5a2a; text-transform: uppercase; letter-spacing: 2px; font-family: 'DM Mono', monospace; }
    .pos-stat-val { font-size: 20px; font-weight: bold; margin-top: 4px; }

    /* Forms */
    .ap-body { padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; max-width: 1200px; margin: 0 auto; width: 100%; }
    .ap-card { background: #141f0e; padding: 25px; border-radius: 20px; border: 1px solid #1e3314; }
    .ap-input { width: 100%; padding: 12px; background: #0f1a0a; border: 1px solid #2a4a1a; border-radius: 8px; color: #fff; margin-bottom: 12px; outline: none; }
    .ap-input:focus { border-color: #5aaa38; }
    
    /* Toasts */
    .pos-toasts { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; display: flex; flex-direction: column; gap: 10px; }
    .pos-toast { padding: 12px 24px; border-radius: 12px; background: #1e3314; color: #a8d87a; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #2a4a1a; font-size: 14px; font-weight: bold; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    /* Modal */
    .receipt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(4px); }
    .receipt-card { background: #141f0e; width: 340px; padding: 40px; border-radius: 24px; font-family: 'DM Mono', monospace; border: 1px solid #2a4a1a; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
  `;

  // ── RENDER: LOGIN ─────────────────────────────────────────────────────────
  if (!accessGranted) return (
    <div className="pos-root">
      <style>{S}</style>
      <div className="pos-login">
        <form className="pos-login-card" onSubmit={handleLogin}>
          <div className="pos-login-logo">🌿 Lilo's Farm</div>
          <p style={{color: '#5a7a4a', fontSize: '13px', marginBottom: '24px'}}>ADMINISTRATION PANEL</p>
          <input
            className="pos-login-input"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {passwordError && <div className="pos-login-err">{passwordError}</div>}
          <button className="pos-login-btn" type="submit">Access Dashboard</button>
        </form>
      </div>
    </div>
  );

  // ── RENDER: DASHBOARD ─────────────────────────────────────────────────────
  return (
    <div className="pos-root">
      <style>{S}</style>

      {/* TOASTS */}
      <div className="pos-toasts">
        {toasts.map(t => <div key={t.id} className={`pos-toast ${t.type}`}>{t.msg}</div>)}
      </div>

      {/* RECEIPT MODAL */}
      {receipt && (
        <div className="receipt-overlay" onClick={() => setReceipt(null)}>
          <div className="receipt-card" onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', color: '#a8d87a', marginBottom: '4px' }}>🌿 Lilo's Farm</h2>
            <p style={{ fontSize: '10px', textAlign: 'center', color: '#3a5a2a', marginBottom: '24px' }}>{receipt.time.toLocaleString()}</p>
            <div style={{ borderTop: '1px dashed #2a4a1a', paddingTop: '16px' }}>
              {receipt.items.map((i, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span>{i.product_name} x{i.qty}</span>
                  <span>{fmt(i.product_cost * i.qty)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px dashed #2a4a1a', marginTop: '10px', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#a8d87a' }}>
                <span>TOTAL</span>
                <span>{fmt(receipt.total)}</span>
              </div>
            </div>
            <button className="pos-login-btn" style={{ marginTop: '30px' }} onClick={() => setReceipt(null)}>Close Receipt</button>
          </div>
        </div>
      )}

      {/* TOPBAR */}
      <div className="pos-topbar">
        <div style={{ fontFamily: 'Playfair Display', fontSize: '20px', color: '#a8d87a' }}>Lilo's Farm <span style={{fontSize:'12px', opacity:0.6}}>POS</span></div>
        <div className="pos-tabs">
          {[["pos", "Terminal"], ["products", "Inventory"], ["orders", "History"], ["analytics", "Insights"]].map(([id, label]) => (
            <button key={id} className={`pos-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        <button className="pos-tab" onClick={handleLogout} style={{color: '#f87171'}}>Logout</button>
      </div>

      {/* STATS */}
      <div className="pos-statbar">
        <div className="pos-stat"><div className="pos-stat-label">Items</div><div className="pos-stat-val">{products.length}</div></div>
        <div className="pos-stat"><div className="pos-stat-label">Total Sales</div><div className="pos-stat-val">{orders.length}</div></div>
        <div className="pos-stat"><div className="pos-stat-label">Net Revenue</div><div className="pos-stat-val" style={{ color: '#5aaa38' }}>{fmt(totalRevenue)}</div></div>
        <div className="pos-stat"><div className="pos-stat-label">Sync Status</div><div className="pos-stat-val" style={{fontSize: '14px', color: '#a8d87a'}}>● Live</div></div>
      </div>

      {/* MAIN BODY */}
      <div className="pos-body">
        
        {/* TERMINAL TAB */}
        {tab === "pos" && (
          <>
            <div className="pos-left">
              <input 
                className="ap-input" 
                placeholder="🔍 Search inventory..." 
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                style={{marginBottom: '24px'}}
              />
              <div className="pos-grid">
                {products.filter(p => p.product_name.toLowerCase().includes(posSearch.toLowerCase())).map(p => (
                  <div key={p.id} className="pos-product" onClick={() => addToPos(p)}>
                    {p.product_photo ? 
                      <img src={IMG + p.product_photo} className="pos-product-img" alt="" /> : 
                      <div className="pos-product-img" style={{display:'flex', alignItems:'center', justifyContent:'center', fontSize: '24px'}}>🌿</div>
                    }
                    <div className="pos-product-body">
                      <div className="pos-product-name">{p.product_name}</div>
                      <div className="pos-product-price">{fmt(p.product_cost)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pos-right">
              <div style={{ padding: '20px', fontSize: '12px', fontWeight: 'bold', color: '#a8d87a', letterSpacing: '1px' }}>CURRENT BASKET</div>
              <div className="pos-cart-items">
                {posCart.length === 0 ? (
                  <div style={{textAlign:'center', marginTop: '40px', opacity: 0.3, fontSize: '13px'}}>Basket is empty</div>
                ) : posCart.map(item => (
                  <div key={item.product_name} className="pos-cart-item">
                    <div>
                      <div style={{fontSize:'13px', fontWeight: 'bold'}}>{item.product_name}</div>
                      <div style={{fontSize:'11px', color:'#5aaa38', fontFamily: 'DM Mono'}}>{fmt(item.product_cost)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => posChangeQty(item.product_name, -1)} style={{ background: '#1e3314', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                      <span style={{minWidth: '20px', textAlign: 'center'}}>{item.qty}</span>
                      <button onClick={() => posChangeQty(item.product_name, 1)} style={{ background: '#1e3314', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pos-checkout">
                <div className="pos-stat-label" style={{textAlign:'center', marginBottom: '5px'}}>Total Due</div>
                <div className="pos-grand-total">{fmt(posCart.reduce((s, i) => s + i.product_cost * i.qty, 0))}</div>
                <button className="pos-login-btn" onClick={chargeOrder} disabled={loading || !posCart.length}>
                  {loading ? "Processing Sale..." : "Complete Checkout"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* INVENTORY TAB */}
        {tab === "products" && (
          <div className="ap-body">
            <div className="ap-card">
              <h3 className="pos-stat-label" style={{marginBottom:'20px'}}>Add New Item</h3>
              <form onSubmit={handleProductSubmit}>
                <input className="ap-input" placeholder="Product Name" value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} required />
                <textarea className="ap-input" placeholder="Short Description" style={{height:'80px'}} value={form.product_description} onChange={e => setForm({...form, product_description: e.target.value})} />
                <input className="ap-input" type="number" placeholder="Cost (Ksh)" value={form.product_cost} onChange={e => setForm({...form, product_cost: e.target.value})} required />
                <input type="file" className="ap-input" onChange={e => {
                  setForm({...form, product_photo: e.target.files[0]});
                  setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                }} />
                {photoPreview && <img src={photoPreview} style={{width:'100%', borderRadius:'8px', marginBottom:'15px', height:'100px', objectFit:'cover'}} alt="preview"/>}
                <button className="pos-login-btn" type="submit" disabled={loading}>{loading ? "Saving..." : "Add to POS"}</button>
                {formMsg.text && <div style={{marginTop:'15px', fontSize:'13px', color: formMsg.type === 'success' ? '#a8d87a' : '#f87171'}}>{formMsg.text}</div>}
              </form>
            </div>
            <div className="ap-card" style={{display: 'flex', flexDirection: 'column'}}>
              <h3 className="pos-stat-label" style={{marginBottom:'20px'}}>Existing Inventory</h3>
              <div style={{overflowY: 'auto', flex: 1}}>
                {products.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e3314' }}>
                    <div>
                      <div style={{fontWeight:'bold', fontSize:'14px'}}>{p.product_name}</div>
                      <div style={{color: '#5aaa38', fontSize: '12px', fontFamily: 'DM Mono'}}>{fmt(p.product_cost)}</div>
                    </div>
                    <button onClick={() => deleteProduct(p.id)} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid #4a1a1a', color: '#f87171', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "orders" && (
          <div className="pos-left">
            <h3 className="pos-stat-label" style={{marginBottom: '20px'}}>Recent Transactions</h3>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#3a5a2a', fontSize: '11px', borderBottom: '1px solid #1e3314' }}>
                  <th style={{ padding: '15px' }}>ITEM</th>
                  <th>QUANTITY</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice().reverse().map((o, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #0a120a' }}>
                    <td style={{ padding: '15px', fontSize: '14px' }}>{o.product_name}</td>
                    <td>{o.quantity}</td>
                    <td style={{ color: '#a8d87a', fontFamily: 'DM Mono' }}>{fmt(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {tab === "analytics" && (
          <div className="ap-body" style={{ gridTemplateColumns: '1fr' }}>
            <div className="ap-card" style={{ height: '450px' }}>
              <h3 className="pos-stat-label" style={{marginBottom: '30px'}}>Revenue by Product</h3>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#3a5a2a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ background: '#141f0e', border: '1px solid #2a4a1a', borderRadius: '12px' }} 
                  />
                  <Bar dataKey="Revenue" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}