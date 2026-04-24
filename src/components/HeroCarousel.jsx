import React from "react";
import Carousel from "react-bootstrap/Carousel";
import { useNavigate } from "react-router-dom";
import "../css/HeroCarousel.css";

const HeroCarousel = () => {
  const navigate = useNavigate();

  return (
    <Carousel fade interval={4000} className="mb-5">

      {/* 🌾 Slide 1 */}
      <Carousel.Item>
        <div
          className="hero-slide"
          style={{ backgroundImage: "url('/Images/agricultural products.jpg')" }}
        >
          <div className="hero-content">
            <h2>Fresh From The Farm</h2>
            <p>Quality grains & cereals at unbeatable prices</p>

            <button
              className="btn hero-btn"
              onClick={() => navigate("/")}
            >
              Shop Now
            </button>
          </div>
        </div>
      </Carousel.Item>

      {/* 🍎 Slide 2 */}
      <Carousel.Item>
        <div
          className="hero-slide"
          style={{ backgroundImage: "url('/Images/fruits.jpg')" }}
        >
          <div className="hero-content">
            <h2>Organic Fruits</h2>
            <p>Harvested today, delivered tomorrow</p>

            <button
              className="btn hero-btn"
              onClick={() => navigate("")}
            >
              Buy Fresh
            </button>
          </div>
        </div>
      </Carousel.Item>

      {/* 🐄 Slide 3 */}
      <Carousel.Item>
        <div
          className="hero-slide"
          style={{ backgroundImage: "url('/Images/vegetableadvert.jpg')" }}
        >
          <div className="hero-content">
            <h2>Livestock & Dairy</h2>
            <p>Milk, eggs, poultry & more</p>

           
          </div>
        </div>
      </Carousel.Item>

    </Carousel>
  );
};

export default HeroCarousel;