import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import { StateProvider } from '../../Context/StateProvider'; // Adjust as needed
import reducer from '../../Context/Reducer'; // Adjust as needed
import { initialState } from '../../Context/InitialState';
import './index.css';
import Navbar from './Components/Navbar/Navbar';

const container = document.getElementById('root'); // Get the root element
const root = createRoot(container); // Create a root

root.render( // Render your application
  <StateProvider reducer={reducer} initialState={initialState}>
    <Router>
      <App />
      <Navbar />
    </Router>
  </StateProvider>
);