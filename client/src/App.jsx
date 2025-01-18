import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./Components/Navbar/Navbar";
import Home from "./Components/HomePage/Home";
import Orders from "./Components/Navbar/Orders";
import Cart from "./Components/Navbar/Cart";
import { AnimatePresence } from "framer-motion";
import { useEffect } from 'react';
import { useStateValue } from '../../Context/StateProvider';
import { actionType } from '../../Context/Reducer';
import Category from './Components/Categories/Categories';
import CategoryItems from "./Components/Categories/CategoryItems";
import TopSale from "./Components/TopSale/TopSale";
import CheckoutPage from "./Components/Checkout/CheckoutPage";
import PaymentSuccessPage from "./Components/Checkout/PaymentSuccess";
import Footer from "./Components/Footer/Footer";

function App() {
  const [{ user }, dispatch] = useStateValue();

  // Check localStorage when the app initializes
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      // Parse the stored user and dispatch it to your global state
      dispatch({
        type: actionType.SET_USER,
        user: JSON.parse(storedUser),
      });
    }
  }, [dispatch]);
  

  return (
    <AnimatePresence mode="wait">
     
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/Category" element={<Category />} />
        <Route path="/category/:categoryType/:categoryName" element={<CategoryItems />} />
        <Route path="/topsale" element={<TopSale />} />   
        <Route path="/footer" element={<Footer />} /> 
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;



