import React from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <nav>
      <ul style={{
        display: 'flex',
        listStyle: 'none', // Removes default bullet points
        padding: 0, // Removes default padding
        margin: 0, // Removes default margin
        justifyContent: 'center', // Centers the list items horizontally
      }}>
        <li style={{ margin: '0 15px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>Home</Link>
        </li>
        <li style={{ margin: '0 15px' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: 'black' }}>Login</Link>
        </li>
        <li style={{ margin: '0 15px' }}>
          <Link to="/cart" style={{ textDecoration: 'none', color: 'black' }}>Cart</Link>
        </li>
        <li style={{ margin: '0 15px' }}>
          <Link to="/logout" style={{ textDecoration: 'none', color: 'black' }}>Logout</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
