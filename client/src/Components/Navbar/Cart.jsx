import React, { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useStateValue } from "../../../../Context/StateProvider"; // Import the state provider
import "./Cart.css"; // Import CSS for styling
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const db = getFirestore();
  const auth = getAuth();
  const [{ cartItems: globalCartItems }, dispatch] = useStateValue(); // Use global cart items and dispatch from state
  const navigate = useNavigate();
  const [{ user }] = useStateValue();

  const handleCheckout = async () => {
    console.log("Checkout initiated");
    if (user) {
      // Filter the cartItems based on selected items
      const selectedData = cartItems.filter((item) => selectedItems[item.id]);

      console.log("Selected items for checkout:", selectedData);

      // Check if any items are selected for checkout
      if (selectedData.length > 0) {
        try {
          // Fetch the latest cart data from Firebase for the selected items
          const updatedSelectedData = await Promise.all(
            selectedData.map(async (item) => {
              const itemDocRef = doc(db, "userCarts", user.uid);
              const itemDoc = await getDoc(itemDocRef);

              if (itemDoc.exists()) {
                const itemData = itemDoc.data().items[item.id] || {};
                const updatedCartQuantity = itemData.cartQuantity || 1; // Get the latest cartQuantity from Firebase
                console.log("Updated cart quantity for item:", itemData);
                return {
                  ...item,
                  cartQuantity: updatedCartQuantity,
                  totalPrice: item.price * updatedCartQuantity, // Recalculate total price
                };
              } else {
                // If the item does not exist in Firebase, return the item as is
                console.log("Item not found in Firebase:", item);
                return item;
              }
            })
          );

          console.log("Updated selected items with details:", updatedSelectedData);

          // Pass the updated data to the CheckoutPage
          navigate("/checkout", {
            state: { items: updatedSelectedData }, // Send updated items with cartQuantity
          });
        } catch (error) {
          console.error("Error fetching cart data for checkout:", error);
        }
      } else {
        console.log("No items selected for checkout");
      }
    } else {
      console.log("User is not logged in!");
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      setError(null);

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          try {
            const cartDocRef = doc(db, "userCarts", userId);
            const cartDoc = await getDoc(cartDocRef);

            if (cartDoc.exists()) {
              const cartData = cartDoc.data().items || {};
              const items = Object.entries(cartData).map(
                ([itemId, itemData]) => ({
                  ...itemData,
                  id: itemId,
                  price: parseFloat(itemData.price) || 0,
                  cartQuantity: itemData.cartQuantity || 1, // Initialize cartQuantity if not present
                })
              );
              setCartItems(items);
              dispatch({ type: "SET_CART_ITEMS", cartItems: items }); // Set global cart state
            } else {
              setCartItems([]);
              dispatch({ type: "SET_CART_ITEMS", cartItems: [] }); // Clear global cart state if empty
            }
          } catch (error) {
            setError("Failed to load cart items.");
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
          setCartItems([]);
          dispatch({ type: "SET_CART_ITEMS", cartItems: [] }); // Clear global cart state when user is not authenticated
        }
      });
    };

    fetchCartItems();
  }, [dispatch]);


const decrementCartQuantity = async (itemDocId, currentQuantity) => {
  const newQuantity = Math.max(1, currentQuantity - 1); // Ensure quantity does not go below 1

  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const cartDocRef = doc(db, "userCarts", userId);

    const collections = ["Aminetyitems", "Marioitems", "Storeitems"];
    let originalItem = null;

    try {
      // Search for the item in all collections
      for (const collectionName of collections) {
        const originalItemDocRef = doc(db, collectionName, itemDocId);
        const originalItemSnapshot = await getDoc(originalItemDocRef);

        if (originalItemSnapshot.exists()) {
          originalItem = { ...originalItemSnapshot.data(), collectionName };
          break;
        }
      }

      if (!originalItem) {
        console.warn(`Item with ID ${itemDocId} not found in any collection.`);
        return;
      }

      // Update Firestore and local state
      await updateDoc(cartDocRef, {
        [`items.${itemDocId}.cartQuantity`]: newQuantity,
      });

      // Update local cart items
      const updatedCart = cartItems.map((item) =>
        item.id === itemDocId ? { ...item, cartQuantity: newQuantity } : item
      );
      setCartItems(updatedCart);
      dispatch({ type: "SET_CART_ITEMS", cartItems: updatedCart });

      console.log(`Item ID: ${itemDocId} updated to Cart Quantity: ${newQuantity}`);
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  }
};


