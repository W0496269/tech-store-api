import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import necessary hooks for routing
import { useCookies } from 'react-cookie'; // Import the hook to manage cookies

const Details = () => {
  // Get the product ID from the URL parameter using useParams()
  const { id } = useParams(); 
  
  // Declare state to store the product details
  const [product, setProduct] = useState(null); 
  
  // Declare state to manage the cookies and set the cart cookie
  const [cookies, setCookie] = useCookies(['cart']);
  
  // Initialize navigate function to programmatically navigate between routes
  const navigate = useNavigate();

  // useEffect hook to fetch product details when the component mounts or the product ID changes
  useEffect(() => {
    // Fetch the product data from the API
    fetch(`${import.meta.env.VITE_API_HOST}/products/${id}`)
      .then(response => response.json())  // Parse the response into JSON
      .then(data => {
        setProduct(data);  // Update the state with the fetched product data
      })
      .catch(error => console.error('Error fetching product:', error));  // Handle any errors
  }, [id]);  // Only re-run the effect if the product ID changes

  // Function to add the product to the cart
  const addToCart = () => {
    // Retrieve the existing cart from cookies, if available
    let cart = cookies.cart ? cookies.cart : '';

    // If the cart has items, append the current product's ID, otherwise, start with this product ID
    cart = cart ? `${cart},${id}` : id;

    // Update the cart cookie with the new product ID
    setCookie('cart', cart, { path: '/' });
  };

  // Function to navigate back to the home page
  const goBack = () => {
    navigate('/');  // Navigate to the home route
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {/* Check if the product data has been loaded */}
      {product ? (
        <>
          {/* Display the product image */}
          <img
            src={`${import.meta.env.VITE_API_HOST}/images/${product.image_filename}`}
            alt={product.name}  // Image alt text for accessibility
            style={{ width: '100%', maxWidth: '400px', margin: '20px 0' }}
          />
          
          {/* Display the product name */}
          <h2>{product.name}</h2>
          
          {/* Display the product cost */}
          <p>${product.cost.toFixed(2)}</p>
          
          {/* Display the product description */}
          <p>{product.description}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
  {/* Add to Cart button */}
  <Link
    to="#"
    onClick={addToCart}  // Trigger the addToCart function when clicked
    style={{
      padding: '10px 20px',
      backgroundColor: '#4CAF50',  // Green background
      color: 'white',
      textDecoration: 'none',  // Remove the default underline from Link
      borderRadius: '20px',
      marginTop: '5px',
      display: 'inline-block',  // a block element
    }}
  >
    Add to Cart
  </Link>

  <Link
    to="/"  // Navigate to the home page when clicked
    style={{
      padding: '10px 20px',
      backgroundColor: '#f44336',  // Red background
      color: 'white',
      textDecoration: 'none',  // Remove the default underline from Link
      borderRadius: '20px',
      marginTop: '5px',  // to create space
      display: 'inline-block',  // a block element
    }}
  >
    Go Back
  </Link>
</div>

        </>
      ) : (
        // If the product is still loading, show a loading message
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Details;
