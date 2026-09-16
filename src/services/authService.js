import api from './api';

/**
 * Service for handling authentication related API calls.
 */
export const authService = {
  /**
   * Logs in a user.
   * 
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<{user: Object, token: string}>} The user object and JWT token.
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Registers a new user.
   * 
   * @param {Object} userData - The user details.
   * @param {string} userData.name - Full name.
   * @param {string} userData.email - Email address.
   * @param {string} userData.password - Password.
   * @returns {Promise<{user: Object, token: string}>} The newly created user object and JWT token.
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Logs out the current user by clearing local storage and notifying the backend.
   * 
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  /**
   * Retrieves the current authenticated user's details.
   * 
   * @returns {Promise<{user: Object}>} The user object.
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Retrieves the authentication token from local storage.
   * 
   * @returns {string|null} The JWT token or null if not found.
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Checks if the user is currently authenticated (has a token).
   * 
   * @returns {boolean} True if authenticated, false otherwise.
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
