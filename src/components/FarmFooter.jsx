import React from "react";
import "../css/FarmFooter.css";

const FarmFooter = () => {
  return (
    <footer className="farm-footer">

      {/* 🌿 TOP SECTION */}
      <div className="footer-top">

        {/* Left */}
        <div className="footer-brand">
          <h2>🌿 Lilo's Farm</h2>
        </div>

        {/* Middle */}
        <div className="footer-newsletter">
          <h5>NEW TO THE FARM?</h5>
          <p>
            Subscribe for fresh harvest updates, discounts, and organic goodness straight from the soil 🌱
          </p>

          <div className="terms">
            <input type="checkbox" />
            <span>I agree to the farm's privacy policy</span>
          </div>

          <div className="subscribe-box">
            <input type="email" placeholder="Enter your email address" />
            <button>Subscribe</button>
          </div>
        </div>

        {/* Right */}
        <div className="footer-app">
          <h5>GET OUR FARM APP</h5>
          <p>Order fresh produce anytime 🧺</p>

          <div className="app-buttons">
            <button className="app-btn">🍎 App Store</button>
            <button className="app-btn">▶ Google Play</button>
          </div>
        </div>

      </div>

      {/* 🌱 BOTTOM SECTION */}
      <div className="footer-bottom">

        <div>
          <h6>Need Help?</h6>
          <p>Chat with us</p>
          <p>Help Center</p>
        </div>

        <div>
          <h6>About Farm</h6>
          <p>Our Story</p>
          <p>Returns Policy</p>
        </div>

        <div>
          <h6>Earn With Us</h6>
          <p>Sell your produce</p>
          <p>Farmer Hub</p>
        </div>

        <div>
          <h6>Farm Locations</h6>
          <p>Nairobi</p>
          <p>Nakuru</p>
        </div>
 <div>
      
      </div>
      </div>
     

    </footer>
  );
};

export default FarmFooter;