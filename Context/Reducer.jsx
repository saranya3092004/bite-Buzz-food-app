// export const actionType = {
//   SET_USER: "SET_USER",
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case actionType.SET_USER:
//       return {
//         ...state,
//         user: action.user,
//       };
//     default:
//       console.warn(`Unknown action type: ${action.type}`);
//       return state;
//   }
// };

// export default reducer;




export const actionType = {
  SET_USER: "SET_USER",
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  SET_CART_ITEMS: "SET_CART_ITEMS", // For setting items after a refresh
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionType.SET_USER:
      return {
        ...state,
        user: action.user,
      };
    case actionType.ADD_TO_CART:
      return {
        ...state,
        cartItems: [...state.cartItems, action.item],
      };
    case actionType.REMOVE_FROM_CART:
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => item.id !== action.itemId),
      };
    case actionType.SET_CART_ITEMS:
      return {
        ...state,
        cartItems: action.cartItems,
      };
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
};

export default reducer;
