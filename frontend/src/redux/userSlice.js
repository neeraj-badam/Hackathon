import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // ✅ Use localStorage as default

// Persist Config
const persistConfig = {
  key: "user",
  storage,
};

// Load saved user from Redux Persist
const initialState = {
  user: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      console.log(action.payload.user);
      state.user = action.payload.user;
      state.token = action.payload.token;  // ✅ Store token in Redux state

      // Save to localStorage (Handled by Redux Persist)
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      // ✅ Remove only user-related persist keys
      localStorage.removeItem('persist:root');
      localStorage.removeItem('persist:user');
      
    },
  },
});

export const { login, logout } = userSlice.actions;

// ✅ Export Persisted Reducer
export default persistReducer(persistConfig, userSlice.reducer);
