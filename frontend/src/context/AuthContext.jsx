import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user has an active session via /customers/me
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/customers/me');
      setUser(response.data);
    } catch (error) {
      // 401 Unauthorized or network issue -> clear user
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/customers/login', { email, password });
    // After setting cookie, fetch authenticated user profile
    await checkAuth();
    return response.data;
  };

  // Register handler
  const register = async (formData) => {
    const response = await api.post('/customers/register', formData);
    return response.data;
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
