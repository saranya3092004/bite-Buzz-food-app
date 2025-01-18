
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
    if (user) {
      const selectedData = cartItems.filter((item) => selectedItems[item.id]);

      if (selectedData.length > 0) {
        navigate("/checkout", {
          state: { items: selectedData },
        });
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

  const updateCartQuantity = async (itemDocId, cartQuantity) => {
    if (cartQuantity < 1) return;

    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const cartDocRef = doc(db, "userCarts", userId);

      try {
        const item = cartItems.find((item) => item.id === itemDocId);
        await updateDoc(cartDocRef, {
          [`items.${itemDocId}.cartQuantity`]: cartQuantity,
        });

        const updatedCart = cartItems.map((item) =>
          item.id === itemDocId
            ? { ...item, cartQuantity }
            : item
        );
        setCartItems(updatedCart);
        dispatch({ type: "SET_CART_ITEMS", cartItems: updatedCart }); // Dispatch updated cart state

        console.log(`Item ID: ${itemDocId} updated to Cart Quantity: ${cartQuantity}`);
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

  const toggleSelectItem = (itemId) => {
    setSelectedItems((prevSelectedItems) => ({
      ...prevSelectedItems,
      [itemId]: !prevSelectedItems[itemId], // Toggle the selection state
    }));
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

  const handleSelectAll = (isChecked) => {
    const newSelectedItems = {};
    cartItems.forEach((item) => {
      newSelectedItems[item.id] = isChecked; // Set all items as selected/unselected
    });
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
                checked={Object.values(selectedItems).every((v) => v === true)}
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
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, Math.max(1, item.cartQuantity - 1))
                      }
                    >
                      -
                    </button>
                    <span>{item.cartQuantity}</span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.cartQuantity + 1)
                      }
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
