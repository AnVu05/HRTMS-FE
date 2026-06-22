import { apiRequest } from './api';

export const jockeyService = {
  /**
   * Lấy thông tin profile của Jockey
   * @param {number|string} jockeyId 
   * @returns {Promise<{status: string, message: string, data: {id: number, username: string, email: string, role: string, createdAt: string, jockeyName: string, yearOfExperience: number, age: number, professionalBio: string, status: boolean}}>}
   */
  getProfile(jockeyId) {
    return apiRequest(`/api/jockeys/${6}/profile`, {
      method: 'GET',
    });
  },

  /**
   * Cập nhật thông tin profile của Jockey
   * @param {number|string} jockeyId
   * @param {{ jockeyName: string, yearOfExperience: number, age: number, professionalBio: string }} payload
   */
  updateProfile(jockeyId, payload) {
    return apiRequest(`/api/jockeys/${6}/profile`, {
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
    return apiRequest(`/api/v1/verifications/jockey-certs/${6}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Yêu cầu xác minh chứng chỉ
   * @param {number|string} jockeyId 
   */
  requestVerification(jockeyId) {
    return apiRequest(`/api/v1/verifications/jockey-certs/${6}/request-verification`, {
      method: 'POST',
    });
  },
  /**
   * Lấy kết quả xác minh chứng chỉ (thông báo)
   * @param {number|string} jockeyId 
   */
  getCertificateResults(jockeyId) {
    return apiRequest(`/api/v1/notifications/jockeys/${6}/certificate-results`, {
      method: 'GET',
    });
  },
};
