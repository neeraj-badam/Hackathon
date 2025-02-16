import { createSlice } from "@reduxjs/toolkit";

// ✅ Load cart from localStorage if exists
const loadCartFromLocalStorage = () => {
  const storedCart = localStorage.getItem("cart");
  return storedCart ? JSON.parse(storedCart) : { items: [], total: 0, discount: 0, coupon: null };
};

const cartSlice = createSlice({
  name: "cart",
  initialState: loadCartFromLocalStorage(),
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.total += action.payload.price;
      localStorage.setItem("cart", JSON.stringify(state)); // ✅ Save cart to localStorage
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find(item => item._id === action.payload);
      if (item) {
        item.quantity += 1;
        state.total += item.price;
      }
      localStorage.setItem("cart", JSON.stringify(state)); // ✅ Save cart to localStorage
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find(item => item._id === action.payload);
      if (item && item.quantity >= 1) {
        item.quantity -= 1;
        state.total -= item.price;
        if (item.quantity === 0) {
          state.items = state.items.filter(item => item._id !== action.payload);
        }
      } else {
        state.items = state.items.filter(item => item._id !== action.payload);
      }
      state.total = Math.max(0, parseFloat(state.total.toFixed(2))); // ✅ Prevent negative total
      localStorage.setItem("cart", JSON.stringify(state));
    },

    removeFromCart: (state, action) => {
      const itemToRemove = state.items.find(item => item._id === action.payload);
      if (itemToRemove) {
        state.total -= itemToRemove.price * itemToRemove.quantity; // ✅ Adjust total correctly
      }
      state.items = state.items.filter(item => item._id !== action.payload);
      localStorage.setItem("cart", JSON.stringify(state)); // ✅ Save cart to localStorage
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0; // ✅ Explicitly reset total
      state.discount = 0;
      state.coupon = null;
      localStorage.removeItem("cart"); // ✅ Remove cart from localStorage
    },
    applyCoupon: (state, action) => {
      if (action.payload === "DISCOUNT10") {
        state.coupon = "DISCOUNT10";
        state.discount = state.total * 0.1;
      }
      localStorage.setItem("cart", JSON.stringify(state)); // ✅ Save cart to localStorage
    },
  },
});

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, applyCoupon } = cartSlice.actions;
export default cartSlice.reducer;
