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
   * @param {string} [data.tournamentDescription]
   * @param {string} data.status DRAFT | PUBLISHED
   */
  createTournament(data) {
    const adminIdParsed = parseInt(data.adminId || data.admin_id || 3, 10);
    const horseAgeParsed = parseInt(data.allowedHorseAge || data.allowed_horse_age, 10);

    const payload = {
      name: data.name,
      status: data.status,
      admin_id: isNaN(adminIdParsed) ? 3 : adminIdParsed,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      allowed_breed: data.allowedBreed || data.allowed_breed,
      allowed_horse_age: isNaN(horseAgeParsed) ? 0 : horseAgeParsed,
      tournament_description: data.tournamentDescription || data.tournament_description || data.description || ''
    };
    return apiRequest('/api/v1/tournaments', {
      method: 'POST',
      body: JSON.stringify(payload)
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
  },
  /**
   * Cập nhật thông tin giải đấu
   * @param {string|number} id
   * @param {Object} data
   */
  updateTournament(id, data) {
    const ageParsed = parseInt(data.allowedHorseAge || data.horse_age_requirement || data.allowed_horse_age, 10);
    const payload = {
      status: data.status,
      tournament_name: data.name || data.tournament_name,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      allowed_horse_breed: data.allowedBreed || data.allowed_horse_breed || data.allowed_breed,
      horse_age_requirement: isNaN(ageParsed) ? 0 : ageParsed,
      tournament_description: data.tournamentDescription || data.tournament_description || data.description || ''
    };
    return apiRequest(`/api/v1/tournaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }
};
