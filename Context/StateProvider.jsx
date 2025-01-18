// import React, { createContext, useContext, useReducer } from 'react';

// export const StateContext = createContext();

// export const StateProvider = ({ reducer, initialState, children }) => (
//   <StateContext.Provider value={useReducer(reducer, initialState)}>
//     {children}
//   </StateContext.Provider>
// );

// export const useStateValue = () => useContext(StateContext);







import React, { createContext, useContext, useReducer, useEffect } from "react";

export const StateContext = createContext();

export const StateProvider = ({ reducer, initialState, children }) => {
  // Load cart items from localStorage
  const localStorageCart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const persistedState = { ...initialState, cartItems: localStorageCart };

  const [state, dispatch] = useReducer(reducer, persistedState);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  return (
    <StateContext.Provider value={[state, dispatch]}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateValue = () => useContext(StateContext);
