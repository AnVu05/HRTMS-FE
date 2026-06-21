import { apiRequest } from './api';

export const jockeyService = {
  /**
   * Lấy thông tin profile của Jockey
   * @param {number|string} jockeyId 
   * @returns {Promise<{status: string, message: string, data: {id: number, username: string, email: string, role: string, createdAt: string, jockeyName: string, yearOfExperience: number, age: number, professionalBio: string, status: boolean}}>}
   */
  getProfile(jockeyId) {
    return apiRequest(`/api/jockeys/${jockeyId}/profile`, {
      method: 'GET',
    });
  },

  /**
   * Cập nhật thông tin profile của Jockey
   * @param {number|string} jockeyId
   * @param {{ jockeyName: string, yearOfExperience: number, age: number, professionalBio: string }} payload
   */
  updateProfile(jockeyId, payload) {
    return apiRequest(`/api/jockeys/${jockeyId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Thêm chứng chỉ cho Jockey
   * @param {number|string} jockeyId 
   * @param {{ certName: string, certImageBase64: string }} payload 
   */
  addCertificate(jockeyId, payload) {
    return apiRequest(`/api/v1/verifications/jockey-certs/${jockeyId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Yêu cầu xác minh chứng chỉ
   * @param {number|string} jockeyId 
   */
  requestVerification(jockeyId) {
    return apiRequest(`/api/v1/verifications/jockey-certs/${jockeyId}/request-verification`, {
      method: 'POST',
    });
  },
};