const incrementCartQuantity = async (itemDocId, currentQuantity) => {
  const newQuantity = currentQuantity + 1;

  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const cartDocRef = doc(db, "userCarts", userId);

    const collections = ["Aminetyitems", "Marioitems", "Storeitems"];
    let originalItem = null;

    try {
      // Search for the item in all collections
      for (const collectionName of collections) {
        const originalItemDocRef = doc(db, collectionName, itemDocId);
        const originalItemSnapshot = await getDoc(originalItemDocRef);

        if (originalItemSnapshot.exists()) {
          originalItem = { ...originalItemSnapshot.data(), collectionName };
          break;
        }
      }

      if (!originalItem) {
        console.warn(`Item with ID ${itemDocId} not found in any collection.`);
        return;
      }

      const availableQuantity = parseInt(originalItem.quantity, 10);

      // Check if the new quantity exceeds available stock
      if (newQuantity > availableQuantity) {
        alert(`Insufficient quantity! Only ${availableQuantity} items available in stock.`);
        return;
      }

      // Update Firestore and local state
      await updateDoc(cartDocRef, {
        [`items.${itemDocId}.cartQuantity`]: newQuantity,
      });

      // Update local cart items
      const updatedCart = cartItems.map((item) =>
        item.id === itemDocId ? { ...item, cartQuantity: newQuantity } : item
      );
      setCartItems(updatedCart);
      dispatch({ type: "SET_CART_ITEMS", cartItems: updatedCart });

      console.log(`Item ID: ${itemDocId} updated to Cart Quantity: ${newQuantity}`);
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  }
};






  const removeItem = async (itemDocId) => {
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const cartDocRef = doc(db, "userCarts", userId);

      try {
        await updateDoc(cartDocRef, {
          [`items.${itemDocId}`]: deleteField(),
        });

        const updatedCart = cartItems.filter((item) => item.id !== itemDocId);
        setCartItems(updatedCart);
        dispatch({ type: "SET_CART_ITEMS", cartItems: updatedCart }); // Dispatch updated cart state

        console.log(`Item ID: ${itemDocId} removed from cart.`);
      } catch (error) {
        console.error("Error removing item:", error);
      }
    }
  };

  const toggleSelectItem = async (itemId) => {
    const collections = ["Aminetyitems", "Marioitems", "Storeitems"];
    let originalItem = null;
  
    try {
      // Search for the item in all collections
      for (const collectionName of collections) {
        const originalItemDocRef = doc(db, collectionName, itemId);
        const originalItemSnapshot = await getDoc(originalItemDocRef);
  
        if (originalItemSnapshot.exists()) {
          originalItem = { ...originalItemSnapshot.data(), collectionName };
          break;
        }
      }
  
      if (!originalItem) {
        console.warn(`Item with ID ${itemId} not found in any collection.`);
        return;
      }
  
      const availableQuantity = parseInt(originalItem.quantity, 10);
      const cartItem = cartItems.find((item) => item.id === itemId);
  
      if (!cartItem) {
        console.warn(`Item with ID ${itemId} not found in cart.`);
        return;
      }
  
      if (cartItem.cartQuantity > availableQuantity) {
        alert(
          `Insufficient quantity for "${cartItem.name}"! Only ${availableQuantity} items are available in stock.`
        );
        return;
      }
  
      // Toggle the selection state if quantity is valid
      setSelectedItems((prevSelectedItems) => ({
        ...prevSelectedItems,
        [itemId]: !prevSelectedItems[itemId],
      }));
    } catch (error) {
      console.error("Error toggling item selection:", error);
    }
  };
  

  const getSelectedSummary = () => {
    const selected = cartItems.filter((item) => selectedItems[item.id]);
    const totalItems = selected.reduce((acc, item) => acc + item.cartQuantity, 0);
    const totalPrice = selected.reduce(
      (acc, item) => acc + item.price * item.cartQuantity,
      0
    );
    return { totalItems, totalPrice };
  };

  const handleSelectAll = async (isChecked) => {
    const newSelectedItems = {};
  
    for (const item of cartItems) {
      const collections = ["Aminetyitems", "Marioitems", "Storeitems"];
      let originalItem = null;
  
      for (const collectionName of collections) {
        const originalItemDocRef = doc(db, collectionName, item.id);
        const originalItemSnapshot = await getDoc(originalItemDocRef);
  
        if (originalItemSnapshot.exists()) {
          originalItem = { ...originalItemSnapshot.data(), collectionName };
          break;
        }
      }
  
      if (originalItem) {
        const availableQuantity = parseInt(originalItem.quantity, 10);
  
        if (item.cartQuantity <= availableQuantity) {
          newSelectedItems[item.id] = isChecked; // Only select valid items
        } else if (isChecked) {
          alert(
            `Item "${item.name}" cannot be selected. Only ${availableQuantity} items are available in stock.`
          );
        }
      }
    }
  
    setSelectedItems(newSelectedItems);
  };
  

  if (loading) return <div className="cart-loading">Loading cart...</div>;
  if (error) return <div className="cart-error">{error}</div>;

  const { totalItems, totalPrice } = getSelectedSummary();

  return (
    <div className="cart-container1">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">Your cart is empty.</div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-header">
            <input
  type="checkbox"
  onChange={(e) => handleSelectAll(e.target.checked)}
  checked={cartItems.every((item) => selectedItems[item.id])}
/>

              <span>Select All</span>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <input
  type="checkbox"
  checked={selectedItems[item.id] || false}
  onChange={() => toggleSelectItem(item.id)}
/>

                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h2>{item.name}</h2>
                  <p>Price: Rs.{item.price.toFixed(2)}</p>
                  
                  <div className="cart-item-actions">
  {/* Decrement Button */}
  <button
    onClick={() => decrementCartQuantity(item.id, item.cartQuantity)}
  >
    -
  </button>

  <span>{item.cartQuantity}</span>

  {/* Increment Button */}
  <button
    onClick={() => incrementCartQuantity(item.id, item.cartQuantity)}
  >
    +
  </button>
</div>


                  <p>Total: Rs.{(item.price * item.cartQuantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Summary</h2>
            <p>Total Items: {totalItems}</p>
            <p>Total Price: Rs.{totalPrice.toFixed(2)}</p>
            <button className="checkout-button" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
