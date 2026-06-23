import { apiRequest } from './api';

export const refereeService = {
  /**
   * Lấy danh sách lời mời trọng tài đang chờ xử lý
   * @param {number|string} refereeId 
   */
  getPendingInvitations(refereeId) {
    return apiRequest(`/api/v1/notifications/referees/${refereeId}/invitations`, {
      method: 'GET',
    });
  },

  /**
   * Chấp nhận lời mời làm trọng tài cho một cuộc đua
   * @param {number|string} refereeId 
   * @param {number|string} notificationId 
   */
  acceptInvitation(refereeId, notificationId) {
    return apiRequest(`/api/v1/notifications/referees/${refereeId}/invitations/${notificationId}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'accepted' }),
    });
  },

  /**
   * Từ chối lời mời làm trọng tài cho một cuộc đua
   * @param {number|string} refereeId 
   * @param {number|string} notificationId 
   * @param {string} reason - Lý do từ chối
   */
  declineInvitation(refereeId, notificationId) {
    return apiRequest(`/api/v1/notifications/referees/${refereeId}/invitations/${notificationId}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Reject' }),
    });
  },

  /**
   * Lấy danh sách cuộc đua đã được lên lịch cho trọng tài
   * @param {number|string} refereeId 
   */
  getScheduledRaces(refereeId) {
    return apiRequest(`/api/v1/referees/${refereeId}/scheduled-races`, {
      method: 'GET',
    });
  },

  /**
   * Lấy thông tin chi tiết cuộc đua
   * @param {number|string} raceId 
   */
  getRaceDetails(raceId) {
    return apiRequest(`/api/v1/races/${raceId}`, {
      method: 'GET',
    });
  },

  /**
   * Lấy thông tin profile trọng tài
   * @param {number|string} refereeId 
   */
  getProfile(refereeId) {
    return apiRequest(`/api/v1/referee/${refereeId}/profile`, {
      method: 'GET',
    });
  },
};
