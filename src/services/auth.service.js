import { apiRequest } from './api';

export const authService = {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} data
   * @param {string} data.username
   * @param {string} data.email
   * @param {string} data.password
   * @param {string} data.role
   */
  register(data) {
    return apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
