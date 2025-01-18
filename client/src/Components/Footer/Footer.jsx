import React from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Us Section */}
        <div className="footer-section about">
          <h4>About Us</h4>
          <p>
  We offer quick and convenient food delivery from your favorite restaurants, bringing fresh, delicious meals right to your doorstep. Whether you’re craving comfort food or something new, we’ve got you covered!
</p>

        </div>

        {/* Quick Links Section */}
        <div className="footer-section quick-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Shop</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>

        {/* Order Services Section */}
        <div className="footer-section order-services">
          <h4>Order Services</h4>
          <ul>
            <li><a href="#">Order Now</a></li>
            <li><a href="#">Track Your Order</a></li>
            <li><a href="#">Delivery Information</a></li>
            <li><a href="#">Payment Options</a></li>
            <li><a href="#">Order History</a></li>
          </ul>
        </div>

        {/* Customer Support Section */}
        <div className="footer-section customer-support">
          <h4>Customer Support</h4>
          <ul>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Contact Support</a></li>
            <li><a href="#">Delivery Assistance</a></li>
            <li><a href="#">Report an Issue</a></li>
            <li><a href="#">Return/Refund Policy</a></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact">
          <h4>Contact Us</h4>
          <p>Email: support@yourwebsite.com</p>
          <p>Phone: +123 456 7890</p>
          <p>Address: 123 Jewelry Lane, City, Country</p>
          <div className="social-icons">
            <FaFacebook className="social-icon" />
            <FaTwitter className="social-icon" />
            <FaInstagram className="social-icon" />
            <FaPinterest className="social-icon" />
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; 2025 Bite Buzz. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
