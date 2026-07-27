import { apiRequest } from './api';

export const walletService = {
  /**
   * Get wallet info by userId
   * GET /api/wallets/user/{userId}
   * @param {number|string} userId
   */
  getWalletByUserId(userId) {
    return apiRequest(`/api/wallets/user/${userId}`, {
      method: 'GET',
    });
  },

  /**
   * Create wallet
   * POST /api/wallets
   * @param {{ userId: number, balance: number }} payload
   */
  createWallet(payload) {
    return apiRequest('/api/wallets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update wallet by wallet ID
   * PUT /api/wallets/{id}
   * @param {number|string} id
   * @param {{ userId: number, balance: number }} payload
   */
  updateWallet(id, payload) {
    return apiRequest(`/api/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
