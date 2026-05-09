import { useState } from "react";

const leafSvg = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.5 2 3 7 3 12c0 2.5 1 5 3 7l1-4c1 2 3 3.5 5 4V15c-2-.5-3.5-2-4-4 1 .5 2.5.5 4 0V2z" fill="currentColor" opacity="0.85"/>
    <path d="M12 2c5.5 0 9 5 9 10 0 2.5-1 5-3 7l-1-4c-1 2-3 3.5-5 4V15c2-.5 3.5-2 4-4-1 .5-2.5.5-4 0V2z" fill="currentColor" opacity="0.5"/>
  </svg>
);

const sunSvg = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
    <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const seedSvg = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="13" rx="5" ry="7" fill="currentColor" opacity="0.7"/>
    <path d="M12 6 Q14 3 18 4 Q16 8 12 6Z" fill="currentColor" opacity="0.5"/>
    <line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const contactItems = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" opacity="0.8"/>
        <circle cx="12" cy="9" r="2.5" fill="white" opacity="0.9"/>
      </svg>
    ),
    label: "Visit Us",
    value: "123 Harvest Road, Green Valley",
    sub: "Open Mon–Sat, 7am–6pm",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="currentColor" opacity="0.8"/>
      </svg>
    ),
    label: "Call Us",
    value: "+254 712 345 678",
    sub: "We're happy to chat!",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="currentColor" opacity="0.8"/>
        <polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.9"/>
      </svg>
    ),
    label: "Email Us",
    value: "hello@lilosfarm.co",
    sub: "We reply within 24 hours",
  },
];

