import api from './api';

export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response;
  },

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Remove auth token
  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response;
  },

  // Get notifications
  getNotifications: async () => {
    const response = await api.get('/auth/me'); // User model has notifications array
    return response.data?.data?.notifications || [];
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/auth/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { data: { success: true } };
    }
  }
};