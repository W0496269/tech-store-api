import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './ui/Nav';


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in (based on token or session storage)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);  // Set logged-in flag to true if token exists
    }
  }, []);

  return (
    <div>
      <Nav isLoggedIn={isLoggedIn} />
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Welcome to My Tech Store</h1>
      <Outlet context={{ isLoggedIn, setIsLoggedIn }} /> {/* Pass isLoggedIn and setIsLoggedIn to context */}
    </div>
  );
};

export default App;
