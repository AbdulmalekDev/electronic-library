import api from './api';

export const notificationService = {
  // Get all borrow notifications mapped
  getBorrowNotifications: async () => {
    return await api.get('/notifications/borrows');
  },

  // Mark specific notification as read
  markAsRead: async (id) => {
    return await api.put(`/notifications/mark-read/${id}`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return await api.put('/notifications/mark-all-read');
  }
};

export default notificationService;
