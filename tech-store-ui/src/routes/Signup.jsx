import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_HOST;

const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError("");  // Reset server error before submission

    try {
      const response = await fetch(`${apiUrl}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setServerError(errorData.error || 'Signup failed. Please try again.');
      } else {
        // Redirect to login page after successful signup
        navigate('/login');
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center">Signup</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-4" style={{ maxWidth: "400px" }}>
        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            {...register('email', {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            {...register('password', {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            })}
          />
          {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
        </div>

        {/* First Name */}
        <div className="mb-3">
          <label htmlFor="first_name" className="form-label">First Name</label>
          <input
            id="first_name"
            type="text"
            className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
            {...register('first_name', { required: "First name is required" })}
          />
          {errors.first_name && <div className="invalid-feedback">{errors.first_name.message}</div>}
        </div>

        {/* Last Name */}
        <div className="mb-3">
          <label htmlFor="last_name" className="form-label">Last Name</label>
          <input
            id="last_name"
            type="text"
            className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
            {...register('last_name', { required: "Last name is required" })}
          />
          {errors.last_name && <div className="invalid-feedback">{errors.last_name.message}</div>}
        </div>

        {/* Server Error */}
        {serverError && <div className="alert alert-danger" role="alert">{serverError}</div>}

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-100">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
