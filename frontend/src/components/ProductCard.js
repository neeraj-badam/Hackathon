import { useDispatch, useSelector } from "react-redux";
import { addToCart, increaseQuantity, decreaseQuantity, removeFromCart } from "../redux/cartSlice";
import { useState, useEffect } from "react";
import axios from "axios";


function ProductCard({ product }) {
  const dispatch = useDispatch();
  const cartItem = useSelector((state) => state.cart.items.find((item) => item._id === product._id));
  const [rating, setRating] = useState(product.averageRating || 0);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [reviewText, setReviewText] = useState("");

  // ✅ Fetch reviews from the backend when the component mounts
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/products/${product._id}/reviews`);
      setReviews(response.data.product.reviews);
    } catch (error) {
      console.error("❌ Error fetching reviews:", error);
    }
  };

  // ✅ Open & Close Product Modal
  const openProductModal = async () => {
    await fetchReviews(); // Fetch latest reviews when modal opens
    setShowModal(true);
  };
  const closeProductModal = () => setShowModal(false);

  // ✅ Open & Close Review Modal
  const openReviewModal = () => setShowReviewModal(true);
  const closeReviewModal = () => {
    setShowReviewModal(false);
    setUserRating(null);
    setReviewText("");
  };

  // ✅ Submit Review and Auto Refresh Reviews
  const handleSubmitReview = async () => {
    if (!userRating || !reviewText.trim()) {
      alert("Please provide a rating and a review.");
      return;
    }

    try {
      await axios.post(`http://localhost:8000/api/products/${product._id}/review`, {
        rating: userRating,
        review: reviewText,
      });

      // ✅ Refresh product reviews from backend
      fetchReviews();
      closeReviewModal(); // ✅ Close modal after submission
      window.location.reload();
    } catch (error) {
      console.error("❌ Error submitting review:", error);
    }
  };

  return (
    <div style={styles.card} >
      {/* Clicking Image Opens Reviews Modal */}
      <img src={product.image} alt={product.name} style={styles.image} onClick={openProductModal} />

      <h3 style={styles.name}>{product.name}</h3>
      <p style={styles.price}>${product.price.toFixed(2)}</p>
      <p style={styles.description} title={product.description}>{product.description}</p>
      <p style={{ ...styles.stock, color: product.stock > 0 ? "green" : "red" }}>
        {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
      </p>

      <p>Avg Rating: {rating.toFixed(1)} </p>

      {/* Review Button */}
      <button style={styles.reviewButton} onClick={openReviewModal}>Rate & Review</button>

      {cartItem ? (
        <div style={styles.quantityContainer}>
          <button onClick={() => dispatch(decreaseQuantity(product._id))} style={styles.quantityButton}>-</button>
          <span style={styles.quantity}>{cartItem.quantity}</span>
          {
            (product.stock - 1) >= cartItem.quantity ?
            <button onClick={() => dispatch(increaseQuantity(product._id))} style={styles.quantityButton}>+</button>
            :
            <></>
          }
          <button onClick={() => dispatch(removeFromCart(product._id))} style={styles.trashButton}>🗑️</button>
        </div>
      ) : (
        <button
        onClick={() => dispatch(addToCart(product))}
        style={{
          ...styles.button,
          width: "100%",
          backgroundColor: product.stock === 0 ? "#ccc" : "#27ae60", // Gray if disabled
          color: product.stock === 0 ? "#666" : "white", // Dimmed text for disabled
          cursor: product.stock === 0 ? "not-allowed" : "pointer", // Prevents click if disabled
          opacity: product.stock === 0 ? 0.6 : 1, // Make disabled button less prominent
        }}
        disabled={product.stock === 0}
      >
        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
      </button>
      
      )}

      {/* 🛑 Modal for Rating & Review */}
      {showReviewModal && (
        <div style={styles.modalOverlay(false)} onClick={closeReviewModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Rate & Review</h3>
            <div style={styles.rating}>
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  onClick={() => setUserRating(index + 1)}
                  style={{
                    cursor: "pointer",
                    color: index < userRating ? "#f39c12" : "#ccc",
                    fontSize: "25px",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Write your review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={styles.textarea}
            />
            <button style={styles.submitButton} onClick={handleSubmitReview}>Submit</button>
            <button style={styles.closeButton} onClick={closeReviewModal}>Close</button>
          </div>
        </div>
      )}

      {/* 📜 Modal for Viewing Reviews */}
      {showModal &&  (
        <div style={styles.modalOverlay(true)} onClick={closeProductModal}>
          <div style={styles.reviewModalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{product.name} - Reviews</h3>
            <div style={styles.reviewContainer}>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} style={styles.reviewBox}>
                    <p style={{ fontSize: "16px", fontWeight: "bold", color: "white"}}>⭐ {review.rating} / 5</p>
                    <p>{review.comment}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
            <button style={styles.closeButton} onClick={closeProductModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 🔧 Improved Modal Layout & Quantity Button Alignment
const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    margin: "10px",
    textAlign: "center",
    width: "270px",
    height: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  modalOverlay: (enter) => ({
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)", // ✅ Center the modal
    width: "50%",
    height: "50%",
    background: !enter ? 'rgb(209, 235, 217)': 'transparent', 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    boxShadow: !enter ? "0px 4px 6px rgba(0, 0, 0, 0.3)": '', // ✅ Adds depth effect
    borderRadius: "10px",
    padding: "20px",
  }),
  reviewModalContent: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "50%",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  quantityContainer: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  quantityButton: {
    padding: "8px",
    background: "#27ae60",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  trashButton: {
    padding: "8px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
};

export default ProductCard;
