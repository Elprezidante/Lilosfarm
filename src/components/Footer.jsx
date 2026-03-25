import React, { useState } from "react";
import "../css/Footer.css";

const Footer = () => {

  // ✅ STATE (this was missing)
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // ✅ FUNCTION (this was missing)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email, message);

    setEmail("");
    setMessage("");
  };

  return (
    <footer className="footer">

      <h1>Lilo's Farm 🌿</h1>
      <p>Fresh farm products, straight to you.</p>

      <div className="footer-links">
        <span>Home</span>
        <span>Products</span>
        <span>Contact</span>
      </div>

      <p className="contact">
        📞 +254 118 933 540 | ✉️ info@lilosfarm.com
      </p>

      {/* 🌿 FORM (moved up for better layout) */}
      <form className="footer-form" onSubmit={handleSubmit}>
        <h3>Contact Us</h3>

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <textarea
          placeholder="Your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>

        <button type="submit">Send 🌿</button>
      </form>

      {/* Social Section */}
      <div className="social">
        <h5>Follow Us</h5>


        <br />
<h1>        <img src="/Images/tiktok.jpg" alt="Facebook" width="30" /> <a href="#">Facebook</a><br /></h1>
       <h1> <img src="/Images/x.jpg" alt="X" width="30" /> <a href="#">Twitter</a><br /></h1>
        <h1> <img src="/Images/instagram.jpg" alt="Instagram" width="30" /><a href="#">Instagram</a><br /></h1>
      </div>

      <p className="copy">
        © {new Date().getFullYear()} Lilo's Farm
      </p>

    </footer>
  );
};

export default Footer;