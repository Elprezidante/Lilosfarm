import React from "react";
import "../css/FarmHeader.css";

function FarmHeader() {
  return (
    <div>

      {/* Main Header */}
      <div className="main-header">

        {/* Logo */}
        <div className="logo">
          <img src="/Images/Logo.png" alt="Lilo's Farm" className="logo-img" />
          <h1>Lilo's Farm </h1>
        </div>

        {/* Search Bar */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search vegetables, fruits, dairy..."
          />
          <button>Search</button>
        </div>

        {/* Right Section */}
        <div className="header-icons">
          <span>👤 Account</span>
          <span>❓ Help</span>
          <span>🛒 Cart</span>
        </div>

      </div>

    </div>
  );
}

export default FarmHeader;