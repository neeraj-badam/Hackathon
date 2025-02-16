import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // ✅ Uses localStorage

// Persist Config
const persistConfig = {
  key: "admin",
  storage,
};

// Initial State
const initialState = {
  admin: null,
  token: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminLogin: (state, action) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
    },
    adminLogout: (state) => {
      state.admin = null;
      state.token = null;

      // ✅ Remove only admin-related persist keys
      localStorage.removeItem("persist:admin");
      localStorage.removeItem("persist:root");
    },
  },
});

export const { adminLogin, adminLogout } = adminSlice.actions;
export default persistReducer(persistConfig, adminSlice.reducer);
