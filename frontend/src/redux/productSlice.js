import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch products from API
export const fetchProducts = createAsyncThunk("http://localhost:8000/products/fetchProducts", async () => {
  const res = await axios.get("http://localhost:8000/api/products");
  return res.data;
});

const productSlice = createSlice({
  name: "products",
  initialState: { products: [], status: "idle", error: null, categories: [] },
  reducers: {
    setCategories: (state) => {
      // Extract unique categories from products
     
      state.categories = [...new Set(
        state.products
          .map((product) => product.category)
          .filter((category) => category !== "" && category !== null) // ✅ Filter out empty & null categories
      )];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setCategories } = productSlice.actions;
export default productSlice.reducer;
