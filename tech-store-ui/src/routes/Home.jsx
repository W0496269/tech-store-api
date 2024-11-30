import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_HOST}/products/all`)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched products:', data);
        setProducts(data);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Our Products</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        {products.map(product => (
          <div key={product.product_id} style={{ flex: '1 1 calc(50% - 40px)', boxSizing: 'border-box', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden', borderRadius: '8px' }}>
              <img src={`${import.meta.env.VITE_API_HOST}/images/${product.image_filename}`} alt={product.name} style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            </div>
            <h3 style={{ margin: '10px 0' }}>{product.name}</h3>
            <p style={{ color: '#555' }}>${product.cost.toFixed(2)}</p>
            <Link to={`/details/${product.product_id}`} style={{ textDecoration: 'none', color: 'blue' }}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
