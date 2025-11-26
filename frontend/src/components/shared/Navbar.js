import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  if (!user) {
    return null; // Don't show navbar on auth pages
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <h1>🤖 AI Document Authoring Platform</h1>
        </Link>
      </div>
      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-link">
          📊 Dashboard
        </Link>
        <Link to="/projects/new" className="navbar-link btn-primary-small">
          ➕ New Project
        </Link>
        <div className="navbar-user">
          <span className="navbar-username">👤 {user.username}</span>
          <button className="btn btn-secondary" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

