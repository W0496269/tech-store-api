import React from 'react';
import { Link } from 'react-router-dom';

const Confirmation = () => {
  return (
    <div className="container my-5">
      <h1 className="text-center">Purchase Confirmation</h1>
      <p className="text-center">Thank you for your purchase!</p>
      <div className="text-center mt-4">
        <Link to="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default Confirmation;
