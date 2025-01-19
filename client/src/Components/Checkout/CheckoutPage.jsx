import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, arrayUnion, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { useStateValue } from '../../../../Context/StateProvider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [{ user }] = useStateValue();
  const [isProcessing, setIsProcessing] = useState(false);
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (location.state?.items) {
      console.log('Items received from CartPage:', location.state.items);
      setItems(location.state.items);

      // Calculate total price
      const total = location.state.items.reduce(
        (sum, item) => sum + item.price * (item.cartQuantity || 1),
        0
      );
      setTotalPrice(total);
      console.log('Total Price:', total);
    }
  }, [location.state]);

  const handlePayment = async () => {
    if (!user) {
      toast.error('You must be logged in to complete the payment.', { position: 'top-center' });
      return;
    }

    try {
      setIsProcessing(true);

      console.log('Processing payment...');
      const userRef = doc(db, 'orders', user.uid);
      const orderData = items.map(item => ({
        item: {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.cartQuantity, // Use static cartQuantity
          image: item.image,
        },
        totalAmount: item.price * item.cartQuantity,
        orderDate: new Date().toISOString(),
        status: 'Paid',
      }));

      console.log('Saving order data for the user:', orderData);

      await setDoc(
        userRef,
        {
          orders: arrayUnion(...orderData),
        },
        { merge: true }
      );

      toast.success('Payment successful! Redirecting...', {
        position: 'top-center',
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate('/payment-success', { state: { orders: orderData } });
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed! Please try again.', {
        position: 'top-center',
        autoClose: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      {items.length === 0 ? (
        <div>No items selected for checkout.</div>
      ) : (
        <div className="checkout-items">
          {items.map(item => (
            <div key={item.id} className="checkout-item">
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>Price: Rs.{item.price}</p>
              <p>Quantity: {item.cartQuantity}</p>
              <p>Total Amount: Rs.{item.price * item.cartQuantity}</p>
            </div>
          ))}

          <div className="checkout-summary">
            <h4>Total Price: Rs.{totalPrice}</h4>
          </div>

          <button onClick={handlePayment} disabled={isProcessing} className="paynow-button">
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default CheckoutPage;
