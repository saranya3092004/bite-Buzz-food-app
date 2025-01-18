import React, { useState, useEffect, useRef } from 'react';
import Store from './Components/Store';
import Aminety from './Components/Aminety';
import Mario from './Components/Mario';
import { useStateValue } from '../../Context/StateProvider'; // Correct import for context
import './App.css'; // For styling

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('Store'); // Default section
  const [isMobile, setIsMobile] = useState(false); // To track if it's mobile view
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // For sidebar toggle in mobile
  const [{ user }, dispatch] = useStateValue(); // Accessing state and dispatch from context
  const sidebarRef = useRef(null); // Ref to track sidebar element

  // Function to handle screen resizing and check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set to true if window width is <= 768px
      if (window.innerWidth > 768) {
        setIsSidebarVisible(true); // Ensure sidebar is always visible on larger screens
      } else {
        setIsSidebarVisible(false); // Hide sidebar when screen is small
      }
    };

    handleResize(); // Check on component mount
    window.addEventListener('resize', handleResize); // Listen to window resize

    return () => window.removeEventListener('resize', handleResize); // Cleanup on unmount
  }, []);

  // Function to render the appropriate component based on the selected section
  const renderSection = () => {
    switch (activeSection) {
      case 'Store':
        return <Store />;
      case 'Aminety':
        return <Aminety />;
      case 'Mario':
        return <Mario />;
      default:
        return <Store />;
    }
  };



  const handleLogout = () => {
    // Clear user from localStorage
    localStorage.removeItem('user');

    // Dispatch action to set user to null
    dispatch({ type: 'SET_USER', user: null }); // Correct way to set user in context

    // Redirect to home page
    window.location.href = 'http://localhost:3000'; // Replace with actual home URL in production
  };

  const toggleSidebar = () => {
    setIsSidebarVisible((prevState) => {
      return !prevState; // Toggle the visibility
    });
  };

  const handleOptionClick = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setIsSidebarVisible(false); // Hide sidebar in mobile view after selecting an option
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
        {/* Show toggle button only in mobile view */}
        {isMobile && (
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarVisible ? '✖' : '☰'} {/* Change icon based on sidebar visibility */}
          </button>
        )}
      </header>

      <nav ref={sidebarRef} className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <ul>
          <li onClick={() => handleOptionClick('Store')}>Store</li>
          <li onClick={() => handleOptionClick('Aminety')}>Aminety</li>
          <li onClick={() => handleOptionClick('Mario')}>Mario</li>
        </ul>
      </nav>

      <div className="content">{renderSection()}</div>
    </div>
  );
};

export default AdminPage;
