// PaymentSuccessPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css'; // Optional: For styling

const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success-container">
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase. Your order has been placed successfully.</p>
      <button onClick={() => navigate('/')} className="browse-more-btn">
        Browse More
      </button>
    </div>
  );
};

export default PaymentSuccessPage;
