import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase.config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useStateValue } from '../../../../Context/StateProvider';
import { actionType } from '../../../../Context/Reducer';

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import './TopSale.css';

const TopSale = () => {
  const [topSaleItems, setTopSaleItems] = useState([]);
  const [addedItems, setAddedItems] = useState(new Set()); // Track added items
  const [{ user }, dispatch] = useStateValue();
  const navigate = useNavigate();
  const auth = getAuth();



  const handleBuyNow = async (item) => {
    if (user) {
      const itemWithQuantity = { ...item, quantity: 1 }; // Explicitly set quantity to 1
      navigate('/checkout', {
        state: { items: [itemWithQuantity] }, // Pass the updated item to CheckoutPage
      });
      console.log(itemWithQuantity);
    }
  };
  
  
  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (
      currentUser) => {
      if (currentUser) {
        dispatch({
          type: actionType.SET_USER,
          user: currentUser, // Dispatch the authenticated user
        });
      } else {
        dispatch({
          type: actionType.SET_USER,
          user: null, // Clear user on logout
        });
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [auth, dispatch]);

  // Fetch Top Sale items from Firestore
  useEffect(() => {
    const fetchTopSaleItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'topSale'));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTopSaleItems(items);

        if (user) {
          // Fetch added items from Firestore to track
          const userCartRef = doc(db, 'userCarts', user.uid);
          const userCartSnapshot = await getDoc(userCartRef);
          if (userCartSnapshot.exists()) {
            const userCartData = userCartSnapshot.data();
            const cartItems = userCartData.items;
            setAddedItems(new Set(Object.keys(cartItems))); // Set added item IDs
          }
        }
      } catch (error) {
        console.error('Error fetching top sale items: ', error);
      }
    };

    fetchTopSaleItems();
  }, [user]);

  // Add to cart logic
  const handleAddToCart = async (item) => {
    if (!user || !user.uid) {
      console.warn('User not authenticated. Please login to add items to the cart.');
      return;
    }

    try {
      const userCartRef = doc(db, 'userCarts', user.uid);
      const userCartSnapshot = await getDoc(userCartRef);

      const updatedCart = {
        uid: user.uid,
        items: userCartSnapshot.exists() ? userCartSnapshot.data().items : {},
      };

      if (updatedCart.items[item.id]) {
        updatedCart.items[item.id].quantity += 1;
      } else {
        updatedCart.items[item.id] = {
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
        };
      }

      await setDoc(userCartRef, updatedCart, { merge: true });
      localStorage.setItem(`cartItems_${user.uid}`, JSON.stringify(updatedCart.items));

      setAddedItems((prev) => new Set(prev.add(item.id))); // Ensure addedItems updates correctly
      dispatch({
        type: actionType.SET_CART_ITEMS,
        cartItems: Object.values(updatedCart.items),
      });

      console.log('Item added/updated in user cart:', updatedCart);
    } catch (error) {
      console.error('Error adding item to user cart:', error);
    }
  };



  return (
    <div className="top-sale-container">
      <h2>Top Sale Items</h2>
      <div className="top-sale-grid">
        {topSaleItems.map((item) => (
          <div key={item.id} className="top-sale-card">
            <img
              src={item.image || 'https://via.placeholder.com/150'}
              alt={item.name}
              className="top-sale-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p className="price">Rs.{item.price}</p>
            <div className="top-sale-buttons">
            {user ? (
            <>
              {addedItems.has(item.id) ? (
                <>
                  <button disabled>
                    Item Added
                  </button>
                  <button onClick={() => handleBuyNow(item)}>
                    Buy Now
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleAddToCart(item)}>
                    Add to Cart
                  </button>
                  <button onClick={() => handleBuyNow(item)}>
                    Buy Now
                  </button>
                </>
              )}
            </>
          ) : (
            // If the user is not logged in, show Login buttons
            <>
              <button disabled>
                Login 
              </button>
            </>
          )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSale;
