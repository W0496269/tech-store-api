import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const Details = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [cookies, setCookie] = useCookies(['cart']);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_HOST}/products/${id}`)
      .then(response => response.json())
      .then(data => setProduct(data))
      .catch(error => console.error('Error fetching product:', error));
  }, [id]);

  const addToCart = () => {
    const cart = cookies.cart ? cookies.cart.split(',') : [];
    cart.push(id);
    setCookie('cart', cart.join(','), { path: '/' });
  };

  return (
    <div>
      {product ? (
        <>
          <img src={`${import.meta.env.VITE_API_HOST}/images/${product.image_filename}`} alt={product.name} />
          <h2>{product.name}</h2>
          <p>${product.cost}</p>
          <p>{product.description}</p>
          <button onClick={addToCart}>Add to Cart</button>
          <Link to="/">Go back</Link>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Details;
