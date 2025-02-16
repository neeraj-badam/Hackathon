import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../redux/cartSlice';

function Cart() {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  return (
    <div>
      <h2>Shopping Cart</h2>
      {items.length === 0 ? <p>Your cart is empty.</p> : (
        <>
          {items.map((item) => (
            <div key={item._id}>
              <p>{item.name} - ${item.price} x {item.quantity}</p>
              <button onClick={() => dispatch(removeFromCart(item._id))}>Remove</button>
            </div>
          ))}
          <h3>Total: ${total}</h3>
          <button onClick={() => dispatch(clearCart())}>Clear Cart</button>
        </>
      )}
    </div>
  );
}

export default Cart;
