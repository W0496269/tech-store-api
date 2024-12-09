import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();
  const setIsLoggedIn = useOutletContext();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }

        setIsLoggedIn(false);
        navigate('/');
      } catch (error) {
        alert(error.message);
      }
    };

    logout();
  }, [setIsLoggedIn, navigate]);

  return <p>Logging out...</p>;
};

export default Logout;
