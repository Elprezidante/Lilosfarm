import React from "react";
import { Link } from "react-router-dom";
import "../css/FarmHeader.css";

function FarmHeader({ isLoggedIn, handleLogout }) {
  return (
    <header className="main-header">

      {/* LEFT SIDE - LOGO */}
      <div className="logo">
        <img src="/Images/Logo.png" alt="Lilo's Farm" className="logo-img" />
        <h1>Welcome to Lilos Farm</h1>
      </div>

     

    </header>
  );
}

export default FarmHeader;