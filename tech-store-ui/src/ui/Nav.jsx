import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useCookies } from 'react-cookie';

const Nav = ({ isLoggedIn }) => {
  const [cookies] = useCookies(['cart']);
  const cartItemsCount = cookies.cart ? cookies.cart.split(",").length : 0;

  return (
    <nav style={{ padding: '10px', backgroundColor: '#f4f4f4', borderBottom: '1px solid #ddd' }}>
      <ul style={{ display: 'flex', justifyContent: 'center', listStyleType: 'none', padding: '0' }}>
        <li><Link to="/" style={{ margin: '0 15px' }}>Home</Link></li>
        <li>
          <Link to="/cart" style={{ margin: '0 15px' }}>
            <FaShoppingCart /> Cart ({cartItemsCount})
          </Link>
        </li>
        {isLoggedIn ? (
          <li><Link to="/logout" style={{ margin: '0 15px' }}>Logout</Link></li>
        ) : (
          <li><Link to="/login" style={{ margin: '0 15px' }}>Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
