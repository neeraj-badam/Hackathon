import { useSelector, useDispatch } from "react-redux";
import { clearCart, applyCoupon } from "../redux/cartSlice";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe("pk_test_51QssF8Fz5J2atefwS53D47DeItlCRqaYpTfvk44usiDL1t5vD9yqBMkmX4SS5r7xKlm4YUIN3qaE5gz0PiIUscTx00glyoIWP2");

function Checkout() {
  const { items, total, discount, coupon } = useSelector((state) => state.cart);
  console.log( total );
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCouponApply = () => {
    dispatch(applyCoupon(couponCode));
  };

  const handlePayment = async () => {
    if (!user) {
      setErrorMessage("Please log in to proceed with payment.");
      return;
    }

    try {
      const stripe = await stripePromise;
      console.log( user );
      
      const res = await axios.post("http://localhost:8000/api/payment", { 
        items, 
        userId: user._id,
        userName: user.name,
        deliveryAddress: user.address,
        discount: discount
      });

      if (res.data.error) {
        setErrorMessage(res.data.error);
        return;
      }

      const result = await stripe.redirectToCheckout({ sessionId: res.data.sessionId });

      if (result.error) {
        setErrorMessage(result.error.message);
      }  else {
        dispatch(clearCart()); // Clear cart after successful payment
        navigate("/orders"); // Redirect to Orders page
      }
    } catch (error) {
      setErrorMessage("Payment failed. Please try again.");
      console.error("Payment Error:", error.message);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      {items.map((item) => (
        <p key={item._id}>
          {item.name} - ${item.price.toFixed(2)} x {item.quantity}
        </p>
      ))}
      
      <h3>Subtotal: ${total.toFixed(2)}</h3>
      <input
        type="text"
        placeholder="Enter Coupon Code"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
      />
      <button onClick={handleCouponApply}>Apply Coupon</button>
      
      {coupon && <h3>Discount ({coupon}): -${discount.toFixed(2)}</h3>}
      <h2>Total: ${(total - discount).toFixed(2)}</h2>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <button onClick={handlePayment}>Proceed to Payment</button>
      <button onClick={() => dispatch(clearCart())}>Clear Cart</button>
    </div>
  );
}

export default Checkout;
