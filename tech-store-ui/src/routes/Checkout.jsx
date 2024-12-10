import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useForm } from 'react-hook-form';

// Base API URL from environment variables
const apiUrl = import.meta.env.VITE_API_HOST;

const Checkout = () => {
  // Initialize cookies and state for cart and user information
  const [cookies, setCookie, removeCookie] = useCookies(['cart', 'user']);
  const [cartItems, setCartItems] = useState([]);  // To store the items in the cart
  const [loading, setLoading] = useState(false);  // Loading state for UI feedback
  const [error, setError] = useState(null);  // To handle any errors
  const { register, handleSubmit, formState: { errors } } = useForm();  // React Hook Form to manage form
  const navigate = useNavigate();  // Hook to navigate to different pages

  // Check if user is logged in based on the cookies
  const user = cookies.user;  // Get user from cookies
  if (!user) {
    // If no user is logged in, redirect to the login page
    const redirectUrl = encodeURIComponent('/checkout');  // URL-encode the checkout path
    return (
      <div className="text-center">
        <p>You need to be logged in to checkout.</p>
        {/* Redirect to login page with a return URL after successful login */}
        <a href={`/login?redirect=${redirectUrl}`} className="btn btn-primary">Login</a>
      </div>
    );
  }

  // Fetch cart items from the API
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // Get product IDs from the cart cookie
        const productIds = cookies.cart ? String(cookies.cart).split(',') : [];
        
        // If there are no items in the cart, stop further processing
        if (productIds.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        // Count the quantity of each product in the cart
        const productCount = {};
        productIds.forEach(id => {
          productCount[id] = (productCount[id] || 0) + 1;
        });

        // Get the unique product IDs
        const uniqueProductIds = [...new Set(productIds)];
        
        // Fetch product details from the API and add quantity info
        const productsWithQuantities = await Promise.all(
          uniqueProductIds.map(async (id) => {
            const response = await fetch(`${apiUrl}/products/${id}`);
            if (!response.ok) {
              throw new Error('Failed to fetch product details');
            }
            const product = await response.json();
            return {
              ...product,
              quantity: productCount[product.product_id],  // Add the quantity for each product
            };
          })
        );

        // Set the cart items state
        setCartItems(productsWithQuantities);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setError('Error fetching cart items. Please try again.');
      } finally {
        setLoading(false);  // Stop loading after fetch completes
      }
    };

    fetchCartItems();  // Call the fetch function when component mounts
  }, [cookies.cart]);  // Re-run if cart changes

  // Handle form submission for checkout
  const onSubmit = async (data) => {
    setLoading(true);  // Show loading indicator while processing the payment
    try {
      // Send checkout data to the API
      const response = await fetch(`${apiUrl}/products/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // Ensure cookies are sent with the request
        body: JSON.stringify({
          ...data,  // Spread the form data
          cart: cookies.cart,  // Include the cart items
        }),
      });

      // If the purchase was successful
      if (response.ok) {
        // Clear the cart cookies after successful purchase
        removeCookie('cart', { path: '/' });
        // Redirect the user to the confirmation page
        navigate('/confirmation');
      } else {
        // If an error occurred, display the error message
        const errorData = await response.json();
        setError(errorData.error || 'Failed to complete purchase');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);  // Hide loading indicator after processing
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
          <div className="alert alert-danger">{error}</div>  // Show error message if any
        ) : (
          <div className="mb-4">
            <h4>Your Order Summary</h4>
            <ul className="list-group">
              {cartItems.map(item => (
                <li key={item.product_id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{item.name}</strong> <br />
                    Quantity: {item.quantity}  {/* Display item name and quantity */}
                  </div>
                  <div>
                    ${Number(item.cost * item.quantity).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}  {/* Show the total cost for this item */}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Address Fields */}
          <div className="form-group">
            <label htmlFor="street">Street</label>
            <input
              id="street"
              type="text"
              className="form-control"
              {...register('street', { required: 'Street is required' })}  // Field validation with react-hook-form
            />
            {errors.street && <span className="text-danger">{errors.street.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              className="form-control"
              {...register('city', { required: 'City is required' })}
            />
            {errors.city && <span className="text-danger">{errors.city.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="province">Province</label>
            <input
              id="province"
              type="text"
              className="form-control"
              {...register('province', { required: 'Province is required' })}
            />
            {errors.province && <span className="text-danger">{errors.province.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              className="form-control"
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <span className="text-danger">{errors.country.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="postal_code">Postal Code</label>
            <input
              id="postal_code"
              type="text"
              className="form-control"
              {...register('postal_code', { required: 'Postal code is required' })}
            />
            {errors.postal_code && <span className="text-danger">{errors.postal_code.message}</span>}
          </div>

          {/* Credit Card Fields */}
          <div className="form-group">
            <label htmlFor="credit_card">Card Number</label>
            <input
              id="credit_card"
              type="text"
              className="form-control"
              {...register('credit_card', { required: 'Card number is required' })}
            />
            {errors.credit_card && <span className="text-danger">{errors.credit_card.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="credit_expire">Expiry Date</label>
            <input
              id="credit_expire"
              type="text"
              className="form-control"
              {...register('credit_expire', { required: 'Expiry date is required' })}
            />
            {errors.credit_expire && <span className="text-danger">{errors.credit_expire.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="credit_cvv">CVV</label>
            <input
              id="credit_cvv"
              type="text"
              className="form-control"
              {...register('credit_cvv', { required: 'CVV is required' })}
            />
            {errors.credit_cvv && <span className="text-danger">{errors.credit_cvv.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processing...' : 'Complete Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
