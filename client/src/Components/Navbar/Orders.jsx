import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase.config'; // Ensure you have Firebase config with auth and db
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Orders.css'; // Import external CSS

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get the logged-in user's UID using Firebase Authentication
  useEffect(() => {
    const user = getAuth().currentUser;
    if (user) {
      setUserId(user.uid); // Set the logged-in user's UID
    } 
  }, []);

  // Fetch orders from Firestore based on user ID (document ID)
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return; // Don't fetch if no user ID is set

      try {
        const userDocRef = doc(db, 'orders', userId); // Get the user's document by UID
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const fetchedOrders = userDoc.data().orders || [];
          // Sort orders by orderDate in descending order (recent first)
          const sortedOrders = fetchedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
          setOrders(sortedOrders);
        } 
      } catch (err) {
        console.error(err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="order-list">
      <h2>Your Orders</h2>

      {/* Conditional rendering for "No orders found" message */}
      {orders.length === 0 ? (
        <div className="no-orders-message">OOPS! No orders found </div>
      ) : (
        <ul>
          {orders.map((order, index) => (
            <li key={index} className="order-item">
              <div className="order-image">
                <img src={order.item.image} alt={order.item.name} />
              </div>
              <div className="order-details">
                <p><strong>Product Name:</strong> {order.item.name}</p>
                <p><strong>Price:</strong> ₹{order.item.price}</p>
                <p><strong>Quantity:</strong> {order.item.quantity}</p>
                <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Status:</strong> {order.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders;
