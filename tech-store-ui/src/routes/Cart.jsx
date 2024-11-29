import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cookies] = useCookies(['cart']);
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cookies.cart) {
      try {
        const productIds = cookies.cart.split(',');
        fetch(`${import.meta.env.VITE_API_HOST}/products`)
          .then(response => response.json())
          .then(data => {
            const items = productIds.reduce((acc, id) => {
              const product = data.find(p => p.id === parseInt(id, 10));
              if (product) {
                const existingItem = acc.find(item => item.id === product.id);
                if (existingItem) {
                  existingItem.quantity++;
                } else {
                  acc.push({ ...product, quantity: 1 });
                }
              }
              return acc;
            }, []);
            setCartItems(items);
          })
          .catch(error => {
            console.error('Failed to load products:', error);
            setError('Failed to load products.');
          });
      } catch (error) {
        console.error('Invalid cart format:', error);
        setError('Invalid cart format.');
      }
    }
  }, [cookies.cart]);

  const subTotal = cartItems.reduce((sum, item) => sum + item.cost * item.quantity, 0).toFixed(2);

  return (
    <div>
      <h2>Shopping Cart</h2>
      {error && <p>{error}</p>}
      <div>
        {cartItems.length > 0 ? (
          cartItems.map(item => (
            <div key={item.id}>
              <img src={`${import.meta.env.VITE_API_HOST}/images/${item.thumbnail}`} alt={item.name} width={50} />
              <h3>{item.name}</h3>
              <p>${item.cost}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Total: ${(item.cost * item.quantity).toFixed(2)}</p>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
      <h3>Subtotal: ${subTotal}</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link to="/">Continue shopping</Link>
        <Link to="/checkout">Complete purchase</Link>
      </div>
    </div>
  );
};

export default Cart;
