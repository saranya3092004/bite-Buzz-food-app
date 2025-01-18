import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  // Added useNavigate
import { db } from '../../firebase.config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useStateValue } from '../../../../Context/StateProvider';
import { actionType } from '../../../../Context/Reducer'; // Import actionType here

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import './CategoryItems.css';

const CategoryItemsPage = () => {
  const { categoryType, categoryName } = useParams();
  const [categoryItems, setCategoryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const [addedItems, setAddedItems] = useState(new Set()); // Track added items
  const [{ user, cartItems }, dispatch] = useStateValue();
  const navigate = useNavigate();  // Initialize navigate

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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

  // Fetch category items based on categoryType and categoryName
  useEffect(() => {
    const fetchCategoryItems = async () => {
      setLoading(true);
      try {
        const categoryCollectionMap = {
          mario: 'Marioitems',
          store: 'Storeitems',
          aminety: 'Aminetyitems',
        };

        if (!categoryCollectionMap[categoryType]) {
          console.error('Invalid category type:', categoryType);
          return;
        }

        const itemsRef = collection(db, categoryCollectionMap[categoryType]);
        const q = query(itemsRef, where('category', '==', categoryName));
        const querySnapshot = await getDocs(q);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCategoryItems(items);

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
        console.error('Error fetching category items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryItems();
  }, [categoryType, categoryName, user]);

  // Fetch categories for the sidebar based on the categoryType
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryCollectionMap = {
          mario: 'Mariocategories',
          store: 'Storecategories',
          aminety: 'Aminetycategories',
        };

        if (!categoryCollectionMap[categoryType]) {
          console.error('Invalid category type:', categoryType);
          return;
        }

        const categoryRef = collection(db, categoryCollectionMap[categoryType]);
        const categorySnapshot = await getDocs(categoryRef);

        const categoriesData = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Ensure categoryName exists in the list
        if (!categoriesData.some((category) => category.name === categoryName)) {
          categoriesData.push({ name: categoryName });
        }

        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [categoryType, categoryName]);

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

  const handleBuyNow = async (item) => {
    if (user) {
      const itemWithQuantity = { ...item, quantity: 1 }; // Explicitly set quantity to 1
      navigate('/checkout', {
        state: { items: [itemWithQuantity] }, // Pass the updated item to CheckoutPage
      });
      console.log(itemWithQuantity);
    }
  };

  

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className="category-sidebar">
        <h3>Other Categories</h3>
        <ul>
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category.id || category.name}>
                <a
                  href={`/category/${categoryType}/${category.name}`}
                  className={category.name === categoryName ? 'active' : ''}
                >
                  {category.name}
                </a>
              </li>
            ))
          ) : (
            <p>No categories available</p>
          )}
        </ul>
      </div>

      <div className="category-items-content">
  <h2>Items in {categoryName} Category</h2>
  <div className="items-container">
  {categoryItems.length > 0 ? (
  categoryItems.map((item) => (
    <div key={item.id} className="item-card">
      <img
        src={item.image}
        alt={item.name}
        className="item-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/150';
        }}
      />
      <h3>{item.name}</h3>
      <p>Price: Rs.{item.price}</p>
      <p>Quantity Available: {item.quantity}</p>

      {/* Check the quantity of the item */}
      {item.quantity === 0 ? (
        <button disabled>Currently Not Available</button>
      ) : user ? (
        // If the user is logged in, display Add to Cart or Item Added, Buy Now buttons
        <>
          {addedItems.has(item.id) ? (
            <>
              <button disabled>Item Added</button>
              <button onClick={() => handleBuyNow(item)}>Buy Now</button>
            </>
          ) : (
            <>
              <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
              <button onClick={() => handleBuyNow(item)}>Buy Now</button>
            </>
          )}
        </>
      ) : (
        // If the user is not logged in, show Login buttons
        <button disabled>Login</button>
      )}
    </div>
  ))
) : (
  <p>No items found in this category</p>
)}

  </div>
</div>

    </div>
  );
};

export default CategoryItemsPage;
