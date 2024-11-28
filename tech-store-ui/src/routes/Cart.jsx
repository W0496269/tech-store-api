import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cookies] = useCookies(['cart']);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (cookies.cart) {
      const productIds = cookies.cart.split(',');
      fetch(`${import.meta.env.VITE_APP_HOST}/products`)
        .then(response => response.json())
        .then(data => {
          const items = productIds.reduce((acc, id) => {
            const product = data.find(p => p.id === parseInt(id));
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
        });
    }
  }, [cookies.cart]);

  const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2>Shopping Cart</h2>
      <div>
        {cartItems.map(item => (
          <div key={item.id}>
            <img src={item.thumbnail} alt={item.name} />
            <h3>{item.name}</h3>
            <p>${item.price}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Total: ${item.price * item.quantity}</p>
          </div>
        ))}
      </div>
      <h3>Subtotal: ${subTotal}</h3>
      <Link to="/home">Continue shopping</Link>
      <Link to="/checkout">Complete purchase</Link>
    </div>
  );
}

export default Cart;
