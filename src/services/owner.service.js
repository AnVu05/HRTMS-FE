import { apiRequest } from './api';

export const ownerService = {
  /**
   * Lấy thông tin profile của Horse Owner
   * @param {number|string} ownerId 
   * @returns {Promise<{userId: number, username: string, email: string, role: string, createdAt: string}>}
   */
  getProfile(ownerId) {
    return apiRequest(`/api/horse-owners/${ownerId}/profile`, {
      method: 'GET'
    });
  }
};
