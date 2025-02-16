import { useSelector, useDispatch } from "react-redux";
import { clearCart, applyCoupon, increaseQuantity, decreaseQuantity } from "../redux/cartSlice"; 
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Trash2, ArrowLeft } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

// ✅ Load Stripe Public Key
const stripePromise = loadStripe("pk_test_51QsreKE6VDYBbjs5Rnftal44mgvQYje5VYqfGir6McT8cAZA3Bux4TV0h8TIcsVdWj15MFJ66FrqdNW0i03jiazK00Piqa9rJE");

// ✅ Payment Form Component
function CheckoutForm({ total, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");

  // Fetch Payment Intent from Backend
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/payment", {
          amount: total,
        });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };
    createPaymentIntent();
  }, [total]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        console.error("Payment Error:", error);
      } else if (paymentIntent.status === "succeeded") {
        onSuccess();
      }
    } catch (err) {
      console.error("Payment Error:", err);
    }
  };

  return (
    <form onSubmit={handlePayment} className="mt-4">
      <CardElement className="p-3 border rounded" />
      <button
        type="submit"
        disabled={!stripe || !clientSecret}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded w-full"
      >
        Pay ${total.toFixed(2)}
      </button>
    </form>
  );
}

// ✅ Checkout Page Component
function Checkout() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const handleApplyCoupon = () => {
    dispatch(applyCoupon(couponCode));
  };

  const handleOrderSuccess = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/orders", {
        userId: "12345", // Replace with actual logged-in user ID
        items: cart.items,
        total: cart.total - cart.discount,
        status: "Processing",
      });

      if (response.status === 201) {
        dispatch(clearCart());
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error creating order", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>

      {/* Back to Home Button */}
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded mb-4"
        onClick={() => navigate("/home")}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.items.map((item) => (
            <div key={item._id} className="border p-4 mb-4 rounded flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p>${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center">
                <button 
                  className="px-3 py-1 bg-red-500 text-white rounded" 
                  onClick={() => dispatch(decreaseQuantity(item._id))}
                >
                  <Trash2 size={16} />
                </button>
                <span className="px-3">{item.quantity}</span>
                <button 
                  className="px-3 py-1 bg-gray-300 rounded" 
                  onClick={() => dispatch(increaseQuantity(item._id))}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {/* Apply Coupon */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Apply Coupon:</h3>
            <input 
              type="text" 
              placeholder="Enter Coupon Code" 
              value={couponCode} 
              onChange={(e) => setCouponCode(e.target.value)} 
              className="p-2 border rounded w-full mt-2"
            />
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
              onClick={handleApplyCoupon}
            >
              Apply Coupon
            </button>

            {cart.coupon && (
              <p className="text-green-600 mt-2">Applied Coupon: {cart.coupon} (Discount: ${cart.discount.toFixed(2)})</p>
            )}
          </div>

          {/* Proceed to Payment Button */}
          {!showPayment ? (
            <button 
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded w-full"
              onClick={() => setShowPayment(true)}
            >
              Proceed to Payment
            </button>
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm total={cart.total - cart.discount} onSuccess={handleOrderSuccess} />
            </Elements>
          )}

          {/* Clear Cart */}
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded mt-4 w-full"
            onClick={() => dispatch(clearCart())}
          >
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
}

export default Checkout;
