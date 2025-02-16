import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // ✅ Uses localStorage

// ✅ Persist Config for Driver
const persistConfig = {
  key: "driver",
  storage
};

// ✅ Initial State
const initialState = {
  driver: null,
  token: null,
};

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    driverLogin: (state, action) => {
      state.driver = action.payload.driver;
      state.token = action.payload.token;
    },
    driverLogout: (state) => {
      state.driver = null;
      state.token = null;

      // ✅ Clear only driver-related persisted data
      localStorage.removeItem("persist:driver");
      localStorage.removeItem('persist:root');

    },
  },
});

export const { driverLogin, driverLogout } = driverSlice.actions;
export default persistReducer(persistConfig, driverSlice.reducer);
