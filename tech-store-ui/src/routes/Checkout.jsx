import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useForm } from 'react-hook-form';

const apiUrl = import.meta.env.VITE_API_HOST;

const Checkout = () => {
  const [cookies, setCookies, removeCookies] = useCookies(['cart', 'user']);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Calculate the subtotal, tax, and total
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.cost * item.quantity,
      0
    );
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  // Handle checkout form submission
  const onSubmit = async (data) => {
    setLoading(true);  // show loading indicator
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
        // Clear cart and navigate to confirmation page
        removeCookies('cart', { path: '/' });
        navigate('/confirmation');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to complete purchase');
      }
    } catch (error) {
      //console.error('Error during purchase:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);  // hide loading indicator
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
            <div className="mt-3">
              <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
              <p><strong>Tax:</strong> ${tax.toFixed(2)}</p>
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group mb-3">
            <label htmlFor="street">Street</label>
            <input
              type="text"
              id="street"
              className="form-control"
              {...register('street', { required: 'Street is required' })}
            />
            {errors.street && <p className="text-danger">{errors.street.message}</p>}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              className="form-control"
              {...register('city', { required: 'City is required' })}
            />
            {errors.city && <p className="text-danger">{errors.city.message}</p>}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="province">Province</label>
            <input
              type="text"
              id="province"
              className="form-control"
              {...register('province', { required: 'Province is required' })}
            />
            {errors.province && <p className="text-danger">{errors.province.message}</p>}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              className="form-control"
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <p className="text-danger">{errors.country.message}</p>}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="postal_code">Postal Code</label>
            <input
              type="text"
              id="postal_code"
              className="form-control"
              {...register('postal_code', { required: 'Postal Code is required' })}
            />
            {errors.postal_code && <p className="text-danger">{errors.postal_code.message}</p>}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="credit_card">Credit Card</label>
            <input
              type="text"
              id="credit_card"
              className="form-control"
              {...register('credit_card', { required: 'Credit Card is required' })}
            />
            {errors.credit_card && <p className="text-danger">{errors.credit_card.message}</p>}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="credit_expire">Expiration Date</label>
            <input
              type="text"
              id="credit_expire"
              className="form-control"
              {...register('credit_expire', { required: 'Expiration Date is required' })}
            />
            {errors.credit_expire && <p className="text-danger">{errors.credit_expire.message}</p>}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="credit_cvv">CVV</label>
            <input
              type="text"
              id="credit_cvv"
              className="form-control"
              {...register('credit_cvv', { required: 'CVV is required' })}
            />
            {errors.credit_cvv && <p className="text-danger">{errors.credit_cvv.message}</p>}
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