const topics = [
  "Fresh produce order",
  "Farm tour booking",
  "Wholesale enquiry",
  "Seasonal CSA box",
  "General question",
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) setSubmitted(true);
  };

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "linear-gradient(160deg, #f5f0e8 0%, #eef5e8 50%, #f5f0e8 100%)",
      minHeight: "100vh",
      padding: "0",
    }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2d5a1b 0%, #3d7a25 50%, #4a8f2e 100%)",
        padding: "3.5rem 2rem 5rem",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Decorative background circles */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            width: `${120 + i * 80}px`,
            height: `${120 + i * 80}px`,
            top: `${10 - i * 20}px`,
            left: `${-30 + i * 15}%`,
            pointerEvents: "none",
          }}/>
        ))}

        {/* Floating leaf decorations */}
        <div style={{ position: "absolute", top: "20px", right: "8%", color: "rgba(255,255,255,0.2)", fontSize: "48px", transform: "rotate(25deg)" }}>&#9698;</div>
        <div style={{ position: "absolute", top: "60px", left: "6%", color: "rgba(255,255,255,0.15)", fontSize: "32px", transform: "rotate(-15deg)" }}>&#9698;</div>
        <div style={{ position: "absolute", bottom: "30px", right: "20%", color: "rgba(255,255,255,0.12)", fontSize: "40px", transform: "rotate(45deg)" }}>&#9698;</div>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50px",
          padding: "6px 18px",
          marginBottom: "1.2rem",
        }}>
          <span style={{ color: "#a8d87a", display: "flex" }}>{leafSvg}</span>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase" }}>Lilo's Farm</span>
        </div>

        <h1 style={{
          color: "#ffffff",
          fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
          fontWeight: "400",
          margin: "0 0 0.6rem",
          letterSpacing: "-0.5px",
          lineHeight: 1.15,
        }}>
          We'd love to hear from you
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: "1.1rem",
          margin: "0",
          fontStyle: "italic",
        }}>
          Rooted in the soil, growing for our community.
        </p>
      </div>

      {/* Cards strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "0",
        margin: "-2.5rem 2rem 0",
        position: "relative",
        zIndex: 2,
        maxWidth: "960px",
        marginLeft: "auto",
        marginRight: "auto",
        padding: "0 1.5rem",
      }}>
        {contactItems.map((item, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: hoveredCard === i ? "linear-gradient(160deg, #f2fae8, #ffffff)" : "#ffffff",
              borderRadius: i === 0 ? "16px 0 0 16px" : i === contactItems.length - 1 ? "0 16px 16px 0" : "0",
              borderLeft: i !== 0 ? "1px solid #e8f0dc" : "none",
              borderTop: hoveredCard === i ? "2px solid #4a8f2e" : "2px solid transparent",
              padding: "1.5rem 1.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: hoveredCard === i
                ? "0 16px 48px rgba(45,90,27,0.18), 0 2px 8px rgba(45,90,27,0.08)"
                : "0 8px 32px rgba(45,90,27,0.1)",
              transform: hoveredCard === i ? "translateY(-6px)" : "translateY(0)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, border-top 0.2s ease",
              cursor: "default",
              zIndex: hoveredCard === i ? 3 : 1,
              position: "relative",
            }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: hoveredCard === i
                ? "linear-gradient(135deg, #3d7a25, #5aaa38)"
                : "linear-gradient(135deg, #e8f5d8, #c8e8a0)",
              display: "flex",
              alignItems: "center",
              transition: "background 0.25s ease",
              justifyContent: "center",
              color: hoveredCard === i ? "#ffffff" : "#3d7a25",
              marginBottom: "4px",
            }}>
              {item.icon}
            </div>
            <p style={{ margin: 0, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7a9a5a", fontFamily: "sans-serif" }}>{item.label}</p>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: hoveredCard === i ? "#2d5a1b" : "#2d3a1e", fontFamily: "sans-serif", transition: "color 0.2s" }}>{item.value}</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#7a8a6a", fontFamily: "sans-serif" }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{
        maxWidth: "960px",
        margin: "3rem auto 4rem",
        padding: "0 1.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 1.6fr",
        gap: "2.5rem",
        alignItems: "start",
      }}>

        {/* Left: About panel */}
        <div>
          <div style={{
            background: "linear-gradient(160deg, #2d5a1b, #3d7a25)",
            borderRadius: "20px",
            padding: "2rem 1.8rem",
            color: "white",
            marginBottom: "1.5rem",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", bottom: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }}/>
            <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "60px", height: "60px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }}/>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#a8d87a" }}>
              {sunSvg}
              <span style={{ fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>About the Farm</span>
            </div>
            <p style={{ margin: "0 0 1rem", fontSize: "1rem", lineHeight: "1.7", opacity: "0.9" }}>
              Nestled in the green heart of the valley, Lilo's Farm has been nurturing the land and our community for over 20 years.
            </p>
            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6", opacity: "0.7" }}>
              We grow seasonal vegetables, herbs, and fruits using regenerative practices — no shortcuts, just honest farming.
            </p>
          </div>

          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "1.5rem 1.6rem",
            boxShadow: "0 4px 20px rgba(45,90,27,0.07)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.2rem", color: "#3d7a25" }}>
              {seedSvg}
              <span style={{ fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7a9a5a", fontFamily: "sans-serif" }}>What we offer</span>
            </div>
            {["Weekly CSA vegetable boxes", "Farm tours & workshops", "Wholesale for restaurants", "Seasonal flower bundles", "Organic seedling sales"].map((item, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 0",
                borderBottom: i < 4 ? "1px solid #f0f5e8" : "none",
                fontFamily: "sans-serif",
                fontSize: "14px",
                color: "#3d4a2e",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#5a9a30", flexShrink: 0 }}/>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "2.2rem 2rem",
          boxShadow: "0 8px 40px rgba(45,90,27,0.1)",
        }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{
                width: "70px", height: "70px", borderRadius: "50%",
                background: "linear-gradient(135deg, #e8f5d8, #c8e8a0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "28px",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#3d7a25" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ color: "#2d5a1b", fontWeight: "400", marginBottom: "0.7rem", fontSize: "1.6rem" }}>Message received!</h2>
              <p style={{ color: "#7a8a6a", fontFamily: "sans-serif", fontSize: "15px", lineHeight: "1.6", marginBottom: "2rem" }}>
                Thank you, {form.name}. We'll get back to you at {form.email} within 24 hours.
              </p>
              <button
                onClick={() => { setForm({ name: "", email: "", topic: "", message: "" }); setSubmitted(false); }}
                style={{
                  background: "linear-gradient(135deg, #3d7a25, #4a8f2e)",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  padding: "12px 28px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3d7a25", marginBottom: "6px" }}>
                  {leafSvg}
                  <span style={{ fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7a9a5a", fontFamily: "sans-serif" }}>Send us a message</span>
                </div>
                <h2 style={{ margin: 0, color: "#2d3a1e", fontSize: "1.8rem", fontWeight: "400" }}>Get in touch</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                {[
                  { name: "name", label: "Your name", type: "text", placeholder: "Jane Smith" },
                  { name: "email", label: "Email address", type: "email", placeholder: "jane@example.com" },
                ].map((field) => (
                  <div key={field.name}>
                    <label style={{ display: "block", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "#7a9a5a", marginBottom: "6px", fontFamily: "sans-serif" }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      onFocus={() => setFocused(field.name)}
                      onBlur={() => setFocused(null)}
                      placeholder={field.placeholder}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: focused === field.name ? "1.5px solid #4a8f2e" : "1.5px solid #e0e8d0",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontFamily: "sans-serif",
                        color: "#2d3a1e",
                        background: focused === field.name ? "#f8fdf4" : "#fafcf7",
                        outline: "none",
                        transition: "all 0.2s",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "#7a9a5a", marginBottom: "6px", fontFamily: "sans-serif" }}>
                  What's this about?
                </label>
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  onFocus={() => setFocused("topic")}
                  onBlur={() => setFocused(null)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: focused === "topic" ? "1.5px solid #4a8f2e" : "1.5px solid #e0e8d0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: "sans-serif",
                    color: form.topic ? "#2d3a1e" : "#aab89a",
                    background: focused === "topic" ? "#f8fdf4" : "#fafcf7",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a9a5a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: "36px",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="" disabled>Select a topic...</option>
                  {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "#7a9a5a", marginBottom: "6px", fontFamily: "sans-serif" }}>
                  Your message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: focused === "message" ? "1.5px solid #4a8f2e" : "1.5px solid #e0e8d0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: "Georgia, serif",
                    color: "#2d3a1e",
                    background: focused === "message" ? "#f8fdf4" : "#fafcf7",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: "1.6",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #2d5a1b 0%, #4a8f2e 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  fontSize: "15px",
                  fontFamily: "sans-serif",
                  letterSpacing: "0.5px",
                  cursor: "pointer",
                  transition: "opacity 0.2s, transform 0.1s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => e.target.style.opacity = "0.9"}
                onMouseLeave={(e) => e.target.style.opacity = "1"}
              >
                <span style={{ color: "#a8d87a", display: "flex" }}>{leafSvg}</span>
                Send message
              </button>

              <p style={{ textAlign: "center", fontSize: "12px", color: "#aab89a", marginTop: "1rem", marginBottom: 0, fontFamily: "sans-serif" }}>
                We read every message personally. No bots, just farmers.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Footer strip */}
      <div style={{
        background: "#2d5a1b",
        padding: "1.5rem 2rem",
        textAlign: "center",
        color: "rgba(255,255,255,0.5)",
        fontSize: "13px",
        fontFamily: "sans-serif",
        letterSpacing: "0.5px",
      }}>
        © {new Date().getFullYear()} Lilo's Farm — Grown with love, delivered with care.
      </div>
    </div>
  );
}