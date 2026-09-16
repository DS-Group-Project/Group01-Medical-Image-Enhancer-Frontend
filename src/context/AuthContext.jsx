import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { mockAuthService } from '../services/mockData';

export const AuthContext = createContext(null);

/**
 * Custom hook to consume the AuthContext.
 * Throws an error if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true; // Set true as default for dev without backend
const activeAuthService = USE_MOCK ? mockAuthService : authService;

/**
 * AuthProvider component that wraps the application to provide authentication context.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (activeAuthService.isAuthenticated()) {
          const data = await activeAuthService.getCurrentUser();
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await activeAuthService.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (userData) => {
    const data = await activeAuthService.register(userData);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = async () => {
    try {
      await activeAuthService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
