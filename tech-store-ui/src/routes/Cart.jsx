import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

// API base URL for fetching product details
const apiUrl = import.meta.env.VITE_API_HOST;

const Cart = () => {
  // State management for cookies, cart items, loading, and errors
  const [cookies, setCookie, removeCookie] = useCookies(['cart']);
  const [cartItems, setCartItems] = useState([]); // To store fetched cart items
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);      // Error state

  // Effect hook to fetch cart items whenever the cart changes
  useEffect(() => {
    async function fetchCartItems() {
      try {
        // Get product IDs from the cart cookie (comma separated values)
        const productIds = cookies.cart ? String(cookies.cart).split(',') : [];
        
        // If cart is empty, set cart items as an empty array and stop loading
        if (productIds.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        // Count the quantity of each product in the cart
        const productCount = {};
        productIds.forEach((id) => {
          productCount[id] = (productCount[id] || 0) + 1;
        });

        // Get unique product IDs to avoid redundant requests
        const uniqueProductIds = [...new Set(productIds)];
        const productsWithQuantities = [];

        // Fetch details for each product
        for (const id of uniqueProductIds) {
          const response = await fetch(`${apiUrl}/products/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch product details');
          }
          const product = await response.json();
          // Add the quantity information to each product
          productsWithQuantities.push({
            ...product,
            quantity: productCount[product.product_id],
          });
        }

        // Update the state with the fetched cart items
        setCartItems(productsWithQuantities);
      } catch (error) {
        // Log error and update the error state
        console.error('Error fetching cart items:', error);
        setError('Error fetching cart items. Please try again.');
      } finally {
        // Stop loading after the fetch operation completes
        setLoading(false);
      }
    }
    fetchCartItems();  // Call the function when the component mounts or when cart changes
  }, [cookies.cart]);

  // Function to update the cart (add or remove a product)
  const updateCart = (productId, increment) => {
    const currentCart = cookies.cart ? String(cookies.cart).split(',') : [];
    let updatedCart = [...currentCart];

    if (increment) {
      // Add the product to the cart if increment is true
      updatedCart.push(productId.toString());
    } else {
      // Remove the product from the cart if increment is false
      const index = updatedCart.indexOf(productId.toString());
      if (index > -1) {
        updatedCart.splice(index, 1);
      }
    }

    // If the cart is empty, remove the cart cookie; otherwise, update the cart cookie
    if (updatedCart.length === 0) {
      removeCookie('cart', { path: '/' });
    } else {
      setCookie('cart', updatedCart.join(','), { path: '/', maxAge: 3600000 });
    }
  };

  // Function to remove an item from the cart
  const removeItem = (productId) => {
    const currentCart = cookies.cart ? String(cookies.cart).split(',') : [];
    const updatedCart = currentCart.filter((id) => id !== productId.toString());

    // If the cart is empty, remove the cart cookie; otherwise, update the cart cookie
    if (updatedCart.length === 0) {
      removeCookie('cart', { path: '/' });
    } else {
      setCookie('cart', updatedCart.join(','), { path: '/', maxAge: 3600000 });
    }
  };

  // Function to calculate the subtotal of the cart (sum of all items' costs)
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.cost * item.quantity, 0);
  };

  // Function to calculate tax (15% of the subtotal)
  const calculateTax = (subtotal) => {
    return subtotal * 0.15;
  };

  // Function to calculate the total (subtotal + tax)
  const calculateTotal = (subtotal, tax) => {
    return subtotal + tax;
  };

  // Display loading message if cart is being fetched
  if (loading) return <p className="text-center">Loading your cart...</p>;

  // Display error message if there is an issue fetching cart items
  if (error) return <p className="text-danger text-center">{error}</p>;

  // Calculate subtotal, tax, and total after cart items have been fetched
  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);

  return (
    <div className="container my-5">
      <div className="bg-light p-4 rounded shadow-lg">
        <h1 className="text-center display-4 text-primary mb-4">Your Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <p className="text-center">
            Cart is empty. <Link to="/home">Start shopping!</Link>
          </p>
        ) : (
          <div>
            <div className="row">
              {cartItems.map((item) => (
                <div key={item.product_id} className="col-12 mb-4">
                  <div className="card shadow-sm">
                    <div className="row g-0 align-items-center">
                      <div className="col-md-3 d-flex justify-content-center align-items-center">
                        <img
                          src={`${apiUrl}/images/${item.image_filename}`}
                          alt={item.name}
                          className="img-fluid rounded shadow-lg mt-2"
                          style={{ maxHeight: '100px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="col-md-9">
                        <div className="card-body d-flex justify-content-between">
                          <div>
                            <h5 className="card-title">{item.name}</h5>
                            <p>
                              Price: $$
                              {item.cost.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                            <p>Quantity: {item.quantity}</p>
                            <div className="btn-group">
                              {/* Buttons for updating item quantity and removing item */}
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => updateCart(item.product_id, true)}
                              >
                                +
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateCart(item.product_id, false)}
                              >
                                -
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeItem(item.product_id)}
                              >
                                X
                              </button>
                            </div>
                          </div>
                          <p>
                            Total: $
                            {(item.cost * item.quantity).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h4>
                Subtotal: $
                {subtotal.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h4>
              <h5>
                Tax: $
                {tax.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h5>
              <h3>
                Total: $
                {total.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              {/* Buttons for continuing shopping and proceeding to checkout */}
              <Link to="/" className="btn btn-secondary">
                Continue Shopping
              </Link>
              <Link to="/checkout" className="btn btn-primary">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
