import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, arrayUnion, getDocs, updateDoc, collection } from 'firebase/firestore';
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
      setItems(location.state.items);
    }
  }, [location.state]);

  useEffect(() => {
    // Calculate the total price based on cartQuantity (which is just the passed quantity now)
    const total = items.reduce((sum, item) => {
      return sum + item.price * (item.cartQuantity || 1); // Use cartQuantity for total price
    }, 0);
    setTotalPrice(total); // Update the total price state
  }, [items]); // Recalculate when items change

  const updateItemQuantities = async () => {
    try {
      // Fetch items from all relevant collections
      const categorySnapshot = await getDocs(collection(db, 'Marioitems'));
      const latestProductsSnapshot = await getDocs(collection(db, 'Aminetyitems'));
      const sliderItemsSnapshot = await getDocs(collection(db, 'Storeitems'));

      // Combine all items
      const allItems = [
        ...categorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), collection: 'Marioitems' })),
        ...latestProductsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), collection: 'Aminetyitems' })),
        ...sliderItemsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), collection: 'Storeitems' })),
      ];

      // Update quantities for matched items
      for (const cartItem of items) {
        const matchedItem = allItems.find((item) => item.id === cartItem.id);
        if (matchedItem) {
          const newQuantity = matchedItem.quantity - cartItem.cartQuantity; // Reduce quantity from DB
          if (newQuantity >= 0) {
            await updateDoc(doc(db, matchedItem.collection, matchedItem.id), { quantity: newQuantity });
            console.log(`Updated quantity for ${matchedItem.id} in ${matchedItem.collection}`);
          } else {
            toast.warning(`Insufficient stock for ${matchedItem.name}.`, { position: 'top-center' });
          }
        } else {
          console.warn(`Item ${cartItem.id} not found in any collection.`);
        }
      }
    } catch (error) {
      console.error('Error updating item quantities:', error);
      throw error; // Propagate error to show failure toast
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('You must be logged in to complete the payment.', { position: 'top-center' });
      return;
    }

    try {
      setIsProcessing(true);

      // Update quantities in relevant collections
      await updateItemQuantities();

      // Save order details for the user
      const userRef = doc(db, 'orders', user.uid);
      const orderData = items.map((item) => ({
        item: {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.cartQuantity || 1, // Use cartQuantity for order data
          image: item.image,
        },
        totalAmount: item.price * (item.cartQuantity || 1),
        orderDate: new Date().toISOString(),
        status: 'Paid',
      }));

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
          {items.map((item) => (
            <div key={item.id} className="checkout-item">
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>Price: Rs.{item.price}</p>
              <p>Quantity: {item.cartQuantity || 1}</p> {/* Display quantity */}
              <p>Total Amount: Rs.{item.price * (item.cartQuantity || 1)}</p> {/* Total price based on quantity */}
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
