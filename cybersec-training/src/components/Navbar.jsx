import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/navbar.css';

export default function Navbar() {
  const location = useLocation();

  const getClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <span className="logo">USTP CYBER RANGE</span>
      </div>

      <div className="nav-links">
        <Link to="/" className={getClass('/')}>
          Mission
        </Link>

        <Link to="/dashboard" className={getClass('/dashboard')}>
          Leaderboard
        </Link>
      </div>
    </div>
  );
}