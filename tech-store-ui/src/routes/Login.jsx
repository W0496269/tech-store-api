import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useOutletContext } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_HOST;

export default function Login() {
  const { setIsLoggedIn } = useOutletContext();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [cookies, setCookies] = useCookies(['cart', 'user']);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError('');
    
    try {
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',  // Include cookies in request
      });
    
      const result = await response.json();
    
      if (!response.ok) {
        setServerError(result.error || 'Invalid credentials');
        return;
      }
    
      setCookies('user', result.user, { path: '/' });
      setIsLoggedIn(true);
      
      // Log the cookies
      console.log(cookies);
    
      const cartItems = cookies.cart ? cookies.cart.split(",") : [];
      if (cartItems.length > 0) {
        navigate("/cart");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error('Login error:', error);  // Log the error details
      setServerError('An unexpected error occurred. Please try again later.');
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
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          {serverError && (
            <div className="alert alert-danger" role="alert">
              {serverError}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 rounded-pill mb-3">Login</button>

          <div className="text-center">
            Don’t have an account? <a href="/signup" className="text-primary">Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
}
