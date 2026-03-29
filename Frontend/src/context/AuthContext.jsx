/**
 * Auth Context
 * Manages global authentication state
 * Stores access token in memory (never localStorage)
 * Refresh token is stored in httpOnly cookie by backend
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance, { setAccessToken, clearAccessToken } from '../utils/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      });

      const { accessToken: token, user: userData } = response.data;

      // Store token in memory
      setAccessTokenState(token);
      setAccessToken(token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const message = !err.response
        ? 'Cannot connect to server. Ensure backend is running on http://localhost:5001.'
        : err.response?.data?.error || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Logout - clear auth state and cookie
   */
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear refresh token cookie
      await axiosInstance.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local auth state
      setAccessTokenState(null);
      clearAccessToken();
      setUser(null);
      setError(null);
    }
  }, []);

  /**
   * Refresh access token silently
   * Called on app load to restore session from refresh cookie
   */
  const silentRefresh = useCallback(async () => {
    try {
      const response = await axiosInstance.post('/api/auth/refresh');
      const { accessToken: token, user: userData } = response.data;

      setAccessTokenState(token);
      setAccessToken(token);
      setUser(userData);

      return true;
    } catch (err) {
      // Silent refresh failed - user not authenticated
      clearAccessToken();
      setAccessTokenState(null);
      setUser(null);
      return false;
    }
  }, []);

  /**
   * On app mount, try to restore session from refresh cookie
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        await silentRefresh();
      } catch (err) {
        console.error('Session restore error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [silentRefresh]);

  /**
   * Listen for auth errors from axios interceptor
   */
  useEffect(() => {
    const handleRefreshFailed = () => {
      // Token refresh failed, user must login again
      logout();
    };

    const handleUnauthorized = () => {
      // Direct unauthorized error, clear auth
      clearAccessToken();
      setAccessTokenState(null);
      setUser(null);
    };

    window.addEventListener('auth-refresh-failed', handleRefreshFailed);
    window.addEventListener('auth-unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth-refresh-failed', handleRefreshFailed);
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const value = {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated: !!user && !!accessToken,
    login,
    logout,
    silentRefresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
