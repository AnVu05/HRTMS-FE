import { apiRequest } from './api';

export const horseService = {
  /**
   * Lấy danh sách ngựa của chủ ngựa
   * @param {number|string} ownerId 
   * @returns {Promise<any[]>}
   */
  getHorsesByOwner(ownerId) {
    return apiRequest(`/api/horses/owner/${ownerId}`, {
      method: 'GET'
    });
  },

  /**
   * Thêm ngựa mới
   * @param {Object} data 
   * @returns {Promise<any>}
   */
  createHorse(data) {
    return apiRequest('/api/horses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Cập nhật ngựa
   * @param {number|string} id 
   * @param {Object} data 
   * @returns {Promise<any>}
   */
  updateHorse(id, data) {
    return apiRequest(`/api/horses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Xóa ngựa
   * @param {number|string} id 
   * @returns {Promise<any>}
   */
  deleteHorse(id) {
    return apiRequest(`/api/horses/${id}`, {
      method: 'DELETE'
    });
  }
};
