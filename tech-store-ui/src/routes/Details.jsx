import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const Details = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_HOST}/products/${id}`)
      .then(response => response.json())
      .then(data => setProduct(data))
      .catch(error => console.error('Error fetching product details:', error));
  }, [id]);

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{product.name}</h2>
      <img src={product.image} alt={product.name} />
      <p>{product.description}</p>
      <p>${product.cost}</p>
      <Link to="/">Go Back</Link>
    </div>
  );
};

export default Details;
