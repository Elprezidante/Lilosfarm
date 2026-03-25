import React, { useState } from "react";
import "../css/Carousel.css";

const Carousel = ({ products }) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) =>
      prev === products.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? products.length - 1 : prev - 1
    );
  };

  return (
    <div className="carousel">
      <button className="arrow left" onClick={prevSlide}>❮</button>

      <div className="carousel-track">
        {products.map((item, index) => (
          <div
            className={`card ${
              index === current ? "active" : ""
            }`}
            key={index}
          >
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>Ksh {item.price}</p>
          </div>
        ))}
      </div>

      <button className="arrow right" onClick={nextSlide}>❯</button>
    </div>
  );
};

export default Carousel;