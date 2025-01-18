import React, { useRef } from "react";
import "./Home.css";
import hero_image from "../../assets/hero.png";
import { FaStore } from "react-icons/fa";
import { IoRestaurantOutline, IoFastFoodOutline } from "react-icons/io5";
import Category from "../Categories/Categories";
import TopSale from "../../Components/TopSale/TopSale";
import Footer from '../Footer/Footer';

const Home = () => {
  const categoryRef = useRef(null); // Create a ref for the Category section

  const handleExploreClick = () => {
    // Scroll to the Category section
    categoryRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-text">
            <h1>Your delicious discoveries ahead</h1>
            <p>
              Ready to tantalize your taste buds with every bite! Explore a
              world of flavors and indulge in culinary adventures that delight
              and surprise.
            </p>
            <div className="buttons">
              <button className="explore" onClick={handleExploreClick}>
                Explore
              </button>
            </div>
          </div>
          {/* Image comes after the hero text */}
          <div className="hero-image">
            <img src={hero_image} alt="Delicious burger" />
            <div className="overlay"></div>
          </div>
        </div>
        {/* Store section should appear after the image */}
        <div className="store-section">
          <div className="store-card">
            <FaStore className="icon" />
            <h2>Store</h2>
          </div>
          <div className="store-card">
            <IoRestaurantOutline className="icon" />
            <h2>Amenity</h2>
          </div>
          <div className="store-card">
            <IoFastFoodOutline className="icon" />
            <h2>Mario</h2>
          </div>
        </div>
      </div>
      {/* Use the ref to target the Category component */}
      <div ref={categoryRef}>
        <Category />
      </div>
      <TopSale />
      <Footer/>
    </>
  );
};

export default Home;
