import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setCategories } from "../redux/productSlice";
import { addToCart, increaseQuantity, decreaseQuantity } from "../redux/cartSlice";
import { Plus, Trash2 } from "lucide-react"; // ✅ Import Trash & Plus Icons
import axios from "axios";

function Home() {
  const dispatch = useDispatch();
  const { products, status, error, categories } = useSelector((state) => state.products);
  const cartItems = useSelector((state) => state.cart.items); // ✅ Get cart items from Redux
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [likes, setLikes] = useState({}); // ✅ Store likes locally

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts()).then(() => dispatch(setCategories()));
    }
  }, [status, dispatch]);

  const handleLike = async (productId) => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/products/like/${productId}`);
      setLikes((prevLikes) => ({
        ...prevLikes,
        [productId]: res.data.likes,
      }));
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find((item) => item._id === productId);
    return item ? item.quantity : 0;
  };

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
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Products</h1>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <div>
          <label className="block text-sm">Price: ${priceRange[0]} - ${priceRange[1]}</label>
          <input
            type="range"
            min="0"
            max="50"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const quantity = getCartQuantity(product._id);

          return (
            <div key={product._id} className="border rounded-lg p-4 shadow-md flex flex-col items-center text-center">
              <img
                src={product.image || "https://via.placeholder.com/150"}
                alt={product.name}
                className="w-40 h-40 object-cover mb-3"
              />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{product.description}</p>
              <p className="text-gray-800 font-semibold">${product.price.toFixed(2)}</p>
              
              {/* ✅ Like Button */}
              <button
                onClick={() => handleLike(product._id)}
                className="text-yellow-500 cursor-pointer flex items-center gap-2 mt-2"
              >
                👍 {likes[product._id] !== undefined ? likes[product._id] : product.likes} 
                ({product.likePercentage}%)
              </button>

              {/* ✅ Quantity Controls with Trash (-) & Plus (+) Buttons */}
              {quantity > 0 ? (
                <div className="flex items-center mt-2">
                  {/* 🗑️ Trash Icon should decrease quantity and remove item at 0 */}
                  <button 
                    className="px-3 py-1 bg-red-500 text-white rounded" 
                    onClick={() => dispatch(decreaseQuantity(product._id))}
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* 🛒 Show quantity only if greater than 0 */}
                  {quantity > 0 && <span className="px-3">{quantity}</span>}

                  <button 
                    className="px-3 py-1 bg-gray-300 rounded" 
                    onClick={() => dispatch(increaseQuantity(product._id))}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button className="mt-2 px-4 py-2 bg-gray-300 text-black rounded" onClick={() => dispatch(addToCart(product))}>
                  <Plus size={16} /> Add to Cart
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
