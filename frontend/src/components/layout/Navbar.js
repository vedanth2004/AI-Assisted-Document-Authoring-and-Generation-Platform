import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" className="navbar-logo">
          🤖 AI Document Platform
        </Link>
      </div>
      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-link">
          📊 Dashboard
        </Link>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="navbar-user">
          <span className="navbar-username">👤 {user.username}</span>
          <button className="navbar-logout" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

