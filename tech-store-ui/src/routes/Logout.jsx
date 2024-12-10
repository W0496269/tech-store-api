import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

const Logout = () => {
  const { setIsLoggedIn } = useOutletContext();  // Access setIsLoggedIn from context
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Clear user token from localStorage
        localStorage.removeItem('token');
        setIsLoggedIn(false);  // Set isLoggedIn flag to false
        navigate('/');  // Redirect to home or login page
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    logoutUser();
  }, [setIsLoggedIn, navigate]);

  return <p>Logging out...</p>;
};

export default Logout;
