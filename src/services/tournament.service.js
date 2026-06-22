import { apiRequest } from './api';

export const tournamentService = {
  /**
   * Tạo giải đấu mới
   * @param {Object} data
   * @param {string} data.adminId
   * @param {string} data.name
   * @param {string} data.startDate YYYY-MM-DD
   * @param {string} data.endDate YYYY-MM-DD
   * @param {string} data.allowedBreed
   * @param {string|number} data.allowedHorseAge
   * @param {string} data.status DRAFT | PUBLISHED
   */
  createTournament(data) {
    return apiRequest('/api/v1/tournaments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Lấy danh sách tổng quan các giải đấu cho màn hình Dashboard
   */
  getTournamentDashboard() {
    return apiRequest('/api/v1/tournaments/dashboard', {
      method: 'GET'
    });
  },

  /**
   * Lấy nhanh danh sách các giải đấu đang ở trạng thái PUBLIC (dropdown chọn giải)
   */
  getActiveTournaments() {
    return apiRequest('/api/v1/tournaments/active', {
      method: 'GET'
    });
  },

  /**
   * Hủy bỏ toàn bộ một giải đấu
   * @param {string} id
   * @param {string} reason
   */
  cancelTournament(id, reason) {
    return apiRequest(`/api/v1/tournaments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }
};
