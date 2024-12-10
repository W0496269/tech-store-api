import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useOutletContext } from 'react-router-dom';

// API URL from environment variables
const apiUrl = import.meta.env.VITE_API_HOST;

export default function Login() {
  // Accessing context for updating login state
  const { setIsLoggedIn } = useOutletContext(); // Access setIsLoggedIn from context
  // Destructuring methods from react-hook-form for form handling
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // State to hold server error message if login fails
  const [serverError, setServerError] = useState('');
  // Access cookies for cart and user data
  const [cookies, setCookies] = useCookies(['cart', 'user']);
  // Hook for navigation to different pages
  const navigate = useNavigate();

  // Function to handle form submission
  const onSubmit = async (data) => {
    setServerError(''); // Reset server error on form submission

    try {
      // Send a POST request to login the user
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Send user credentials
        credentials: 'include', // Include cookies in request for session
      });

      // Parse the server response
      const result = await response.json();

      if (!response.ok) {
        // If login fails, set the server error message
        setServerError(result.error || 'Invalid credentials');
        return;
      }

      // Set user data in cookies upon successful login
      setCookies('user', result.user, { path: '/' });
      setIsLoggedIn(true); // Update login state to true

      // Log the cookies for debugging purposes
      console.log(cookies);

      // Check if there are items in the cart, navigate accordingly
      const cartItems = cookies.cart ? cookies.cart.split(",") : [];
      if (cartItems.length > 0) {
        navigate("/cart"); // Go to cart if items are present
      } else {
        navigate("/home"); // Otherwise, go to home
      }
    } catch (error) {
      console.error('Login error:', error); // Log any error
      setServerError('An unexpected error occurred. Please try again later.'); // Show error message
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="bg-light p-5 rounded shadow-lg" style={{ width: "100%", maxWidth: "400px" }}>
        <h1 className="text-center mb-4 text-primary">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`} // Show invalid class if error exists
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required", // Email is required
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email pattern validation
                  message: "Enter a valid email address", // Custom error message
                },
              })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>} {/* Display error if validation fails */}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`} // Show invalid class if error exists
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required", // Password is required
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters", // Minimum length validation
                },
              })}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>} {/* Display error if validation fails */}
          </div>

          {serverError && (
            <div className="alert alert-danger" role="alert"> 
              {serverError} {/* Display server error if login fails */}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 rounded-pill mb-3">Login</button> {/* Submit button for login */}

          <div className="text-center">
            Don’t have an account? <a href="/signup" className="text-primary">Sign Up</a> {/* Link to sign up page */}
          </div>
        </form>
      </div>
    </div>
  );
}
