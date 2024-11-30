import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './ui/Nav';

const App = () => {
  return (
    <div>
      <Nav />
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Welcome to My Tech Store</h1>
      <Outlet />
    </div>
  );
}

export default App;
