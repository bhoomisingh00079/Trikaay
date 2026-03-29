/**
 * Axios Instance with JWT Authentication
 * Automatically attaches access token to requests
 * Handles token expiration and refresh
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store for access token (set by AuthContext)
let accessToken = null;
let refreshPromise = null;

/**
 * Set the access token (called by AuthContext)
 */
export const setAccessToken = (token) => {
  accessToken = token;
};

/**
 * Clear the access token (called by AuthContext on logout)
 */
export const clearAccessToken = () => {
  accessToken = null;
};

/**
 * Request interceptor - attach access token to all requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle token expiration and refresh
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if this is a 401 TOKEN_EXPIRED error
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Prevent multiple simultaneous refresh attempts
        if (!refreshPromise) {
          refreshPromise = axiosInstance
            .post('/api/auth/refresh')
            .then((response) => {
              accessToken = response.data.accessToken;
              return response.data.accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - user must login again
        accessToken = null;
        
        // Dispatch event for AuthContext to clear auth
        window.dispatchEvent(
          new CustomEvent('auth-refresh-failed', { detail: refreshError })
        );

        return Promise.reject(refreshError);
      }
    }

    // For other 401 errors (UNAUTHORIZED), clear auth and redirect
    if (error.response?.status === 401 && error.response?.data?.code === 'UNAUTHORIZED') {
      accessToken = null;
      window.dispatchEvent(new CustomEvent('auth-unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
