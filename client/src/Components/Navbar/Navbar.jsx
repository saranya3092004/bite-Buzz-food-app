import React, { useState, useEffect, useRef } from "react";
import { FaShoppingCart, FaUserAlt } from "react-icons/fa";
import { RxDividerVertical } from "react-icons/rx";
import { MdLogout } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { IoMdClose } from 'react-icons/io'; 
import { Link } from "react-router-dom";
import "./Navbar.css";
import Logo from "../../assets/Logo.png";
import { motion } from "framer-motion";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app,db } from "../../firebase.config";
import { useStateValue } from "../../../../Context/StateProvider";
import { actionType } from "../../../../Context/Reducer";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import Fuse from "fuse.js";


const Navbar = () => {
  const firebaseAuth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const [{ user }, dispatch] = useStateValue();
  const [imgError, setImgError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const [{ cartItems }] = useStateValue();
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  
 
 
  const adminEmail = import.meta.env.VITE_REACT_APP_ADMIN_EMAIL_1?.toLowerCase() || "";

  const login = async () => {
    if (user) {
      setDropdownOpen(prev => !prev);
    } else {
      try {
        const result = await signInWithPopup(firebaseAuth, provider);
        const user = result.user;
  
        if (user) {
          const normalizedUser = user.providerData[0]; 
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          dispatch({ type: actionType.SET_USER, user: normalizedUser });
          setDropdownOpen(false);
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch({ type: actionType.SET_USER, user: null });
    setDropdownOpen(false);
    firebaseAuth.signOut(); // Sign out from Firebase
    window.location.href = '/'; // Redirect after logout
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
  const fetchItemsAndCategories = async () => {
    try {
      let allFetchedItems = [];
      let fetchedCategories = new Set();

      // Fetch Mario items
      const marioSnapshot = await getDocs(collection(db, "Marioitems"));
      const marioItems = marioSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        source: "mario",
      }));
      allFetchedItems.push(...marioItems);
      marioItems.forEach(item => fetchedCategories.add(item.category));

      // Fetch Aminety items
      const amenitySnapshot = await getDocs(collection(db, "Aminetyitems"));
      const aminetyItems = amenitySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        source: "aminety",
      }));
      allFetchedItems.push(...aminetyItems);
      aminetyItems.forEach(item => fetchedCategories.add(item.category));

      // Fetch Store items
      const storeSnapshot = await getDocs(collection(db, "Storeitems"));
      const storeItems = storeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        source: "store",
      }));
      allFetchedItems.push(...storeItems);
      storeItems.forEach(item => fetchedCategories.add(item.category));

      setAllItems(allFetchedItems);
      setCategories([...fetchedCategories]); // Convert Set to Array
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  fetchItemsAndCategories();
}, []);

const handleSearch = () => {
  console.log("Search Term:", searchTerm);
  console.log("All Items:", allItems);

  // Normalize the search term
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const searchKeywords = normalizedSearchTerm.split(/\s+/);
  console.log("Search Keywords:", searchKeywords);

  // Fuse.js options for fuzzy matching
  const fuse = new Fuse(allItems, {
    includeScore: true,
    threshold: 0.4, // Slightly relaxed threshold
    distance: 100, // Adjust distance for close matches
    keys: ["name", "category"], // Match both name and category
  });

  // Search using the full input as well as individual keywords
  const results = [
    ...fuse.search(normalizedSearchTerm),
    ...searchKeywords.flatMap(keyword => fuse.search(keyword)),
  ];

  // Combine and deduplicate results
  const combinedResults = Array.from(new Map(results.map(res => [res.item.id, res])).values());
  console.log("Combined Results:", combinedResults);

  // Sort results by score (lower score is better)
  combinedResults.sort((a, b) => a.score - b.score);

  if (combinedResults.length > 0) {
    const matchedItem = combinedResults[0].item; // Best match
    console.log("Matched Item:", matchedItem);

    // Construct the navigation URL
    const formattedCategory = matchedItem.category.charAt(0).toUpperCase() + matchedItem.category.slice(1);
    navigate(`/category/${matchedItem.source}/${encodeURIComponent(formattedCategory)}`);
  } else {
    alert("No matching items found.");
  }
};

  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={Logo} alt="Logo" className="logo-image" />
        </Link>
      </div>
  
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="icon-divider"><RxDividerVertical/></div>
        <button type="submit" className="search-icon" onClick={handleSearch}>
          <FiSearch />
        </button>
        
        {searchTerm && (
          <button className="clear-icon" onClick={() => setSearchTerm('')}>
            <IoMdClose />
          </button>
        )}
      </div>
  
      <div className="navbar-icons">
      <motion.div whileTap={{ scale: 0.6 }}>
        <Link to="/" className="nav">Home</Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.6 }}>
        <Link to="/orders" className="nav">Orders</Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.6 }}>
          <Link to="/cart" className="nav-icon cart-container">
            <FaShoppingCart />
            <span className="cart-badge">{cartItems?.length || 0}</span> {/* Dynamic cart badge */}
          </Link>
        </motion.div>
      </div>

      <div className="profile-icon" onClick={() => setDropdownOpen(prev => !prev)}>
        <motion.div whileTap={{ scale: 0.6 }}>
          {user ? (
            imgError || !user.photoURL ? (
              <span className="user-initial">
                {user.displayName ? user.displayName.charAt(0) : "U"}
              </span>
            ) : (
              <img
                src={user.photoURL}
                alt="User Avatar"
                className="user-avatar"
                onError={() => setImgError(true)}
              />
            )
          ) : (
            <FaUserAlt />
          )}
        </motion.div>
      </div>

      {dropdownOpen && (
        <div className="dropdown-menu" ref={dropdownRef}>
          {!user ? (
            <div className="dropdown-item" onClick={login}>
              <i className="fa fa-user" /> Login / Sign Up
            </div>
          ) : (
            <>
              {user?.email && adminEmail.includes(user.email.toLowerCase()) && (
  <a
    href="http://localhost:5173/" // Link to your admin page
    className="dropdown-item"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i className="fa fa-cog" /> Admin
  </a>
)}
              <div onClick={handleLogout} className="dropdown-item logout">
                <i className="sign-out" /> Logout &nbsp;<MdLogout />
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
