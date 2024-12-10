import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useForm } from 'react-hook-form';

const apiUrl = import.meta.env.VITE_API_HOST;

const Checkout = () => {
  const [cookies, setCookies, removeCookies] = useCookies(['cart', 'user']);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // Check if user is logged in
  const user = cookies.user;
  if (!user) {
    const redirectUrl = encodeURIComponent('/checkout');
    return (
      <div className="text-center">
        <p>You need to be logged in to checkout.</p>
        <a href={`/login?redirect=${redirectUrl}`} className="btn btn-primary">Login</a>
      </div>
    );
  }

  // Fetch cart items from API
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const productIds = cookies.cart ? String(cookies.cart).split(',') : [];
        if (productIds.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const productCount = {};
        productIds.forEach(id => {
          productCount[id] = (productCount[id] || 0) + 1;
        });

        const uniqueProductIds = [...new Set(productIds)];
        const productsWithQuantities = await Promise.all(
          uniqueProductIds.map(async (id) => {
            const response = await fetch(`${apiUrl}/products/${id}`);
            if (!response.ok) {
              throw new Error('Failed to fetch product details');
            }
            const product = await response.json();
            return {
              ...product,
              quantity: productCount[product.product_id],
            };
          })
        );

        setCartItems(productsWithQuantities);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setError('Error fetching cart items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [cookies.cart]);

  // Handle checkout form submission
  const onSubmit = async (data) => {
    setLoading(true);  // Show loading indicator
    try {
      const response = await fetch(`${apiUrl}/products/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          cart: cookies.cart,
        }),
      });

      if (response.ok) {
        // Clear cart and redirect to confirmation page
        removeCookies('cart', { path: '/' });
        navigate('/confirmation');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to complete purchase');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);  // Hide loading indicator
    }
  };

  return (
    <div className="container my-5">
      <div className="bg-light p-4 rounded shadow-lg">
        <h1 className="text-center display-4 text-primary mb-4">Checkout</h1>

        {/* Cart Summary */}
        {loading ? (
          <p>Loading cart items...</p>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="mb-4">
            <h4>Your Order Summary</h4>
            <ul className="list-group">
              {cartItems.map(item => (
                <li key={item.product_id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{item.name}</strong> <br />
                    Quantity: {item.quantity}
                  </div>
                  <div>
                    ${Number(item.cost * item.quantity).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form fields for address, payment, etc. */}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processing...' : 'Complete Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
