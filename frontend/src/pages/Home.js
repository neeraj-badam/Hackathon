import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setCategories } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";

function Home() {
  const dispatch = useDispatch();
  const { products, status, error, categories } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts()).then(() => dispatch(setCategories()));
    }
  }, [status, dispatch]);

  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "" || product.category === selectedCategory) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
    );
  });

  if (status === "loading") return <p>Loading products...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Products</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: "8px", marginBottom: "10px", width: "100%" }}
      />

      {/* Category Filter */}
<select 
  value={selectedCategory} 
  onChange={(e) => setSelectedCategory(e.target.value)} 
  style={{ padding: "8px", marginRight: "10px" }}
>
  <option value="">All Categories</option>

  {categories
    .filter((category) => category && category.trim() !== "") // ✅ Remove empty & null categories
    .map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
</select>


      {/* Price Range Filter */}
      <label>
        Price: ${priceRange[0]} - ${priceRange[1]}
        <input
          type="range"
          min="0"
          max="50"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, Number(e.target.value)])}
          style={{ marginLeft: "10px", width: '20%' }}
        />
      </label>

      {/* Display Products */}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default Home;
