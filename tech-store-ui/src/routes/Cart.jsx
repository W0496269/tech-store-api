import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cookies] = useCookies(['cart']); // Get the cart cookie
  const [cartItems, setCartItems] = useState([]); // State to store cart items
  const [error, setError] = useState(null); // State to handle error messages

  // Fetch product details when the cart cookie changes
  useEffect(() => {
    if (!cookies.cart) return; // If no cart cookie, do nothing

    // Log cookies.cart to debug if cart has product IDs
    console.log("Cart Cookie:", cookies.cart);

    // Split the cart cookie string into an array of product IDs
    const productIds = cookies.cart.split(',');

    if (productIds.length === 0) return; // If no product IDs in the cart, do nothing

    // Fetch product details for the product IDs in the cart
    //https://www.w3schools.com/js/js_api_fetch.asp
    fetch(`${import.meta.env.VITE_API_HOST}/products?ids=${productIds.join(',')}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        return response.json();
      })
      .then(products => {
        // Log products to debug the response
        console.log('Fetched Products:', products);

        // If no products are found, return early
        if (!Array.isArray(products) || products.length === 0) {
          setError('No products found.');
          return;
        }

        // Create a map to store the quantity of each product
        const productMap = {};
        productIds.forEach(id => {
          if (!productMap[id]) {
            productMap[id] = 0;
          }
          productMap[id]++; // Count the number of occurrences of each product ID
        });

        // Map the product data to include quantity for each product
        const updatedCart = products.map(product => ({
          ...product,
          quantity: productMap[product.product_id], // Add the quantity for the product
        }));

        setCartItems(updatedCart); // Update the state with the fetched cart items
      })
      .catch(error => {
        setError('Failed to load products.');
        console.error('Error fetching products:', error);
      });
  }, [cookies.cart]); // Re-run when the cart cookie changes

  // Calculate the total price of all cart items (subtotal)
  const subTotal = cartItems.reduce((sum, item) => sum + item.cost * item.quantity, 0).toFixed(2);

  // Calculate the total cost for each product (price * quantity)
  const calculateItemTotal = (cost, quantity) => (cost * quantity).toFixed(2);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Shopping Cart</h2>

      {/* Display error message if there's an error */}
      {error && <p>{error}</p>}

      {/* If there are items in the cart, display them */}
      {cartItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Iterate over each cart item and display its details */}
          {cartItems.map(item => (
            <div
              key={item.product_id} // Ensure product_id is used for the unique key
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                border: '1px solid #ddd',
                padding: '10px',
                borderRadius: '8px',
              }}
            >
              {/* Display the product image */}
              <img
                src={`${import.meta.env.VITE_API_HOST}/images/${item.image_filename}`}
                alt={item.name}
                style={{ width: '80px', height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: '1' }}>
                {/* Display the product name, cost, quantity, and total cost */}
                <h3>{item.name}</h3>
                <p>${item.cost.toFixed(2)}</p>
                <p>Quantity: {item.quantity}</p>
                {/* Calculate and display the total cost for each item (price × quantity) */}
                <p>Total: ${calculateItemTotal(item.cost, item.quantity)}</p>
              </div>
            </div>
          ))}
          {/* Display the subtotal of all cart items */}
          <h3 style={{ marginTop: '20px' }}>Subtotal: ${subTotal}</h3>
        </div>
      ) : (
        <p>Your cart is empty.</p> // If no items in the cart, show this message
      )}

      {/* Display links for continuing shopping or completing the purchase */}
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
