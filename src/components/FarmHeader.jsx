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
          <h1> ᥕᥱᥣᥴ᥆mᥱ 𝗍᥆ LIL᥆s Farm </h1>
        </div>
      </div>

    </div>
  );
}

export default FarmHeader;