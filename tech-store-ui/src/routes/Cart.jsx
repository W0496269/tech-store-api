import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cookies] = useCookies(['cart']);
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cookies.cart) return;

    const productIds = cookies.cart.split(','); // Split the comma-delimited list into an array of IDs

    if (productIds.length === 0) return;

    fetch(`${import.meta.env.VITE_API_HOST}/products?ids=${productIds.join(',')}`)
      .then(response => response.json())
      .then(products => {
        // Create an object to store product data along with its count (quantity)
        const productMap = {};
        productIds.forEach(id => {
          if (!productMap[id]) {
            productMap[id] = 0;
          }
          productMap[id]++;
        });

        // Combine the product details and quantities
        const updatedCart = products.map(product => ({
          ...product,
          quantity: productMap[product.id],
        }));

        setCartItems(updatedCart);
      })
      .catch(error => {
        console.error('Failed to load products:', error);
        setError('Failed to load products.');
      });
  }, [cookies.cart]);

  const subTotal = cartItems.reduce((sum, item) => sum + item.cost * item.quantity, 0).toFixed(2);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Shopping Cart</h2>
      {error && <p>{error}</p>}
      {cartItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cartItems.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                border: '1px solid #ddd',
                padding: '10px',
                borderRadius: '8px',
              }}
            >
              <img
                src={`${import.meta.env.VITE_API_HOST}/images/${item.image_filename}`}
                alt={item.name}
                style={{ width: '80px', height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: '1' }}>
                <h3>{item.name}</h3>
                <p>${item.cost.toFixed(2)}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Total: ${(item.cost * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
          <h3 style={{ marginTop: '20px' }}>Subtotal: ${subTotal}</h3>
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <Link
          to="/"
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            borderRadius: '5px',
          }}
        >
          Continue shopping
        </Link>
        <Link
          to="/checkout"
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF6347',
            color: '#fff',
            borderRadius: '5px',
          }}
        >
          Complete purchase
        </Link>
      </div>
    </div>
  );
};

export default Cart;
