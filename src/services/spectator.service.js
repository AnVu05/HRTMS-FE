import { apiRequest } from './api';

export const spectatorService = {
  /**
   * Lấy thông tin profile của Spectator
   * @param {number|string} spectatorId
   */
  getProfile(spectatorId) {
    return apiRequest(`/api/spectators/${spectatorId}/profile`, {
      method: 'GET',
    });
  },

  /**
   * Cập nhật thông tin profile của Spectator
   * @param {number|string} spectatorId
   * @param {{ name?: string, email?: string }} payload
   */
  updateProfile(spectatorId, payload) {
    return apiRequest(`/api/spectators/${spectatorId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Cập nhật avatar của Spectator
   * @param {number|string} spectatorId
   * @param {{ avatarUrl: string }} payload
   */
  updateAvatar(spectatorId, payload) {
    return apiRequest(`/api/spectators/${spectatorId}/profile/avatar`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Lấy danh sách thông báo của Spectator
   * @param {number|string} spectatorId
   * @param {number} page
   * @param {number} size
   */
  getNotifications(spectatorId, page = 0, size = 10) {
    return apiRequest(`/api/v1/notifications/spectators/${spectatorId}?page=${page}&size=${size}`, {
      method: 'GET',
    });
  },

  /**
   * Tạo dự đoán kết quả cuộc đua mới
   * @param {{ spectatorId: number, raceId: number, predictedHorseId: number, pointsInvested: number, status: string, createdAt: string }} payload
   */
  createPrediction(payload) {
    return apiRequest('/api/predictions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Lấy danh sách tất cả các dự đoán
   */
  getAllPredictions() {
    return apiRequest('/api/predictions', {
      method: 'GET',
    });
  },

  /**
   * Lấy thông tin dự đoán cụ thể theo ID
   * @param {number|string} id
   */
  getPredictionById(id) {
    return apiRequest(`/api/predictions/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Cập nhật dự đoán kết quả
   * @param {number|string} id
   * @param {object} payload
   */
  updatePrediction(id, payload) {
    return apiRequest(`/api/predictions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Xóa dự đoán
   * @param {number|string} id
   */
  deletePrediction(id) {
    return apiRequest(`/api/predictions/${id}`, {
      method: 'DELETE',
    });
  },
};
