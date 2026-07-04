import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    const stored = localStorage.getItem('cc_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
        // Verify token is still valid
        api.get('/auth/me')
          .then(res => {
            setUser(res.data.user);
            localStorage.setItem('cc_user', JSON.stringify(res.data.user));
          })
          .catch(() => logout())
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token, user } = res.data;
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cc_user', JSON.stringify(updatedUser));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      updateUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error('Could not refresh user:', err);
    }
  }, [updateUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
