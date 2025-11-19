import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (token && userId && username) {
      setUser({ id: userId, username, token });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { access_token, user_id, username } = response.data;
      
      console.log('Login successful, storing token:', access_token.substring(0, 20) + '...');
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('userId', user_id);
      localStorage.setItem('username', username);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser({ id: user_id, username, token: access_token });
      
      console.log('Token stored, user set:', username);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running on http://localhost:8000';
      } else {
        errorMessage = error.message || 'Login failed';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await api.post('/api/auth/register', {
        email,
        username,
        password
      });
      const { access_token, user_id, username: regUsername } = response.data;
      
      console.log('Registration successful, storing token:', access_token.substring(0, 20) + '...');
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('userId', user_id);
      localStorage.setItem('username', regUsername);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser({ id: user_id, username: regUsername, token: access_token });
      
      console.log('Token stored, user set:', regUsername);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'Cannot connect to server. Make sure the backend is running on http://localhost:8000';
      } else {
        // Something else happened
        errorMessage = error.message || 'Registration failed';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

