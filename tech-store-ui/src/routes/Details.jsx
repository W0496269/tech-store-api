import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const Details = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [cookies, setCookie] = useCookies(['cart']);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_HOST}/products/${id}`)
      .then(response => response.json())
      .then(data => {
        setProduct(data);
      })
      .catch(error => console.error('Error fetching product:', error));
  }, [id]);

  const addToCart = () => {
    // Retrieve the existing cart cookie and parse it as a comma-delimited list
    let cart = cookies.cart ? cookies.cart : '';

    // Add the current product ID to the cart string
    cart = cart ? `${cart},${id}` : id;

    // Set the updated cart string in the cookie
    setCookie('cart', cart, { path: '/' });
  };

  const goBack = () => {
    navigate('/'); // Navigate to the Home page
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {product ? (
        <>
          <img
            src={`${import.meta.env.VITE_API_HOST}/images/${product.image_filename}`}
            alt={product.name}
            style={{ width: '100%', maxWidth: '400px', margin: '20px 0' }}
          />
          <h2>{product.name}</h2>
          <p>${product.cost.toFixed(2)}</p>
          <p>{product.description}</p>
          <button
            onClick={addToCart}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Add to Cart
          </button>
          <button
            onClick={goBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              marginTop: '20px',
            }}
          >
            Go Back
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Details;
