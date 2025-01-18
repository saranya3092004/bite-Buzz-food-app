// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { doc, setDoc, arrayUnion } from 'firebase/firestore';
// import { db } from '../../firebase.config';
// import { useStateValue } from '../../../../Context/StateProvider'; // Assuming this holds user info
// import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
// import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
// import './CheckoutPage.css';

// const CheckoutPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [{ user }] = useStateValue(); // Assuming user is stored in context
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [quantity, setQuantity] = useState({}); // For storing multiple quantities if multiple items are in cart
//   const [items, setItems] = useState([]); // To store items (from CartPage)
//   const [totalPrice, setTotalPrice] = useState(0); // To store the total price of all items

//   useEffect(() => {
//     if (location.state?.items) {
//       setItems(location.state.items); // Receive multiple items from CartPage
//       const initialQuantities = location.state.items.reduce((acc, item) => {
//         acc[item.id] = item.quantity || 1; // Default to 1 if no quantity is set
//         return acc;
//       }, {});
//       setQuantity(initialQuantities); // Set initial quantities for each item
//     }
//   }, [location.state]);

//   useEffect(() => {
//     // Recalculate total price whenever items or quantities change
//     const total = items.reduce((sum, item) => {
//       return sum + item.price * quantity[item.id];
//     }, 0);
//     setTotalPrice(total); // Update total price
//   }, [items, quantity]);

//   const handleQuantityChange = (itemId, change) => {
//     setQuantity(prevQuantity => {
//       const newQuantity = prevQuantity[itemId] + change;
//       if (newQuantity > 0) {
//         return { ...prevQuantity, [itemId]: newQuantity }; // Update quantity if it's greater than 0
//       }
//       return prevQuantity; // Don't update if quantity is less than 1
//     });
//   };

//   const handlePayment = async () => {
//     if (!user) {
//       toast.error('You must be logged in to complete the payment.', { position: 'top-center' });
//       return;
//     }

//     try {
//       setIsProcessing(true);

//       const userRef = doc(db, 'orders', user.uid); // Using the user's UID for document ID

//       const orderData = items.map(item => ({
//         item: {
//           id: item.id,
//           name: item.name,
//           price: item.price,
//           quantity: quantity[item.id],
//           image:item.image,
//         },
//         totalAmount: item.price * quantity[item.id], // Adjust for dynamic quantity
//         orderDate: new Date().toISOString(),
//         status: 'Paid',
//       }));

//       // Store the order in the user's document
//       await setDoc(
//         userRef,
//         {
//           orders: arrayUnion(...orderData), // Add multiple orders to the 'orders' array
//         },
//         { merge: true } // Merge the new data with the existing document
//       );

//       console.log('Order added to user document:', orderData);

//       // Show success toast
//       toast.success('Payment successful! Redirecting...', {
//         position: 'top-center',
//         autoClose: 2000, // Auto close after 2 seconds
//       });

//       // Navigate to the payment success page after a delay
//       setTimeout(() => {
//         navigate('/payment-success', { state: { orders: orderData } });
//       }, 2000);
//     } catch (error) {
//       console.error('Error processing payment:', error);
//       toast.error('Payment failed! Please try again.', {
//         position: 'top-center',
//         autoClose: 3000,
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="checkout-container">
//       <h2>Checkout</h2>

//       {items.length === 0 ? (
//         <div>No items selected for checkout.</div>
//       ) : (
//         <div className="checkout-items">
//           {items.map(item => (
//             <div key={item.id} className="checkout-item">
//               <img src={item.image} alt={item.name} />
//               <h3>{item.name}</h3>
//               <p>Price: Rs.{item.price}</p>

//               {/* Quantity adjustment */}
//               <div className="quantity-container">
//                 <button onClick={() => handleQuantityChange(item.id, -1)} disabled={quantity[item.id] <= 1}>
//                   -
//                 </button>
//                 <span>{quantity[item.id]}</span>
//                 <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
//               </div>

//               <p>Total Amount: Rs.{item.price * quantity[item.id]}</p>
//             </div>
//           ))}

//           {/* Total price */}
//           <div className="checkout-summary">
//             <h4>Total Price: Rs.{totalPrice}</h4>
//           </div>

//           <button onClick={handlePayment} disabled={isProcessing} className='paynow-button'>
//             {isProcessing ? 'Processing...' : 'Pay Now'}
//           </button>
//         </div>
//       )}

//       {/* Toast Container for notifications */}
//       <ToastContainer />
//     </div>
//   );
// };

// export default CheckoutPage;













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
  const [quantity, setQuantity] = useState({});
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (location.state?.items) {
      setItems(location.state.items);
      const initialQuantities = location.state.items.reduce((acc, item) => {
        acc[item.id] = item.quantity || 1;
        return acc;
      }, {});
      setQuantity(initialQuantities);
    }
  }, [location.state]);

  useEffect(() => {
    const total = items.reduce((sum, item) => {
      return sum + item.price * quantity[item.id];
    }, 0);
    setTotalPrice(total);
  }, [items, quantity]);

  const handleQuantityChange = (itemId, change) => {
    setQuantity(prevQuantity => {
      const newQuantity = prevQuantity[itemId] + change;
      if (newQuantity > 0) {
        return { ...prevQuantity, [itemId]: newQuantity };
      }
      return prevQuantity;
    });
  };

  const updateItemQuantities = async () => {
    try {
      // Fetch items from all relevant collections
      const categorySnapshot = await getDocs(collection(db, 'Marioitems'));
      const latestProductsSnapshot = await getDocs(collection(db, 'Aminetyitems'));
      const sliderItemsSnapshot = await getDocs(collection(db, 'Storeitems'));

      // Combine all items
      const allItems = [
        ...categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collection: 'Marioitems' })),
        ...latestProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collection: 'Aminetyitems' })),
        ...sliderItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collection: 'Storeitems' })),
      ];

      // Update quantities for matched items
      for (const cartItem of items) {
        const matchedItem = allItems.find(item => item.id === cartItem.id);
        if (matchedItem) {
          const newQuantity = matchedItem.quantity - quantity[cartItem.id];
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
      const orderData = items.map(item => ({
        item: {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: quantity[item.id],
          image: item.image,
        },
        totalAmount: item.price * quantity[item.id],
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
          {items.map(item => (
            <div key={item.id} className="checkout-item">
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>Price: Rs.{item.price}</p>
              <div className="quantity-container">
                <button onClick={() => handleQuantityChange(item.id, -1)} disabled={quantity[item.id] <= 1}>
                  -
                </button>
                <span>{quantity[item.id]}</span>
                <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
              </div>
              <p>Total Amount: Rs.{item.price * quantity[item.id]}</p>
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
