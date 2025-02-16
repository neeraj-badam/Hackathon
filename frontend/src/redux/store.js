import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import userReducer from './userSlice';
import cartReducer from './cartSlice';
import productReducer from './productSlice';
import adminReducer from "./adminSlice";
import driverReducer from "./driverSlice";

// ✅ Combine Reducers
const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  products: productReducer,
  admin: adminReducer,
  driver: driverReducer,
});

// ✅ Configure Persisted Reducer
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "admin", "driver"], // ✅ Persist both user & admin states
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Configure Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ Fix Redux Persist issues
    }),
});

// ✅ Create Persistor
export const persistor = persistStore(store);
