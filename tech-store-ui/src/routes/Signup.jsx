import React from 'react';
import { useForm } from 'react-hook-form';

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const formSubmit = async (data) => {
    const apiHost = import.meta.env.VITE_APP_HOST;
    try {
      const response = await fetch(`${apiHost}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <h1>Signup</h1>
      <form onSubmit={handleSubmit(formSubmit)} method="post" className="w-25">
        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input {...register("firstName", { required: true })} type="text" className="form-control bg-light" />
          {errors.firstName && <span className="text-danger">First Name is required.</span>}
        </div>
        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input {...register("lastName", { required: "Last Name is required." })} type="text" className="form-control bg-light" />
          {errors.lastName && <span className="text-danger">{errors.lastName.message}</span>}
        </div>
        <div className="mb-3">
          <label className="form-label">Email (username)</label>
          <input {...register("email", { required: "Email is required." })} type="text" className="form-control bg-light" />
          {errors.email && <span className="text-danger">{errors.email.message}</span>}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input {...register("password", { required: "Password is required." })} type="password" className="form-control bg-light" />
          {errors.password && <span className="text-danger">{errors.password.message}</span>}
        </div>
        <button type="submit" className="btn btn-primary">Signup</button>
      </form>
    </>
  );
}
