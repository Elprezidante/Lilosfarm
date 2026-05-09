import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://elprezidante.alwaysdata.net/api";

const Signup = () => {
  const [form, setForm] = useState({ username:"", email:"", password:"", phone:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all required fields."); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      await axios.post(`${API}/signup`, fd);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const msg = err.response?.data?.error || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#22c55e 0%,#16a34a 40%,#15803d 100%)",
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:"20px",
      fontFamily:"'Segoe UI',sans-serif",
    }}>
      <style>{`
        .su-card{
          background:white;
          border-radius:20px;
          overflow:hidden;
          width:500px;
          max-width:98vw;
          box-shadow:0 24px 60px rgba(0,0,0,0.22);
          display:flex;
          flex-direction:column;
          position:relative;
        }
        .su-img-section{
          position:relative;
          height:180px;
          overflow:hidden;
          flex-shrink:0;
        }
        .su-bg-img{
          width:100%;height:100%;object-fit:cover;display:block;
          filter:brightness(0.75);
        }
        .su-img-overlay{
          position:absolute;inset:0;
          background:linear-gradient(to bottom,rgba(21,128,61,0.3),rgba(21,128,61,0.7));
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:6px;
        }
        .su-img-title{
          color:white;font-size:26px;font-weight:800;
          text-shadow:0 2px 8px rgba(0,0,0,0.3);
        }
        .su-img-sub{
          color:rgba(255,255,255,0.88);font-size:13px;
          text-shadow:0 1px 4px rgba(0,0,0,0.2);
        }
        .su-form-section{
          padding:28px 32px 32px;
        }
        .su-field{
          margin-bottom:16px;
          position:relative;
        }
        .su-field-icon{
          position:absolute;left:14px;top:50%;transform:translateY(-50%);
          color:#aaa;font-size:15px;pointer-events:none;
        }
        .su-input{
          width:100%;padding:13px 14px 13px 42px;
          border:1.5px solid #e5e7eb;border-radius:10px;
          font-size:14px;font-family:'Segoe UI',sans-serif;
          color:#1a1a1a;background:#fafafa;outline:none;
          transition:border-color 0.2s,background 0.2s;
          box-sizing:border-box;
        }
        .su-input:focus{border-color:#22c55e;background:white;}
        .su-input::placeholder{color:#bbb;}
        .su-btn{
          width:100%;padding:14px;border-radius:30px;border:none;
          background:linear-gradient(90deg,#22c55e,#16a34a);
          color:white;font-size:15px;font-weight:700;
          font-family:'Segoe UI',sans-serif;cursor:pointer;
          box-shadow:0 4px 16px rgba(22,163,74,0.4);
          transition:opacity 0.2s,transform 0.1s;
          margin-top:4px;
        }
        .su-btn:hover:not(:disabled){opacity:0.92;transform:translateY(-1px);}
        .su-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .su-error{
          background:#fee2e2;color:#b91c1c;
          border-radius:8px;padding:10px 14px;
          font-size:13px;margin-bottom:14px;
          border:1px solid #fca5a5;
        }
        .su-success{
          background:#dcfce7;color:#15803d;
          border-radius:8px;padding:10px 14px;
          font-size:13px;margin-bottom:14px;
          border:1px solid #86efac;
        }
        .su-footer-text{
          text-align:center;margin-top:18px;
          font-size:13px;color:#888;
        }
        .su-link{
          color:#16a34a;font-weight:700;cursor:pointer;
          text-decoration:none;background:none;border:none;
          font-family:'Segoe UI',sans-serif;font-size:13px;
        }
        .su-link:hover{text-decoration:underline;}
        .su-divider{display:flex;align-items:center;gap:10px;margin:18px 0;}
        .su-divider-line{flex:1;height:1px;background:#e5e7eb;}
        .su-divider-text{font-size:12px;color:#aaa;}
        @keyframes spinSu{to{transform:rotate(360deg);}}
        .su-spinner{display:inline-block;animation:spinSu 0.8s linear infinite;margin-right:6px;}
      `}</style>

      <div className="su-card">
        {/* Header image section — vegetable basket */}
        <div className="su-img-section">
          <img
            src="https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&q=80"
            alt="Fresh vegetables"
            className="su-bg-img"
            onError={e => {
              e.target.style.display = "none";
              e.target.parentElement.style.background = "linear-gradient(135deg,#22c55e,#15803d)";
            }}
          />
          <div className="su-img-overlay">
            <div className="su-img-title">Register</div>
            <div className="su-img-sub">Signup now and get full access to our app.</div>
          </div>
        </div>

        {/* Form */}
        <div className="su-form-section">
          {error   && <div className="su-error">⚠️ {error}</div>}
          {success && <div className="su-success">✅ {success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="su-field">
              <span className="su-field-icon">👤</span>
              <input
                className="su-input"
                name="username"
                type="text"
                placeholder="Full Name"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="su-field">
              <span className="su-field-icon">✉️</span>
              <input
                className="su-input"
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="su-field">
              <span className="su-field-icon">🔒</span>
              <input
                className="su-input"
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div className="su-field">
              <span className="su-field-icon">📱</span>
              <input
                className="su-input"
                name="phone"
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <button className="su-btn" type="submit" disabled={loading}>
              {loading ? <><span className="su-spinner">⏳</span>Creating account...</> : "Submit"}
            </button>
          </form>

          <div className="su-footer-text">
            Already have an account?{" "}
            <button className="su-link" onClick={() => navigate("/login")}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;