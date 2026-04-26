import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    return !!(token && userData);
  };

  // Login function
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout function
  const logout = (redirectToAuth = true) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    if (redirectToAuth) {
      // Redirect to auth page, preserving the current path for potential redirect after login
      const currentPath = location.pathname !== '/auth' ? location.pathname : '/dashboard';
      navigate('/auth', { 
        replace: true,
        state: { from: currentPath }
      });
    }
  };

  // Handle token expiration
  const handleTokenExpiration = () => {
    console.log('Token expired, redirecting to login...');
    logout(true);
  };

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout(false);
      }
    }
    
    setLoading(false);
  }, []);

  // Redirect to auth if not authenticated (except when already on auth page)
  useEffect(() => {
    if (!loading && !isAuthenticated() && location.pathname !== '/auth') {
      logout(true);
    }
  }, [loading, location.pathname]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    handleTokenExpiration
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};