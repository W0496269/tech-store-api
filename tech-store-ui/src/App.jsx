import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './ui/Nav';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);  // Keep user logged in if token is present
    }
  }, []);

  return (
    <div>
      <Nav isLoggedIn={isLoggedIn} />
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Welcome to My Tech Store</h1>
      <Outlet context={{ setIsLoggedIn }} />  {/* Passing setIsLoggedIn via context */}
    </div>
  );
}

export default App;
