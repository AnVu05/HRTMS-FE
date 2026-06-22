import { apiRequest } from './api';

export const notificationService = {
  getAdminNotifications: async (adminId, page = 0, size = 5, unreadOnly = false) => {
    const url = `/api/v1/notifications/admin/${adminId}?page=${page}&size=${size}&unreadOnly=${unreadOnly}`;
    return await apiRequest(url, { method: 'GET' });
  },

  markAllAsRead: async (adminId) => {
    const url = `/api/v1/notifications/admin/${adminId}/read`;
    return await apiRequest(url, { method: 'PUT' });
  }
};
